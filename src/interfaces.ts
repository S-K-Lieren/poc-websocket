export namespace BannSystem {
    export interface Report {
        id: string;
        userID: string;
        reason: string;
        timestamp: number;
        reportedBy: string;
    }

    export interface WebSocketMessage {
        messageID: string;
        report: BannSystem.Report;
    }

    export interface WebSocketClient {
        clientName: string;
        apiKey: string;
    }
}
