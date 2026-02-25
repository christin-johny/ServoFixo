import { 
  ChatStatus, 
  ChatMessage, 
  ChatSummary, 
  ChatTokenUsage,
  ChatTimestamps 
} from "../value-objects/ChatSessionTypes";

export interface ChatSessionProps {
  id?: string;
  customerId: string;
  status: ChatStatus;
  messages: ChatMessage[];
  summary?: ChatSummary;
  tokenUsage?: ChatTokenUsage;
  timestamps?: ChatTimestamps;
}

export class ChatSession {
  private _id: string;
  private _customerId: string;
  private _status: ChatStatus;
  private _messages: ChatMessage[];
  private _summary?: ChatSummary;
  private _tokenUsage: ChatTokenUsage;
  private _timestamps: ChatTimestamps;

  constructor(props: ChatSessionProps) {
    this._id = props.id || "";
    this._customerId = props.customerId;
    this._status = props.status;
    this._messages = props.messages || [];
    this._summary = props.summary;
    
    this._tokenUsage = props.tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    this._timestamps = props.timestamps || {
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
 
  public getId(): string { return this._id; }
  public getCustomerId(): string { return this._customerId; }
  public getStatus(): ChatStatus { return this._status; }
  public getMessages(): ChatMessage[] { return this._messages; }
  public getSummary(): ChatSummary | undefined { return this._summary; }
  public getTokenUsage(): ChatTokenUsage { return this._tokenUsage; }
  public getTimestamps(): ChatTimestamps { return this._timestamps; }
 
  public addMessage(message: ChatMessage): void {
    this._messages.push(message);
    this._timestamps.updatedAt = new Date();
  }

  public updateTokenUsage(prompt: number, completion: number): void {
    this._tokenUsage.promptTokens += prompt;
    this._tokenUsage.completionTokens += completion;
    this._tokenUsage.totalTokens = this._tokenUsage.promptTokens + this._tokenUsage.completionTokens;
  }

  public resolveSession(summary: ChatSummary): void {
    this._status = "RESOLVED";
    this._summary = summary;
    this._timestamps.resolvedAt = new Date();
    this._timestamps.updatedAt = new Date();
  }

  public escalateToBooking(summary: ChatSummary): void {
    this._status = "ESCALATED_TO_BOOKING";
    this._summary = summary;
    this._timestamps.resolvedAt = new Date();
    this._timestamps.updatedAt = new Date();
  }

  public toProps(): ChatSessionProps {
    return {
      id: this._id,
      customerId: this._customerId,
      status: this._status,
      messages: this._messages,
      summary: this._summary,
      tokenUsage: this._tokenUsage,
      timestamps: this._timestamps
    };
  }
}