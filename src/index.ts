import { WebSocketServer } from './server/server';
import express from 'express';
import * as http from 'http';
import { WebSocketClient } from './client/client';
import { BannSystem } from './interfaces';
import { interval, map, take } from 'rxjs';
import { CLIENTS } from './clients';


//#region HTTP server

const app: express.Express = express();
const httpServer: http.Server = http.createServer(app);
let server: WebSocketServer;

httpServer.listen(8080, () => {
    console.log(`Listening on http://localhost:8080 ...`);

    server = new WebSocketServer(httpServer);

    startClients();
});

//#endregion



//#region WebSocketClient

function startClients() {


    new WebSocketClient(CLIENTS[0]);
    new WebSocketClient(CLIENTS[1]);
    new WebSocketClient({ apiKey: 'invalidApiKey', clientName: 'clyde' });



    const mockReports: Array<BannSystem.Report> = [
        {
            id: 'mcEdbnfue',
            reason: 'Spam',
            reportedBy: '123456789',
            timestamp: 5435345435,
            userID: '234234'
        },
        {
            id: 'FIUDfiudbf',
            reason: 'Scam',
            reportedBy: '123456789',
            timestamp: 5435345435,
            userID: '234234'
        },
        {
            id: 'UHEIFjksdg',
            reason: 'Werbung',
            reportedBy: '123456789',
            timestamp: 5435345435,
            userID: '234234'
        }, {
            id: '=jfej09ejfw',
            reason: 'Unangebrachtes Chatverhalten',
            reportedBy: '123456789',
            timestamp: 5435345435,
            userID: '234234'
        }
    ];

    interval(1000)
        .pipe(
            take(mockReports.length),
            map(i => mockReports[i])
        )
        .subscribe((report: BannSystem.Report) => {
            server.createReport(report);
        });
}
//#endregion