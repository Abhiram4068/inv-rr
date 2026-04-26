import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { profile } from '../../../services/authService';
import { sizeFormatter } from '../../../utils/sizeFormatter';
const UserProfile = () => {
  // --- THEME STATE SYNC (Untouched) ---
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
      <div className={`flex-1 flex min-w-0 items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex-1 flex min-w-0 items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#050505] text-red-400' : 'bg-[#F8FAFC] text-red-600'}`}>
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">System Error</p>
          <p className="opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const getInitials = (firstName, lastName) => {
    const f = firstName?.trim()?.charAt(0)?.toUpperCase() || "";
    const l = lastName?.trim()?.charAt(0)?.toUpperCase() || "";
    return f + l || "U";
  };

  return (
    <div className={`flex-1 flex min-w-0 transition-colors duration-300 ${isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Settings</h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Manage your public profile and account details.</p>
            </div>
            <Link 
              to="/settings"
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 border ${
                isDark 
                ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <span>Edit Profile</span>
            </Link>
          </div>

          <div className={`w-full rounded-lg overflow-hidden border transition-all ${
            isDark ? 'bg-[#0F0F0F] border-neutral-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            {/* Profile Hero Area */}
            <div className={`p-8 lg:p-10 border-b ${isDark ? 'border-neutral-800 bg-gradient-to-br from-[#0F0F0F] to-[#141414]' : 'border-slate-100 bg-gradient-to-br from-white to-slate-50'}`}>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar with Status Ring */}
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-tr from-blue-700 to-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl ">
                    <span className="-rotate-3">{getInitials(userProfile.first_name, userProfile.last_name)}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-[#0F0F0F] rounded-full" title="Active"></div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {userProfile.first_name} {userProfile.last_name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider self-center ${
                      isDark ? ' text-neutral-400' : ' text-slate-500'
                    }`}>
                      {userProfile.designation}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {userProfile.email}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                     <Stat pill label="Joined" value={userProfile.date_joined} isDark={isDark} />
                     <Stat pill label="Storage" value={sizeFormatter(userProfile.storage_used_bytes) + " used of 1GB"} isDark={isDark} />
                  </div>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className={`p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
              <DetailItem label="First Name" value={userProfile.first_name} isDark={isDark} />
              <DetailItem label=" Last Name" value={userProfile.last_name} isDark={isDark} />
              <DetailItem label="Designation" value={userProfile.designation} isDark={isDark} />
              <DetailItem label="Total files" value={`${userProfile.total_files} File(s)`} isDark={isDark} />
              <DetailItem label="System Access" value="Full Administrative" isDark={isDark} />
              <DetailItem label="Account Standing" value={userProfile.status} valueColor="#10b981" isDark={isDark} />
            </div>

            {/* Footer Note */}
            <div className={`px-8 py-4 text-[11px] font-medium tracking-wide border-t uppercase opacity-50 ${isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-100 text-slate-400'}`}>
              Identity verified via secure Hive protocol
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, isDark }) => (
  <div className="flex items-center gap-2">
    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
      {label}:
    </span>
    <span className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
      {value}
    </span>
  </div>
);

const DetailItem = ({ label, value, valueColor, isDark }) => (
  <div className="group">
    <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors ${
      isDark ? 'text-neutral-600 group-hover:text-blue-500' : 'text-slate-400 group-hover:text-blue-600'
    }`}>
      {label}
    </label>
    <div className={`text-[15px] font-semibold tracking-wide py-2.5 px-4  transition-all ${
      isDark 
      ? 'text-white' 
      : ' text-slate-700'
    }`} style={{ color: valueColor }}>
      {value}
    </div>
  </div>
);

export default UserProfile;