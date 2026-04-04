import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const CollectionRightSidebar = ({ collectionInfo, onManage, onDelete }) => {
  // 1. Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';
if (!collectionInfo) {
  return (
    <aside className="w-[320px] p-6 hidden xl:flex">
      <div className="text-gray-400 text-sm">Loading...</div>
    </aside>
  );
}
  return (
    <aside className={`w-[320px] p-6 flex flex-col overflow-y-auto hidden xl:flex border-l transition-colors duration-300 no-scrollbar
      ${isDark ? 'bg-black border-[#555]' : 'bg-[#F1F5F9] border-slate-200'}`}>
     <div className={`border rounded-lg p-5 mb-4 transition-colors 
  ${isDark ? 'bg-[#0a0a0a] border-[#555]' : 'bg-white border-slate-200 shadow-sm'}`}>
  <h3 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
    About
  </h3>
  <p className={`text-sm leading-relaxed break-words ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
    {collectionInfo?.description || "No description provided for this collection."}
  </p>
</div>
      {/* Collection Details Card */}
      <div className={`border rounded-lg p-5 mb-4 transition-colors 
        ${isDark ? 'bg-[#0a0a0a] border-[#555]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Collection Details</h3>
        {/* <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
          Created on: {collectionInfo?.created_at}
        </p> */}
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className={`${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Created on:</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{collectionInfo?.created_at}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className={`${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Total Size</span>
            
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{collectionInfo?.total_size}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className={`${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Files</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{collectionInfo?.total_files}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Card
      <div className={`border rounded-lg p-5 mb-6 transition-colors 
        ${isDark ? 'bg-[#0a0a0a] border-[#555]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Activity</h3>
        <ul className="text-xs space-y-3">
          <li className="flex gap-2">
            <span className={`${isDark ? 'text-gray-400' : 'text-blue-500'}`}>•</span>
            <span className={`${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
              You uploaded <b className={`font-normal underline ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Pitch_Deck.pdf</b>
            </span>
          </li>
          <li className="flex gap-2">
            <span className={`${isDark ? 'text-gray-400' : 'text-blue-500'}`}>•</span>
            <span className={`${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
              Collection renamed to <b className={`font-normal italic ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Project Assets</b>
            </span>
          </li>
        </ul>
      </div> */}

      {/* Action Buttons (Sticky at bottom) */}
      <div className="mt-auto space-y-3">
        <button 
          onClick={onManage}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border
            ${isDark 
              ? 'bg-transparent border-[#555] hover:bg-[#111] text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 shadow-sm'}`}
        >
          <i className={`fa-solid fa-gear ${isDark ? 'text-gray-400' : 'text-slate-400'}`}></i>
          Manage Collection
        </button>
        
        <button 
          onClick={onDelete}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border
            ${isDark 
              ? 'bg-transparent border-red-900/20 hover:bg-red-950/20 text-red-500' 
              : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'}`}
        >
          <i className="fa-solid fa-trash-can"></i>
          Delete Collection
        </button>
      </div>
    </aside>
  );
};

export default CollectionRightSidebar;