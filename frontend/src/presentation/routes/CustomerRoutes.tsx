// src/presentation/routes/CustomerRoutes.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoaderFallback from "../components/LoaderFallback";
import LogoutButton from "../components/Customer/LogoutButton";

// const CustomerHome = lazy(() => import("../pages/Customer/CustomerHome" /* optional */));
const CustomerLogin = lazy(() => import("../pages/Customer/CustomerLogin"));

const CustomerRoutes: React.FC = () => (
  <Suspense fallback={<LoaderFallback />}>
    <Routes>
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/" element={<div>Customer home (implement) <LogoutButton/></div>} />
      {/* add more customer routes */}
    </Routes>
  </Suspense>
);

export default CustomerRoutes;
