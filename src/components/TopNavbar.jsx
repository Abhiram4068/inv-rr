import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

import useAuth from "../hooks/useAuth";

const TopNavbar = ({ toggleSidebar }) => {
  const { user, logout: clearUser } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 1. Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // 2. Update localStorage and apply class to document whenever theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      // Optional: if you aren't using Tailwind dark mode yet, 
      // this ensures the body background matches your new white theme
      document.body.style.backgroundColor = '#F8FAFC'; 
    } else {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = 'black';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  const handleLogout = async () => {
    try {
      await logout();          // tells the server to blacklist / clear the refresh cookie
    } catch {
      // even if the server call fails, clear client state
    } finally {
      clearUser(null);          // wipe user from context
      navigate("/login", { replace: true });
    }
  };
  return (
    <nav className={`h-[60px] flex items-center justify-between px-4 md:px-6 border-b shrink-0 z-50 transition-colors duration-300 
      ${theme === 'dark' ? 'bg-black border-[#333]' : 'bg-white border-slate-200 shadow-sm'}`}>
      
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-[#808080] hover:text-blue-500">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <div className={`text-[18px] md:text-[20px] font-bold tracking-tight transition-colors 
          ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          HiveDrive
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* --- Theme Toggle Button --- */}
        <button 
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border
            ${theme === 'dark' 
              ? 'bg-[#111] border-[#333] text-yellow-400 hover:bg-[#222]' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          title="Toggle Theme"
        >
          <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

       

        {/* User Profile Dropdown */}
        <div className={`relative flex items-center p-1 rounded-lg cursor-pointer transition-colors group
             ${theme === 'dark' ? 'hover:bg-[#111]' : 'hover:bg-slate-100'}`} 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          
          <div className="flex items-center gap-[10px]">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 shadow-sm">JD</div>
            <div className="hidden md:flex flex-col text-left">
              <span className={`text-[13px] font-medium transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>John Doe</span>
              <span className="text-[10px] text-[#808080]">Project Manager</span>
            </div>
            <i className="fa-solid fa-chevron-down text-[10px] text-[#808080] ml-1"></i>
          </div>

          {isDropdownOpen && (
            <div className={`absolute top-[calc(100%+10px)] right-0 w-[180px] border rounded-xl p-2 z-[100] shadow-xl animate-in fade-in zoom-in duration-200
              ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-slate-200'}`}>
              
              <Link to="/myprofile" className={`flex items-center gap-[10px] p-[10px_12px] no-underline text-[13px] rounded-md transition-all 
                ${theme === 'dark' ? 'text-[#808080] hover:bg-[#222] hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                <i className="fa-solid fa-user"></i> Account
              </Link>
              
              <hr className={`my-2 border-0 border-t ${theme === 'dark' ? 'border-[#333]' : 'border-slate-100'}`} />
              
              <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-[10px] p-[10px_12px] text-[#ff4444] text-[13px] rounded-md transition-all 
                ${theme === 'dark' ? 'hover:bg-[#222]' : 'hover:bg-red-50'}`}>
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;