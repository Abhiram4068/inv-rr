import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { login, forgotPassword } from "../../services/authService";
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
  const [showPassword, setShowPassword] = useState(false);

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
      const userData = res.data?.user || res.data;
      setUser(userData);
      
      if (userData?.is_staff || userData?.is_superuser) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Invalid email or password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return <Navigate to={(user.is_staff || user.is_superuser) ? "/admin/dashboard" : "/dashboard"} replace />;

  return (
    <div className="min-h-screen bg-[#09090b] flex font-['Inter'] antialiased">
      
      {/* LEFT SIDE: Welcome Back Panel (Pure Deep Black & Ultra Clean Typography) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-black border-r border-[#1e1e20] relative">
        <div className="relative z-10">
        <div className="flex items-center gap-2 mb-24">
          <i className="fa-solid fa-users text-white text-lg"></i>

          <div className="text-xl font-bold tracking-tight text-white">
            HiveDrive<span className="text-blue-500">.</span>
          </div>
        </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-6">
            Welcome back to <br />
            <span className="text-blue-400 font-bold italic">the Hive.</span>
          </h1>
          <p className="text-[#a1a1aa] text-base max-w-md leading-relaxed font-light">
            Your projects are waiting. Log in to access your dashboard, manage team files, and keep your workflow moving.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[#71717a] text-xs tracking-wide uppercase border-t border-[#1e1e20] pt-8">
                    <div>
            <div className="text-white text-sm font-medium tracking-wide uppercase mb-1">Ready to Continue?</div>
            <div className="text-[#71717a] text-xs leading-relaxed">Access your workspace and stay on top of every project.</div>
          </div>
          <div>
            <div className="text-white text-sm font-medium tracking-wide uppercase mb-1">Back to Work, Simplified</div>
            <div className="text-[#71717a] text-xs leading-relaxed">Manage projects and stay productive.</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#09090b]">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile Header (Visible only on mobile) */}
          <div className="lg:hidden text-left mb-12">
            <div className="text-xl font-bold tracking-tight text-white">HiveDrive<span className="text-blue-500">.</span></div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-medium tracking-tight text-white mb-2">Sign In</h2>
            <p className="text-[#a1a1aa] text-sm font-light">Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="p-2 mb-2 rounded-md text-red-400 text-xs tracking-wide text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Group */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">
                Email Address
              </label>
              <div className="relative flex items-center">
                <i className="fa-solid fa-envelope absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@example.com" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-4 rounded-md text-white text-sm outline-none   placeholder:text-xs placeholder:italic placeholder:text-[#4a4a4a]  transition-colors focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password Group */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] font-semibold">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-blue-500 no-underline hover:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <i className="fa-solid fa-lock absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••" 
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-11 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#71717a] hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white border-none rounded-md font-medium text-sm tracking-wide cursor-pointer mt-2 transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          {/* Styled OR Splitter Section */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-[#27272a]"></div>
            <span className="flex-shrink mx-4 text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-[#27272a]"></div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-[#71717a] tracking-wide">
            <span>
              New to HiveDrive? <Link to="/register" className="text-blue-500 no-underline font-medium hover:text-blue-400 ml-1">Join Now</Link>
            </span>
            <div className="mt-6">
              <Link 
                to="/" 
                className="text-[11px] text-[#4a4a4a] transition-colors hover:text-white no-underline tracking-widest uppercase"
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