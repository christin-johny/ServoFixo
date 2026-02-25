import { ChatSession } from "../entities/ChatSession";
import { IBaseRepository } from "./IBaseRepository";

export interface IChatSessionRepository extends IBaseRepository<ChatSession> { 
  findByCustomerId(customerId: string, limit?: number, skip?: number): Promise<ChatSession[]>;
  findActiveSessionByCustomer(customerId: string): Promise<ChatSession | null>;
}