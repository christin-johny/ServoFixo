// src/presentation/routes/CustomerRoutes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import CustomerHome from "../pages/Customer/Home/CustomerHome";

// Lazy imports
const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));
const CustomerRegister = lazy(() => import("../pages/Customer/Register"));
const VerifyOtp = lazy(() => import("../pages/Customer/VerifyOtp"));
const ForgotPassword = lazy(() => import("../pages/Customer/ForgotPassword"));

// Placeholder for future Profile page
// const CustomerProfile = lazy(() => import("../pages/Customer/Profile"));

const CustomerRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      
      <Route index element={<CustomerHome />} />

      <Route path="home" element={<Navigate to="/" replace />} />

      {/* --- AUTH ROUTES (Guests Only) --- */}
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

      {/* --- PROTECTED ROUTES (Logged-in Users Only) --- */}
      {/* Uncomment and add pages here when ready.
         Note: redirectTo is now "/login" (Root login), not "/customer/login"
      */}
      
      {/* <Route
        path="profile"
        element={
          <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
            <div className="p-6">
               <CustomerProfile />
            </div>
          </RoleProtectedRoute>
        }
      />
      */}

    </Routes>
  </Suspense>
);

export default CustomerRoutes;