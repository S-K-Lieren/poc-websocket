"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server/server");
var express_1 = __importDefault(require("express"));
var http = __importStar(require("http"));
var client_1 = require("./client/client");
var rxjs_1 = require("rxjs");
var clients_1 = require("./clients");
//#region HTTP server
var app = express_1.default();
var httpServer = http.createServer(app);
var server;
httpServer.listen(8080, function () {
    console.log("Listening on http://localhost:8080 ...");
    server = new server_1.WebSocketServer(httpServer);
    startClients();
});
//#endregion
//#region WebSocketClient
function startClients() {
    new client_1.WebSocketClient(clients_1.CLIENTS[0]);
    new client_1.WebSocketClient(clients_1.CLIENTS[1]);
    new client_1.WebSocketClient({ apiKey: 'invalidApiKey', clientName: 'clyde' });
    var mockReports = [
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
    rxjs_1.interval(1000)
        .pipe(rxjs_1.take(mockReports.length), rxjs_1.map(function (i) { return mockReports[i]; }))
        .subscribe(function (report) {
        server.createReport(report);
    });
}
//#endregion
//# sourceMappingURL=index.js.map