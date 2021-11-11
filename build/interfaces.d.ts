export declare namespace BannSystem {
    interface Report {
        id: string;
        userID: string;
        reason: string;
        timestamp: number;
        reportedBy: string;
    }
    interface WebSocketMessage {
        messageID: string;
        report: BannSystem.Report;
    }
    interface WebSocketClient {
        clientName: string;
        apiKey: string;
    }
}
