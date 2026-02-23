import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import AdminLogin from "../features/auth/pages/admin/AdminLogin";
import AdminDashboard from "../features/dashboard/pages/admin/AdminDashboard";
import GuestOnlyGuard from "./GuestOnlyGuard";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AdminLayout from "../layouts/admin/AdminLayout";
import Zones from "../features/zones/pages/Zones";
import Services from "../features/service-catalog/pages/admin/Services";
import Customers from "../features/profile/pages/admin/customerProfile/AdminCustomersPage";
import AdminCustomerProfilePage from "../features/profile/pages/admin/customerProfile/AdminCustomerProfilePage";
 
import TechnicianVerificationQueue from "../features/profile/pages/admin/technicianProfile/TechnicianVerificationQueue";
import TechnicianVerificationDetails from "../features/profile/pages/admin/technicianProfile/TechnicianVerificationDetails";
import TechnicianList from "../features/profile/pages/admin/technicianProfile/TechnicianList";
import AdminTechnicianProfilePage from "../features/profile/pages/admin/technicianProfile/AdminTechnicianProfilePage";
import PartnerRequestQueue from "../features/profile/pages/admin/technicianProfile/TechnicainRequestQueue";
const AdminBookingsPage = React.lazy(() => import("../features/booking/pages/admin/AdminBookingsPage")); 
const AdminBookingDetails = React.lazy(() => import("../features/booking/pages/admin/AdminBookingDetails"));
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
        <Route path="bookings"> 
            <Route path="live" element={<AdminBookingsPage />} />
            <Route path="history" element={<AdminBookingsPage />} />
             
           <Route path=":id" element={<AdminBookingDetails />} /> 
             
            <Route index element={<Navigate to="live" replace />} />
        </Route>

        <Route path="customers">
          <Route index element={<Customers />} />
          <Route path=":customerId" element={<AdminCustomerProfilePage />} />
        </Route>

        {/*   TECHNICIAN ROUTES */}
        <Route path="technicians">
          {/* 1. Verification Flow (Pending items) */}
          <Route path="verification" element={<TechnicianVerificationQueue />} />
          <Route path="verification/:id" element={<TechnicianVerificationDetails />} />
          
          {/* 2. Management Flow (Master Database) */}
          <Route path="list" element={<TechnicianList />} />
          <Route path="requests" element={<PartnerRequestQueue/>} />
          
          {/* 3. The New Profile Page (For viewing verified/suspended users) */}
          <Route path=":id" element={<AdminTechnicianProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminRoutes;