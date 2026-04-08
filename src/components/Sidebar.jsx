import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme !== theme) setTheme(currentTheme);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] 
      flex flex-col z-40 transition-all duration-300 ease-in-out p-[24px_16px] overflow-y-auto no-scrollbar
      ${isDark ? 'bg-black border-r border-[#333]' : 'bg-white border-r border-slate-200'}
    `}>
      
      {/* Main Feed Section */}
      <div className={`text-[11px] uppercase tracking-widest m-[24px_0_12px_12px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
        Main Feed
      </div>
      <div className={`border-b mx-3 mb-2 ${isDark ? 'border-[#333]' : 'border-slate-100'}`}></div>
      
      {[
        { to: "/", icon: "fa-house", label: "Home" },
        { to: "/files", icon: "fa-folder-open", label: "My Files" },
        { to: "/shared", icon: "fa-share-nodes", label: "Shares" },
        { to: "/recent", icon: "fa-clock", label: "Recents" },
        { to: "/starred", icon: "fa-star", label: "Starred" },
      ].map((item) => (
        <NavLink 
          key={item.label}
          to={item.to} 
          className={({ isActive }) => `
            flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all mb-1
            ${isActive 
              ? (isDark ? 'bg-[#111] text-white' : 'bg-blue-50 text-blue-600 font-semibold') 
              : (isDark ? 'text-[#808080] hover:bg-[#111] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600')
            }
          `}
        >
          {({ isActive }) => (
            <>
              <i className={`fa-solid ${item.icon} w-5 mr-3 text-base ${isDark ? 'text-white' : (isActive ? 'text-blue-600' : 'text-slate-400')}`}></i>
              {item.label}
            </>
          )}
        </NavLink>
      ))}

      {/* Workspace Section */}
      <div className={`text-[11px] uppercase tracking-widest m-[24px_0_12px_12px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
        Workspace
      </div>
      <div className={`border-b mx-3 mb-2 ${isDark ? 'border-[#333]' : 'border-slate-100'}`}></div>
      
      {[
        { to: "/collections", icon: "fa-folder", label: "Collections" },
        { to: "/schedules", icon: "fa-calendar-days", label: "Schedules" },
        { to: "/reports", icon: "fa-chart-line", label: "Reports" },
        
      ].map((item) => (
        <NavLink 
          key={item.label}
          to={item.to} 
          className={({ isActive }) => `
            flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all mb-1
            ${isActive 
              ? (isDark ? 'bg-[#111] text-white' : 'bg-blue-50 text-blue-600 font-semibold') 
              : (isDark ? 'text-[#808080] hover:bg-[#111] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600')
            }
          `}
        >
           {({ isActive }) => (
            <>
              <i className={`fa-solid ${item.icon} w-5 mr-3 text-base ${isDark ? 'text-white' : (isActive ? 'text-blue-600' : 'text-slate-400')}`}></i>
              {item.label}
            </>
          )}
        </NavLink>
      ))}

      {/* Manage Section */}
      <div className={`text-[11px] uppercase tracking-widest m-[24px_0_12px_12px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
        Manage
      </div>
      <div className={`border-b mx-3 mb-2 ${isDark ? 'border-[#333]' : 'border-slate-100'}`}></div>

      {/* FIXED NavLinks below */}
      <NavLink to="/archives" className={({ isActive }) => `flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all mb-1 ${isActive ? (isDark ? 'bg-[#111] text-white' : 'bg-blue-50 text-blue-600') : (isDark ? 'text-[#808080] hover:text-white' : 'text-slate-600 hover:bg-slate-50')}`}>
        {({ isActive }) => (
          <>
            <i className={`fa-solid fa-box-archive w-5 mr-3 text-base ${isDark ? 'text-white' : (isActive ? 'text-blue-600' : 'text-slate-400')}`}></i> Archives
          </>
        )}
      </NavLink>

      <NavLink to="/storage/trash" className={({ isActive }) => `flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all ${isActive ? (isDark ? 'bg-[#111] text-white' : 'bg-blue-50 text-blue-600') : (isDark ? 'text-[#808080] hover:text-white' : 'text-slate-600 hover:bg-slate-50')}`}>
        {({ isActive }) => (
          <>
            <i className={`fa-solid fa-trash w-5 mr-3 text-base ${isDark ? 'text-white' : (isActive ? 'text-blue-600' : 'text-slate-400')}`}></i> Trash
          </>
        )}
      </NavLink>

    </aside>
  );
};

export default Sidebar;