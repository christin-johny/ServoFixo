import { ISendChatMessageUseCase } from "../../interfaces/use-cases/chat/IChatUseCases";
import { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository";
import { IChatAiService } from "../../interfaces/services/IChatAiService";
import { ChatSessionMapper } from "../../mappers/ChatSessionMapper";
import { ChatSessionResponseDto } from "../../dto/chat/ChatSessionDtos";
import { FIXIT_SYSTEM_PROMPT } from "../../constants/ChatSystemPrompt";
import { ErrorMessages } from "../../constants/ErrorMessages";

export class SendChatMessageUseCase implements ISendChatMessageUseCase {
  constructor(
    private readonly _chatRepo: IChatSessionRepository,
    private readonly _aiService: IChatAiService
  ) {}

  async execute(customerId: string, sessionId: string, message: string): Promise<ChatSessionResponseDto> {
    const session = await this._chatRepo.findById(sessionId);
    
    if (!session) throw new Error(ErrorMessages.CHAT_SESSION_NOT_FOUND);
    if (session.getCustomerId() !== customerId) throw new Error(ErrorMessages.UNAUTHORIZED_CHAT_ACCESS);
    if (session.getStatus() !== "ACTIVE") throw new Error(ErrorMessages.CHAT_SESSION_CLOSED);
 
    session.addMessage({
      role: "user",
      content: message,
      timestamp: new Date()
    });
 
    const allMessages = session.getMessages();
    const firstUserIndex = allMessages.findIndex(m => m.role === "user");
     
    const historyForAi = firstUserIndex !== -1 ? allMessages.slice(firstUserIndex) : [];

    // 3. Call the AI Service 
    const historyExcludingCurrent = historyForAi.slice(0, -1);

    const aiResponse = await this._aiService.sendMessage(
      historyExcludingCurrent,
      message,
      FIXIT_SYSTEM_PROMPT
    );
 
    session.addMessage({
      role: "model",
      content: aiResponse.text,
      timestamp: new Date()
    });

    // 5. Update token tracking
    session.updateTokenUsage(
      aiResponse.tokenUsage.promptTokens, 
      aiResponse.tokenUsage.completionTokens
    );

    const updatedSession = await this._chatRepo.update(session);
    return ChatSessionMapper.toResponse(updatedSession);
  }
}