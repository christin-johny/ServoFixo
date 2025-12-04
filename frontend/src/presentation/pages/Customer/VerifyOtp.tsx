import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAccessToken, setUser } from "../../../store/authSlice";
import * as authRepo from "../../../infrastructure/repositories/authRepository";

const OTP_LENGTH = 6;
// OTP expiry (3 minutes)
const OTP_EXPIRY_SECONDS = 180;
// Resend allowed after 60s
const RESEND_DELAY_SECONDS = 60;

const STORAGE_KEY = "otpFlowData"; // new standard
const LEGACY_REG_KEY = "registrationData"; // fallback for older flows

const VerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read state from location (preferred)
  const state = (location.state || {}) as any;

  // Try sessionStorage fallback(s)
  const storageRaw = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
  const legacyRaw = typeof window !== "undefined" ? sessionStorage.getItem(LEGACY_REG_KEY) : null;

  const storageParsed = storageRaw ? JSON.parse(storageRaw as string) : null;
  const legacyParsed = legacyRaw ? JSON.parse(legacyRaw as string) : null;

  // Determine context robustly:
  // - If location.state.context provided, use it.
  // - Else if storageParsed has context, use it.
  // - Else if legacyParsed exists assume registration.
  // - Fallback to 'registration' for safety.
  const context =
    (state.context as string) ??
    (storageParsed?.context as string) ??
    (legacyParsed ? "registration" : undefined) ??
    "registration";

  // Determine email/sessionId/form fields from state OR storage/legacy
  const email = state.email ?? storageParsed?.email ?? legacyParsed?.email ?? "";
  const sessionId = state.sessionId ?? storageParsed?.sessionId ?? legacyParsed?.sessionId ?? "";
  const form = state.form ?? storageParsed?.form ?? legacyParsed ?? {};

  const nameFromState = state.name ?? form?.name ?? "";
  const passwordFromState = state.password ?? form?.password ?? "";
  const phoneFromState = state.phone ?? form?.phone ?? "";

  // OTP inputs
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Two timers: expiry (180s) and resend delay (60s)
  const [expiryTimer, setExpiryTimer] = useState<number>(OTP_EXPIRY_SECONDS);
  const [resendTimer, setResendTimer] = useState<number>(RESEND_DELAY_SECONDS);
  const [resending, setResending] = useState(false);

  // Forgot password specific inputs
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Single interval to tick both timers every second
  useEffect(() => {
    const t = window.setInterval(() => {
      setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
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

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete OTP.");
      return;
    }

    // If forgot-password flow, ensure new password is valid
    if (context === "forgot_password") {
      if (!newPassword || newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      if (context === "registration") {
        // Keep previous behaviour unchanged
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

        // cleanup any stored data
        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(LEGACY_REG_KEY);
        } catch (_) {}

        navigate("/dashboard");
      } else {
        // forgot_password — send otp + newPassword in same request
        const resp = await authRepo.customerForgotPasswordVerify({
          email,
          otp: code,
          sessionId,
          newPassword,
        });

        const data = resp as any;
        // no auto-login, navigate to login with success message (from backend if present)
        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem("forgotResetHandoff");
        } catch (_) {}

        navigate("/login", {
          state: { successMessage: data?.message ?? "Password reset successful. Please login." },
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Verification failed";
      setError(msg);
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
      // Reset timers on resend: new otp issued
      setExpiryTimer(OTP_EXPIRY_SECONDS);
      setResendTimer(RESEND_DELAY_SECONDS);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to resend OTP";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center border border-gray-200">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/assets/logo.png" alt="Servofixo" className="h-12 object-contain" />
        </div>

        <h2 className="text-2xl font-semibold mb-6">
          {context === "registration" ? "Enter OTP" : "Enter OTP & Reset Password"}
        </h2>

        <p className="text-sm text-gray-500 mb-4">OTP sent to <strong>{email}</strong></p>

        {/* OTP boxes */}
        <div className="flex justify-center gap-3 mb-4">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              maxLength={1}
              className="w-12 h-12 bg-gray-200 text-center text-xl rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={otp[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              inputMode="numeric"
            />
          ))}
        </div>

        {/* For forgot password: new password inputs */}
        {context === "forgot_password" && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <input
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700"
                aria-label="New Password"
                type="password"
              />
            </div>

            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <input
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700"
                aria-label="Confirm New Password"
                type="password"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Resend OTP */}
        <div className="text-right pr-2 mb-4">
          <button
            onClick={resendOtp}
            disabled={resendTimer > 0 || resending}
            className={`text-sm ${resendTimer === 0 ? "text-blue-600 underline" : "text-gray-400"}`}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        {/* Verify Button */}
        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Countdown */}
        <p className="text-sm mt-5">
          OTP expires in: <span className="text-red-600">{expiryTimer} seconds</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
