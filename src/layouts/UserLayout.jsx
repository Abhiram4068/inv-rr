import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const UserLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="m-0 text-white flex flex-col h-screen overflow-hidden bg-black">
      <TopNavbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-grow overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} />
        
       <main className="flex-1 overflow-y-auto no-scrollbar">
  <Outlet />
</main>

        <RightSidebar />

        {/* Backdrop for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-[#141d2a] z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default UserLayout;