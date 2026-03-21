import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
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

  // Dynamic Class Helper for NavLinks
  const getNavLinkClass = ({ isActive }) => {
    const base = "flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all duration-200 font-medium ";
    
    if (isActive) {
      return base + (isDark ? "bg-[#111] text-white" : "bg-white text-blue-600 shadow-sm border border-slate-100");
    }
    return base + (isDark ? "text-[#808080] hover:bg-[#111] hover:text-white" : "text-slate-500 hover:bg-white hover:text-blue-500");
  };

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] flex flex-col z-40 transition-all duration-300 ease-in-out p-[24px_16px] overflow-y-auto no-scrollbar border-r
      ${isDark ? 'bg-black border-neutral-800' : 'bg-[#F8FAFC] border-slate-200'}
    `}>
      
      <div className={`text-[11px] uppercase tracking-widest m-[24px_0_12px_12px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
        HiveDrive Storage
      </div>

      <div className="space-y-1">
        <NavLink to="/" className={getNavLinkClass}>
          <i className="fa-solid fa-house w-5 mr-3 text-base"></i> Home
        </NavLink>

        <NavLink to="/cleanup" className={getNavLinkClass}>
          <i className="fa-solid fa-wand-magic-sparkles w-5 mr-3 text-base"></i> Cleanup
        </NavLink>

        <NavLink to="/storage/view-duplicates" className={getNavLinkClass}>
          <i className="fa-solid fa-copy w-5 mr-3 text-base"></i> Duplicates
        </NavLink>

        <NavLink to="/storage/view-oldfiles" className={getNavLinkClass}>
          <i className="fa-solid fa-clock-rotate-left w-5 mr-3 text-base"></i> Old Files
        </NavLink>

        <NavLink to="/storage/trash" className={getNavLinkClass}>
          <i className="fa-solid fa-trash-can w-5 mr-3 text-base"></i> Trash
        </NavLink>
      </div>

    </aside>
  );
};

export default Sidebar;