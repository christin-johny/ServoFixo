// src/presentation/routes/AdminRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AdminLogin from "../pages/Admin/AdminLogin"; // if you prefer lazy, rewrap in lazy/Suspense
import AdminDashboard from "../pages/Admin/AdminDashboard";

const AdminRoutes: React.FC = () => (
  <React.Suspense fallback={<LoaderFallback />}>
    <Routes>
      {/* index -> /admin  (protected) */}
      <Route index element={<AdminDashboard />} />
      {/* explicit dashboard route -> /admin/dashboard */}
      <Route path="dashboard" element={<AdminDashboard />} />
      {/* optional: keep a fallback within admin area */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </React.Suspense>
);

export default AdminRoutes;
