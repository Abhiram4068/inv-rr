import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const AdminTopNavbar = ({ toggleSidebar }) => {
  const { user, logout: clearUser } = useAuth();
  const navigate = useNavigate();


  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'User';
  const initials = fullName.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'U';
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

  return (
    <nav className="h-[60px] flex items-center justify-between px-4 md:px-6 border-b shrink-0 z-50 transition-colors duration-300 bg-black border-[#333]">

      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-[#808080] hover:text-blue-500">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <div className="text-[18px] md:text-[20px] font-bold tracking-tight transition-colors text-white">
          HiveDrive Administration Panel
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* User Profile Dropdown */}
        <div className="relative flex items-center p-1 rounded-lg cursor-pointer transition-colors group hover:bg-[#111]">

          <div className="flex items-center gap-[10px]">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 shadow-sm">{initials}</div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-medium transition-colors text-white">{fullName}</span>
              <span className="text-[10px] text-[#808080] capitalize">System Administrator</span>
            </div>
          </div>

          
        </div>
      </div>
    </nav>
  );
};

export default AdminTopNavbar;