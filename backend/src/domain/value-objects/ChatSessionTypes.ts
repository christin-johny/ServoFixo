export type ChatRole = "user" | "model" | "system";
export type ChatStatus = "ACTIVE" | "RESOLVED" | "ESCALATED_TO_BOOKING" | "TIMEOUT";

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  actionMeta?: {
    suggestedCategoryId?: string; 
    isDangerous?: boolean;         
  };
}

export interface ChatSummary {
  text: string;
  shortBullets: string[];
}

export interface ChatTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatTimestamps {
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}