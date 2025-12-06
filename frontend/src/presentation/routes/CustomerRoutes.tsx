// src/presentation/routes/CustomerRoutes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import LogoutButton from "../components/Customer/LogoutButton";

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
      {/* NOTE: these are relative to /customer/* mounted in App.tsx */}
      <Route path="login" element={<CustomerLogin />} />
      <Route path="register" element={<CustomerRegister />} />
      <Route path="verify-otp" element={<VerifyOtp />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      {/* index -> /customer */}
      <Route index element={<CustomerHomeStub />} />
    </Routes>
  </Suspense>
);

export default CustomerRoutes;
