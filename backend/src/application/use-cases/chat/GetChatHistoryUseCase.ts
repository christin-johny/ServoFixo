import { IGetChatHistoryUseCase } from "../../interfaces/use-cases/chat/IChatUseCases";
import { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository";
import { ChatSessionMapper } from "../../mappers/ChatSessionMapper";
import { ChatSessionHistoryDto } from "../../dto/chat/ChatSessionDtos";

export class GetChatHistoryUseCase implements IGetChatHistoryUseCase {
  constructor(private readonly _chatRepo: IChatSessionRepository) {}

  async execute(customerId: string): Promise<ChatSessionHistoryDto[]> {
    const sessions = await this._chatRepo.findByCustomerId(customerId, 20, 0);
    return sessions.map(session => ChatSessionMapper.toHistoryListResponse(session));
  }
}