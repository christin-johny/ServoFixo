// src/presentation/routes/AuthGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface Props {
  children: React.ReactElement;
}

/**
 * AuthGuard prevents authenticated users from accessing auth routes (login/register).
 * If user is logged in, redirects them to their appropriate dashboard based on role.
 */
const AuthGuard: React.FC<Props> = ({ children }) => {
  const auth = useSelector((s: RootState) => s.auth);
  const token = auth.accessToken;
  const userRole = auth.user?.role;

  // If user is authenticated, redirect to their dashboard
  if (token && userRole) {
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "technician":
        return <Navigate to="/technician" replace />;
      case "customer":
      default:
        return <Navigate to="/customer" replace />;
    }
  }

  // If not authenticated, show the auth page (login/register)
  return children;
};

export default AuthGuard;
