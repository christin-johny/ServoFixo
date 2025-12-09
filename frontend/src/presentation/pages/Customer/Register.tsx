// src/presentation/pages/Customer/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ZodError, z } from "zod";
import { customerRegisterInitOtp } from "../../../infrastructure/repositories/authRepository";
import type { CustomerRegisterInitDto, AuthResponse } from "../../../../../shared/types/dto/AuthDtos";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { usePasswordStrength } from "../../components/PasswordStrength/usePasswordStrength";
import PasswordStrength from "../../components/PasswordStrength/PasswordStrength";

// Zod validation schema (authoritative)
const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // reuse hook for fast password checks and messages
  const { checks } = usePasswordStrength(formData.password);

  // helper - map first failing rule to the same messages used in Zod schema
  const firstPasswordFailureMessage = (): string | undefined => {
    const pwd = formData.password;
    if (!pwd) return undefined;
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (pwd.length > 100) return "Password is too long";
    if (!checks.uppercase) return "Password must contain at least one uppercase letter";
    if (!checks.lowercase) return "Password must contain at least one lowercase letter";
    if (!checks.number) return "Password must contain at least one number";
    if (!checks.special) return "Password must contain at least one special character";
    return undefined;
  };

  const extractZodMessage = (err: unknown) => {
    if (err instanceof ZodError) {
      // prefer issues, fallback to older .errors shape defensively
      return err.issues?.[0]?.message ?? (err as any).errors?.[0]?.message ?? null;
    }
    return null;
  };

  // handle general input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    // real-time validation for touched fields
    if (touched[name]) {
      if (name === "confirmPassword") {
        // direct compare
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: value !== formData.password ? "Passwords do not match" : "",
        }));
        return;
      }

      // fast password checks
      if (name === "password") {
        const fail = firstPasswordFailureMessage();
        if (fail) {
          setFieldErrors((prev) => ({ ...prev, password: fail }));
          return;
        }
      }

      // try single-field Zod parse
      try {
        // dynamic access: schema.shape[field].parse
        // @ts-ignore - runtime dynamic access
        registerSchema.shape[name].parse(value);
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      } catch (err) {
        const msg = extractZodMessage(err);
        setFieldErrors((prev) => ({ ...prev, [name]: msg ?? "Invalid input" }));
      }

      // confirmPassword may need re-check after password change
      if (name === "password" && touched.confirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword:
            formData.confirmPassword && formData.confirmPassword !== value ? "Passwords do not match" : "",
        }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched((p) => ({ ...p, [field]: true }));

    // special-case confirm password
    if (field === "confirmPassword") {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword:
          formData.confirmPassword !== formData.password ? "Passwords do not match" : "",
      }));
      return;
    }

    // single-field Zod parse on blur
    try {
      // @ts-ignore
      registerSchema.shape[field].parse(formData[field as keyof typeof formData]);
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      const msg = extractZodMessage(err);
      setFieldErrors((prev) => ({ ...prev, [field]: msg ?? "Invalid input" }));
    }
  };

  const validate = () => {
    try {
      registerSchema.parse(formData);
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        for (const issue of err.issues) {
          const key = String(issue.path?.[0] ?? "");
          if (key && !errors[key]) errors[key] = issue.message;
        }
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    // mark all as touched so errors show
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) return;

    setLoading(true);
    try {
      const payload: CustomerRegisterInitDto = { email: formData.email };
      const resp = await customerRegisterInitOtp(payload);
      
      // ✅ FIXED: Removed 'resp.data as AuthResponse'. 'resp' is already the data.
      const data = resp as unknown as AuthResponse; // Double cast for safety if types are strict
      const sessionId = data?.sessionId ?? null;

      setInfo(data?.message ?? "OTP sent. Please check your email.");

      const otpFlowData = {
        email: formData.email,
        sessionId,
        context: "registration" as const,
        form: {
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        },
      };
      sessionStorage.setItem("otpFlowData", JSON.stringify(otpFlowData));

      navigate("/customer/verify-otp", { state: otpFlowData });
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
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
              <h2 className="text-2xl font-semibold">Join Servofixo</h2>
              <p className="text-sm text-gray-500">Let's set up your new account.</p>
            </div>
          </div>

          {/* messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600">
              {info}
            </div>
          )}

          {/* disable native browser validation */}
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="sr-only">Name</label>
              <div
                className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.name && fieldErrors.name
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                  }`}
              >
                <User className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="Name"
                />
              </div>
              {touched.name && fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="sr-only">Email</label>
              <div
                className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.email && fieldErrors.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                  }`}
              >
                <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="Email"
                  type="email"
                />
              </div>
              {touched.email && fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="sr-only">Phone</label>
              <div
                className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.phone && fieldErrors.phone
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                  }`}
              >
                <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="Phone"
                  type="tel"
                />
              </div>
              {touched.phone && fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="sr-only">Password</label>
              <div
                className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.password && fieldErrors.password
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                  }`}
              >
                <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="Password"
                  type={showPassword ? "text" : "password"}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.password && fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}

              {/* Password strength UI (reusable component) */}
              <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="sr-only">Confirm Password</label>
              <div
                className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched.confirmPassword && fieldErrors.confirmPassword
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                  }`}
              >
                <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button type="button" onClick={() => setShowConfirmPassword((s) => !s)} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
            </div>

            <div>
              <button
                type="submit"
                className={`w-full rounded-lg py-3 text-white font-semibold transition-all ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"
                  }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Already have Account :{" "}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate("/customer/login")}>
                Login
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or Register With</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE}/api/customer/auth/google`)}
                className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-3" />
                Sign in with Google
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

export default Register;