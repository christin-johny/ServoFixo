import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";

const TechLogin: React.FC = () => <div className="p-6">Technician Login</div>;
const TechDashboard: React.FC = () => <div className="p-6">Technician Dashboard</div>;

const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>

      <Route
        path="login"
        element={
          <GuestOnlyGuard>
            <TechLogin />
          </GuestOnlyGuard>
        }
      />

      <Route
        index
        element={
          <RoleProtectedRoute requiredRole="technician" redirectTo="/technician/login">
            <TechDashboard />
          </RoleProtectedRoute>
        }
      />

    </Routes>
  </Suspense>
);

export default TechnicianRoutes;
