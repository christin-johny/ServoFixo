import { io, Socket } from "socket.io-client";
import type { Notification } from "../../domain/types/Notification";

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

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string, role: UserRole): void {
    if (this.socket?.connected) return;

    // --- CRITICAL FIX FOR REALTIME NOTIFICATIONS ---
    // The backend expects "techId" in the query to join the correct room.
    // We strictly map userId to "techId" if the role is TECHNICIAN.
    const queryParams: Record<string, string> = { role };

    if (role === "TECHNICIAN") {
      queryParams.techId = userId; // Restore legacy parameter for Backend
    } else {
      queryParams.userId = userId; // Standard param for Customers
    }

    this.socket = io(SOCKET_URL, {
      query: queryParams, 
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log(`✅ [${role}] Connected to Socket ${this.socket?.id}`);
    });

    this.socket.on("disconnect", () => {
      console.log(`❌ [${role}] Disconnected`);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
 

  onNotification(callback: (notification: Notification) => void): void {
    this.socket?.off("NOTIFICATION_RECEIVED");
    this.socket?.on("NOTIFICATION_RECEIVED", (data: Notification) => {
      callback(data);
    });
  }

  offNotification(): void {
    this.socket?.off("NOTIFICATION_RECEIVED");
  }
 

  onBookingConfirmed(callback: (data: BookingConfirmedEvent) => void): void {
    this.socket?.off("booking:confirmed");
    this.socket?.on("booking:confirmed", (data: BookingConfirmedEvent) => {
      console.log("🎉 Booking Confirmed Event:", data);
      callback(data);
    });
  }
 

  onJobRequest(callback: (data: JobRequestEvent) => void): void {
    this.socket?.off("booking:assign_request");
    this.socket?.on("booking:assign_request", (data: JobRequestEvent) => {
      console.log("🔔 New Job Request:", data);
      callback(data);
    });
  }
}

export const socketService = new SocketService();