// temp debug AdminRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";

// TEMP INLINE STUBS — replace with your real lazy imports after test
const AdminLogin = () => <div style={{padding:20}}>ADMIN LOGIN STUB — Hello 👋</div>;
const AdminDashboard = () => <div style={{padding:20}}>ADMIN DASHBOARD STUB</div>;

const AdminRoutes: React.FC = () => (
  <React.Suspense fallback={<LoaderFallback />}>
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="" element={<AdminDashboard />} />
    </Routes>
  </React.Suspense>
);

export default AdminRoutes;
