import { log, warn, error } from 'cc';

export interface IWebSocketHandler {
    onOpen: () => void;
    onClose: () => void;
    onError: (event: Event) => void;
    onMessage: (data: any) => void;
}

export class WebSocketConnector<T extends IWebSocketHandler = any> {
    private socket: WebSocket | null = null;
    private handler: T;
    private url: string;
    private autoReconnect: boolean;
    private baseReconnectDelay = 2000;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    private heartbeatInterval: number = 5000;
    private heartbeatTimeout: number = 3000;
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
            log(`[Network] WebSocket connected to ${this.url}`);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.handler.onOpen?.();
        };

        this.socket.onclose = () => {
            warn('[Network] WebSocket closed');
            this.stopHeartbeat();
            this.handler.onClose?.();
            if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
                log(`[Network] Will attempt to reconnect in ${delay}ms... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                setTimeout(() => this.reconnect(), delay);
            }
        };

        this.socket.onerror = (event) => {
            error('[Network] WebSocket error:', event);
            this.handler.onError?.(event);
        };

        this.socket.onmessage = (event) => {
            this.resetTimeout();

            let data: any;
            try {
                data = JSON.parse(event.data);
                log(`[Network][RECV] ${data.type || 'unknown'}`, data);

                if (data.type === 'pong') return;

                this.handler.onMessage?.(data);
            } catch (e) {
                warn('[Network] Invalid message format:', e);
            }
        };
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.pingTimer = window.setInterval(() => {
            this.send({ type: 'ping' });

            this.timeoutTimer = window.setTimeout(() => {
                warn('[Network] WebSocket heartbeat timeout, forcing close.');
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
            log(`[Network][SEND] ${data.type || 'unknown'}`, data);
            this.socket.send(JSON.stringify(data));
        } else {
            warn('[Network] WebSocket is not open. Cannot send message.');
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

