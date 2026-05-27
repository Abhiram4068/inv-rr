import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  // Matching the dark navy/slate theme of the image
  const sidebarBg = "#1c1c2b";  
  const activeBg = "rgba(255, 255, 255, 0.08)";
  const textMuted = "#9da2ae";

  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] 
      flex flex-col z-40 transition-all duration-300 ease-in-out overflow-y-auto no-scrollbar
    `} style={{ backgroundColor: sidebarBg }}>
            
      {/* Brand Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
          <i className="fa-solid fa-chart-pie text-white"></i>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">DashboardKit</span>
      </div>

      <div className="flex flex-col gap-1 px-2">
        <div className="text-[10px] uppercase tracking-widest px-4 py-4 font-bold text-slate-500">
          Navigation
        </div>
                
        <SidebarItem to="/" icon="fa-house" label="Dashboard" />
                
        <div className="text-[10px] uppercase tracking-widest px-4 py-4 font-bold text-slate-500">
          Elements
        </div>
        <SidebarItem to="/files" icon="fa-folder-open" label="My Files" />
        <SidebarItem to="/viewallshares" icon="fa-share-nodes" label="Shares" />
        <SidebarItem to="/schedules" icon="fa-calendar-days" label="Schedules" />
                
        <div className="text-[10px] uppercase tracking-widest px-4 py-4 font-bold text-slate-500">
          Manage
        </div>
        <SidebarItem to="/archives" icon="fa-box-archive" label="Archives" />
        <SidebarItem to="/storage/trash" icon="fa-trash" label="Trash" />

        {(user?.is_staff || user?.is_superuser) && (
          <>
            <div className="text-[10px] uppercase tracking-widest px-4 py-4 font-bold text-slate-500">
              Administration
            </div>
            <SidebarItem to="/admin/dashboard" icon="fa-gauge-high" label="Stats Overview" />
            <SidebarItem to="/admin/requests" icon="fa-envelope-open-text" label="Requests" />
          </>
        )}
      </div>
    </aside>
  );
};

const SidebarItem = ({ to, icon, label }) => (
  <NavLink  
    to={to}  
    className={({ isActive }) => `
      flex items-center px-4 py-3 rounded-md transition-all group
      ${isActive ? 'bg-[rgba(255,255,255,0.08)] text-white' : 'text-[#9da2ae] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'}
    `}
  >
    <i className={`fa-solid ${icon} w-6 text-sm`}></i>
    <span className="text-sm font-medium">{label}</span>
  </NavLink>
);

export default Sidebar;