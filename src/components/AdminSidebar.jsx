import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import adminService from '../services/adminservice/userservice';
const AdminSidebar = ({ isOpen, onClose }) => {

  const { logout: handleLogout } = useAuth();
   const [counts, setCounts] = useState({ pending: 0, roleChange: 0, reactivation: 0 });
  const navigate = useNavigate();

const fetchCounts = async () => {
    try {
      const [pending, roleChange, reactivation] = await Promise.allSettled([
        adminService.getPendingApprovals(),
        adminService.getDesignationChangeRequests(),
        adminService.getReactivationRequests(),
      ]);
      setCounts({
        pending:      pending.status === 'fulfilled'      ? (pending.value?.count      ?? 0) : 0,
        roleChange:   roleChange.status === 'fulfilled'   ? (roleChange.value?.count   ?? 0) : 0,
        reactivation: reactivation.status === 'fulfilled' ? (reactivation.value?.count ?? 0) : 0,
      });
    } catch { }
  };

  useEffect(() => {
    fetchCounts();
    // Refresh every 60 seconds
    const interval = setInterval(fetchCounts, 60_000);
    // Also refresh when any resolve action fires this event
    window.addEventListener('admin:counts:refresh', fetchCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('admin:counts:refresh', fetchCounts);
    };
  }, []);

const isDark = true;  

  const getNavLinkClass = ({ isActive }) => {
    const base = "flex items-center p-[10px_12px] rounded-lg no-underline text-sm transition-all duration-200 font-medium mb-1 ";
    if (isActive) {
      return base + (isDark ? "bg-[#3b82f610] text-[#3b82f6]" : "bg-blue-50 text-blue-600 shadow-sm border border-slate-100");
    }
    return base + (isDark ? "text-[#808080] hover:bg-[#111] hover:text-[#3b82f6]" : "text-slate-500 hover:bg-white hover:text-blue-500");
  };

  const sectionHeaderClass = `text-[11px] uppercase tracking-widest m-[24px_0_12px_12px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`;
  const dividerClass = `border-b mx-3 my-4 ${isDark ? 'border-[#262626]' : 'border-slate-200'}`;
  const Badge = ({ n }) => n > 0 ? (
    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
      isDark ? 'bg-[#1a1a1a] text-[#f59e0b]' : 'bg-amber-50 text-amber-600 border border-amber-200'
    }`}>
      {n > 99 ? '99+' : n}
    </span>
  ) : null;


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
          <Badge n={counts.pending} />
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/designations" className={getNavLinkClass}>
          <i className="fa-solid fa-id-badge w-5 mr-3 text-base"></i> Manage Designations
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/role-change" className={getNavLinkClass}>
          <i className="fa-solid fa-user-pen w-5 mr-3 text-base"></i> Role Change Requests
           <Badge n={counts.roleChange} />
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/blocked-users" className={getNavLinkClass}>
          <i className="fa-solid fa-user-lock w-5 mr-3 text-base"></i> Blocked Users
        </NavLink>
        <NavLink onClick={() => onClose?.()} to="/admin/reactivation-requests" className={getNavLinkClass}>
          <i className="fa-solid fa-envelope-open-text w-5 mr-3 text-base"></i> Reactivation Requests
          <Badge n={counts.reactivation}/>
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