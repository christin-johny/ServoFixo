import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import CustomerHome from "../pages/Customer/Home/CustomerHome";
import CustomerDataLoader from "../components/auth/CustomerDataLoader";

const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));
const CustomerRegister = lazy(() => import("../pages/Customer/Register"));
const VerifyOtp = lazy(() => import("../pages/Customer/VerifyOtp"));
const ForgotPassword = lazy(() => import("../pages/Customer/ForgotPassword"));
const ServiceListing = lazy(() => import("../pages/Customer/Listing/ServiceListing"));
const ServiceDetails = lazy(() => import("../pages/Customer/Listing/ServiceDetails"));

const CustomerRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>

      <Route element={<CustomerDataLoader><Outlet /></CustomerDataLoader>}>
        <Route index element={<CustomerHome />} />
        <Route path="services" element={<ServiceListing />} />
        <Route path="services/:id" element={<ServiceDetails />} />
      </Route>

      <Route path="login" element={<GuestOnlyGuard><CustomerLogin /></GuestOnlyGuard>} />
      <Route path="register" element={<GuestOnlyGuard><CustomerRegister /></GuestOnlyGuard>} />
      <Route path="verify-otp" element={<GuestOnlyGuard><VerifyOtp /></GuestOnlyGuard>} />
      <Route path="forgot-password" element={<GuestOnlyGuard><ForgotPassword /></GuestOnlyGuard>} />

    </Routes>
  </Suspense>
);

export default CustomerRoutes;
