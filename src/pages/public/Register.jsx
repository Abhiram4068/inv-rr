import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { register, getDesignations  } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, login: setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    designation: "",
    password: "",
    confirm_password: "",
  });
  const [designations , setDesignations] = useState([]);
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
        date_of_birth: formData.dob,
        username,
        designation: formData.designation,
        password: formData.password,
        confirm_password: formData.confirm_password,
      };
      const res = await register(payload);
      const createdUser = res.data?.user || null;
      if (createdUser && typeof createdUser === "object") {
        setUser(createdUser);
        if (createdUser?.is_staff || createdUser?.is_superuser) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
        return;
      }
      navigate("/login", { replace: true });
    } catch (err) {
      setError(buildErrorMessage(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await getDesignations();
        setDesignations(res.data);
      } catch (err) {
        console.error("Failed to fetch designations", err);
      }
    };

    fetchDesignations();
  }, []);

  if (authLoading) return null;
  if (user) return <Navigate to={(user.is_staff || user.is_superuser) ? "/admin/dashboard" : "/dashboard"} replace />;

  return (
    <div className="min-h-screen bg-[#09090b] flex font-['Inter'] antialiased">
      
      {/* LEFT SIDE: Brand & Info (Pure Deep Black & Ultra Clean Typography) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-black border-r border-[#1e1e20] relative">
        <div className="relative z-10">
          <div className="text-xl font-bold tracking-tight text-white mb-24">
            HiveDrive<span className="text-blue-500">.</span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-6">
            The workspace where <br />
            <span className="text-blue-500 font-normal italic">projects move faster.</span>
          </h1>
          <p className="text-[#a1a1aa] text-base max-w-md leading-relaxed font-light">
            Designed specifically for project managers. Securely upload, organize, and share mission-critical files with your entire team in one centralized hive.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-12 border-t border-[#1e1e20] pt-8">
          <div>
            <div className="text-white text-sm font-medium tracking-wide uppercase mb-1">Secure Storage</div>
            <div className="text-[#71717a] text-xs leading-relaxed">Enterprise-grade encryption for all project assets.</div>
          </div>
          <div>
            <div className="text-white text-sm font-medium tracking-wide uppercase mb-1">Instant Sharing</div>
            <div className="text-[#71717a] text-xs leading-relaxed">Share files with stakeholders in a single click.</div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#09090b]">
        <div className="w-full max-w-[440px]">
          
          {/* Mobile Header (Visible only on mobile) */}
          <div className="lg:hidden text-left mb-12">
            <div className="text-xl font-bold tracking-tight text-white">HiveDrive<span className="text-blue-500">.</span></div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-medium tracking-tight text-white mb-2">Create an account</h2>
            <p className="text-[#a1a1aa] text-sm font-light">Join the Hive and start managing your files today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-950/20 border border-red-900/50 text-red-400 text-xs tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* First Name */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">First Name</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-user absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-4 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">Last Name</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-user absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-4 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">Email Address</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-envelope absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-4 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">Date of Birth</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-calendar-days absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <input 
                    type="date" 
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    style={{ colorScheme: 'dark' }} 
                    className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-4 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Designation (Customized Select) */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">Designation</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-briefcase absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <select
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-10 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#121214]">Select designation</option>
                    {designations.map((designation) => (
                      <option key={designation.value} value={designation.value} className="bg-[#121214]">
                        {designation.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none text-[#71717a]">
                    <i className="fa-solid fa-chevron-down text-[9px]"></i>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">Password</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
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

              {/* Confirm Password */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2 font-semibold">Confirm Password</label>
                <div className="relative flex items-center">
                  <i className="fa-solid fa-lock absolute left-4 text-[#4a4a4a] text-xs pointer-events-none"></i>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full bg-[#121214] border border-[#27272a] py-3 pl-11 pr-11 rounded-md text-white text-sm outline-none transition-colors focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 text-white border-none rounded-md font-medium text-sm tracking-wide cursor-pointer mt-2 transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
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
              Already have an account? <Link to="/login" className="text-blue-500 no-underline font-medium hover:text-blue-400 ml-1">Log In</Link>
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

export default Register;