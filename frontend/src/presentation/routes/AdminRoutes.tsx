import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AuthGuard from "./AuthGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AdminLayout from "../layouts/AdminLayout"; // <--- Default import

const AdminRoutes: React.FC = () => (
  <React.Suspense fallback={<LoaderFallback />}>
    <Routes>
      <Route
        path="login"
        element={
          <AuthGuard>
            <AdminLogin />
          </AuthGuard>
        }
      />

      <Route
        element={
          <RoleProtectedRoute requiredRole="admin" redirectTo="/admin/login">
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Placeholder Routes */}
        <Route path="bookings/*" element={<div>Bookings Module</div>} />
        <Route path="technicians/*" element={<div>Technicians Module</div>} />
        <Route path="customers" element={<div>Customers Module</div>} />
        <Route path="zones" element={<div>Zones Module</div>} />
        <Route path="payments" element={<div>Payments Module</div>} />
        <Route path="disputes" element={<div>Disputes Module</div>} />
        <Route path="reports" element={<div>Reports Module</div>} />
        <Route path="settings" element={<div>Settings Module</div>} />

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  </React.Suspense>
);

export default AdminRoutes;