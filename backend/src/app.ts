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
const httpServer = createServer(app);  

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

// Routes
import adminRoutes from "./presentation/routes/admin";
import customerRoutes from "./presentation/routes/customer/index";
import technicianRoutes from './presentation/routes/technician/index.ts'
import globalAuthRouter from './presentation/routes/GlobalAuthRouter';
import bookingRoutes from './presentation/routes/booking.routes';

app.use('/api/auth', globalAuthRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/bookings", bookingRoutes);

export const startServer = async () => {
  await connectDatabase();
 
  SocketServer.init(httpServer, logger);

  const PORT = process.env.PORT || 5000;
   
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}