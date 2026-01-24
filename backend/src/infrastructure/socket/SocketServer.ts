import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { ILogger } from "../../application/interfaces/ILogger"; 

export class SocketServer {
  private static _io: SocketIOServer;

  public static init(httpServer: HTTPServer, logger: ILogger): SocketIOServer {
    this._io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_ORIGIN, 
        methods: ["GET", "POST"],
      },
    });

    this._io.on("connection", (socket) => { 
      const techId = socket.handshake.query.techId as string;

      if (techId) { 
        socket.join(techId);
        logger.info(`Technician Connected: ${techId}`);

        socket.on("disconnect", () => {
          logger.info(`Technician Disconnected: ${techId}`);
        });
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