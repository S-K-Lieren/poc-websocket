import * as WebSocket from 'ws';
import * as http from 'http';
import { catchError, filter, mergeMap, Observable, of, Subject, takeUntil, throwError } from 'rxjs';
import { BannSystem } from '../interfaces';
import { CLIENTS } from '../clients';
import chalk from 'chalk';

export class WebSocketServer {

    private websocketServer: WebSocket.Server;
    private mockAPIKeys: Map<string, string> = new Map();
    private report$: Subject<BannSystem.Report> = new Subject();

    constructor(httpServer: http.Server) {
        this.websocketServer = new WebSocket.Server({ server: httpServer });

        this.generateMockAPIKeys();

        this.listen();
    }

    public createReport(report: BannSystem.Report): void {
        this.log(`Creating new report with ID ${report.id}`);
        this.report$.next(report);
    }

    private listen(): void {
        this.log('WebSocket-Server listening...');

        this.websocketServer.addListener('connection', (ws: WebSocket, req: http.IncomingMessage) => {
            this.handleNewConnection(ws, req);
        });
    }

    private handleNewConnection(ws: WebSocket, req: http.IncomingMessage): void {
        // Check if the connection has a request with an url like ws://localhost:8081/?token=XOXO
        if (req.url) {

            const urlParams: string = req.url.startsWith('/')
                ? req.url.substring(1, req.url.length)
                : req.url;
            const params: URLSearchParams = new URLSearchParams(urlParams);

            const apiKey: string | null = params.get('key');

            const unsubscribe$: Subject<void> = new Subject();

            // If there's not authentication token, don't proceed
            if (!apiKey) {
                return;
            }

            this.validateApiKey(apiKey)
                .pipe(
                    mergeMap((clientID: string | undefined) => {
                        if (!clientID) {
                            return throwError(() => new Error(`Invalid API KEY: ${apiKey}`));
                        }

                        this.log(`New connection by ${clientID}`);
                        return this.onReport();
                    }),
                    catchError((err: Error) => {
                        this.log(err.message);
                        ws.close();
                        return of(undefined);
                    }),
                    filter((report: BannSystem.Report | undefined) => !!report),
                    takeUntil(unsubscribe$)
                )
                // eslint-disable-next-line rxjs/no-ignored-subscription
                .subscribe((report: BannSystem.Report | undefined) => {
                    if (report) {
                        ws.send(JSON.stringify(report),
                            (err?: Error) => {
                                if (err) {

                                    this.log(`Sending message to websocket failed: ${err}`);

                                    ws.close();
                                }
                            });
                    }
                });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ws.onerror = (_error: WebSocket.ErrorEvent) => {
                unsubscribe();
                if (ws.readyState !== ws.CLOSED) {
                    ws.close();
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ws.onclose = (_event: WebSocket.CloseEvent) => {
                unsubscribe();
            };

            const unsubscribe: () => void = () => {
                unsubscribe$.next();
                unsubscribe$.complete();
            };

        }
    }

    private onReport(): Observable<BannSystem.Report> {
        return this.report$.asObservable();
    }

    private validateApiKey(key: string): Observable<string | undefined> {
        return of(this.mockAPIKeys.get(key));
    }

    private generateMockAPIKeys(): void {
        CLIENTS
            .forEach((client: BannSystem.WebSocketClient) => this.mockAPIKeys.set(client.apiKey, client.clientName));
    }

    private log(message: string): void {
        console.log(chalk.blue(`WebSocketServer: ${message}`));
    }
}