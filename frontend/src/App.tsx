import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import { setAccessToken, setUser, logout } from "./store/authSlice";
import * as authRepo from "./features/auth/api/authRepository";
import AdminRoutes from "./routes/AdminRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";
import TechnicianRoutes from "./routes/TechnicianRoutes";
import LoaderFallback from "./components/LoaderFallback";
import { parseJwt } from "./utils/jwt";
import { NotificationProvider } from "./features/notifications/context/NotificationContext";
import ToastContainer from "./features/notifications/components/ToastContainer";
import type { RefreshResponse } from "./features/auth/types/auth";

const AppInner: React.FC = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let aborted = false;

    const tryRefresh = async () => {
      try { 
        const data = (await authRepo.refresh()) as RefreshResponse;

        const token = data.accessToken ?? data.token ?? null;
        const user = data.user ?? null;

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
                    role: payload.type,
                  })
                );
              }
            }
          } else {
            dispatch(logout());
          }
        }
      } catch {
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
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<LoaderFallback />}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route path="/technician/*" element={<TechnicianRoutes />} />
        <Route path="/*" element={<CustomerRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <NotificationProvider>
      <AppInner />
      <ToastContainer />
    </NotificationProvider>
  </Provider>
);

export default App;