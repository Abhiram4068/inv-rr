import React from 'react';
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";


const Sidebar = ({ isOpen }) => {
  return (
   <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] bg-black border-r border-[#1a1a1a] flex flex-col z-40 transition-transform duration-300 ease-in-out p-[24px_16px] overflow-y-auto custom-scrollbar`}>
  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">HiveDrive Storage Management</div>
<NavLink to="/" className="flex items-center p-[10px_12px] rounded-lg text-white no-underline text-sm ">
    <i className="fa-solid fa-house w-5 mr-3 text-base"></i> Home
  </NavLink>
  <NavLink to="/" className="flex items-center p-[10px_12px] rounded-lg text-white no-underline text-sm bg-[#111]">
    <i className="fa-solid fa-house w-5 mr-3 text-base"></i> Cleanup Recommendations
  </NavLink>

  <NavLink to="/storage/view-duplicates" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-folder-open w-5 mr-3 text-base"></i> Duplicates
  </NavLink>

  <NavLink to="/storage/view-oldfiles" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-share-nodes w-5 mr-3 text-base"></i> Old Files
  </NavLink>

  <NavLink to="/storage/trash" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-star w-5 mr-3 text-[16px]"></i> Trash
  </NavLink>



</aside>
  );
};

export default Sidebar;