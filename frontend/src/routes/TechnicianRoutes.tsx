import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import PersonalDetails from "../features/profile/pages/technician/PersonalDetails";
import ServiceSkills from "../features/profile/pages/technician/ServiceSkills";
import PayoutSettings from "../features/profile/pages/technician/PayoutSettings";
 
const TechLogin = React.lazy(() => import("../features/auth/pages/technician/TechnicianLogin"));
const TechRegister = React.lazy(() => import("../features/auth/pages/technician/TechnicianRegister"));
const TechVerifyOtp = React.lazy(() => import("../features/auth/pages/technician/TechnicianVerifyOtp"));
const TechForgotPassword = React.lazy(() => import("../features/auth/pages/technician/TechnicianForgotPassword"));
 
const TechDashboard = React.lazy(() => import("../features/dashboard/pages/technician/TechnicianDashboard"));
const TechnicianLayout = React.lazy(() => import("../layouts/technician/TechnicianLayout"));
const OnboardingWizard =React.lazy(() => import("../features/onboarding/pages/OnboardingWizard"));
const TechnicianProfile=React.lazy(() => import("../features/profile/pages/technician/TechnicianProfile"));
const ActiveJobPage=React.lazy(() => import("../features/booking/pages/technician/ActiveJobPage"));
const AddExtrasPage = React.lazy(() => import("../features/booking/pages/technician/AddExtrasPage"));
const CompleteJobPage = React.lazy(() => import("../features/booking/pages/technician/CompleteJobPage"));
const MyJobsPage = React.lazy(() => import("../features/booking/pages/technician/MyJobsPage"));
const TechnicianBookingDetails = React.lazy(() => import("../features/booking/pages/technician/TechnicianBookingDetails"));

const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
 
      <Route path="login" element={<GuestOnlyGuard><TechLogin /></GuestOnlyGuard>} />
      <Route path="register" element={<GuestOnlyGuard><TechRegister /></GuestOnlyGuard>} />
      <Route path="forgot-password" element={<GuestOnlyGuard><TechForgotPassword /></GuestOnlyGuard>} />
      <Route path="verify-otp" element={<GuestOnlyGuard><TechVerifyOtp /></GuestOnlyGuard>} />

      <Route
        path="/"
        element={
          <RoleProtectedRoute requiredRole="technician" redirectTo="/technician/login">
            <TechnicianLayout />
          </RoleProtectedRoute>
        }
      >
        {/* Dashboard (Home) */}
        <Route index element={<TechDashboard />} />

        {/* Onboarding Wizard (Next Task) */}
        <Route path="onboarding" element={<OnboardingWizard />} />

        {/* Placeholders for Future Modules */}
        <Route path="jobs" element={<MyJobsPage />} />
        <Route path="wallet" element={<div className="p-8">Wallet Module (Coming Soon)</div>} />
        <Route path="profile" element={<TechnicianProfile/>} />
        <Route path="profile/personal" element={<PersonalDetails/>} />
        <Route path="profile/services" element={<ServiceSkills/>} />
        <Route path="profile/payouts" element={<PayoutSettings/>} />
        <Route path="jobs/:id" element={<ActiveJobPage />} />
        <Route path="jobs/:id/extras" element={<AddExtrasPage />} />
        <Route path="jobs/:id/complete" element={<CompleteJobPage />} />
        <Route path="jobs/:id/details" element={<TechnicianBookingDetails />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/technician/login" replace />} />

    </Routes>
  </Suspense>
);

export default TechnicianRoutes;