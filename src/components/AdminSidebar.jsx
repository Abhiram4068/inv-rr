import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminSidebar = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { logout, logout: clearUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // even if the server call fails, clear client state
    } finally {
      clearUser(null);
      navigate("/login", { replace: true });
    }
  };

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
      lg:translate-x-0 lg:static fixed top-[60px] lg:top-0 bottom-0 left-0 w-[260px] flex flex-col z-40 transition-all duration-300 ease-in-out p-[24px_16px] overflow-y-auto no-scrollbar border-r
      ${isDark ? 'bg-black border-[#262626]' : 'bg-[#F8FAFC] border-slate-200'}
    `}>

      {/* SECTION 1: ADMINISTRATION */}
      <div className={sectionHeaderClass}>Administration</div>
      <div className="space-y-1">
        <NavLink onClick={() => onClose?.()} to="/admin/dashboard" className={getNavLinkClass}>
          <i className="fa-solid fa-gauge-high w-5 mr-3 text-base"></i> Overview
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/activity-logs" className={getNavLinkClass}>
          <i className="fa-solid fa-clock-rotate-left w-5 mr-3 text-base"></i> Activity Logs
        </NavLink>
      </div>

      <div className={dividerClass}></div>

      {/* SECTION 2: USERS & ACCESS CONTROL */}
      <div className={sectionHeaderClass}>Users & Access Control</div>
      <div className="space-y-1">
        <NavLink onClick={() => onClose?.()} to="/admin/users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-group w-5 mr-3 text-base"></i> User Profiles
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/pending-users" className={getNavLinkClass}>
          <i className="fa-solid fa-users w-5 mr-3 text-base"></i> Pending Approvals
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/designations" className={getNavLinkClass}>
          <i className="fa-solid fa-id-badge w-5 mr-3 text-base"></i> Manage Designations
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/role-change" className={getNavLinkClass}>
          <i className="fa-solid fa-user-pen w-5 mr-3 text-base"></i> Role Change Requests
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/blocked-users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-lock w-5 mr-3 text-base"></i> Blocked Users
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/reactivation-requests" className={getNavLinkClass}>
          <i className="fa-solid fa-envelope-open-text w-5 mr-3 text-base"></i> Reactivation Requests
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/deleted-users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-minus w-5 mr-3 text-base"></i> Deleted Users
        </NavLink>
      </div>

      {/* Logout */}
      <div className={`border-t mt-auto pt-4 mx-0 ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
       <button
  onClick={handleLogout}
  className={`w-full flex items-center p-[10px_12px] rounded-lg text-sm font-medium transition-all duration-200 ${
    isDark
      ? 'text-red-400 hover:bg-[#111] hover:text-red-500'
      : 'text-red-500 hover:bg-white hover:text-red-600'
  }`}
>
  <i className="fa-solid fa-right-from-bracket w-5 mr-3 text-base text-red-500"></i>
  Logout
</button>
      </div>

    </aside>
  );
};

export default AdminSidebar;