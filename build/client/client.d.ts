import { Observable } from 'rxjs';
import { BannSystem } from '../interfaces';
export declare class WebSocketClient {
    private webSocketClient;
    private websocket;
    private connection$;
    private reconnect$;
    private webSocketEvent$;
    private static readonly RETRY_SECONDS;
    private static readonly WS_ENDPOINT;
    constructor(webSocketClient: BannSystem.WebSocketClient);
    onWebSocketEvent(): Observable<BannSystem.WebSocketMessage>;
    reconnect(): void;
    private init;
    private connect;
}
