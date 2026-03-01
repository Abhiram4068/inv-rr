import React, { useState } from 'react';

const TopNavbar = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="h-[60px] flex items-center justify-between px-4 md:px-6 border-b border-[#1a1a1a] shrink-0 bg-black z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-[#808080] hover:text-white">
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <div className="text-[18px] md:text-[20px] font-bold tracking-tight text-white">HiveDrive</div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden sm:flex items-center gap-5">
          <a href="/login" className="text-[#808080] no-underline text-sm hover:text-white">Log In</a>
          <a href="/register" className="bg-white text-black px-[18px] py-2 rounded-[20px] no-underline font-semibold text-sm">Join Now</a>
        </div>

        <div className="relative flex items-center p-1 rounded-lg cursor-pointer hover:bg-[#111] transition-colors group" 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="flex items-center gap-[10px]">
            <div className="w-8 h-8 bg-[#3b82f6] text-white rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0">JD</div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-medium text-white">John Doe</span>
              <span className="text-[10px] text-[#808080]">Project Manager</span>
            </div>
            <i className="fa-solid fa-chevron-down text-[10px] text-[#808080] ml-1"></i>
          </div>

          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+10px)] right-0 w-[180px] bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-2 z-[100] shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <a href="/myprofile" className="flex items-center gap-[10px] p-[10px_12px] text-[#808080] no-underline text-[13px] rounded-md transition-all hover:bg-[#1a1a1a] hover:text-white">
                <i className="fa-solid fa-user"></i> Account
              </a>
              <hr className="border-0 border-t border-[#1a1a1a] my-2" />
              <button className="w-full flex items-center gap-[10px] p-[10px_12px] text-[#ff4444] text-[13px] rounded-md transition-all hover:bg-[#1a1a1a]">
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