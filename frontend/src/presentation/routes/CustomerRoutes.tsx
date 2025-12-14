 
  import React, { Suspense, lazy } from "react";
  import { Routes, Route, Navigate,Outlet } from "react-router-dom";
  import LoaderFallback from "../components/LoaderFallback";
  import AuthGuard from "./AuthGuard";
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
      
      <Route element={
          <CustomerDataLoader>
             <Outlet />
          </CustomerDataLoader>
      }>
          <Route index element={<CustomerHome />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="services" element={<ServiceListing />} />
          <Route path="services/:id" element={<ServiceDetails />} />
      </Route>


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

    </Routes>
  </Suspense>
);

export default CustomerRoutes;
