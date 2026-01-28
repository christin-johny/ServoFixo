import { io, Socket } from "socket.io-client";
import store from "../../store/store"; 
import { setIncomingJob } from "../../store/technicianBookingSlice";
import { type Notification, NotificationType } from "../../domain/types/Notification";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

// --- Events Interfaces ---
export interface BookingConfirmedEvent {
  bookingId: string;
  techName: string;
  vehicleNumber?: string;
  photoUrl?: string;
  otp?: string;
  status: string;
}

export interface BookingFailedEvent {
    bookingId: string;
    reason: string;
}

export interface BookingStatusEvent {
    bookingId: string;
    status: string;
}

export interface JobRequestEvent {
  bookingId: string;
  serviceName: string;
  earnings: number;
  distance: string;
  address: string;
  expiresAt: string;
}

export interface ApprovalRequestEvent {
    bookingId: string;
    extraItem: { id: string; title: string; amount: number; proofUrl?: string; };
}

export interface PaymentRequestEvent {
    bookingId: string;
    totalAmount: number;
}

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null; 

  // --- Callbacks Storage ---
  private uiNotificationCallback: ((notification: Notification) => void) | null = null;
  private bookingConfirmedCallback: ((data: BookingConfirmedEvent) => void) | null = null;
  private bookingFailedCallback: ((data: BookingFailedEvent) => void) | null = null; // New
  private statusUpdateCallback: ((data: BookingStatusEvent) => void) | null = null;

  connect(userId: string, role: UserRole): void {
    if (this.socket?.connected && this.currentUserId === userId) return;
    if (this.socket) this.disconnect();

    this.currentUserId = userId; 
    const queryParams: Record<string, string> = { role };
    if (role === "TECHNICIAN") queryParams.techId = userId; 
    else queryParams.userId = userId; 

    this.socket = io(SOCKET_URL, { query: queryParams, transports: ["websocket"], reconnection: true });

    this.socket.on("connect", () => console.log(`[Socket] Connected as ${role}`));

    // --- MASTER LISTENER ---
    this.socket.on("NOTIFICATION_RECEIVED", (data: Notification) => {
        console.log("[Socket] Notification:", data.type);
        
        // 1. Always send to UI (Bell/Toast) - This fixes "No B and C"
        if (this.uiNotificationCallback) {
            this.uiNotificationCallback(data);
        }

        // 2. Handshake: Success
        if (data.type === NotificationType.BOOKING_CONFIRMED) {
            this.bookingConfirmedCallback?.({
                bookingId: data.metadata.bookingId,
                techName: data.metadata.techName,
                otp: data.metadata.otp,
                status: "ACCEPTED",
                photoUrl: data.metadata.techPhoto,
                vehicleNumber: "" 
            });
        }
        
        // 3. Handshake: Failed (New)
        if (data.type === NotificationType.BOOKING_FAILED) {
            this.bookingFailedCallback?.({
                bookingId: data.metadata.bookingId,
                reason: data.body || "No technicians available."
            });
        }

        // 4. Tracking: Status Updates
        if (data.type === NotificationType.BOOKING_STATUS_UPDATE) { 
             this.statusUpdateCallback?.({
                bookingId: data.metadata.bookingId,
                status: data.metadata.status
             });
        }
    });

    // Technician Logic
    this.socket.on("booking:assign_request", (data: JobRequestEvent) => { 
        store.dispatch(setIncomingJob(data)); 
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
  } 

  // --- Listeners ---
  onNotification(callback: (notification: Notification) => void): void {
    this.uiNotificationCallback = callback;
  }
  
  offNotification(): void {
    this.uiNotificationCallback = null;
  }

  onBookingConfirmed(callback: (data: BookingConfirmedEvent) => void): void {
    this.bookingConfirmedCallback = callback;
  }

  onBookingFailed(callback: (data: BookingFailedEvent) => void): void {
      this.bookingFailedCallback = callback;
  }
  
  onBookingStatusUpdate(callback: (data: BookingStatusEvent) => void): void {
      this.statusUpdateCallback = callback;
  }

  onApprovalRequest(callback: (data: ApprovalRequestEvent) => void): void {
      this.socket?.off("booking:approval_request");
      this.socket?.on("booking:approval_request", callback);
  }

  onPaymentRequest(callback: (data: PaymentRequestEvent) => void): void {
      this.socket?.off("booking:payment_request");
      this.socket?.on("booking:payment_request", callback);
  }

  offTrackingListeners(): void {
      this.socket?.off("booking:approval_request");
      this.socket?.off("booking:payment_request");
      this.bookingConfirmedCallback = null;
      this.statusUpdateCallback = null;
      this.bookingFailedCallback = null;
  }
}

export const socketService = new SocketService();