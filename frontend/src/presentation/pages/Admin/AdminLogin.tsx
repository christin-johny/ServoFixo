import React, { useState } from "react";
// 1. Remove useNavigate since we are using window.location for the fix
import { useDispatch } from "react-redux";
import { z } from "zod";
import { adminLogin } from "../../../infrastructure/repositories/admin/adminAuthRepository";
import { setAccessToken, setUser } from "../../../store/authSlice";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { parseJwt } from "../../../utils/jwt";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const AdminLogin: React.FC = () => {
  // const navigate = useNavigate(); // <-- Removed for the fix
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
      const token = (resp as any).accessToken ?? (resp as any).token ?? null;
      const user = (resp as any).user ?? null;

      if (token) {
        // 🟢 FIX STEP 1: Manually save to storage to ensure it persists 
        // across the "reload" we are about to trigger.
        localStorage.setItem("accessToken", token);

        // Update Redux (Standard practice)
        dispatch(setAccessToken(token));
        
        if (user) {
          dispatch(setUser(user));
        } else {
          const payload = parseJwt(token);
          if (payload) {
             const role = Array.isArray(payload?.roles) ? payload?.roles[0] : payload?.roles;
             dispatch(setUser({ id: payload?.sub, role }));
          }
        } 
        
        // 🟢 FIX STEP 2: Force a Hard Browser Redirect
        // This simulates the "Refresh" that fixes your issue.
        // It bypasses the React Router race condition entirely.
        window.location.href = "/admin/dashboard";

      } else {
        setError("No token received from server");
      }

    } catch (err: any) {
      setError(err?.message ?? "Login failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex items-center justify-center p-4">

      {/* MAIN CONTAINER – fixed width, rounded, two sections */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE – Logo + Admin Login Form */}
        <div className="px-10 lg:px-14 py-12 flex flex-col justify-center">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/assets/logo.png" alt="ServoFixo" className="h-14 w-14" />
            <span className="text-xl font-semibold text-[#0B1B3B]">ServoFixo Admin</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-[#0B1B3B]">
            Welcome Back, Admin
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage ServoFixo operations.
          </p>

          {error && (
            <div className="mt-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={onSubmit} className="mt-8 space-y-6">

            {/* Admin Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <div
                className={`flex items-center bg-[#F4F5F9] border rounded-xl px-4 py-3 text-sm ${
                  fieldErrors.email
                    ? "border-red-300 bg-red-50"
                    : "border-transparent focus-within:border-[#1E88E5]"
                }`}
              >
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                <input
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-gray-800"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Admin Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <div
                className={`flex items-center bg-[#F4F5F9] border rounded-xl px-4 py-3 text-sm ${
                  fieldErrors.password
                    ? "border-red-300 bg-red-50"
                    : "border-transparent focus-within:border-[#1E88E5]"
                }`}
              >
                <Lock className="w-4 h-4 text-gray-400 mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="ml-2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`w-full rounded-xl py-3 text-white font-semibold text-sm ${
                loading
                  ? "bg-blue-400"
                  : "bg-[#1E88E5] hover:bg-[#166fbd]"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE — Illustration */}
        <div className="hidden md:flex items-center justify-center bg-[#FFFDF7] p-6">
          <img
            src="/assets/adminLogin.png"
            alt="Admin Illustration"
            className="max-w-[420px] w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;