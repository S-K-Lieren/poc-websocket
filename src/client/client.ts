import chalk from 'chalk';
import { Observable, of, Subject, throwError, timer } from 'rxjs';
import { filter, map, mergeMap, retryWhen, switchMap } from 'rxjs/operators';
import { webSocket, WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { BannSystem } from '../interfaces';
(global as any).WebSocket = require('ws');

export class WebSocketClient {

    private websocket: <T>(urlConfigOrSource: string | WebSocketSubjectConfig<T>) => WebSocketSubject<T> = webSocket;
    private connection$: WebSocketSubject<BannSystem.WebSocketMessage> | undefined;
    private reconnect$: Subject<void> = new Subject<void>();
    private webSocketEvent$: Subject<BannSystem.WebSocketMessage> = new Subject();
    private static readonly RETRY_SECONDS: number = 2;
    // URL to server
    private static readonly WS_ENDPOINT: string = 'http://localhost:8080/';


    constructor(private webSocketClient: BannSystem.WebSocketClient) {
        this.init();
    }

    onWebSocketEvent(): Observable<BannSystem.WebSocketMessage> {
        return this.webSocketEvent$
            .asObservable();
    }

    reconnect(): void {
        this.reconnect$.next(undefined);
    }

    private init(): void {

        log(`Initiating client '${this.webSocketClient.clientName}'`);

        this.reconnect$
            .pipe(
                mergeMap(() => this.connect()),
            )
            .subscribe((message: BannSystem.WebSocketMessage) => {
                log(`${this.webSocketClient.clientName} received bansystem message: ${JSON.stringify(message)}`);
            });

        this.reconnect$.next();
    }

    private connect(): Observable<BannSystem.WebSocketMessage> {

        return of(WebSocketClient.WS_ENDPOINT)
            .pipe(
                filter((apiUrl: string) => !!apiUrl),
                // https becomes wss, http becomes ws
                map((apiUrl: string) => apiUrl.replace(/^http/, 'ws')),
                switchMap((wsUrl: string) => {
                    if (this.connection$) {
                        return this.connection$;
                    }

                    const url: string = `${wsUrl}?key=${this.webSocketClient.apiKey}`;

                    this.connection$ = this.websocket<BannSystem.WebSocketMessage>(url)
                        .pipe(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            retryWhen(
                                genericRetryStrategy({
                                    scalingDuration: WebSocketClient.RETRY_SECONDS * 1000,
                                    maxRetryAttempts: 5
                                })
                            )
                        ) as WebSocketSubject<BannSystem.WebSocketMessage>;

                    return this.connection$;
                })
            );
    }
}

/* eslint-disable no-console, arrow-body-style */
const genericRetryStrategy = (
    {
        maxRetryAttempts,
        scalingDuration
    }: {
        maxRetryAttempts: number;
        scalingDuration: number;
    }
) => (attempts: Observable<unknown>) => {
    return attempts.pipe(
        mergeMap((error: unknown, i: number) => {
            if (i === 0) {
                console.error(
                    `WebSocket connection reported an error`,
                    error
                );
            }

            const retryAttempt: number = i + 1;

            if (retryAttempt > maxRetryAttempts) {
                return throwError(error);
            }

            log(
                `Trying to reconnect. Attempt ${retryAttempt} in ${retryAttempt * scalingDuration}ms`
            );

            return timer(retryAttempt * scalingDuration);
        })
    );
};
/* eslint-enable no-console */

function log(message: string): void {
    console.log(chalk.yellow(`Client: ${message}`));
}
