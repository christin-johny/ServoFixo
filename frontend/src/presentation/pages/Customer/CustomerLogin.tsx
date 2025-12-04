// src/presentation/pages/Customer/CustomerLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { customerLogin } from "../../../infrastructure/repositories/authRepository";
import { setAccessToken } from "../../../store/authSlice";

const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validate = (): { email?: string; password?: string } => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Please enter your email.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Please enter a valid email.";

    if (!password) errs.password = "Please enter your password.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";

    return errs;
  };

  const errors = validate();

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // customerLogin returns resp.data (AuthResponse) — server returns { message, accessToken }
      const data = await customerLogin({ email, password });
      // read accessToken (preferred) or fallback to token
      const token = (data as any).accessToken ?? (data as any).token ?? null;

      if (token) {
        dispatch(setAccessToken(token));
      }

      setLoading(false);
      navigate("/");
    } catch (err: any) {
      setLoading(false);
      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Login failed. Try again.";
      setError(serverMsg);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: form */}
        <div className="w-full md:w-1/2 p-8">
          {/* logo */}
          <div className="mb-6 flex items-center gap-3">
            <img src="/assets/logo.png" alt="ServoFixo" className="h-10 w-10" />
            <div>
              <h2 className="text-2xl font-semibold">Good to See You Again</h2>
              <p className="text-sm text-gray-500">Let's get you signed in again.</p>
            </div>
          </div>

          {/* messages */}
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="sr-only">Email</label>
              <div className={`flex items-center bg-gray-100 rounded-full px-4 py-3 ${touched.email && errors.email ? "ring-1 ring-red-200" : ""}`}>
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m8 0l-4 4m4-4l-4-4" />
                </svg>
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Email"
                  type="email"
                />
              </div>
              {touched.email && errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>

            <div>
              <label className="sr-only">Password</label>
              <div className={`flex items-center bg-gray-100 rounded-full px-4 py-3 ${touched.password && errors.password ? "ring-1 ring-red-200" : ""}`}>
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.656 1.343-3 3-3s3 1.344 3 3v1H6v-1c0-1.656 1.343-3 3-3s3 1.344 3 3z" />
                </svg>
                <input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Password"
                  type="password"
                />
              </div>
              {touched.password && errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
            </div>

            <div className="flex justify-end mb-4">
              <a href="/forgot-password" className="text-sm text-gray-500 hover:text-blue-600">Forgot password ?</a>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full rounded-full py-3 text-white font-semibold ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              No Account yet?{" "}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate("/register")}>
                Register
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">Or Login With</div>

            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE}/api/customer/auth/google`)}
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                Continue with Google
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: illustration (hidden on small screens) */}
        <div className="hidden md:block md:w-1/2 bg-[url('/assets/loginpic.png')] bg-cover bg-center" role="img" aria-label="illustration" />
      </div>
    </div>
  );
};

export default CustomerLogin;
