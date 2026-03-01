import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import Sidebar from "../components/Sidebar";
import ActivityInsights from "../components/ActivityInsights"; // Import here

const RecentLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="m-0 text-white flex flex-col h-screen overflow-hidden bg-black">
      
      <TopNavbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-grow overflow-hidden relative">
        
        {/* LEFT SIDEBAR */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* PAGE CONTENT */}
       <main className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>

        {/* RIGHT INSIGHTS SIDEBAR */}
        <ActivityInsights />

        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      </div>
    </div>
  );
};

export default RecentLayout;