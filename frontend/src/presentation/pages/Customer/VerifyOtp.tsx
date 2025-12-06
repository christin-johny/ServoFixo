// src/presentation/pages/Customer/VerifyOtp.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ZodError, z } from "zod";
import { setAccessToken, setUser } from "../../../store/authSlice";
import * as authRepo from "../../../infrastructure/repositories/authRepository";
import { Lock, Eye, EyeOff } from "lucide-react";
import { usePasswordStrength } from "../../components/PasswordStrength/usePasswordStrength";
import PasswordStrength from "../../components/PasswordStrength/PasswordStrength";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 180;
const RESEND_DELAY_SECONDS = 60;

const STORAGE_KEY = "otpFlowData";
const LEGACY_REG_KEY = "registrationData";

/** password validation schema (authoritative) */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const VerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const state = (location.state || {}) as any;
  const storageRaw = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
  const legacyRaw = typeof window !== "undefined" ? sessionStorage.getItem(LEGACY_REG_KEY) : null;
  const storageParsed = storageRaw ? JSON.parse(storageRaw as string) : null;
  const legacyParsed = legacyRaw ? JSON.parse(legacyRaw as string) : null;

  const context =
    (state.context as string) ??
    (storageParsed?.context as string) ??
    (legacyParsed ? "registration" : undefined) ??
    "registration";

  const email = state.email ?? storageParsed?.email ?? legacyParsed?.email ?? "";
  const sessionId = state.sessionId ?? storageParsed?.sessionId ?? legacyParsed?.sessionId ?? "";
  const form = state.form ?? storageParsed?.form ?? legacyParsed ?? {};

  const nameFromState = state.name ?? form?.name ?? "";
  const passwordFromState = state.password ?? form?.password ?? "";
  const phoneFromState = state.phone ?? form?.phone ?? "";

  // OTP boxes
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [expiryTimer, setExpiryTimer] = useState<number>(OTP_EXPIRY_SECONDS);
  const [resendTimer, setResendTimer] = useState<number>(RESEND_DELAY_SECONDS);
  const [resending, setResending] = useState(false);

  // Forgot password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // reuse hook for fast checks
  const { checks } = usePasswordStrength(newPassword);

  // timers
  useEffect(() => {
    const t = window.setInterval(() => {
      setExpiryTimer((p) => (p > 0 ? p - 1 : 0));
      setResendTimer((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[i] = value.slice(-1);
    setOtp(next);
    if (value && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    const key = e.key;
    if (key === "Backspace") {
      if (otp[i]) {
        const next = [...otp];
        next[i] = "";
        setOtp(next);
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
        const next = [...otp];
        next[i - 1] = "";
        setOtp(next);
      }
    } else if (key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (key === "ArrowRight" && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  // Map the first failing rule to the same messages used in Zod schema
  const firstPasswordFailureMessage = (): string | undefined => {
    if (!newPassword) return undefined;
    if (newPassword.length < 8) return "Password must be at least 8 characters";
    if (newPassword.length > 100) return "Password is too long";
    if (!checks.uppercase) return "Password must contain at least one uppercase letter";
    if (!checks.lowercase) return "Password must contain at least one lowercase letter";
    if (!checks.number) return "Password must contain at least one number";
    if (!checks.special) return "Password must contain at least one special character";
    return undefined;
  };

  // handle password typing with fast client-side feedback
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);

    if (passwordTouched) {
      const fail = firstPasswordFailureMessage();
      if (fail) {
        setPasswordError(fail);
      } else {
        // final defensive Zod parse (keeps messages consistent)
        try {
          passwordSchema.parse(val);
          setPasswordError(null);
        } catch (err) {
          if (err instanceof ZodError) {
            setPasswordError(err.issues?.[0]?.message ?? (err as any).errors?.[0]?.message);
          } else {
            setPasswordError("Invalid password");
          }
        }
      }
    }

    // check match
    if (confirmNewPassword && val !== confirmNewPassword) {
      setConfirmError("Passwords do not match");
    } else if (confirmNewPassword) {
      setConfirmError(null);
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmNewPassword(val);
    if (val !== newPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError(null);
    }
  };

  // helper to extract server or Zod error safely
  const extractServerMsg = (err: any) =>
    err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? "Verification failed";

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete OTP.");
      return;
    }

    if (context === "forgot_password") {
      setPasswordTouched(true);
      const fail = firstPasswordFailureMessage();
      if (fail) {
        setPasswordError(fail);
        return;
      }
      // final authoritative parse
      try {
        passwordSchema.parse(newPassword);
        setPasswordError(null);
      } catch (err) {
        if (err instanceof ZodError) {
          setPasswordError(err.issues?.[0]?.message ?? (err as any).errors?.[0]?.message);
        } else {
          setPasswordError("Invalid password");
        }
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setConfirmError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      if (context === "registration") {
        if (!nameFromState || !passwordFromState) {
          setError("Missing registration details. Please restart registration.");
          return;
        }

        const resp = await authRepo.customerRegisterVerifyOtp({
          email,
          otp: code,
          sessionId,
          name: nameFromState,
          password: passwordFromState,
          phone: phoneFromState,
        });

        const data = resp as any;
        const access = data?.accessToken ?? data?.token;
        if (access) dispatch(setAccessToken(access));
        if (data.user) dispatch(setUser(data.user));

        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(LEGACY_REG_KEY);
        } catch (_) {}

        navigate("/customer");
      } else {
        const resp = await authRepo.customerForgotPasswordVerify({
          email,
          otp: code,
          sessionId,
          newPassword,
        });

        const data = resp as any;
        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem("forgotResetHandoff");
        } catch (_) {}

        navigate("/customer/login", {
          state: { successMessage: data?.message ?? "Password reset successful. Please login." },
        });
      }
    } catch (err: any) {
      setError(extractServerMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setError(null);

    try {
      if (context === "registration") {
        await authRepo.customerRegisterInitOtp({ email });
      } else {
        await authRepo.customerForgotPasswordInit({ email });
      }
      setExpiryTimer(OTP_EXPIRY_SECONDS);
      setResendTimer(RESEND_DELAY_SECONDS);
    } catch (err: any) {
      setError(extractServerMsg(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          <img src="/assets/logo.png" alt="Servofixo" className="h-12 object-contain" />
        </div>

        <h2 className="text-2xl font-semibold mb-6">
          {context === "registration" ? "Enter OTP" : "Reset Password"}
        </h2>

        <p className="text-sm text-gray-500 mb-6">OTP sent to <strong>{email}</strong></p>

        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              maxLength={1}
              className="w-12 h-12 bg-gray-50 border border-gray-300 text-center text-xl rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={otp[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              inputMode="numeric"
            />
          ))}
        </div>

        {context === "forgot_password" && (
          <div className="space-y-4 mb-6 text-left">
            <div>
              <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${passwordTouched && passwordError ? "border-red-300 bg-red-50" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"}`}>
                <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  placeholder="New Password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  onBlur={() => setPasswordTouched(true)}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="New Password"
                  type={showNewPassword ? "text" : "password"}
                />
                <button type="button" onClick={() => setShowNewPassword((s) => !s)} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordTouched && passwordError && (<p className="mt-1 text-xs text-red-600">{passwordError}</p>)}
              {/* reuse the PasswordStrength component for visuals */}
              <PasswordStrength password={newPassword} />
            </div>

            <div>
              <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${confirmError ? "border-red-300 bg-red-50" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"}`}>
                <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={handleConfirmChange}
                  className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                  aria-label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button type="button" onClick={() => setShowConfirmPassword((s) => !s)} className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmError && (<p className="mt-1 text-xs text-red-600">{confirmError}</p>)}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="text-right pr-2 mb-4">
          <button onClick={resendOtp} disabled={resendTimer > 0 || resending} className={`text-sm ${resendTimer === 0 ? "text-blue-600 underline" : "text-gray-400"}`}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <button onClick={verifyOtp} disabled={loading} className={`w-full rounded-lg py-3 text-white font-semibold transition-all ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"}`}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>

        <p className="text-sm mt-5 text-gray-500">
          OTP expires in: <span className="text-red-600 font-medium">{expiryTimer} seconds</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
