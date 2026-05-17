import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ isOpen }) => {
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

  const getNavLinkClass = ({ isActive }) => {
    const base = "flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all duration-200 font-medium mb-1 ";
    if (isActive) {
      return base + (isDark ? "bg-[#3b82f610] text-[#3b82f6]" : "bg-blue-50 text-blue-600 shadow-sm border border-slate-100");
    }
    return base + (isDark ? "text-[#808080] hover:bg-[#111] hover:text-[#3b82f6]" : "text-slate-500 hover:bg-white hover:text-blue-500");
  };

  const sectionHeaderClass = `text-[11px] uppercase tracking-widest m-[24px_0_12px_12px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`;
  const dividerClass = `border-b mx-3 my-4 ${isDark ? 'border-[#262626]' : 'border-slate-200'}`;

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] flex flex-col z-40 transition-all duration-300 ease-in-out p-[24px_16px] overflow-y-auto no-scrollbar border-r
      ${isDark ? 'bg-black border-[#262626]' : 'bg-[#F8FAFC] border-slate-200'}
    `}>

      {/* SECTION 1: ADMINISTRATION */}
      <div className={sectionHeaderClass}>
        Administration
      </div>
      <div className="space-y-1">
        <NavLink to="/admin/dashboard" className={getNavLinkClass}>
          <i className="fa-solid fa-gauge-high w-5 mr-3 text-base"></i> Overview
        </NavLink>
        <NavLink to="/admin/activity-logs" className={getNavLinkClass}>
    <i className="fa-solid fa-clock-rotate-left w-5 mr-3 text-base"></i> Activity Logs
  </NavLink>
      </div>
  <div className={dividerClass}></div>
      {/* SECTION 2: USERS & ACCESS CONTROL */}
      <div className={sectionHeaderClass}>
        Users & Access Control
      </div>
      <div className="space-y-1">
        <NavLink to="/admin/users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-group w-5 mr-3 text-base"></i> User Profiles
        </NavLink>
        <NavLink to="/admin/pending-users" className={getNavLinkClass}>
          <i className="fa-solid fa-users w-5 mr-3 text-base"></i> Pending Approvals
        </NavLink>
        <NavLink to="/admin/role-change" className={getNavLinkClass}>
          <i className="fa-solid fa-user-pen w-5 mr-3 text-base"></i> Role Change Requests
        </NavLink>
        <NavLink to="/admin/blocked-users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-lock w-5 mr-3 text-base"></i> Blocked Users
        </NavLink>
        <NavLink to="/admin/reactivation-requests" className={getNavLinkClass}>
          <i className="fa-solid fa-envelope-open-text w-5 mr-3 text-base"></i> Reactivation Requests
        </NavLink>
        <NavLink to="/admin/deleted-users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-minus w-5 mr-3 text-base"></i> Deleted Users
        </NavLink>
      </div>
     

    </aside>
  );
};

export default AdminSidebar;