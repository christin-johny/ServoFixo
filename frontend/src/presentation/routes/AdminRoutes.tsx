import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import Zones from "../pages/Admin/Zones/Zones";
import Services from "../pages/Admin/Services/Services";
import Customers from "../pages/Admin/Customers/AdminCustomersPage";
import AdminCustomerProfilePage from "../pages/Admin/Customers/AdminCustomerProfilePage";

// Technician Pages
import TechnicianVerificationQueue from "../pages/Admin/Technicians/TechnicianVerificationQueue";
import TechnicianVerificationDetails from "../pages/Admin/Technicians/TechnicianVerificationDetails";
import TechnicianList from "../pages/Admin/Technicians/TechnicianList"; // ✅ Import the List Page

const AdminRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>

      {/* Login */}
      <Route
        path="login"
        element={
          <GuestOnlyGuard>
            <AdminLogin />
          </GuestOnlyGuard>
        }
      />

      {/* Protected Admin Area */}
      <Route
        element={
          <RoleProtectedRoute requiredRole="admin" redirectTo="/admin/login">
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="zones" element={<Zones />} />
        <Route path="services" element={<Services />} />

        <Route path="customers">
          <Route index element={<Customers />} />
          <Route path=":customerId" element={<AdminCustomerProfilePage />} />
        </Route>

        <Route path="technicians">
          <Route path="verification" element={<TechnicianVerificationQueue />} />

          <Route path="verification/:id" element={<TechnicianVerificationDetails />} />

          <Route path="list" element={<TechnicianList />} />
        </Route>

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminRoutes;