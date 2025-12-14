
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface Props {
  children: React.ReactElement;
}


const AuthGuard: React.FC<Props> = ({ children }) => {
  const auth = useSelector((s: RootState) => s.auth);
  const token = auth.accessToken;
  const userRole = auth.user?.role;

  if (token && userRole) {
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "technician":
        return <Navigate to="/technician" replace />;
      case "customer":
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default AuthGuard;
