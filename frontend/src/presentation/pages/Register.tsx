import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerRegisterInitOtp } from "../../infrastructure/repositories/authRepository";
import type { CustomerRegisterInitDto, AuthResponse } from "../../../../shared/types/dto/AuthDtos";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email.";
    if (!phone.trim()) return "Please enter phone number.";
    if (!password) return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    const vErr = validate();
    if (vErr) {
      setError(vErr);
      return;
    }

    setLoading(true);
    try {
      // We only send email to init OTP (server handles sending OTP to email)
      const payload: CustomerRegisterInitDto = { email };
      const resp = await customerRegisterInitOtp(payload);
      const data = resp.data as AuthResponse;

      // server may return sessionId in AuthResponse
      const sessionId = data?.sessionId ?? null;

      setInfo(data?.message ?? "OTP sent. Please check your email.");

      // navigate to verify page with form data so verify step can complete creation
      navigate("/verify-otp", {
        state: {
          email,
          sessionId,
          form: { name, phone, password }, // keep password until verify completes (transient)
        },
      });
    
    } catch (err: any) {
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
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          {info && <div className="mb-4 text-sm text-green-600">{info}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="sr-only">Name</label>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.803z" />
                </svg>
                <input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Name"
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Email</label>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m8 0l-4 4m4-4l-4-4" />
                </svg>
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Email"
                  type="email"
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Phone</label>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h2l2 9a2 2 0 002 1.6L13 18h6" />
                </svg>
                <input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Phone"
                  type="tel"
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Password</label>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.656 1.343-3 3-3s3 1.344 3 3v1H6v-1c0-1.656 1.343-3 3-3s3 1.344 3 3z" />
                </svg>
                <input
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Password"
                  type="password"
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Confirm Password</label>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <input
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent outline-none w-full text-gray-700"
                  aria-label="Confirm Password"
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
                {loading ? "Sending OTP..." : "Register"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Already have Account :{" "}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate("/login")}>
                Login
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">Or Register With</div>

            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE }/api/customer/auth/google`}
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
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
