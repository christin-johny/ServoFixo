import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authRepo from "../../../infrastructure/repositories/authRepository";

type Handoff = {
  email: string;
  sessionId?: string;
  otp?: string;
};

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateFromLocation = (location.state || {}) as Partial<Handoff>;
  const stored = typeof window !== "undefined" ? sessionStorage.getItem("forgotResetHandoff") : null;
  const storageHandoff = stored ? (JSON.parse(stored) as Handoff) : null;

  const handoff: Handoff = {
    email: stateFromLocation.email ?? storageHandoff?.email ?? "",
    sessionId: stateFromLocation.sessionId ?? storageHandoff?.sessionId ?? undefined,
    otp: stateFromLocation.otp ?? storageHandoff?.otp ?? undefined,
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    // if missing handoff, redirect to forgot-password
    if (!handoff.email || !handoff.sessionId || !handoff.otp) {
      navigate("/forgot-password");
    }
  }, [handoff, navigate]);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: handoff.email,
        otp: handoff.otp!,
        sessionId: handoff.sessionId!,
        newPassword,
      };
      const resp = await authRepo.customerForgotPasswordVerify(payload);
      setInfo(resp.data?.message ?? resp.message ?? "Password changed. Please login.");

      // clear handoff
      sessionStorage.removeItem("forgotResetHandoff");
      // redirect to login with success message
      setTimeout(() => navigate("/login", { state: { successMessage: "Password reset successful. Please login." } }), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err?.message ?? "Failed to change password.");
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

        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {info && <div className="mb-4 text-sm text-green-600">{info}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
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
          </div>

          <div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <input
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700"
                aria-label="Re-enter new password"
                type="password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full rounded-full py-3 text-white font-semibold ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
