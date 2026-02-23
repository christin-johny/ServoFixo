import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import CustomerHome from "../features/dashboard/pages/customer/CustomerHome";
import CustomerDataLoader from "../features/auth/components/CustomerDataLoader";
import RoleProtectedRoute from "./RoleProtectedRoute";
import ActiveBookingFooter from "../features/booking/components/customer/ActiveBookingFooter";

const CustomerLogin = lazy(() => import("../features/auth/pages/customer/CustomerLogin"));
const CustomerRegister = lazy(() => import("../features/auth/pages/customer/Register"));
const VerifyOtp = lazy(() => import("../features/auth/pages/customer/VerifyOtp"));
const ForgotPassword = lazy(() => import("../features/auth/pages/customer/ForgotPassword"));
const ServiceListing = lazy(() => import("../features/service-catalog/pages/customer/ServiceListing"));
const ServiceDetails = lazy(() => import("../features/service-catalog/pages/customer/ServiceDetails"));
const ProfilePage = lazy(() => import("../features/profile/pages/customer/ProfilePage")); 
const BookingConfirm = lazy(() => import("../features/booking/pages/customer/BookingConfirm"));
const SearchingScreen = lazy(() => import("../features/booking/pages/customer/SearchingScreen"));
const BookingTrackingPage = lazy(() => import("../features/booking/pages/customer/BookingTrackingPage"));
const PaymentPage = lazy(() => import("../features/booking/pages/customer/PaymentPage"));
const RateTechnicianPage = lazy(() => import("../features/booking/pages/customer/RateTechnicianPage"));
const PaymentFailedPage = lazy(() => import("../features/booking/pages/customer/PaymentFailedPage"));
const BookingHistoryPage = lazy(() => import("../features/booking/pages/customer/BookingHistoryPage"));
const BookingDetailsPage = lazy(() => import("../features/booking/pages/customer/BookingDetailsPage"));

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

    <Route 
          path="booking/history" 
          element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
              <BookingHistoryPage />
            </RoleProtectedRoute>
          } 
        />

    <Route path="booking/:id/details" element={
            <RoleProtectedRoute requiredRole="customer" redirectTo="/login">
                <BookingDetailsPage />
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