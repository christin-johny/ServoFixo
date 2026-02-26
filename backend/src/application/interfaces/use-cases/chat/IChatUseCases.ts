import { ChatSessionResponseDto, ChatSessionHistoryDto } from "../../../dto/chat/ChatSessionDtos";

export interface IStartChatSessionUseCase {
  execute(customerId: string): Promise<ChatSessionResponseDto>;
}

export interface ISendChatMessageUseCase {
  execute(customerId: string, sessionId: string, message: string): Promise<ChatSessionResponseDto>;
}

export interface IGetChatHistoryUseCase {
  execute(customerId: string): Promise<ChatSessionHistoryDto[]>;
}

export interface IResolveChatUseCase {
  execute(
    customerId: string, 
    sessionId: string, 
    resolutionType: "RESOLVED" | "ESCALATED_TO_BOOKING"
  ): Promise<void>;
}