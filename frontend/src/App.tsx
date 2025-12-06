// src/App.tsx
import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import { setAccessToken, setUser, logout } from "./store/authSlice";
import * as authRepo from "./infrastructure/repositories/authRepository";
import AdminRoutes from "./presentation/routes/AdminRoutes";
import CustomerRoutes from "./presentation/routes/CustomerRoutes";
import TechnicianRoutes from "./presentation/routes/TechnicianRoutes";
import LoaderFallback from "./presentation/components/LoaderFallback";
import { parseJwt } from "./utils/jwt";

const AppInner: React.FC = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let aborted = false;

    const tryRefresh = async () => {
      try {
        const data = await authRepo.refresh();
        const token = (data as any).accessToken ?? (data as any).token ?? null;
        const user = (data as any).user ?? null;

        if (!aborted) {
          if (token) {
            dispatch(setAccessToken(token));
            if (user) {
              dispatch(setUser(user));
            } else {
              const payload = parseJwt(token);
              if (payload) {
                dispatch(
                  setUser({
                    id: payload.sub,
                    role: Array.isArray(payload.roles) ? payload.roles[0] : payload.roles,
                  })
                );
              }
            }
          } else {
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

  if (initializing) return <LoaderFallback />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/customer" replace />} />

        {/* Admin area - auth routes handled within AdminRoutes */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<LoaderFallback />}>
              <AdminRoutes />
            </Suspense>
          }
        />

        {/* Customer area - auth and protected routes handled within CustomerRoutes */}
        <Route path="/customer/*" element={<CustomerRoutes />} />

        {/* Technician area - auth and protected routes handled within TechnicianRoutes */}
        <Route path="/technician/*" element={<TechnicianRoutes />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
