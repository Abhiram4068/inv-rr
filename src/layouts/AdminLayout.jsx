import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import AdminTopNavbar from "../components/admin/AdminTopNavbar"
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="m-0 text-white flex flex-col h-screen overflow-hidden bg-black">
      <AdminTopNavbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-grow overflow-hidden relative">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-[#f0f2f7]">
          <Outlet />
        </main>

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

export default AdminLayout;
