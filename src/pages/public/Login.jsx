import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { login } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const { user, loading: authLoading, login: setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { type, value } = e.target;
    const key = type === "email" ? "email" : "password";
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(formData);
      setUser(res.data?.user || res.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-['Inter']">
      <div className="w-full max-w-[400px] bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-tighter mb-2 text-white">HiveDrive</div>
          <div className="text-[#808080] text-sm">Welcome back. Please login to continue.</div>
        </div>
{error && (
  <div className="mb-5 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
    {error}
  </div>
)}
        <form onSubmit={handleSubmit}>
          {/* Email Group */}
          <div className="mb-5">
            <label className="block text-[12px] uppercase tracking-widest text-[#808080] mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <i className="fa-solid fa-envelope absolute left-4 text-[#808080] text-sm"></i>
              <input 
                type="email" 
                placeholder="name@example.com" 
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6] focus:bg-[#151515]"
              />
            </div>
          </div>

          {/* Password Group */}
          <div className="mb-5">
            <label className="block text-[12px] uppercase tracking-widest text-[#808080] mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <i className="fa-solid fa-lock absolute left-4 text-[#808080] text-sm"></i>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6] focus:bg-[#151515]"
              />
            </div>
            <Link to="#" className="block text-right text-[12px] text-[#808080] mt-2 no-underline hover:text-white transition-colors">
              Forgot password?
           </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#e3e3e3] text-black border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-2.5 transition-all hover:opacity-90 hover:-translate-y-[1px]"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-[13px] text-[#808080] flex flex-col gap-3">
          <span>
            Don't have an account? <Link to="/register" className="text-[#3b82f6] no-underline font-medium hover:brightness-110">Join Now</Link>
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

export default Login;