import React from 'react';
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";


const Sidebar = ({ isOpen }) => {
  return (
   <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] bg-black border-r border-[#1a1a1a] flex flex-col z-40 transition-transform duration-300 ease-in-out p-[24px_16px] overflow-y-auto custom-scrollbar`}>
  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Main Feed</div>

  <NavLink to="/" className="flex items-center p-[10px_12px] rounded-lg text-white no-underline text-sm bg-[#111]">
    <i className="fa-solid fa-house w-5 mr-3 text-base"></i> Home
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

  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Organize</div>

  <NavLink to="/collections" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-folder w-5 mr-3 text-base"></i> Collections
  </NavLink>

  <NavLink to="/collections" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-box-archive w-5 mr-3 text-base"></i> Archives
  </NavLink>

  <NavLink to="/trash" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-trash w-5 mr-3 text-base"></i> Trash
  </NavLink>

  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Sharing</div>

  <div className="space-y-1">
    {['abhiram@innovature...', 'demo@innovature...'].map((email, i) => (
      <div key={i} className="flex items-center p-[8px_12px] gap-3 cursor-pointer rounded-lg hover:bg-[#111]">
        <div className="w-7 h-7 shrink-0 flex items-center justify-center text-[11px] rounded-full bg-[#1a1a1a] text-white">{i + 1}</div>
        <span className="text-[13px] font-medium text-white truncate">{email}</span>
      </div>
    ))}
  </div>

  <NavLink to="/all-shares" className="mt-auto pt-4 flex justify-between items-center text-[#808080] text-[12px] uppercase tracking-wider hover:text-white border-t border-[#1a1a1a]">
    <span>View All Shares</span>
    <i className="fa-solid fa-chevron-right text-[10px]"></i>
  </NavLink>
</aside>
  );
};

export default Sidebar;