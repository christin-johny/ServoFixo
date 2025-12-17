import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const GuestOnlyGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { accessToken, user } = useSelector((s: RootState) => s.auth);

  if (accessToken && user?.role) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "technician":
        return <Navigate to="/technician" replace />;
      case "customer":
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default GuestOnlyGuard;
