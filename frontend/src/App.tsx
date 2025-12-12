import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import { setAccessToken, setUser, logout } from "./store/authSlice";
import * as authRepo from "./infrastructure/repositories/authRepository";
import AdminRoutes from "./presentation/routes/AdminRoutes";
import CustomerRoutes from "./presentation/routes/CustomerRoutes";
import TechnicianRoutes from "./presentation/routes/TechnicianRoutes";
import LoaderFallback from "./presentation/components/LoaderFallback";
import { parseJwt } from "./utils/jwt";
import { NotificationProvider } from "./presentation/contexts/NotificationContext";
import ToastContainer from "../src/presentation/components/Notifications/ToastContainer";

const AppInner: React.FC = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let aborted = false;

    const tryRefresh = async () => {
      try {
        const data = await authRepo.refresh();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const token = (data as any).accessToken ?? (data as any).token ?? null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    role:payload.type ,
                  })
                );
              }
            }
          } else {
            dispatch(logout());
          }
        }
      } catch (_) {
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
        
        {/* 1. Admin Routes (Keep Isolated) */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<LoaderFallback />}>
              <AdminRoutes />
            </Suspense>
          }
        />

        {/* 2. Technician Routes (Keep Isolated) */}
        <Route path="/technician/*" element={<TechnicianRoutes />} />

        {/* 3. Customer Routes (Now at Root) */}
        {/* This MUST be last because "/*" catches everything else */}
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