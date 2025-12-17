import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface Props {
  children: React.ReactElement;
  requiredRole: string;
  redirectTo: string;
}

const RoleProtectedRoute: React.FC<Props> = ({ children, requiredRole, redirectTo }) => {
  const { accessToken, user } = useSelector((s: RootState) => s.auth);

  if (!accessToken || user?.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
