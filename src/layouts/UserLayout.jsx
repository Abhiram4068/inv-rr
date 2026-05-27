import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const UserLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);

  return (
    <div className="m-0 text-white flex flex-col h-screen overflow-hidden bg-black">
      <TopNavbar 
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        toggleRightSidebar={() => setRightSidebarOpen(!isRightSidebarOpen)} 
      />
      
      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        
       <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        <Outlet />
      </main>

        <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setRightSidebarOpen(false)} />

        {/* Backdrops for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        {isRightSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" 
            onClick={() => setRightSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default UserLayout;