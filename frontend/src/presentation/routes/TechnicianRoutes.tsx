import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import PersonalDetails from "../pages/Technician/Profile/PersonalDetails";
import ServiceSkills from "../pages/Technician/Profile/ServiceSkills";
 
const TechLogin = React.lazy(() => import("../pages/Technician/Auth/TechnicianLogin"));
const TechRegister = React.lazy(() => import("../pages/Technician/Auth/TechnicianRegister"));
const TechVerifyOtp = React.lazy(() => import("../pages/Technician/Auth/TechnicianVerifyOtp"));
const TechForgotPassword = React.lazy(() => import("../pages/Technician/Auth/TechnicianForgotPassword"));
 
const TechDashboard = React.lazy(() => import("../pages/Technician/Dashboard/TechnicianDashboard"));
const TechnicianLayout = React.lazy(() => import("../components/Technician/Layout/TechnicianLayout"));
const OnboardingWizard =React.lazy(() => import("../components/Technician/Onboarding/OnboardingWizard"));
const TechnicianProfile=React.lazy(() => import("../pages/Technician/Profile/TechnicianProfile"));

const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
 
      <Route path="login" element={<GuestOnlyGuard><TechLogin /></GuestOnlyGuard>} />
      <Route path="register" element={<GuestOnlyGuard><TechRegister /></GuestOnlyGuard>} />
      <Route path="forgot-password" element={<GuestOnlyGuard><TechForgotPassword /></GuestOnlyGuard>} />
      <Route path="verify-otp" element={<GuestOnlyGuard><TechVerifyOtp /></GuestOnlyGuard>} />

      {/* =================================================
          2. PROTECTED APP ROUTES (With Layout)
      ================================================== */}
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
        <Route path="jobs" element={<div className="p-8">Jobs Module (Coming Soon)</div>} />
        <Route path="wallet" element={<div className="p-8">Wallet Module (Coming Soon)</div>} />
        <Route path="profile" element={<TechnicianProfile/>} />
        <Route path="profile/personal" element={<PersonalDetails/>} />
        <Route path="/profile/services" element={<ServiceSkills/>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/technician/login" replace />} />

    </Routes>
  </Suspense>
);

export default TechnicianRoutes;