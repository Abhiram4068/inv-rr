import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

const RightSidebar = () => {
  const navigate = useNavigate();
  
  // 1. Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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

  return (
    <aside className={`hidden lg:block w-[320px] p-[24px_20px] border-l transition-colors duration-300 overflow-y-auto no-scrollbar 
      ${isDark ? 'bg-black border-[#555]' : 'bg-[#F8FAFC] border-slate-200'}`}>
      
      {/* Home Tab */}
      <div className={`border rounded-xl p-5 mb-4 transition-colors 
        ${isDark ? 'bg-[#0a0a0a] border-[#555] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
        <div className="text-base font-semibold mb-2">Home</div>
        <p className={`text-[12px] leading-relaxed mb-5 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Your personal HiveDrive frontpage. Check in with your most important documents.
        </p>
        <Link 
          to="/upload-file"
          className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm mb-3 transition-all border
            ${isDark 
              ? 'bg-transparent text-white border-[#1a1a1a] hover:bg-[#111]' 
              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md'}`}
        >
          Upload File
        </Link>

        <Link 
          to="/collections"
          className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm transition-all border
            ${isDark 
              ? 'bg-transparent text-white border-[#1a1a1a] hover:bg-[#111]' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Collections
        </Link>
      </div>

      {/* Mail Scheduler */}
      <div className={`border rounded-xl p-5 mb-4 transition-colors 
        ${isDark ? 'bg-[#0a0a0a] border-[#555] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
        <div className="text-base font-semibold mb-2">Mail Scheduler</div>
        <p className={`text-[12px] leading-relaxed mb-5 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Automate your outreach. Schedule and manage your pending emails.
        </p>
        <Link 
          to="/schedule-mail"
          className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm transition-all
            ${isDark ? 'bg-[#e3e3e3] text-black hover:bg-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          Schedule a Mail
        </Link>
      </div>

      {/* Storage Critical Section */}
      <div className={`border rounded-xl p-5 transition-colors 
        ${isDark ? 'bg-[#0a0a0a] border-[#555]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-[10px] text-[#ff4444] text-[13px] font-bold">
          <i className="fa-solid fa-bullhorn"></i>
          <span>STORAGE CRITICAL</span>
        </div>
        <div className={`h-1.5 rounded-full my-3 ${isDark ? 'bg-[#222]' : 'bg-slate-100'}`}>
          <div className="w-[93%] h-full bg-[#ff4444] rounded-full shadow-[0_0_8px_rgba(255,68,68,0.4)]"></div>
        </div>
        <p className={`text-[12px] mb-5 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          14.08 GB of 15 GB used (93%)
        </p>

        <Link 
          to="/storage"
          className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm transition-all
            ${isDark ? 'text-white hover:bg-[#111]' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          View Storage
        </Link>
      </div>
    </aside>
  );
};

export default RightSidebar;