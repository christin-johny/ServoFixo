import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDatabase } from "./infrastructure/config/Database";
import cookieParser from "cookie-parser";
import passport from "./infrastructure/security/PassportConfig";

const app = express();

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

import adminRoutes from "./presentation/routes/admin";

import customerAuthRoutes from "./presentation/routes/customer/auth.routes";
//import technicianAuthRoutes from "./presentation/routes/technician/auth.routes";
import customerRoutes from "./presentation/routes/customer/index";
//

app.use("/api/admin", adminRoutes);

app.use("/api/customer", customerRoutes);

// app.use("/api/technician/auth", technicianAuthRoutes);
// app.use("/api/technician", technicianRoutes);

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
