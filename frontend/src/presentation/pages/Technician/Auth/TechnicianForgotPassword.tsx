import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { technicianForgotPasswordInit } from "../../../../infrastructure/repositories/technician/technicianAuthRepository";
import { Mail } from "lucide-react";
import { extractErrorMessage } from "../../../../utils/errorHelper";
import type { AuthResponse } from "../../../../domain/types/auth";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

const TechnicianForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      forgotSchema.parse({ email });
    } catch {
      return;  
    }

    setLoading(true);
    try {
      const resp = await technicianForgotPasswordInit({ email });
       
      const data = resp as unknown as AuthResponse;
      
      const otpFlowData = {
        email,
        sessionId: data.sessionId,
        context: "forgot_password", 
      };

      sessionStorage.setItem("otpFlowData", JSON.stringify(otpFlowData));
      navigate("/technician/verify-otp", { state: otpFlowData });
      
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="flex justify-center mb-6">
          <img src="/assets/logo.png" alt="ServoFixo" className="h-12 w-12" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Reset Password</h2>
        <p className="text-center text-gray-500 mb-8">Enter your registered email to receive an OTP.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="email"
                className="bg-transparent outline-none w-full text-gray-900"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-blue-300"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/technician/login")}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechnicianForgotPassword;