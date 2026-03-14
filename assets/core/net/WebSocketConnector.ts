import { log, error } from 'cc';

/**
 * WebSocket 處理介面
 */
export interface IWebSocketHandler {
    onOpen(): void;
    onClose(): void;
    onError(event: Event): void;
    onMessage(data: any): void;
}

/**
 * WebSocketConnector - 長連接連接器
 * 負責單一 WebSocket 鏈路管理。
 */
export class WebSocketConnector {
    private _socket: WebSocket | null = null;
    private _handler: IWebSocketHandler | null = null;
    private _url: string = '';

    constructor(url: string, handler: IWebSocketHandler) {
        this._url = url;
        this._handler = handler;
    }

    public connect(): void {
        if (this._socket) this.disconnect();

        try {
            this._socket = new WebSocket(this._url);
            this._socket.onopen = () => this._handler?.onOpen();
            this._socket.onclose = () => this._handler?.onClose();
            this._socket.onerror = (e) => this._handler?.onError(e);
            this._socket.onmessage = (m) => this._handler?.onMessage(m.data);
            log(`[WebSocket] 正在連線至: ${this._url}`);
        } catch (err) {
            error(`[WebSocket] 連線失敗:`, err);
        }
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(data);
        } else {
            error('[WebSocket] 無法傳送數據，Socket 未開啟');
        }
    }

    public disconnect(): void {
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }
    }

    public get isConnected(): boolean {
        return this._socket !== null && this._socket.readyState === WebSocket.OPEN;
    }
}
