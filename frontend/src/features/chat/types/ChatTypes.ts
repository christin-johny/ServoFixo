export type ChatRole = 'user' | 'model';

export interface ChatMessage {
    role: ChatRole;
    content: string;
    timestamp: string;
}

export interface ChatSession {
    summaryText: any;
    id: string;
    status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED_TO_BOOKING';
    messages: ChatMessage[];
    summary?: {
        text: string;
        shortBullets: string[];
    };
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageResponse {
    success: boolean;
    data: ChatSession;
}