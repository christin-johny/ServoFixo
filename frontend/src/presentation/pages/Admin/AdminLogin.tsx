// src/presentation/pages/Admin/AdminLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { adminLogin } from "../../../infrastructure/repositories/adminAuthRepository";
import { setAccessToken, setUser } from "../../../store/authSlice";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { parseJwt } from "../../../utils/jwt";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errs: any = {};
        err.errors.forEach((e) => {
          const f = e.path[0] as string;
          if (!errs[f]) errs[f] = e.message;
        });
        setFieldErrors(errs);
      }
      return false;
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const resp = await adminLogin({ email, password });
      // server sets refresh cookie; access token returned in resp
      const token = (resp as any).accessToken ?? (resp as any).token ?? null;
      const user = (resp as any).user ?? null;

      if (token) {
        dispatch(setAccessToken(token));
        // populate user from server if available, else decode token
        if (user) {
          dispatch(setUser(user));
        } else {
          const payload = parseJwt(token);
          dispatch(setUser({ id: payload?.sub, role: Array.isArray(payload?.roles) ? payload?.roles[0] : payload?.roles }));
        }
        navigate("/admin/dashboard");
      } else {
        setError("No token received from server");
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src="/assets/logo.png" alt="logo" className="h-10 w-10" />
          <h2 className="text-xl font-semibold">Admin Sign In</h2>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="sr-only">Email</label>
            <div className={`flex items-center bg-gray-50 border rounded-lg px-3 py-2 ${fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300"}`}>
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none w-full"
                onBlur={() => {
                  try {
                    loginSchema.shape.email.parse(email);
                    setFieldErrors((p) => ({ ...p, email: undefined }));
                  } catch (err) {
                    if (err instanceof z.ZodError) setFieldErrors((p) => ({ ...p, email: err.errors[0].message }));
                  }
                }}
                type="email"
              />
            </div>
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="sr-only">Password</label>
            <div className={`flex items-center bg-gray-50 border rounded-lg px-3 py-2 ${fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-300"}`}>
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full"
                type={showPassword ? "text" : "password"}
                onBlur={() => {
                  try {
                    loginSchema.shape.password.parse(password);
                    setFieldErrors((p) => ({ ...p, password: undefined }));
                  } catch (err) {
                    if (err instanceof z.ZodError) setFieldErrors((p) => ({ ...p, password: err.errors[0].message }));
                  }
                }}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="ml-2 text-gray-500">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <button
              type="submit"
              className={`w-full rounded-lg py-2 text-white font-semibold ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={loading}
            >
              {loading ? <span className="flex items-center justify-center gap-2">Signing in...</span> : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
