// src/presentation/routes/CustomerRoutes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import LogoutButton from "../components/Customer/LogoutButton";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";

// lazy imports (or keep your current lazies)
const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));
const CustomerRegister = lazy(() => import("../pages/Customer/Register"));
const VerifyOtp = lazy(() => import("../pages/Customer/VerifyOtp"));
const ForgotPassword = lazy(() => import("../pages/Customer/ForgotPassword"));

// Add other customer pages as needed (dashboard, profile, etc.)
const CustomerHomeStub: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold">Customer Home (stub)</h2>
    <LogoutButton />
  </div>
);

const CustomerRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      {/* Public auth routes - wrapped with AuthGuard to prevent logged-in users */}
      <Route
        path="login"
        element={
          <AuthGuard>
            <CustomerLogin />
          </AuthGuard>
        }
      />
      <Route
        path="register"
        element={
          <AuthGuard>
            <CustomerRegister />
          </AuthGuard>
        }
      />
      <Route
        path="verify-otp"
        element={
          <AuthGuard>
            <VerifyOtp />
          </AuthGuard>
        }
      />
      <Route
        path="forgot-password"
        element={
          <AuthGuard>
            <ForgotPassword />
          </AuthGuard>
        }
      />

      {/* Protected routes - require customer role */}
      <Route
        index
        element={
          <RoleProtectedRoute requiredRole="customer" redirectTo="/customer/login">
            <CustomerHomeStub />
          </RoleProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);

export default CustomerRoutes;
