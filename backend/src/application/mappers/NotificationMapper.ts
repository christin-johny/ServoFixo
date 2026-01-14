import { Notification } from "../../domain/entities/Notification";
import { NotificationResponseDto } from "../../application/dto/notification/NotificationResponseDto";

export class NotificationMapper {
 
  static toResponse(entity: Notification): NotificationResponseDto {
    const props = entity.toProps();  
    
    return {
      id: entity.getId(), 
      type: props.type,
      title: props.title,
      body: props.body,
      icon: props.icon,
      imageUrl: props.imageUrl,
      clickAction: props.clickAction,
      metadata: props.metadata || {},
      priority: props.priority || "MEDIUM",
      status: props.status || "UNREAD",
      readAt: props.readAt,
      createdAt: props.createdAt || new Date(),  
    };
  }
 
  static toDomain(raw: any): Notification {
    if (!raw) throw new Error("Notification data is null/undefined");
    
    return new Notification({
      id: raw.id || raw._id?.toString(),
      recipientId: raw.recipientId,
      recipientType: raw.recipientType,
      type: raw.type,
      title: raw.title,
      body: raw.body,
      icon: raw.icon,
      imageUrl: raw.imageUrl,
      clickAction: raw.clickAction,
      metadata: raw.metadata || {},
      priority: raw.priority,
      status: raw.status,
      readAt: raw.readAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }
}