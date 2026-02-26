import { IResolveChatUseCase } from "../../interfaces/use-cases/chat/IChatUseCases";
import { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository";
import { IChatAiService } from "../../interfaces/services/IChatAiService";

export class ResolveChatUseCase implements IResolveChatUseCase {
  constructor(
    private readonly _chatRepo: IChatSessionRepository,
    private readonly _aiService: IChatAiService
  ) {}

  async execute(
    customerId: string, 
    sessionId: string, 
    resolutionType: "RESOLVED" | "ESCALATED_TO_BOOKING"
  ): Promise<void> {
    const session = await this._chatRepo.findById(sessionId);
    
    if (!session) throw new Error("CHAT_SESSION_NOT_FOUND");
    if (session.getCustomerId() !== customerId) throw new Error("UNAUTHORIZED_ACCESS");
    if (session.getStatus() !== "ACTIVE") throw new Error("CHAT_SESSION_ALREADY_CLOSED");
 
    const summary = await this._aiService.generateSummary(session.getMessages());

    if (resolutionType === "RESOLVED") {
      session.resolveSession(summary);
    } else {
      session.escalateToBooking(summary);
    }
    
    await this._chatRepo.update(session);
  }
}