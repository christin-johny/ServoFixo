
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../../../infrastructure/repositories/admin/adminAuthRepository";
import { logout } from "../../../../store/authSlice";

const AdminLogoutButton: React.FC<{ redirectTo?: string }> = ({ redirectTo = "/admin/login" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const doLogout = async () => {
    setLoading(true);
    try {
      await adminLogout();
    } catch (err) {
      console.warn("Logout request failed", err);
    } finally {
      dispatch(logout());
      setLoading(false);
      navigate(redirectTo);
    }
  };

  return (
    <button onClick={doLogout} className="px-3 py-2 rounded bg-red-600 text-white" disabled={loading}>
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
};

export default AdminLogoutButton;
