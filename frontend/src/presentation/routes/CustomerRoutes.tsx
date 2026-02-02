import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import CustomerHome from "../pages/Customer/Home/CustomerHome";
import CustomerDataLoader from "../components/auth/CustomerDataLoader";
import RoleProtectedRoute from "./RoleProtectedRoute";
import ActiveBookingFooter from "../components/Customer/Layout/ActiveBookingFooter";

const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));
const CustomerRegister = lazy(() => import("../pages/Customer/Register"));
const VerifyOtp = lazy(() => import("../pages/Customer/VerifyOtp"));
const ForgotPassword = lazy(() => import("../pages/Customer/ForgotPassword"));
const ServiceListing = lazy(() => import("../pages/Customer/Listing/ServiceListing"));
const ServiceDetails = lazy(() => import("../pages/Customer/Listing/ServiceDetails"));
const ProfilePage = lazy(() => import("../pages/Customer/Profile/ProfilePage")); 
const BookingConfirm = lazy(() => import("../pages/Customer/Booking/BookingConfirm"));
const SearchingScreen = lazy(() => import("../pages/Customer/Booking/SearchingScreen"));
const BookingTrackingPage = lazy(() => import("../pages/Customer/Booking/BookingTrackingPage"));
const PaymentPage = lazy(() => import("../pages/Customer/Booking/PaymentPage"));
const RateTechnicianPage = lazy(() => import("../pages/Customer/Booking/RateTechnicianPage"));
const PaymentFailedPage = lazy(() => import("../pages/Customer/Booking/PaymentFailedPage"));

const CustomerRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      <Route element={<CustomerDataLoader><Outlet /></CustomerDataLoader>}>
        <Route index element={<CustomerHome />} />
        <Route path="services" element={<ServiceListing />} />
        <Route path="services/:id" element={<ServiceDetails />} />
        <Route 
          path="profile" 
          element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
              <ProfilePage />
            </RoleProtectedRoute>
          } 
        />
        <Route path="booking/confirm" element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
                <BookingConfirm />
            </RoleProtectedRoute>
        } />
        <Route path="booking/searching" element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
                <SearchingScreen />
            </RoleProtectedRoute>
        } />
        {/* Real-time Tracking Route */}
        <Route path="booking/:id/track" element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
                <BookingTrackingPage />
            </RoleProtectedRoute>
        } />
        <Route path="booking/:id/payment" element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
                <PaymentPage />
            </RoleProtectedRoute>
        } />
        <Route path="booking/:id/rate" element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
              <RateTechnicianPage />
            </RoleProtectedRoute>
        } />
        <Route path="booking/:id/payment/failed" element={
        <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
            <PaymentFailedPage />
        </RoleProtectedRoute>
    } />
      </Route>

      <Route path="login" element={<GuestOnlyGuard><CustomerLogin /></GuestOnlyGuard>} />
      <Route path="register" element={<GuestOnlyGuard><CustomerRegister /></GuestOnlyGuard>} />
      <Route path="verify-otp" element={<GuestOnlyGuard><VerifyOtp /></GuestOnlyGuard>} />
      <Route path="forgot-password" element={<GuestOnlyGuard><ForgotPassword /></GuestOnlyGuard>} />
    </Routes>
    {/* Persistent Active Job Tracker */}
    <ActiveBookingFooter />
  </Suspense>
);

export default CustomerRoutes;