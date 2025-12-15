
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import * as authRepo from "../../../infrastructure/repositories/authRepository";
import { Mail } from "lucide-react";
import { extractErrorMessage } from "../../../utils/errorHelper";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.removeItem("otpFlowData");
  }, []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);

    if (touched) {
      try {
        forgotPasswordSchema.shape.email.parse(val);
        setFieldError(null);
      } catch (err) {
        const msg = extractErrorMessage(err, "Invalid email");
        setFieldError(msg);
      }
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    setTouched(true);

    try {
      forgotPasswordSchema.parse({ email });
      setFieldError(null);
    } catch (err) {
      const msg = extractErrorMessage(err, "Invalid input");
      setFieldError(msg);
      return;
    }

    setLoading(true);
    try {
      const resp = await authRepo.customerForgotPasswordInit({ email });

      const sessionId = (resp as any).sessionId ?? null;

      const otpFlowData = {
        email,
        sessionId,
        context: "forgot_password" as const,
      };

      sessionStorage.setItem("otpFlowData", JSON.stringify(otpFlowData));

      setInfo(resp.message ?? "OTP sent. Check your email.");

      navigate("/verify-otp", { state: otpFlowData });
    } catch (err: unknown) {
      const serverMsg = extractErrorMessage(err, "Failed to send OTP. Try again.");
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          <img
            src="/assets/logo.png"
            alt="ServoFixo"
            className="
      h-8
      sm:h-12
      md:h-12
      lg:h-14
      object-contain
    "
          />
        </div>


        <h2 className="text-2xl font-semibold mb-4">Request OTP</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your registered email address.</p>

        {error && (
          <div className="mb-4 rounded text-m text-red-600 text-left">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600 text-left">
            {info}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <div
              className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 transition-all ${touched && fieldError
                ? "border-red-300 bg-red-50"
                : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                }`}
            >
              <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                placeholder="Enter your registered email address"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  setTouched(true);
                  try {
                    forgotPasswordSchema.shape.email.parse(email);
                    setFieldError(null);
                  } catch (err) {
                    const msg = extractErrorMessage(err, "Invalid email");
                    setFieldError(msg);
                  }
                }}
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
                aria-label="Email"
                type="email"

              />
            </div>
            {touched && fieldError && (
              <p className="text-xs text-red-600 text-left">{fieldError}</p>
            )}
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
                "Send OTP"
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;