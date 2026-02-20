
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { customerLogout } from "../api/authRepository";
import { logout } from "../../../store/authSlice";

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await customerLogout();
    } catch (err) {
      console.warn("Logout request failed (still clearing client state):", err);
    } finally {

      dispatch(logout());
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("otpFlowData");
      navigate("/customer/login");
    }
  };

  return (
    <button onClick={handleLogout} className="px-3 py-2 rounded bg-red-600 text-white">
      Logout
    </button>
  );
};

export default LogoutButton;
