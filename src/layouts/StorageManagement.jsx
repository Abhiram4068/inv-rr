import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import StorageSidebar from '../components/StorageSidebar';
import RightSidebar from '../components/RightSidebar';

const StorageLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="m-0 text-white flex flex-col h-screen overflow-hidden bg-black">
      <TopNavbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-grow overflow-hidden relative">
        <StorageSidebar isOpen={isSidebarOpen} />
        
       <Outlet />

        

        {/* Backdrop for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default StorageLayout;