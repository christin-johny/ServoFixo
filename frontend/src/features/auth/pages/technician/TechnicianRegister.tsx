import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ZodError, z } from "zod";
import { technicianRegisterInit } from "../../api/technicianAuthRepository";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import PasswordStrength from "../../../../components/PasswordStrength/PasswordStrength";
import { extractErrorMessage } from "../../../../utils/errorHelper";
interface OtpInitResponse {
  sessionId: string;
  message?: string;
}

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[^A-Za-z0-9]/, "Must contain special char"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const TechnicianRegister: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem("otpFlowData");
  }, []);

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((p) => ({ ...p, [field]: true }));
    try {
      registerSchema.parse(formData);
      setFieldErrors((p) => ({ ...p, [field]: "" }));
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues.find((i) => i.path && i.path.length > 0 && i.path[0] === field);
        setFieldErrors((p) => ({ ...p, [field]: issue ? issue.message : "" }));
      }
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });

    try {
      registerSchema.parse(formData);
    } catch (err) {
       if (err instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach(issue => {
            if (issue.path.length > 0) {
                newErrors[issue.path[0]] = issue.message;
            }
        });
        setFieldErrors(newErrors);
      }
      return;
    }

    setLoading(true);
    try {
      const resp = await technicianRegisterInit({
        email: formData.email,
        phone: formData.phone
      });

      const responseData = resp as unknown as OtpInitResponse;

      if (!responseData.sessionId) {
        throw new Error("Failed to generate OTP Session");
      }

      const otpFlowData = {
        email: formData.email,
        sessionId: responseData.sessionId,
        context: "technician_registration",
        form: {
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        },
      };

      sessionStorage.setItem("otpFlowData", JSON.stringify(otpFlowData));
      navigate("/technician/verify-otp", { state: otpFlowData });

    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Simple Header */}
      <div className="bg-white shadow-sm py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/assets/logo.png" alt="ServoFixo" className="h-10 w-10" />
          <span className="text-xl font-bold text-blue-900">ServoFixo Partner</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Join as Partner</h2>
              <p className="text-sm text-gray-500">Start your journey as a Service Expert.</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm border border-red-200">{error}</div>}

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 ${touched.name && fieldErrors.name ? 'border-red-500' : 'border-gray-200'}`}>
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} onBlur={() => handleBlur("name")} className="bg-transparent w-full outline-none" />
                </div>
                {touched.name && fieldErrors.name && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 ${touched.email && fieldErrors.email ? 'border-red-500' : 'border-gray-200'}`}>
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} onBlur={() => handleBlur("email")} className="bg-transparent w-full outline-none" />
                </div>
                {touched.email && fieldErrors.email && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 ${touched.phone && fieldErrors.phone ? 'border-red-500' : 'border-gray-200'}`}>
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} onBlur={() => handleBlur("phone")} className="bg-transparent w-full outline-none" />
                </div>
                {touched.phone && fieldErrors.phone && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <Lock className="w-5 h-5 text-gray-400 mr-3" />
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} onBlur={() => handleBlur("password")} className="bg-transparent w-full outline-none" />
                    {/*   Improved Eye Color */}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <PasswordStrength password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <div className={`flex items-center bg-gray-50 border rounded-lg px-4 py-3 ${touched.confirmPassword && fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}>
                    <Lock className="w-5 h-5 text-gray-400 mr-3" />
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} onBlur={() => handleBlur("confirmPassword")} className="bg-transparent w-full outline-none" />
                    {/*   Added Eye Button for Confirm Password */}
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-gray-700 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                {loading ? "Processing..." : "Continue"}
              </button>

              <div className="text-center text-sm text-gray-500">
                Already a partner? <button type="button" className="text-blue-600 hover:underline font-medium" onClick={() => navigate("/technician/login")}>Login</button>
              </div>
            </form>
          </div>
          <div className="hidden md:block md:w-1/2 bg-[url('/assets/techLogin.png')] bg-cover bg-center" />
        </div>
      </div>
    </div>
  );
};

export default TechnicianRegister;