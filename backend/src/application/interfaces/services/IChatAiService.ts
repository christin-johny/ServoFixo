import { ChatMessage, ChatTokenUsage } from "../../../domain/value-objects/ChatSessionTypes";

export interface AiChatResponse {
  text: string;
  tokenUsage: ChatTokenUsage;
}

export interface IChatAiService {
  /**
   * Sends a message to the AI model along with the chat history.
   * @param history The previous messages in the session
   * @param newMessage The new user message
   * @param systemInstruction The master rules for the AI
   */
  sendMessage(
    history: ChatMessage[], 
    newMessage: string, 
    systemInstruction: string
  ): Promise<AiChatResponse>;
 
  generateSummary(history: ChatMessage[]): Promise<{ text: string; shortBullets: string[] }>;
}