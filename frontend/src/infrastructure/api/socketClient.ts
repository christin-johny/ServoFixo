import { io, Socket } from "socket.io-client";
import type { Notification } from "../../domain/types/Notification";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(techId: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      query: { techId },
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => { 
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
    this.socket?.on("NOTIFICATION_RECEIVED", (data) => {
      callback(data);
    });
  }
 
  offNotification(): void {
    this.socket?.off("NOTIFICATION_RECEIVED");
  }
}

export const socketService = new SocketService();