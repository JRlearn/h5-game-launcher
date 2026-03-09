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
    private reconnectDelay = 2000;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor(url: string, handler: T, autoReconnect = true) {
        this.url = url;
        this.handler = handler;
        this.autoReconnect = autoReconnect;

        this.connect();
    }

    private connect(): void {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.handler.onOpen?.();
        };

        this.socket.onclose = () => {
            this.handler.onClose?.();
            if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.reconnect(), this.reconnectDelay);
            }
        };

        this.socket.onerror = (event) => {
            this.handler.onError?.(event);
        };

        this.socket.onmessage = (event) => {
            console.log('Received message:', event.data);
            let data: T;
            try {
                data = JSON.parse(event.data);
                this.handler.onMessage?.(data);
            } catch (e) {
                console.warn('Invalid message format:', e);
            }
        };
    }

    private reconnect(): void {
        this.reconnectAttempts++;
        this.connect();
    }

    public send(data: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    }

    public close(): void {
        this.autoReconnect = false;
        this.socket?.close();
    }

    public getReadyState(): number {
        return this.socket?.readyState ?? WebSocket.CLOSED;
    }
}
