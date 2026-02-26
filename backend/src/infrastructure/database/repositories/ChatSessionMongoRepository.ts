import { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository";
import { ChatSession } from "../../../domain/entities/ChatSession";
import { ChatSessionDocument, ChatSessionModel } from "../mongoose/models/ChatSessionModel";
import { ChatRole, ChatStatus } from "../../../domain/value-objects/ChatSessionTypes";
import { ErrorMessages } from "../../../application/constants/ErrorMessages";

export class ChatSessionMongoRepository implements IChatSessionRepository {

  async create(session: ChatSession): Promise<ChatSession> {
    const persistenceData = this.toPersistence(session);
    const doc = await ChatSessionModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async update(session: ChatSession): Promise<ChatSession> {
    const updateData = { ...this.toPersistence(session) } as Record<string, unknown>;
     
    delete updateData._id;

    const doc = await ChatSessionModel.findByIdAndUpdate(
      session.getId(),
      updateData,
      { new: true }
    ).exec();
    
    if (!doc) throw new Error(ErrorMessages.CHAT_SESSION_NOT_FOUND); 
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<ChatSession | null> {
    const doc = await ChatSessionModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByCustomerId(customerId: string, limit: number = 20, skip: number = 0): Promise<ChatSession[]> {
    const docs = await ChatSessionModel.find({ customerId })
      .sort({ "timestamps.updatedAt": -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findActiveSessionByCustomer(customerId: string): Promise<ChatSession | null> {
    const doc = await ChatSessionModel.findOne({ 
      customerId, 
      status: "ACTIVE" 
    }).exec();
    return doc ? this.toDomain(doc) : null;
  }
 
  async findAll(): Promise<ChatSession[]> { 
      throw new Error("Method not implemented for Chat Sessions."); 
  }
   
  async delete(_id: string): Promise<boolean> { 
      throw new Error("Method not implemented for Chat Sessions."); 
  }
 
  private toDomain(doc: ChatSessionDocument): ChatSession {
    return new ChatSession({
      id: doc._id.toString(),
      customerId: doc.customerId,
      status: doc.status as ChatStatus,
      messages: doc.messages.map(m => ({
        role: m.role as ChatRole,
        content: m.content,
        timestamp: m.timestamp,
        actionMeta: m.actionMeta ? {
          suggestedCategoryId: m.actionMeta.suggestedCategoryId,
          isDangerous: m.actionMeta.isDangerous
        } : undefined
      })),
      summary: doc.summary ? {
        text: doc.summary.text,
        shortBullets: doc.summary.shortBullets
      } : undefined,
      tokenUsage: doc.tokenUsage,
      timestamps: doc.timestamps
    });
  }

  private toPersistence(entity: ChatSession): Partial<ChatSessionDocument> {
    const props = entity.toProps();
     
    return {
      ...(props.id ? { _id: props.id } : {}),
      customerId: props.customerId,
      status: props.status,
      messages: props.messages,
      summary: props.summary,
      tokenUsage: props.tokenUsage,
      timestamps: props.timestamps
    } as Partial<ChatSessionDocument>;
  }
}