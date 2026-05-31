import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService"; // Ensure this service exists

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
const uid = searchParams.get("uid"); // Get token from URL: /reset-password?token=xyz

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      // Pass the token and new password to your API
      await resetPassword({ 
        uid, 
        token, 
        new_password: formData.password,
        confirm_password: formData.confirmPassword
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = "Failed to reset password. Link may be expired.";
      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const fieldError = data[firstKey];
            if (Array.isArray(fieldError)) {
              errorMsg = fieldError[0];
            } else if (typeof fieldError === "string") {
              errorMsg = fieldError;
            }
          }
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141d2a] flex font-['Inter']">
      
      {/* LEFT SIDE: Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#050505] border-r border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="text-2xl font-bold tracking-tighter text-white mb-12">HiveDrive</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Secure your <br />
            <span className="text-blue-500">Account.</span>
          </h1>
          <p className="text-[#808080] text-lg max-w-md leading-relaxed">
            Choose a strong password to ensure your files and projects remain protected within the Hive.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          
          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-bold tracking-tighter text-white">HiveDrive</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-[#808080] text-sm">Create a new password for your account.</p>
          </div>

          {error && (
            <div className="p-2 mb-2 rounded-md text-red-400 text-xs tracking-wide text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-2xl"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Password Updated</h3>
              <p className="text-[#808080] mb-6">Your password has been changed successfully. Redirecting you to login...</p>
              <Link to="/login" className="text-blue-500 font-medium hover:underline">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 8 characters" 
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-[45px] rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#404040] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  >
                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-shield-check absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password" 
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 bg-blue-600 text-white border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-2 transition-all hover:bg-blue-700 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
              
              {!token && (
                <p className="text-amber-500 text-[11px] text-center">
                  Invalid reset link. Please request a new one.
                </p>
              )}
            </form>
          )}

          <div className="mt-8 text-center text-[13px] text-[#808080]">
            <Link to="/login" className="text-[12px] opacity-70 transition-all hover:opacity-100 hover:text-white">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;