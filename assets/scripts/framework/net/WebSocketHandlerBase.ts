import { IWebSocketHandler } from '../../manager/network/WebSocketConnector';

export abstract class WebSocketHandlerBase implements IWebSocketHandler {
    abstract onOpen(): void;
    abstract onClose(): void;
    abstract onError(event: Event): void;
    abstract onMessage(data: any): void;
}
