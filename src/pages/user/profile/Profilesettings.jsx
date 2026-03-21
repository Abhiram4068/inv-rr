import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const AccountSettings = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@innovaturelabs.com',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
  };

  return (
    <div className={`flex-1 flex min-w-0 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      <div className="flex-1 p-3 lg:p-5 overflow-y-auto no-scrollbar">
        
        {/* --- Center Dashboard --- */}
        <main className={`flex-1 m-1 rounded-[10px] border p-10 overflow-y-auto no-scrollbar transition-all ${
          isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          
          {/* Back Navigation Link */}
          <div className="mb-6">
            <Link 
              to="/myprofile" 
              className={`group flex items-center gap-2 transition-colors text-base font-bold ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}
            >
              <i className="fa-solid fa-chevron-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
              <span>Account</span>
              <span className={isDark ? 'text-[#333]' : 'text-slate-200'}>/</span>
              <span className={isDark ? 'text-white' : 'text-slate-800'}> Account Settings</span>
            </Link>
          </div>

          <div className={`flex items-center gap-[30px] mb-10 pb-10 border-b ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
            <div className="w-[100px] h-[100px] bg-[#3b82f6] rounded-full flex items-center justify-center text-[36px] font-bold text-white relative shadow-lg shadow-blue-500/20">
              JD
            </div>
            <div>
              <h2 className={`text-2xl font-bold m-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Account Settings</h2>
              <p className={`text-sm mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Manage your profile details and security preferences.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className={`text-base font-bold mb-5 flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <i className="fa-solid fa-address-card text-[#3b82f6]"></i> Personal Information
            </div>
            
            <div className="grid grid-cols-2 gap-[30px] mb-10">
              <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} isDark={isDark} />
              <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} isDark={isDark} />
              <div className="col-span-2">
                <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} isDark={isDark} />
              </div>
            </div>

            {/* Authentication */}
            <div className={`text-base font-bold mb-5 flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <i className="fa-solid fa-lock text-[#3b82f6]"></i> Authentication
            </div>
            
            <div className="grid grid-cols-2 gap-[30px] mb-10">
              <div className="col-span-2">
                <InputGroup 
                  label="Old Password" 
                  name="oldPassword" 
                  type="password"
                  placeholder="Enter current password"
                  value={formData.oldPassword} 
                  onChange={handleChange} 
                  isDark={isDark}
                />
              </div>
              <InputGroup label="New Password" name="newPassword" type="password" placeholder="New password" value={formData.newPassword} onChange={handleChange} isDark={isDark} />
              <InputGroup label="Confirm New Password" name="confirmPassword" type="password" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleChange} isDark={isDark} />
            </div>

            {/* Danger Zone */}
            <div className="text-[#ff4444] text-base font-bold mb-5 flex items-center gap-2.5">
              <i className="fa-solid fa-circle-exclamation"></i> Danger Zone
            </div>
            <div className={`border p-6 rounded-xl mb-10 transition-colors ${
              isDark ? 'border-[#2a1111] bg-[#110505]' : 'border-red-100 bg-red-50/30'
            }`}>
              <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Disable Account</div>
              <p className={`text-[12px] mt-1.5 mb-4 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                Deactivating your account will restrict access to your files. This action can be reversed by an administrator.
              </p>
              <button type="button" className="text-[#ff4444] border border-[#ff4444] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#ff4444] hover:text-white transition-all shadow-sm">
                Disable My Account
              </button>
            </div>

            {/* Actions */}
            <div className={`pt-[30px] border-t flex gap-[15px] ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
              <button type="submit" className={`px-[30px] py-3 rounded-full font-bold text-sm transition-all shadow-md hover:-translate-y-0.5 ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}>
                Save Changes
              </button>
              <Link to="/myprofile" className={`px-[30px] py-3 rounded-full border font-bold text-sm text-center transition-all ${
                isDark ? 'text-[#808080] border-[#1a1a1a] hover:bg-[#111]' : 'text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}>
                Cancel
              </Link>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

const InputGroup = ({ label, type = "text", placeholder, name, value, onChange, isDark }) => (
  <div className="flex flex-col gap-2">
    <label className={`text-[11px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
      {label}
    </label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6] transition-all border font-medium ${
        isDark 
        ? 'bg-[#111] border-[#1a1a1a] text-white placeholder:text-[#333]' 
        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus:bg-white'
      }`}
    />
  </div>
);

export default AccountSettings;