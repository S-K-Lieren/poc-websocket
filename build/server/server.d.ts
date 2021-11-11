/// <reference types="node" />
import * as http from 'http';
import { BannSystem } from '../interfaces';
export declare class WebSocketServer {
    private websocketServer;
    private mockAPIKeys;
    private report$;
    constructor(httpServer: http.Server);
    createReport(report: BannSystem.Report): void;
    private listen;
    private handleNewConnection;
    private onReport;
    private validateApiKey;
    private generateMockAPIKeys;
    private log;
}
