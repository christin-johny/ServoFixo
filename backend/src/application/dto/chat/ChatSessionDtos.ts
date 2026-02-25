import { ChatRole, ChatStatus,  ChatSummary } from "../../../domain/value-objects/ChatSessionTypes";

export interface ChatMessageDto {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface ChatSessionResponseDto {
  id: string;
  customerId: string;
  status: ChatStatus;
  messages: ChatMessageDto[];
  summary?: ChatSummary;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSessionHistoryDto {
  id: string;
  status: ChatStatus;
  summaryText: string;
  createdAt: Date;
}