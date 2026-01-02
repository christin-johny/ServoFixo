import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";

const TechLogin = React.lazy(() => import("../pages/Technician/Auth/TechnicianLogin"));
const TechRegister = React.lazy(() => import("../pages/Technician/Auth/TechnicianRegister"));
const TechVerifyOtp = React.lazy(() => import("../pages/Technician/Auth/TechnicianVerifyOtp"));
const TechDashboard = React.lazy(() => import("../pages/Technician/Dashboard/TechnicianDashboard"));
const TechForgotPassword = React.lazy(() => import("../pages/Technician/Auth/TechnicianForgotPassword"));
const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>

      {/* --- Public Auth Routes (Guest Only) --- */}
      <Route
        path="login"
        element={
          <GuestOnlyGuard>
            <TechLogin />
          </GuestOnlyGuard>
        }
      />

      <Route
        path="register"
        element={
          <GuestOnlyGuard>
            <TechRegister />
          </GuestOnlyGuard>
        }
      />
      <Route
        path="forgot-password"
        element={
          <GuestOnlyGuard>
            <TechForgotPassword />
          </GuestOnlyGuard>
        }
      />

      <Route
        path="verify-otp"
        element={
          <GuestOnlyGuard>
            <TechVerifyOtp />
          </GuestOnlyGuard>
        }
      />

      {/* --- Protected Dashboard --- */}
      <Route
        index
        element={
          <RoleProtectedRoute requiredRole="technician" redirectTo="/technician/login">
            <TechDashboard />
          </RoleProtectedRoute>
        }
      />

      {/* Catch all redirect to login */}
      <Route path="*" element={<TechLogin />} />

    </Routes>
  </Suspense>
);

export default TechnicianRoutes;