import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, login: setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const buildErrorMessage = (data) => {
    if (!data) return "Registration failed. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (typeof data === "object") {
      const parts = [];
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          parts.push(`${key}: ${value.join(", ")}`);
        } else if (typeof value === "string") {
          parts.push(`${key}: ${value}`);
        }
      });
      if (parts.length) return parts.join(" | ");
    }
    return "Registration failed. Please check your details.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const username = formData.email.split("@")[0];
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        dob: formData.dob,
        username,
        password: formData.password,
        confirm_password: formData.confirm_password,
      };
      const res = await register(payload);
      const createdUser = res.data?.user || null;
      if (createdUser && typeof createdUser === "object") {
        setUser(createdUser);
        navigate("/dashboard", { replace: true });
        return;
      }
      navigate("/login", { replace: true });
    } catch (err) {
      setError(buildErrorMessage(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-black flex font-['Inter']">
      
      {/* LEFT SIDE: Brand & Info (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#050505] border-r border-[#1a1a1a] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="text-2xl font-bold tracking-tighter text-white mb-12">HiveDrive</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            The workspace where <br />
            <span className="text-blue-500">projects move faster.</span>
          </h1>
          <p className="text-[#808080] text-lg max-w-md leading-relaxed">
            Designed specifically for project managers. Securely upload, organize, and share mission-critical files with your entire team in one centralized hive.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          <div>
            <div className="text-white font-semibold mb-1">Secure Storage</div>
            <div className="text-[#808080] text-sm">Enterprise-grade encryption for all project assets.</div>
          </div>
          <div>
            <div className="text-white font-semibold mb-1">Instant Sharing</div>
            <div className="text-[#808080] text-sm">Share files with stakeholders in a single click.</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[500px]">
          
          {/* Mobile Header (Visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-bold tracking-tighter text-white">HiveDrive</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
            <p className="text-[#808080] text-sm">Join the Hive and start managing your files today.</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* First Name */}
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">First Name</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-user absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">Last Name</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-user absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">Email Address</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-envelope absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">Date of Birth</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-calendar-days absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type="date" 
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    style={{ colorScheme: 'dark' }} 
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">Password</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
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
                <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">Confirm Password</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-[#404040] text-sm"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-[45px] rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-4 transition-all hover:bg-blue-700 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-[13px] text-[#808080]">
            <span>
              Already have an account? <Link to="/login" className="text-blue-500 no-underline font-medium hover:underline ml-1">Log In</Link>
            </span>
            <div className="mt-4">
              <Link 
                to="/" 
                className="text-[12px] opacity-70 transition-all hover:opacity-100 hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;