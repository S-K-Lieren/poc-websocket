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
exports.WebSocketServer = void 0;
var WebSocket = __importStar(require("ws"));
var rxjs_1 = require("rxjs");
var clients_1 = require("../clients");
var chalk_1 = __importDefault(require("chalk"));
var WebSocketServer = /** @class */ (function () {
    function WebSocketServer(httpServer) {
        this.mockAPIKeys = new Map();
        this.report$ = new rxjs_1.Subject();
        this.websocketServer = new WebSocket.Server({ server: httpServer });
        this.generateMockAPIKeys();
        this.listen();
    }
    WebSocketServer.prototype.createReport = function (report) {
        this.log("Creating new report with ID " + report.id);
        this.report$.next(report);
    };
    WebSocketServer.prototype.listen = function () {
        var _this = this;
        this.log('WebSocket-Server listening...');
        this.websocketServer.addListener('connection', function (ws, req) {
            _this.handleNewConnection(ws, req);
        });
    };
    WebSocketServer.prototype.handleNewConnection = function (ws, req) {
        var _this = this;
        // Check if the connection has a request with an url like ws://localhost:8081/?token=XOXO
        if (req.url) {
            var urlParams = req.url.startsWith('/')
                ? req.url.substring(1, req.url.length)
                : req.url;
            var params = new URLSearchParams(urlParams);
            var apiKey_1 = params.get('key');
            var unsubscribe$_1 = new rxjs_1.Subject();
            // If there's not authentication token, don't proceed
            if (!apiKey_1) {
                return;
            }
            this.validateApiKey(apiKey_1)
                .pipe(rxjs_1.mergeMap(function (clientID) {
                if (!clientID) {
                    return rxjs_1.throwError(function () { return new Error("Invalid API KEY: " + apiKey_1); });
                }
                _this.log("New connection by " + clientID);
                return _this.onReport();
            }), rxjs_1.catchError(function (err) {
                _this.log(err.message);
                ws.close();
                return rxjs_1.of(undefined);
            }), rxjs_1.filter(function (report) { return !!report; }), rxjs_1.takeUntil(unsubscribe$_1))
                // eslint-disable-next-line rxjs/no-ignored-subscription
                .subscribe(function (report) {
                if (report) {
                    ws.send(JSON.stringify(report), function (err) {
                        if (err) {
                            _this.log("Sending message to websocket failed: " + err);
                            ws.close();
                        }
                    });
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ws.onerror = function (_error) {
                unsubscribe_1();
                if (ws.readyState !== ws.CLOSED) {
                    ws.close();
                }
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ws.onclose = function (_event) {
                unsubscribe_1();
            };
            var unsubscribe_1 = function () {
                unsubscribe$_1.next();
                unsubscribe$_1.complete();
            };
        }
    };
    WebSocketServer.prototype.onReport = function () {
        return this.report$.asObservable();
    };
    WebSocketServer.prototype.validateApiKey = function (key) {
        return rxjs_1.of(this.mockAPIKeys.get(key));
    };
    WebSocketServer.prototype.generateMockAPIKeys = function () {
        var _this = this;
        clients_1.CLIENTS
            .forEach(function (client) { return _this.mockAPIKeys.set(client.apiKey, client.clientName); });
    };
    WebSocketServer.prototype.log = function (message) {
        console.log(chalk_1.default.blue("WebSocketServer: " + message));
    };
    return WebSocketServer;
}());
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=server.js.map