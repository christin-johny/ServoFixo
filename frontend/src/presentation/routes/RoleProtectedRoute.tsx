// src/presentation/routes/RoleProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface Props {
  children: React.ReactElement;
  requiredRole?: string | string[];
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<Props> = ({ children, requiredRole, redirectTo }) => {
  const auth = useSelector((s: RootState) => s.auth);
  const token = auth.accessToken;
  const userRoles: string[] = auth.user ? [auth.user.role ?? ""] : [];

  if (!token) {
    return <Navigate to={redirectTo ?? "/login"} replace />;
  }

  if (!requiredRole) return children;

  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRole = required.some((r) => userRoles.includes(r));

  if (!hasRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
