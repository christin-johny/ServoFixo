// src/presentation/routes/TechnicianRoutes.tsx
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";

// Placeholder components - implement these when ready
const TechLogin: React.FC = () => <div className="p-6">Technician Login (implement)</div>;
const TechDashboard: React.FC = () => <div className="p-6">Technician Dashboard (implement)</div>;

const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      {/* Public auth route - wrapped with AuthGuard */}
      <Route
        path="login"
        element={
          <AuthGuard>
            <TechLogin />
          </AuthGuard>
        }
      />

      {/* Protected routes - require technician role */}
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
