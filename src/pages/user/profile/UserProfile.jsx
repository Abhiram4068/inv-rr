import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { profile } from '../../../services/authService';


const UserProfile = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await profile();
        setUserProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch user profile"); 
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);
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

  if (loading) {
    return (
      <div className={`flex-1 flex min-w-0 overflow-hidden items-center justify-center transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex-1 flex min-w-0 overflow-hidden items-center justify-center transition-colors duration-300 ${isDark ? 'bg-black text-red-500' : 'bg-[#E6EBF2] text-red-500'}`}>
        <p className="font-bold">{error}</p>
      </div>
    );
  }
const getInitials = (firstName, lastName) => {
  const f = firstName?.trim()?.charAt(0)?.toUpperCase() || "";
  const l = lastName?.trim()?.charAt(0)?.toUpperCase() || "";
  return f + l || "U"; // fallback (User)
};
  return (
    <div className={`flex-1 flex min-w-0 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      <div className="flex-1 p-3 lg:p-5 overflow-y-auto no-scrollbar">
        <div className={`w-full border rounded-xl p-8 lg:p-12 shadow-2xl transition-all ${
          isDark ? 'bg-[#0a0a0a] border-neutral-900 shadow-black' : 'bg-white border-slate-200 shadow-slate-300/50'
        }`}>
          
          <h1 className={`text-xl font-bold mb-10 ${isDark ? 'text-white' : 'text-slate-800'}`}>Account Profile</h1>

          <div className={`flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b ${
            isDark ? 'border-neutral-900' : 'border-slate-100'
          }`}>
            {/* Avatar Circle */}
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 shadow-lg shadow-blue-600/20">
               {getInitials(userProfile.first_name, userProfile.last_name)}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{userProfile.first_name} {userProfile.last_name}</h2>
              <p className={`font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                {userProfile.role} • <span className={isDark ? 'text-neutral-600' : 'text-slate-400'}>{userProfile.email}</span>
              </p>
            </div>

            <Link 
              to="/settings"
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 shadow-md ${
                isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
            >
              Edit Profile
            </Link>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
            <DetailItem label="First Name" value={userProfile.first_name} isDark={isDark} />
            <DetailItem label="Last Name" value={userProfile.last_name} isDark={isDark} />
            <DetailItem label="Role / Occupation" value={userProfile.role} isDark={isDark} />
            <DetailItem label="Total Files Managed" value={userProfile.total_files+" Files"} isDark={isDark} />
            <DetailItem label="Date Joined" value={userProfile.date_joined} isDark={isDark} />
            <DetailItem label="Account Status" value="Active" valueColor="#00c851" isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, valueColor, isDark }) => (
  <div className="space-y-2">
    <span className={`block text-[10px] uppercase tracking-[0.15em] font-bold ${
      isDark ? 'text-neutral-600' : 'text-slate-400'
    }`}>
      {label}
    </span>
    <span 
      className="block text-lg font-bold tracking-wide" 
      style={{ color: valueColor || (isDark ? '#ffffff' : '#1e293b') }}
    >
      {value}
    </span>
  </div>
);

export default UserProfile;