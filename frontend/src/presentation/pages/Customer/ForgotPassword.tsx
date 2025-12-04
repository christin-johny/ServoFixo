import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authRepo from "../../../infrastructure/repositories/authRepository";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const resp = await authRepo.customerForgotPasswordInit({ email });
      const sessionId = resp.data?.sessionId ?? (resp as any).sessionId ?? null;

      const otpFlowData = {
        email,
        sessionId,
        context: "forgot_password" as const,
      };

      sessionStorage.setItem("otpFlowData", JSON.stringify(otpFlowData));

      setInfo(resp.data?.message ?? "OTP sent. Check your email.");
      // Navigate to OTP verify page with the flow data
      navigate("/verify-otp", { state: otpFlowData });
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          <img src="/assets/logo.png" alt="ServoFixo" className="h-12 object-contain" />
        </div>

        <h2 className="text-2xl font-semibold mb-4">Request OTP</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your registered email address.</p>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {info && <div className="mb-4 text-sm text-green-600">{info}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <input
                placeholder="Enter your registered email address."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700"
                aria-label="Email"
                type="email"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full rounded-full py-3 text-white font-semibold ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "SEND OTP"}
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
