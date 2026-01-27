import { io, Socket } from "socket.io-client";
import type { Notification } from "../../domain/types/Notification";
// 👇 1. IMPORT THE STORE AND ACTION DIRECTLY
import store from "../../store/store"; 
import { setIncomingJob } from "../../store/technicianBookingSlice";

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
  private currentUserId: string | null = null; 

  connect(userId: string, role: UserRole): void {
    if (this.socket?.connected && this.currentUserId === userId) {
        return;
    }

    if (this.socket) {
        this.disconnect();
    }

    this.currentUserId = userId; 

    const queryParams: Record<string, string> = { role };
    if (role === "TECHNICIAN") {
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
    });

    this.socket.on("disconnect", () => { 
    });

    // --- 👇 THE CRITICAL FIX: DIRECT DISPATCH 👇 ---
    // This runs automatically. No React Component needed.
    this.socket.on("booking:assign_request", (data: JobRequestEvent) => { 
        store.dispatch(setIncomingJob(data)); 
    });
    // ------------------------------------------------

    
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
  } 

  onNotification(callback: (notification: Notification) => void): void {
    this.socket?.off("NOTIFICATION_RECEIVED");
    this.socket?.on("NOTIFICATION_RECEIVED", callback);
  }

  offNotification(): void {
    this.socket?.off("NOTIFICATION_RECEIVED");
  }

  onBookingConfirmed(callback: (data: BookingConfirmedEvent) => void): void {
    this.socket?.off("booking:confirmed");
    this.socket?.on("booking:confirmed", callback);
  }
  
  offBookingConfirmed(): void {
      this.socket?.off("booking:confirmed");
  }
 
  onJobRequest(callback: (data: JobRequestEvent) => void): void {
    this.socket?.on("booking:assign_request", callback);
  }

  offJobRequest(): void { 
  }
}

export const socketService = new SocketService();