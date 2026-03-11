import { LogManager } from '../core/LogManager';

export interface IWebSocketHandler {
    onOpen: () => void;
    onClose: () => void;
    onError: (event: Event) => void;
    onMessage: (data: any) => void;
}

export class WebSocketConnector<T extends IWebSocketHandler = any> {
    // 這個類別是用來處理 WebSocket 連線的
    private socket: WebSocket | null = null;
    private handler: T;
    private url: string;
    private autoReconnect: boolean;
    private baseReconnectDelay = 2000;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // 心跳機制參數
    private heartbeatInterval: number = 5000; // 每 5 秒送一次 ping
    private heartbeatTimeout: number = 3000; // 3 秒沒收到 pong 視為斷線
    private pingTimer: number | null = null;
    private timeoutTimer: number | null = null;

    constructor(url: string, handler: T, autoReconnect = true) {
        this.url = url;
        this.handler = handler;
        this.autoReconnect = autoReconnect;

        this.connect();
    }

    private connect(): void {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            LogManager.getInstance().info('Network', `WebSocket connected to ${this.url}`);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.handler.onOpen?.();
        };

        this.socket.onclose = () => {
            LogManager.getInstance().warn('Network', 'WebSocket closed');
            this.stopHeartbeat();
            this.handler.onClose?.();
            if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                // 指數退避 (Exponential Backoff): 2s, 4s, 8s...
                const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
                LogManager.getInstance().info(
                    'Network',
                    `Will attempt to reconnect in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`,
                );
                setTimeout(() => this.reconnect(), delay);
            }
        };

        this.socket.onerror = (event) => {
            LogManager.getInstance().error('Network', 'WebSocket error:', event);
            this.handler.onError?.(event);
        };

        this.socket.onmessage = (event) => {
            // 如果收到任何伺服器訊息 (或是特定的 pong 訊息)，重置超時倒數
            this.resetTimeout();

            // 處理一般的應用程式訊息
            let data: any;
            try {
                data = JSON.parse(event.data);

                // 打印封包
                LogManager.getInstance().net('Network', 'RECV', data.type || 'unknown', data);

                // 假設你的伺服器回傳類似 { type: 'pong' }，可在此攔截而不往上層傳
                if (data.type === 'pong') return;

                this.handler.onMessage?.(data);
            } catch (e) {
                LogManager.getInstance().warn('Network', 'Invalid message format:', e);
            }
        };
    }

    private startHeartbeat(): void {
        this.stopHeartbeat(); // 清理舊的 Timer
        this.pingTimer = window.setInterval(() => {
            // 發送 Ping
            this.send({ type: 'ping' }); // 請確認伺服器能辨識這個格式

            // 啟動超時倒數，如果伺服器沒有回 pong (或任何訊息)，則強制斷開
            this.timeoutTimer = window.setTimeout(() => {
                LogManager.getInstance().warn(
                    'Network',
                    'WebSocket heartbeat timeout, forcing close.',
                );
                this.socket?.close();
            }, this.heartbeatTimeout);
        }, this.heartbeatInterval);
    }

    private resetTimeout(): void {
        if (this.timeoutTimer !== null) {
            window.clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }

    private stopHeartbeat(): void {
        if (this.pingTimer !== null) {
            window.clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        this.resetTimeout();
    }

    private reconnect(): void {
        this.reconnectAttempts++;
        this.connect();
    }

    public send(data: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            LogManager.getInstance().net('Network', 'SEND', data.type || 'unknown', data);
            this.socket.send(JSON.stringify(data));
        } else {
            LogManager.getInstance().warn('Network', 'WebSocket is not open. Cannot send message.');
        }
    }

    public close(): void {
        this.autoReconnect = false;
        this.stopHeartbeat();
        this.socket?.close();
    }

    public getReadyState(): number {
        return this.socket?.readyState ?? WebSocket.CLOSED;
    }
}
