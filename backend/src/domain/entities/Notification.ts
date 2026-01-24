// Inside src/domain/entities/Notification.ts
import { 
  NotificationType, 
  NotificationStatus, 
  RecipientType, 
  NotificationPriority 
} from "../../../../shared/types/value-objects/NotificationTypes";
export interface NotificationProps {
  id?: string;
  recipientId: string;
  recipientType: RecipientType;
  
  type: NotificationType;
  title: string;
  body: string;
  
  icon?: string;
  imageUrl?: string;
   
  clickAction?: string;  
  metadata?: Record<string, string>;  
  
  priority?: NotificationPriority;
  status?: NotificationStatus;
  
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification {
  private _id: string;
  private _recipientId: string;
  private _recipientType: RecipientType;
  
  private _type: NotificationType;
  private _title: string;
  private _body: string;
  
  private _icon?: string;
  private _imageUrl?: string;
  
  private _clickAction?: string;
  private _metadata: Record<string, string>;
  
  private _priority: NotificationPriority;
  private _status: NotificationStatus;
  
  private _readAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: NotificationProps) {
    this._id = props.id || "";
    this._recipientId = props.recipientId;
    this._recipientType = props.recipientType;
    
    this._type = props.type;
    this._title = props.title;
    this._body = props.body;
    
    this._icon = props.icon;
    this._imageUrl = props.imageUrl;
    
    this._clickAction = props.clickAction;
    this._metadata = props.metadata || {};
    
    this._priority = props.priority || "MEDIUM";
    this._status = props.status || "UNREAD";
    
    this._readAt = props.readAt;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public getId(): string { return this._id; }
  public getRecipientId(): string { return this._recipientId; }
  public getType(): NotificationType { return this._type; }
  public getStatus(): NotificationStatus { return this._status; }
  public getMetadata(): Record<string, string> { return this._metadata; }
 
  public markAsRead(): void {
    this._status = "READ";
    this._readAt = new Date();
    this._updatedAt = new Date();
  }

  public toProps(): NotificationProps {
    return {
      id: this._id,
      recipientId: this._recipientId,
      recipientType: this._recipientType,
      type: this._type,
      title: this._title,
      body: this._body,
      icon: this._icon,
      imageUrl: this._imageUrl,
      clickAction: this._clickAction,
      metadata: this._metadata,
      priority: this._priority,
      status: this._status,
      readAt: this._readAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}