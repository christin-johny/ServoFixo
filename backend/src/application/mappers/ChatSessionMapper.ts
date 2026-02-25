import { ChatSession } from "../../domain/entities/ChatSession";
import { ChatSessionResponseDto, ChatSessionHistoryDto } from "../dto/chat/ChatSessionDtos";

export class ChatSessionMapper {
  static toResponse(entity: ChatSession): ChatSessionResponseDto {
    return {
      id: entity.getId(),
      customerId: entity.getCustomerId(),
      status: entity.getStatus(),
      messages: entity.getMessages().map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      })),
      summary: entity.getSummary(),
      createdAt: entity.getTimestamps().createdAt,
      updatedAt: entity.getTimestamps().updatedAt
    };
  }

  static toHistoryListResponse(entity: ChatSession): ChatSessionHistoryDto {
    const summary = entity.getSummary();
    const messages = entity.getMessages();
     
    const fallbackTitle = messages.find(m => m.role === 'user')?.content.substring(0, 50) + "..." || "Troubleshooting Session";

    return {
      id: entity.getId(),
      status: entity.getStatus(),
      summaryText: summary?.text || fallbackTitle,
      createdAt: entity.getTimestamps().createdAt
    };
  }
}