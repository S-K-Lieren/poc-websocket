"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
var chalk_1 = __importDefault(require("chalk"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var webSocket_1 = require("rxjs/webSocket");
global.WebSocket = require('ws');
var WebSocketClient = /** @class */ (function () {
    function WebSocketClient(webSocketClient) {
        this.webSocketClient = webSocketClient;
        this.websocket = webSocket_1.webSocket;
        this.reconnect$ = new rxjs_1.Subject();
        this.webSocketEvent$ = new rxjs_1.Subject();
        this.init();
    }
    WebSocketClient.prototype.onWebSocketEvent = function () {
        return this.webSocketEvent$
            .asObservable();
    };
    WebSocketClient.prototype.reconnect = function () {
        this.reconnect$.next(undefined);
    };
    WebSocketClient.prototype.init = function () {
        var _this = this;
        log("Initiating client '" + this.webSocketClient.clientName + "'");
        this.reconnect$
            .pipe(operators_1.mergeMap(function () { return _this.connect(); }))
            .subscribe(function (message) {
            log(_this.webSocketClient.clientName + " received bansystem message: " + JSON.stringify(message));
        });
        this.reconnect$.next();
    };
    WebSocketClient.prototype.connect = function () {
        var _this = this;
        return rxjs_1.of(WebSocketClient.WS_ENDPOINT)
            .pipe(operators_1.filter(function (apiUrl) { return !!apiUrl; }), 
        // https becomes wss, http becomes ws
        operators_1.map(function (apiUrl) { return apiUrl.replace(/^http/, 'ws'); }), operators_1.switchMap(function (wsUrl) {
            if (_this.connection$) {
                return _this.connection$;
            }
            var url = wsUrl + "?key=" + _this.webSocketClient.apiKey;
            _this.connection$ = _this.websocket(url)
                .pipe(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operators_1.retryWhen(genericRetryStrategy({
                scalingDuration: WebSocketClient.RETRY_SECONDS * 1000,
                maxRetryAttempts: 5
            })));
            return _this.connection$;
        }));
    };
    WebSocketClient.RETRY_SECONDS = 2;
    // URL to server
    WebSocketClient.WS_ENDPOINT = 'http://localhost:8080/';
    return WebSocketClient;
}());
exports.WebSocketClient = WebSocketClient;
/* eslint-disable no-console, arrow-body-style */
var genericRetryStrategy = function (_a) {
    var maxRetryAttempts = _a.maxRetryAttempts, scalingDuration = _a.scalingDuration;
    return function (attempts) {
        return attempts.pipe(operators_1.mergeMap(function (error, i) {
            if (i === 0) {
                console.error("WebSocket connection reported an error", error);
            }
            var retryAttempt = i + 1;
            if (retryAttempt > maxRetryAttempts) {
                return rxjs_1.throwError(error);
            }
            log("Trying to reconnect. Attempt " + retryAttempt + " in " + retryAttempt * scalingDuration + "ms");
            return rxjs_1.timer(retryAttempt * scalingDuration);
        }));
    };
};
/* eslint-enable no-console */
function log(message) {
    console.log(chalk_1.default.yellow("Client: " + message));
}
//# sourceMappingURL=client.js.map