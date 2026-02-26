import { IStartChatSessionUseCase } from "../../interfaces/use-cases/chat/IChatUseCases";
import { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository";
import { ChatSession } from "../../../domain/entities/ChatSession";
import { ChatSessionMapper } from "../../mappers/ChatSessionMapper";
import { ChatSessionResponseDto } from "../../dto/chat/ChatSessionDtos";

export class StartChatSessionUseCase implements IStartChatSessionUseCase {
  constructor(private readonly _chatRepo: IChatSessionRepository) {}

  async execute(customerId: string): Promise<ChatSessionResponseDto> {
    const existingSession = await this._chatRepo.findActiveSessionByCustomer(customerId);
    
    if (existingSession) {
      return ChatSessionMapper.toResponse(existingSession);
    }

    const newSession = new ChatSession({
      customerId,
      status: "ACTIVE",
      messages: [
        {
          role: "model",
          content: "Hi there! I am your ServoFixo AI Assistant. Please describe the issue you are facing with your home or appliance, and I will help you troubleshoot it safely.",
          timestamp: new Date()
        }
      ]
    });

    const savedSession = await this._chatRepo.create(newSession);
    return ChatSessionMapper.toResponse(savedSession);
  }
}