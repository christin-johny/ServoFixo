import axiosInstance from '../../../lib/axiosClient';
import { CHAT_ENDPOINTS } from './endpoints';
import type { ChatSession } from '../types/ChatTypes';

export const startChatSession = async (): Promise<ChatSession> => {
    const response = await axiosInstance.post(CHAT_ENDPOINTS.START);
    return response.data.data;
};

export const sendMessage = async (sessionId: string, message: string): Promise<ChatSession> => {
    const response = await axiosInstance.post(CHAT_ENDPOINTS.SEND_MESSAGE(sessionId), { message });
    return response.data.data;
};

export const getChatHistory = async (): Promise<ChatSession[]> => {
    const response = await axiosInstance.get(CHAT_ENDPOINTS.GET_HISTORY);
    return response.data.data;
};

export const resolveChat = async (sessionId: string, resolutionType: 'RESOLVED' | 'ESCALATED_TO_BOOKING'): Promise<void> => {
    await axiosInstance.post(CHAT_ENDPOINTS.RESOLVE(sessionId), { resolutionType });
};