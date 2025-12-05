// src/presentation/routes/TechnicianRoutes.tsx
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";

// const TechLogin = lazy(() => import("../pages/Technician/TechnicianLogin" /* optional */));
// const TechDashboard = lazy(() => import("../pages/Technician/TechnicianDashboard" /* optional */));

const TechnicianRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      <Route path="/login" element={<div>Technician Login (implement)</div>} />
      <Route path="/" element={<div>Technician Dashboard (implement)</div>} />
    </Routes>
  </Suspense>
);

export default TechnicianRoutes;
