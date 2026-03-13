import { WebSocketConnector, IWebSocketHandler } from './WebSocketConnector';

export class WebSocketManager {
    private static instance: WebSocketManager;
    private sockets = new Map<string, WebSocketConnector>();

    private constructor() {}

    public static getInstance(): WebSocketManager {
        if (!this.instance) {
            this.instance = new WebSocketManager();
        }
        return this.instance!;
    }

    public register<T extends IWebSocketHandler>(
        key: string,
        url: string,
        handler: T,
        autoReconnect = true,
    ) {
        if (this.sockets.has(key)) {
            throw new Error(`WebSocket with key "${key}" already exists.`);
        }
        const connector = new WebSocketConnector<T>(url, handler, autoReconnect);
        this.sockets.set(key, connector);
    }

    public send(key: string, data: any): void {
        const connector = this.sockets.get(key);
        if (!connector) {
            console.warn(`No WebSocket registered for key "${key}"`);
            return;
        }
        connector.send(data);
    }

    public close(key: string): void {
        const connector = this.sockets.get(key);
        if (connector) {
            connector.close();
            this.sockets.delete(key);
        }
    }

    public closeAll(): void {
        this.sockets.forEach((connector) => connector.close());
        this.sockets.clear();
    }
}
