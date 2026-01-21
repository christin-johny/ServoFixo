import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";  
import { connectDatabase } from "./infrastructure/config/Database";
import cookieParser from "cookie-parser";
import passport from "./infrastructure/security/PassportConfig";
import { SocketServer } from "./infrastructure/socket/SocketServer"; 
import { logger } from "./infrastructure/di/Container";  

const app = express();
const httpServer = createServer(app); // ✅ Wrap Express with HTTP Server

app.use(express.json());
app.use(cookieParser());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(passport.initialize());

// Temporary Debug Route
app.post("/api/debug/test-notification/:techId", (req, res) => {
  const { techId } = req.params;
  const io = SocketServer.getInstance();

  const testData = {
    id: new Date().getTime().toString(),
    type: "SERVICE_REQUEST_APPROVED",
    title: "Debug Test 🔔",
    body: "If you see this, Socket.io is working perfectly!",
    clickAction: "/technician/profile",
    status: "UNREAD",
    createdAt: new Date().toISOString(),
    metadata: { test: "true" }
  };

  // Target the specific room joined in SocketServer.ts
  io.to(techId).emit("NOTIFICATION_RECEIVED", testData);

  res.json({ message: `Attempted to send notification to room: ${techId}` });
});


// Routes
import adminRoutes from "./presentation/routes/admin";
import customerRoutes from "./presentation/routes/customer/index";
import technicianRoutes from './presentation/routes/technician/index.ts'
import globalAuthRouter from './presentation/routes/GlobalAuthRouter';

app.use('/api/auth', globalAuthRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/technician", technicianRoutes);

export const startServer = async () => {
  await connectDatabase();
 
  SocketServer.init(httpServer, logger);

  const PORT = process.env.PORT || 5000;
   
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Real-time Socket.io engine initialized`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}