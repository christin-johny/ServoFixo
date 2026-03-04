import { ISendChatMessageUseCase } from "../../interfaces/use-cases/chat/IChatUseCases";
import { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository";
import { IChatAiService } from "../../interfaces/services/IChatAiService";
import { IServiceCategoryRepository } from "../../../domain/repositories/IServiceCategoryRepository";
import { getFixitSystemPrompt } from "../../constants/ChatSystemPrompt";
import { ChatSessionMapper } from "../../mappers/ChatSessionMapper";
import { ChatSessionResponseDto } from "../../dto/chat/ChatSessionDtos";
import { ErrorMessages } from "../../constants/ErrorMessages";
 
export class SendChatMessageUseCase implements ISendChatMessageUseCase {
  constructor(
    private readonly _chatRepo: IChatSessionRepository,
    private readonly _aiService: IChatAiService,
    private readonly _categoryRepo: IServiceCategoryRepository
  ) {}

  async execute(
    customerId: string, 
    sessionId: string, 
    message: string
  ): Promise<ChatSessionResponseDto> { 
    const session = await this._chatRepo.findById(sessionId);
     
    if (!session) {
        throw new Error(ErrorMessages.CHAT_SESSION_NOT_FOUND);
    }
    if (session.getCustomerId() !== customerId) {
        throw new Error(ErrorMessages.UNAUTHORIZED_CHAT_ACCESS);
    }
    if (session.getStatus() !== "ACTIVE") {
        throw new Error(ErrorMessages.CHAT_SESSION_CLOSED);
    }
 
    session.addMessage({
      role: "user",
      content: message,
      timestamp: new Date()
    });
 
    const allMessages = session.getMessages();
    const firstUserIndex = allMessages.findIndex(m => m.role === "user");
    const historyForAi = firstUserIndex !== -1 ? allMessages.slice(firstUserIndex) : [];
     
    const historyExcludingCurrent = historyForAi.slice(0, -1);
 
    const { categories } = await this._categoryRepo.findAll({ 
        page: 1, 
        limit: 100,  
        isActive: true 
    });
 
    const dynamicPrompt = getFixitSystemPrompt(categories);
 
    const aiResponse = await this._aiService.sendMessage(
      historyExcludingCurrent,
      message,
      dynamicPrompt
    );
 
    session.addMessage({
      role: "model",
      content: aiResponse.text,
      timestamp: new Date()
    });
 
    session.updateTokenUsage(
      aiResponse.tokenUsage.promptTokens, 
      aiResponse.tokenUsage.completionTokens
    );
 
    const updatedSession = await this._chatRepo.update(session);
 
    return ChatSessionMapper.toResponse(updatedSession);
  }
}