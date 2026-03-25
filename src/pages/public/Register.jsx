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
      setError("Passworsssds do not match.");
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
    <div className="min-h-screen bg-black flex items-center justify-center p-5 font-['Inter']">
      <div className="w-full max-w-[550px] bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-tighter mb-2 text-white">HiveDrive</div>
          <div className="text-[#808080] text-sm">Create your account to start managing files</div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* First Name */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2">First Name</label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-user absolute left-4 text-[#808080] text-sm"></i>
                <input 
                  type="text" 
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2">Last Name</label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-user absolute left-4 text-[#808080] text-sm"></i>
                <input 
                  type="text" 
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2">Email Address</label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-envelope absolute left-4 text-[#808080] text-sm"></i>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2">Date of Birth</label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-calendar-days absolute left-4 text-[#808080] text-sm"></i>
                <input 
                  type="date" 
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  style={{ colorScheme: 'dark' }} // Modern way to handle the dark picker
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2">Password</label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-lock absolute left-4 text-[#808080] text-sm"></i>
                <input 
                  type="password" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2">Confirm Password</label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-shield-check absolute left-4 text-[#808080] text-sm"></i>
                <input 
                  type="password" 
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="md:col-span-2 w-full py-3.5 bg-[#e3e3e3] text-black border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-4 transition-all hover:opacity-90 hover:-translate-y-[1px]"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-[13px] text-[#808080] flex flex-col gap-3">
          <span>
            Already have an account? <Link to="/login" className="text-[#3b82f6] no-underline font-medium hover:brightness-110">Log In</Link>
          </span>
          <Link 
            to="/" 
            className="text-[12px] text-[#808080] opacity-70 transition-all hover:opacity-100 hover:text-white"
          >
            Back to Home
         </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;