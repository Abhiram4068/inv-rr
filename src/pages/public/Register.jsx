import React, { useState } from 'react';
import { Link } from "react-router-dom";
const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log('Account Data:', formData);
    // Add registration API logic here
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5 font-['Inter']">
      <div className="w-full max-w-[550px] bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold tracking-tighter mb-2 text-white">HiveDrive</div>
          <div className="text-[#808080] text-sm">Create your account to start managing files</div>
        </div>

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
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#111] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="md:col-span-2 w-full py-3.5 bg-[#e3e3e3] text-black border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-4 transition-all hover:opacity-90 hover:-translate-y-[1px]"
            >
              Create Account
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