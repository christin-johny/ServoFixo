// src/presentation/routes/AdminRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";

const AdminRoutes: React.FC = () => (
  <React.Suspense fallback={<LoaderFallback />}>
    <Routes>
      {/* Public auth route - wrapped with AuthGuard */}
      <Route
        path="login"
        element={
          <AuthGuard>
            <AdminLogin />
          </AuthGuard>
        }
      />

      {/* Protected routes - require admin role */}
      <Route
        index
        element={
          <RoleProtectedRoute requiredRole="admin" redirectTo="/admin/login">
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="dashboard"
        element={
          <RoleProtectedRoute requiredRole="admin" redirectTo="/admin/login">
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      
      {/* fallback within admin area */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </React.Suspense>
);

export default AdminRoutes;
