import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  technicianRegisterVerify,
  technicianRegisterInit,
  technicianForgotPasswordVerify,
  technicianForgotPasswordInit
} from "../../api/technicianAuthRepository";
import { setAccessToken, setUser } from "../../../../store/authSlice";
import { parseJwt } from "../../../../utils/jwt";
import { extractErrorMessage } from "../../../../utils/errorHelper";
import { useNotification } from "../../../notifications/hooks/useNotification";
import type { AuthResponse } from "../../types/auth";
import { Lock, Eye, EyeOff } from "lucide-react";
import PasswordStrength from "../../../../components/PasswordStrength/PasswordStrength";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 120;

const TechnicianVerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess } = useNotification();

  const storageRaw = sessionStorage.getItem("otpFlowData");
  const state = location.state || (storageRaw ? JSON.parse(storageRaw) : null);

  const context = state?.context;

  const [sessionId, setSessionId] = useState(state?.sessionId || "");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY_SECONDS);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>(new Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (!state || (state.context !== "technician_registration" && state.context !== "forgot_password")) {
      navigate("/technician/login");
      return;
    }

    if (inputsRef.current && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }

    const t = setInterval(() => setExpiryTimer(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [navigate, state]);

  const handleChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[i] = value.slice(-1);
    setOtp(next);
    if (value && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return setError("Enter complete OTP");

    if (context === "forgot_password") {
      if (newPassword.length < 8) return setError("Password must be at least 8 characters");
      if (newPassword !== confirmPassword) return setError("Passwords do not match");
    }

    setLoading(true);
    setError(null);

    try {
      if (context === "forgot_password") {
        await technicianForgotPasswordVerify({
          email: state.email,
          otp: code,
          sessionId,
          newPassword
        });

        sessionStorage.removeItem("otpFlowData");
        showSuccess("Password reset successful! Please login.");
        navigate("/technician/login");

      } else {
        const resp = await technicianRegisterVerify({
          email: state.email,
          phone: state.form.phone,
          otp: code,
          sessionId,
          name: state.form.name,
          password: state.form.password,
        });

        const token = resp.accessToken || resp.token;
        if (token) {
          dispatch(setAccessToken(token));
          const payload = parseJwt(token);
          if (payload) dispatch(setUser({ id: payload.sub, role: payload.type }));

          sessionStorage.removeItem("otpFlowData");
          showSuccess("Registration Successful!");
          navigate("/technician");
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };

      if (e.response?.status === 401) {
        setError("Invalid OTP or Session Expired");
      } else {
        setError(extractErrorMessage(err, "Verification Failed"));
      }
    }
    finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (expiryTimer > 0) return;

    try {
      let resp: AuthResponse;

      if (context === "forgot_password") {
        resp = await technicianForgotPasswordInit({ email: state.email });
      } else {
        resp = await technicianRegisterInit({ email: state.email, phone: state.form.phone });
      }

      setSessionId(resp.sessionId || "");
      setExpiryTimer(OTP_EXPIRY_SECONDS);
      setError(null);
      showSuccess("OTP Resent!");
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4"><img src="/assets/logo.png" className="h-12" alt="logo" /></div>

        <h2 className="text-2xl font-semibold mb-2">
          {context === "forgot_password" ? "Reset Password" : "Verify Email"}
        </h2>

        <p className="text-sm text-gray-500 mb-6">Enter OTP sent to {state?.email}</p>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((_, i) => (
            <input
              key={i}
              ref={el => { inputsRef.current[i] = el; }}
              value={otp[i]}
              maxLength={1}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(e, i)}
              className="w-12 h-12 border text-center text-xl rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ))}
        </div>

        {context === "forgot_password" && (
          <div className="text-left space-y-4 mb-6">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Verify Button: Disabled if expired */}
        <button
          onClick={verifyOtp}
          disabled={loading || expiryTimer === 0}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors`}
        >
          {loading ? "Processing..." : (context === "forgot_password" ? "Reset Password" : "Verify OTP")}
        </button>

        <div className="mt-6 flex justify-between items-center text-sm">
          <span className={`font-medium ${expiryTimer > 0 ? "text-red-600" : "text-gray-500"}`}>
            {expiryTimer > 0 ? `Expires in ${expiryTimer}s` : "OTP Expired"}
          </span>

          {/* Resend Button: No timer text, disabled until expiry */}
          <button
            onClick={resendOtp}
            disabled={expiryTimer > 0}
            className={`font-semibold ${expiryTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianVerifyOtp;