import { io, Socket } from "socket.io-client";
import type { Notification } from "../../domain/types/Notification";
import store from "../../store/store";
import { setIncomingJob, clearIncomingJob } from "../../store/technicianBookingSlice";
import { setActiveTechnician, clearActiveBooking } from "../../store/customerSlice";
import { NotificationType } from "../../../../shared/types/value-objects/NotificationTypes";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
 

export interface BookingConfirmedEvent {
  bookingId: string;
  techName: string;
  vehicleNumber?: string;
  photoUrl?: string;
  otp?: string;
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

export interface BookingStatusEvent {
  bookingId: string;
  status: string;
}

export interface ApprovalRequestEvent {
  bookingId: string;
  extraItem: {
    id: string;
    title: string;
    amount: number;
    proofUrl?: string;
  };
}

export interface PaymentRequestEvent {
  bookingId: string;
  totalAmount: number;
}

export interface BookingCancelledEvent {
  bookingId: string;
  reason: string;
}

export interface BookingFailedEvent {
  bookingId: string;
  reason: string;
}

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;
 
  private uiNotificationCallback: ((data: Notification) => void) | null = null;
  private bookingConfirmedCallback: ((data: BookingConfirmedEvent) => void) | null = null;
  private bookingFailedCallback: ((data: BookingFailedEvent) => void) | null = null;
  private statusUpdateCallback: ((data: BookingStatusEvent) => void) | null = null;
  private bookingCancelledCallback: ((data: BookingCancelledEvent) => void) | null = null;
  private approvalRequestCallback: ((data: ApprovalRequestEvent) => void) | null = null;
  private paymentRequestCallback: ((data: PaymentRequestEvent) => void) | null = null;

  connect(userId: string, role: UserRole): void {
    if (this.socket?.connected && this.currentUserId === userId) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.currentUserId = userId;

    const queryParams: Record<string, string> = { role };
    if (role.toUpperCase() === "TECHNICIAN") {
      queryParams.techId = userId;
    } else {
      queryParams.userId = userId;
    }

    this.socket = io(SOCKET_URL, {
      query: queryParams,
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log(`[Socket] Connected as ${role}. ID: ${this.socket?.id}`);
    });
 
    this.socket.on("booking:confirmed", (data ) => {
      console.log("[Socket] Direct 'booking:confirmed'", data);
      this.handleBookingConfirmed(data, role);
    });

    // B. Job Assignment (Technician)
    this.socket.on("booking:assign_request", (data: JobRequestEvent) => {
      console.log("[Socket] Direct 'booking:assign_request'");
      store.dispatch(setIncomingJob(data));
    });

    // C. Status Updates (Tracking Page)
    this.socket.on("booking:status_update", (data: BookingStatusEvent) => {
      console.log("[Socket] Direct 'booking:status_update'", data);
      this.statusUpdateCallback?.(data);
    });
 
    this.socket.on("NOTIFICATION_RECEIVED", (data: Notification) => {
      console.log(`[Socket] Notification Received: ${data.type}`);

      // A. Run Core Logic (Redirections, State Updates, Modals)
      this.handleCoreNotificationLogic(data, role);

      // B. Pass to UI (Toast Messages)
      if (this.uiNotificationCallback) {
        this.uiNotificationCallback(data);
      }
    });
  }
 
