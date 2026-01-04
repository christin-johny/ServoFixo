import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ZodError, z } from "zod";
import { technicianLogin } from "../../../../infrastructure/repositories/technician/technicianAuthRepository";
import { setAccessToken, setUser } from "../../../../store/authSlice";
import { parseJwt } from "../../../../utils/jwt";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { extractErrorMessage } from "../../../../utils/errorHelper";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const TechnicianLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((i) => {
          const key = String(i.path[0]);
          errors[key] = i.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    if (!validate()) return;

    setLoading(true);
    try {
      const data = await technicianLogin({ email, password });
      
      const token = data.accessToken || data.token || null;

      if (token) {
        dispatch(setAccessToken(token));
        const payload = parseJwt(token);
        if (payload) {
          dispatch(
            setUser({
              id: payload.sub,
              role: payload.type,
              email: payload.email,
            })
          );
        }
      }

      setLoading(false);
      navigate("/technician");
    } catch (err: unknown) {
      setLoading(false);
      setError(extractErrorMessage(err, "Login failed. Try again."));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <div className="bg-white shadow-sm py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/assets/logo.png" alt="ServoFixo" className="h-10 w-10" />
          <span className="text-xl font-bold text-blue-900">ServoFixo Partner</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* LEFT: form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Technician Login</h2>
              <p className="text-base text-gray-600 mt-1">Access your dashboard & jobs.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 ${touched.email && fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-200"}`}>
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    className="bg-transparent outline-none w-full"
                    placeholder="Enter your email"
                  />
                </div>
                {touched.email && fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 ${touched.password && fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-200"}`}>
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    className="bg-transparent outline-none w-full"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
              </div>

              {/* ✅ Forgot Password Link Added Here */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/technician/forgot-password")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-all disabled:bg-blue-400"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Want to join as a partner?{" "}
                <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={() => navigate("/technician/register")}>
                  Register Here
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Illustration */}
          <div className="hidden md:block md:w-1/2 bg-[url('/assets/techLogin.png')] bg-cover bg-center" />
        </div>
      </div>
    </div>
  );
};

export default TechnicianLogin;