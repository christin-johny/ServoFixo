import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDatabase } from "./infrastructure/config/Database";
import cookieParser from "cookie-parser";
import passport from "./infrastructure/security/PassportConfig";


const app = express();

// Parse JSON
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

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

import adminAuthRoutes from "./presentation/routes/adminAuth.routes";
import customerAuthRoutes from "./presentation/routes/customerAuth.routes";
import technicianAuthRoutes from "./presentation/routes/technicianAuth.routes";
import adminRoutes from "./presentation/routes/admin.routes";
import customerRoutes from "./presentation/routes/customer.routes";
import technicianRoutes from "./presentation/routes/technician.routes";

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/technician/auth", technicianAuthRoutes);
app.use("/api/technician", technicianRoutes);

export const startServer = async () => {
  await connectDatabase();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
