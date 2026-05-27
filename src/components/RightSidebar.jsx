import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { getStorageSummary } from "../services/storageService";

const RightSidebar = ({ isOpen, onClose }) => {
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
  const [storageData, setStorageData] = useState(null);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await getStorageSummary();
        setStorageData(response.data);
      } catch (error) {
        console.error("Error fetching storage summary", error);
      }
    };
    fetchStorage();
  }, []);

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
      lg:translate-x-0 lg:static fixed top-[60px] lg:top-0 bottom-0 right-0 w-[320px] 
      p-[24px_20px] border-l shrink-0 z-40 transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar
      ${isDark ? 'bg-black border-[#262626]' : 'bg-[#F8FAFC] border-slate-200'}
    `}>
      
      {/* Home Tab */}
      <div className={`border rounded-xl p-5 mb-4 transition-colors 
        ${isDark ? 'bg-[#0a0a0a] border-[#555] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}>
        <div className="text-base font-semibold mb-2">Home</div>
        <p className={`text-[12px] leading-relaxed mb-5 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Your personal HiveDrive frontpage. Check in with your most important documents.
        </p>
        <Link 
          to="/upload-file"
          onClick={() => onClose?.()}
          className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm mb-3 transition-all border
            ${isDark 
              ? 'bg-transparent text-white border-[#1a1a1a] hover:bg-[#111]' 
              : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md'}`}
        >
          Upload File
        </Link>

        <Link 
          to="/collections"
          onClick={() => onClose?.()}
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
          onClick={() => onClose?.()}
          className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm transition-all
            ${isDark ? 'bg-[#e3e3e3] text-black hover:bg-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          Schedule a Mail
        </Link>
      </div>

      {/* Storage Critical/Status Section */}
      {storageData && (
        <div className={`border rounded-xl p-5 transition-colors 
          ${isDark ? 'bg-[#0a0a0a] border-[#555]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`flex items-center gap-[10px] text-[13px] font-bold ${storageData.is_storage_critical ? 'text-[#ff4444]' : (isDark ? 'text-white' : 'text-slate-800')}`}>
            <i className={`fa-solid ${storageData.is_storage_critical ? 'fa-bullhorn' : 'fa-hard-drive'}`}></i>
            <span>{storageData.is_storage_critical ? 'STORAGE CRITICAL' : 'STORAGE STATUS'}</span>
          </div>
          <div className={`h-1.5 rounded-full my-3 ${isDark ? 'bg-[#222]' : 'bg-slate-100'}`}>
            <div 
              style={{ width: `${Math.min(storageData.percentage_used, 100)}%` }} 
              className={`h-full rounded-full transition-all duration-500 ${
                storageData.is_storage_critical 
                  ? 'bg-[#ff4444] shadow-[0_0_8px_rgba(255,68,68,0.4)]' 
                  : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
              }`}
            ></div>
          </div>
          <p className={`text-[12px] mb-5 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
            {storageData.storage_used_human} of {storageData.storage_limit_human} used ({storageData.percentage_used}%)
          </p>

          <Link 
            to="/storage"
            onClick={() => onClose?.()}
            className={`block w-full p-2.5 rounded-[20px] font-semibold text-center text-sm transition-all
              ${isDark ? 'text-white border border-[#1a1a1a] hover:bg-[#111]' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
          >
            View Storage
          </Link>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;