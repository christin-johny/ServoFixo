import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import PersonalDetails from "../pages/Technician/Profile/PersonalDetails";
import ServiceSkills from "../pages/Technician/Profile/ServiceSkills";
import PayoutSettings from "../pages/Technician/Profile/PayoutSettings";
 
const TechLogin = React.lazy(() => import("../pages/Technician/Auth/TechnicianLogin"));
const TechRegister = React.lazy(() => import("../pages/Technician/Auth/TechnicianRegister"));
const TechVerifyOtp = React.lazy(() => import("../pages/Technician/Auth/TechnicianVerifyOtp"));
const TechForgotPassword = React.lazy(() => import("../pages/Technician/Auth/TechnicianForgotPassword"));
 
const TechDashboard = React.lazy(() => import("../pages/Technician/Dashboard/TechnicianDashboard"));
const TechnicianLayout = React.lazy(() => import("../components/Technician/Layout/TechnicianLayout"));
const OnboardingWizard =React.lazy(() => import("../components/Technician/Onboarding/OnboardingWizard"));
const TechnicianProfile=React.lazy(() => import("../pages/Technician/Profile/TechnicianProfile"));
const ActiveJobPage=React.lazy(() => import("../pages/Technician/Job/ActiveJobPage"));
const AddExtrasPage = React.lazy(() => import("../pages/Technician/Job/AddExtrasPage"));
 const CompleteJobPage = React.lazy(() => import("../pages/Technician/Job/CompleteJobPage"));
 const MyJobsPage = React.lazy(() => import("../pages/Technician/Job/MyJobsPage"));
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
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/technician/login" replace />} />

    </Routes>
  </Suspense>
);

export default TechnicianRoutes;