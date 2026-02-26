const VERSION = "/v1";
export const CHAT_ENDPOINTS = {
    START: `${VERSION}/customer/chat/start`,
    SEND_MESSAGE: (sessionId: string) => `${VERSION}/customer/chat/${sessionId}/message`,
    GET_HISTORY: `${VERSION}/customer/chat/history`,
    RESOLVE: (sessionId: string) => `${VERSION}/customer/chat/${sessionId}/resolve`,
};