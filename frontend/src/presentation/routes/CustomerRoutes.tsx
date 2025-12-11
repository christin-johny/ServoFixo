// src/presentation/routes/CustomerRoutes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import CustomerHome from "../pages/Customer/Home/CustomerHome";

// lazy imports
const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));
const CustomerRegister = lazy(() => import("../pages/Customer/Register"));
const VerifyOtp = lazy(() => import("../pages/Customer/VerifyOtp"));
const ForgotPassword = lazy(() => import("../pages/Customer/ForgotPassword"));

// ✅ FIX: Removed the CustomerHomeStub with 'p-6' padding. 
// We will use CustomerHome directly in the route below.

const CustomerRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      {/* Public auth routes */}
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

      {/* Protected routes */}
      <Route
        index
        element={
          <RoleProtectedRoute requiredRole="customer" redirectTo="/customer/login">
            {/* ✅ FIX: Use component directly to allow full-width layout */}
            <CustomerHome />
            
            {/* If you wanted a specific wrapper for other pages, do it here, 
                but Home usually needs to be full width. */}
          </RoleProtectedRoute>
        }
      />
      
      {/* Example: If you add a profile page later that NEEDS padding, wrap only that component
      <Route path="profile" element={ <div className="p-6"><CustomerProfile /></div> } /> 
      */}

    </Routes>
  </Suspense>
);

export default CustomerRoutes;