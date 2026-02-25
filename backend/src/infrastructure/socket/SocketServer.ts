import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { ILogger } from "../../application/interfaces/services/ILogger"; 

export class SocketServer {
  private static _io: SocketIOServer;

  public static init(httpServer: HTTPServer, logger: ILogger): SocketIOServer {
    this._io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_ORIGIN, 
        methods: ["GET", "POST"],
      },
    });

// ... inside connection event ...

this._io.on("connection", (socket) => { 
  const techId = socket.handshake.query.techId as string;
  const userId = socket.handshake.query.userId as string;
  const role = socket.handshake.query.role as string;
 
  if (role === "ADMIN") { 
      socket.join("ADMIN_BROADCAST_CHANNEL");  
      if (userId) socket.join(userId);
      logger.info(`Admin Connected to Broadcast Channel: ${userId}`); 
  } 
  else if (techId) { 
    socket.join(techId);
    logger.info(`Technician Connected: ${techId}`);
  } 
  else if (userId) { 
    socket.join(userId);
    logger.info(`Customer Connected: ${userId}`);
  }
});

    return this._io;
  }

  public static getInstance(): SocketIOServer {
    if (!this._io) {
      throw new Error("Socket.io not initialized!");
    }
    return this._io;
  }
}