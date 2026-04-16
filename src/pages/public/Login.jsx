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
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-black flex font-['Inter']">
      
      {/* LEFT SIDE: Welcome Back Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#050505] border-r border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="text-2xl font-bold tracking-tighter text-white mb-12">HiveDrive</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Welcome back to <br />
            <span className="text-blue-500">the Hive.</span>
          </h1>
          <p className="text-[#808080] text-lg max-w-md leading-relaxed">
            Your projects are waiting. Log in to access your dashboard, manage team files, and keep your workflow moving.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[#808080] text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-[#1a1a1a] flex items-center justify-center">
                <i className="fa-solid fa-user text-[10px]"></i>
              </div>
            ))}
          </div>
          <span>Trusted by project managers worldwide.</span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          
          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-bold tracking-tighter text-white">HiveDrive</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-[#808080] text-sm">Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Group */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">
                Email Address
              </label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-envelope absolute left-4 text-[#404040] text-sm"></i>
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@example.com" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Group */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] uppercase tracking-widest text-[#808080] font-medium">
                  Password
                </label>
                <Link to="#" className="text-[11px] text-blue-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <i className="fa-solid fa-lock absolute left-4 text-[#404040] text-sm"></i>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••" 
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-[45px] rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#404040] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-2 transition-all hover:bg-blue-700 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-[13px] text-[#808080]">
            <span>
              Don't have an account? <Link to="/register" className="text-blue-500 no-underline font-medium hover:underline ml-1">Join Now</Link>
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

export default Login;