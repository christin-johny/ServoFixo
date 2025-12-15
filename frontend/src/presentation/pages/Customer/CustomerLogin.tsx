
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ZodError, z } from "zod";
import { customerLogin } from "../../../infrastructure/repositories/authRepository";
import { setAccessToken, setUser } from "../../../store/authSlice";
import { parseJwt } from "../../../utils/jwt";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { usePasswordStrength } from "../../components/PasswordStrength/usePasswordStrength";
import { extractErrorMessage } from "../../../utils/errorHelper";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { checks } = usePasswordStrength(password);

  const firstPasswordFailureMessage = (): string | undefined => {
    if (password.length === 0) return undefined;
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 100) return "Password is too long";
    if (!checks.uppercase) return "Password must contain at least one uppercase letter";
    if (!checks.lowercase) return "Password must contain at least one lowercase letter";
    if (!checks.number) return "Password must contain at least one number";
    if (!checks.special) return "Password must contain at least one special character";
    return undefined;
  };

  function validate() {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      const fieldMap: { [k: string]: string } = {};

      if (err instanceof ZodError) {
        for (const issue of err.issues) {
          const key = issue.path && issue.path[0] ? String(issue.path[0]) : "_";
          if (!fieldMap[key]) fieldMap[key] = issue.message;
        }
      } else if (err && typeof err === "object" && "errors" in (err as any) && Array.isArray((err as any).errors)) {
        for (const issue of (err as any).errors) {
          const key = issue.path && issue.path[0] ? String(issue.path[0]) : "_";
          if (!fieldMap[key]) fieldMap[key] = issue.message;
        }
      }

      setFieldErrors({
        email: fieldMap["email"],
        password: fieldMap["password"],
      });

      return false;
    }
  }

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const data = await customerLogin({ email, password });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (data as any).accessToken ?? (data as any).token ?? null;

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
      navigate("/");
    } catch (err: unknown) {
      setLoading(false);
      const serverMsg = extractErrorMessage(err, "Login failed. Try again.");
      setError(serverMsg);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched.email) {
      try {
        loginSchema.shape.email.parse(e.target.value);
        setFieldErrors((prev) => ({ ...prev, email: undefined }));
      } catch (err) {
        if (err instanceof ZodError) {
          setFieldErrors((prev) => ({ ...prev, email: err.issues?.[0]?.message ?? (err as any).errors?.[0]?.message }));
        } else if (err && typeof err === "object" && "errors" in (err as any) && Array.isArray((err as any).errors)) {
          setFieldErrors((prev) => ({ ...prev, email: (err as any).errors[0]?.message }));
        }
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setPassword(v);

    if (touched.password) { 
      const failMsg = firstPasswordFailureMessage();
      if (failMsg) {
        setFieldErrors((prev) => ({ ...prev, password: failMsg }));
        return;
      }
 
      try {
        loginSchema.shape.password.parse(v);
        setFieldErrors((prev) => ({ ...prev, password: undefined }));
      } catch (err) {
        if (err instanceof ZodError) {
          setFieldErrors((prev) => ({ ...prev, password: err.issues?.[0]?.message ?? (err as any).errors?.[0]?.message }));
        } else if (err && typeof err === "object" && "errors" in (err as any) && Array.isArray((err as any).errors)) {
          setFieldErrors((prev) => ({ ...prev, password: (err as any).errors[0]?.message }));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: form */}
        <div className="w-full md:w-1/2 p-8">
          {/* logo */}
          <div className="mb-8 flex items-center gap-4">
            <img src="/assets/logo.png" alt="ServoFixo" className="h-14 w-14" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Good to See You Again</h2>
              <p className="text-base text-gray-600 mt-1">Let's get you signed in again.</p>
            </div>
          </div>

          {/* Server error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div
                  className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.email && fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                    }`}
                >
                  <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                    aria-label="Email"
                    type="email"
                    aria-invalid={touched.email && !!fieldErrors.email}
                    aria-describedby={touched.email && fieldErrors.email ? "email-error" : undefined}
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div
                  className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.password && fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                    }`}
                >
                  <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                    aria-label="Password"
                    type={showPassword ? "text" : "password"}
                    aria-invalid={touched.password && !!fieldErrors.password}
                    aria-describedby={touched.password && fieldErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {touched.password && fieldErrors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full rounded-lg py-3 text-white font-semibold transition-all ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              No Account yet?{" "}
              <button type="button" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline" onClick={() => navigate("/register")}>
                Register
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or Login With</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE}/customer/auth/google`)}
                className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-3" />
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
