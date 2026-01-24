import { FilterQuery } from "mongoose";
import { 
  INotificationRepository, 
  NotificationFilterParams, 
  PaginatedNotificationResult 
} from "../../../domain/repositories/INotificationRepository";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationModel, NotificationDocument } from "../mongoose/models/NotificationModel";
export class NotificationMongoRepository implements INotificationRepository {
  
  async create(notification: Notification): Promise<Notification> {
    const persistenceData = this.toPersistence(notification);
    const doc = await NotificationModel.create(persistenceData);
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await NotificationModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByRecipient(filters: NotificationFilterParams): Promise<PaginatedNotificationResult> {
    const query: FilterQuery<NotificationDocument> = { recipientId: filters.recipientId };
    if (filters.status) query.status = filters.status;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [docs, total, unreadCount] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      NotificationModel.countDocuments(query),
      NotificationModel.countDocuments({ recipientId: filters.recipientId, status: "UNREAD" })
    ]);

    return {
      data: docs.map(doc => this.toDomain(doc)),
      total,
      page,
      limit,
      unreadCount
    };
  }

  async markAsRead(id: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(id, { 
      $set: { status: "READ", readAt: new Date() } 
    }).exec();
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipientId, status: "UNREAD" },
      { $set: { status: "READ", readAt: new Date() } }
    ).exec();
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return await NotificationModel.countDocuments({ recipientId, status: "UNREAD" });
  }

  // Not implemented in IBaseRepository but included for completeness if needed
  async update(notification: Notification): Promise<Notification> {
      const data = this.toPersistence(notification);
      const doc = await NotificationModel.findByIdAndUpdate(notification.getId(), data, { new: true }).exec();
      if(!doc) throw new Error("Notification not found");
      return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
      const res = await NotificationModel.findByIdAndDelete(id).exec();
      return !!res;
  }

  async deleteExpired(olderThan: Date): Promise<number> {
      const res = await NotificationModel.deleteMany({ createdAt: { $lt: olderThan } }).exec();
      return res.deletedCount || 0;
  }

  // --- Mappers ---
  private toDomain(doc: NotificationDocument): Notification {
    return new Notification({
      id: doc._id.toString(),
      recipientId: doc.recipientId,
      recipientType: doc.recipientType,
      type: doc.type,
      title: doc.title,
      body: doc.body,
      icon: doc.icon,
      imageUrl: doc.imageUrl,
      clickAction: doc.clickAction,
      metadata: doc.metadata instanceof Map ? Object.fromEntries(doc.metadata) : doc.metadata,
      priority: doc.priority,
      status: doc.status,
      readAt: doc.readAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  private toPersistence(entity: Notification): Partial<NotificationDocument> {
    const props = entity.toProps();
    return {
      recipientId: props.recipientId,
      recipientType: props.recipientType,
      type: props.type,
      title: props.title,
      body: props.body,
      icon: props.icon,
      imageUrl: props.imageUrl,
      clickAction: props.clickAction,
      metadata: props.metadata,
      priority: props.priority,
      status: props.status,
      readAt: props.readAt
    };
  }
}