  private handleCoreNotificationLogic(data: Notification, role: UserRole) {
    // 1. Cancellation
    if (
      data.type === NotificationType.BOOKING_CANCELLED 
    ) {
      if (role.toUpperCase() === "TECHNICIAN") {
        store.dispatch(clearIncomingJob());
        this.bookingCancelledCallback?.({
          bookingId: data.metadata.bookingId,
          reason: data.body,
        });
      } else if (role.toUpperCase() === "CUSTOMER") {
        store.dispatch(clearActiveBooking());
      }
    }

    // 2. Confirmation (Fallback if direct event fails)
    if (
      data.type === NotificationType.BOOKING_CONFIRMED  
    ) {
      const eventData = {
        bookingId: data.metadata.bookingId,
        techName: data.metadata.techName,
        otp: data.metadata.otp,
        status: "ACCEPTED",
        photoUrl: data.metadata.techPhoto,
        vehicleNumber: "",
      };
      this.handleBookingConfirmed(eventData, role);
    }

    // 3. Status Updates (Fallback)
    if (
      data.type === NotificationType.BOOKING_STATUS_UPDATE  
    ) {
      this.statusUpdateCallback?.({
        bookingId: data.metadata.bookingId,
        status: data.metadata.status,
      });
    }

    // 4. Failed Assignment
    if (
      data.type === NotificationType.BOOKING_FAILED  
    ) {
      this.bookingFailedCallback?.({
        bookingId: data.metadata.bookingId,
        reason: data.body || "No technicians available.",
      });
    }

    // 5.  EXTRA CHARGE APPROVAL REQUEST (Triggers Modal)
    // if (
    //   data.type === NotificationType.BOOKING_APPROVAL_REQUEST  
    // ) {
    //   console.log("[Socket] Approval Request. Triggering Modal...");

    //   // Mapper: Convert Backend 'Flat' Metadata to Frontend 'Nested' Event
    //   // Note: Backend metadata doesn't have 'title', so we use 'Notification Title' as fallback
    //   const extraEvent: ApprovalRequestEvent = {
    //     bookingId: data.metadata.bookingId,
    //     extraItem: {
    //       id: data.metadata.chargeId,
    //       title: data.title || "Additional Item", // Fallback title
    //       amount: Number(data.metadata.amount),
    //       proofUrl: data.metadata.proofUrl,
    //     },
    //   };

    //   this.approvalRequestCallback?.(extraEvent);
    // }
  }
 
  private handleBookingConfirmed(data: any, role: UserRole) {
    const eventData: BookingConfirmedEvent = {
      bookingId: data.bookingId || data.metadata?.bookingId,
      techName: data.techName || data.metadata?.techName,
      otp: data.otp || data.metadata?.otp,
      status: "ACCEPTED",
      photoUrl: data.photoUrl || data.metadata?.techPhoto,
      vehicleNumber: data.vehicle || "",
    };

    if (role.toUpperCase() === "CUSTOMER") {
      try {
        store.dispatch(
          setActiveTechnician({
            name: eventData.techName,
            photo: eventData.photoUrl,
            otp: eventData.otp,
          })
        );
      } catch (err) {
        console.warn("[Socket] Redux update failed (Safe to ignore):", err);
      }
    }

    if (role.toUpperCase() === "TECHNICIAN") {
      store.dispatch(clearIncomingJob());
    }

    if (this.bookingConfirmedCallback) {
      this.bookingConfirmedCallback(eventData);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
  }
 
  onNotification(callback: (notification: Notification) => void): void {
    this.uiNotificationCallback = callback;
  }

  offNotification(): void {
    this.uiNotificationCallback = null;
  }

  onBookingConfirmed(callback: (data: BookingConfirmedEvent) => void): void {
    this.bookingConfirmedCallback = callback;
  }

  onBookingStatusUpdate(callback: (data: BookingStatusEvent) => void): void {
    this.statusUpdateCallback = callback;
  }
 
  onApprovalRequest(callback: (data: ApprovalRequestEvent) => void): void {
    this.approvalRequestCallback = callback;
  }

  onPaymentRequest(callback: (data: PaymentRequestEvent) => void): void {
    this.paymentRequestCallback = callback;
  }

  onBookingCancelled(callback: (data: BookingCancelledEvent) => void): void {
    this.bookingCancelledCallback = callback;
  }

  onBookingFailed(callback: (data: BookingFailedEvent) => void): void {
    this.bookingFailedCallback = callback;
  }

  offTrackingListeners(): void { 
    this.bookingConfirmedCallback = null;
    this.statusUpdateCallback = null;
    this.bookingCancelledCallback = null;
    this.bookingFailedCallback = null;
    this.approvalRequestCallback = null;
    this.paymentRequestCallback = null;
  }
}

export const socketService = new SocketService();