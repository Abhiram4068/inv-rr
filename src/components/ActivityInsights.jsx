import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ActivityInsights = () => {
  // --- THEME STATE SYNC ---
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
   <aside className={`w-[320px] p-6 flex flex-col overflow-y-auto hidden xl:flex border-l transition-colors duration-300 no-scrollbar ${
      isDark ? 'bg-black border-[#1a1a1a]' : 'bg-[#F1F5F9] border-slate-200'
    }`}>
      
      {/* ACTIVITY SUMMARY */}
      <div className={`rounded-xl p-5 mb-4 border transition-all ${
        isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Activity Summary
        </div>

        <div className="space-y-4">
          {[
            { label: "Added Today", value: "12 files" },
            { label: "Shares Received", value: "4 folders" },
            { label: "Recent Downloads", value: "8 items" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                {item.label}
              </span>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-blue-600'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SYNC STATUS */}
      <div className={`rounded-xl p-5 border transition-all ${
        isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`text-[13px] font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Sync Status
        </div>

        <div className="flex items-center gap-2 text-[#00c851] text-[12px] mb-3 font-bold">
          <i className="fa-solid fa-circle-check"></i>
          <span>All files up to date</span>
        </div>

        <p className={`text-[11px] leading-relaxed font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Your cloud storage was last synchronized at <span className={isDark ? 'text-white' : 'text-slate-800'}>7:34 PM</span> today.
        </p>
      </div>

      {/* QUICK TIP (Added for better UI balance) */}
      <div className="mt-6 px-2">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-[#333]' : 'text-slate-400'}`}>
          System Health: <span className="text-[#00c851]">Optimal</span>
        </p>
      </div>
    </aside>
  );
};

export default ActivityInsights;