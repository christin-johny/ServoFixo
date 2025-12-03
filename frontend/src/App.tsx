// src/App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import { setAccessToken, setUser, logout } from "./store/authSlice";
import * as authRepo from "./infrastructure/repositories/authRepository";
import ProtectedRoute from "./presentation/routes/ProtectedRoute";
import Register from "./presentation/pages/Register";
// --- Placeholder pages (replace with real UI components when ready) ---
const Login = () => <div>Login page — will be replaced</div>;

const VerifyOtp = () => <div>Verify OTP — will be replaced</div>;
const Dashboard = () => <div>Dashboard — protected</div>;

const AppInner: React.FC = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let aborted = false;

    const tryRefresh = async () => {
      try {
        const data = await authRepo.refresh(); // AuthResponse shape from shared DTOs
        const token = (data as any).token ?? null; // backend uses `token`
        const user = (data as any).user ?? null;

        if (!aborted) {
          if (token) {
            dispatch(setAccessToken(token));
            dispatch(setUser(user));
          } else {
            // No token returned — ensure logged out state
            dispatch(logout());
          }
        }
      } catch (err) {
        if (!aborted) {
          dispatch(logout());
        }
      } finally {
        if (!aborted) setInitializing(false);
      }
    };

    tryRefresh();

    return () => {
      aborted = true;
    };
  }, [dispatch]);

  if (initializing) {
    // Small, unobtrusive boot/loading screen while we try refresh
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
      }}>
        <div>
          <div style={{ textAlign: "center", marginBottom: 8 }}>Checking session…</div>
          <div style={{ textAlign: "center", opacity: 0.6 }}>If you stay logged-in, this completes automatically.</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppInner />
  </Provider>
);

export default App;
