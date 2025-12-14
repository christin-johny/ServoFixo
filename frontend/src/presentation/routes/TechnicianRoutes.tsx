
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";

const TechLogin: React.FC = () => <div className="p-6">Technician Login (implement)</div>;
const TechDashboard: React.FC = () => <div className="p-6">Technician Dashboard (implement)</div>;

const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes> 
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
