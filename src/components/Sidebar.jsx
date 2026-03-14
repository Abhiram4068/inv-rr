import React from 'react';
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";


const Sidebar = ({ isOpen }) => {
  return (
   <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] bg-black border-r border-[#555] flex flex-col z-40 transition-transform duration-300 ease-in-out p-[24px_16px] overflow-y-auto no-scrollbar`}>
  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Main Feed</div>
<div className="border-b border-[#333] mx-3 mb-2"></div>
  <NavLink to="/" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-house w-5 mr-3 text-base"></i>Home
  </NavLink>


  <NavLink to="/files" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-folder-open w-5 mr-3 text-base"></i> My Files
  </NavLink>

  <NavLink to="/shared" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-share-nodes w-5 mr-3 text-base"></i> Shares
  </NavLink>

  <NavLink to="/recent" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-clock w-5 mr-3 text-[16px]"></i> Recent
  </NavLink>

  <NavLink to="/starred" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-star w-5 mr-3 text-[16px]"></i> Starred
  </NavLink>
  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Workspace</div>
<div className="border-b border-[#333] mx-3 mb-2"></div>
  {/* NEW: Schedules Field */}
  <NavLink to="/schedules" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-calendar-days w-5 mr-3 text-base"></i> Schedules
  </NavLink>

<NavLink
  to="/reports"
  className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white"
>
  <i className="fa-solid fa-chart-line w-5 mr-3 text-base"></i> Reports
</NavLink>
  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Organize</div>
<div className="border-b border-[#333] mx-3 mb-2"></div>
  <NavLink to="/collections" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-folder w-5 mr-3 text-base"></i> Collections
  </NavLink>

  <NavLink to="/collections" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-box-archive w-5 mr-3 text-base"></i> Archives
  </NavLink>

  <NavLink to="/storage/trash" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-trash w-5 mr-3 text-base"></i> Trash
  </NavLink>

</aside>
  );
};

export default Sidebar;