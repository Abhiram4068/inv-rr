import React from 'react';
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";


const StorageSidebar = ({ isOpen }) => {
  return (
   <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static fixed inset-y-0 left-0 w-[260px] bg-black border-r border-[#1a1a1a] flex flex-col z-40 transition-transform duration-300 ease-in-out p-[24px_16px] overflow-y-auto custom-scrollbar`}>

    <NavLink to="/" className="flex items-center p-[10px_12px] rounded-lg text-white no-underline text-sm hover:bg-[#111] mb-4">

    <i className="fa-solid fa-arrow-left w-5 mr-3 text-base text-[#3b82f6]"></i> Go to Home
  </NavLink>
  <div className="text-[11px] uppercase text-[#808080] tracking-widest m-[24px_0_12px_12px]">Options</div>

  <NavLink to="/storage/storage-cleanup" className="flex items-center p-[10px_12px] rounded-lg text-white no-underline text-sm bg-[#111]">
    <i className="fa-solid fa-house w-5 mr-3 text-base"></i> Largest Files
  </NavLink>

  <NavLink to="/storage/view-duplicates" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-folder-open w-5 mr-3 text-base"></i> Duplicate Files
  </NavLink>
  
<NavLink
  to="/storage/view-oldfiles"
  className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white"
>
  <i className="fa-solid fa-share-nodes w-5 mr-3 text-base"></i>
  Old Files (&gt; 1 year)
</NavLink>

 <NavLink to="/storage/unused" className="flex items-center p-[10px_12px] rounded-lg text-[#808080] no-underline text-sm transition-colors hover:bg-[#111] hover:text-white">
    <i className="fa-solid fa-star w-5 mr-3 text-[16px]"></i> Unused Files
  </NavLink>
 

    

</aside>
  );
};

export default StorageSidebar;