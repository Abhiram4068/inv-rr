import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const FileCard = ({ id, title, display_name, originalName, size, time, iconClass, isLink = false }) => {
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

  const Content = (
    <>
      <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors duration-300
        ${isDark ? 'bg-[#111] border-[#555]' : 'bg-slate-50 border-slate-100'}`}>
        
        <i className={`fa-solid ${iconClass} text-[40px] absolute z-10 group-hover:scale-110 transition-all
          ${isDark ? 'text-[#808080]' : 'text-blue-500'}`}></i>
        
        <div className={`w-full h-full object-cover opacity-40 ${isDark ? 'bg-[#111]' : 'bg-white'}`}></div>
      </div>

      <div className="p-4">
        {/* Original Name - Now Main Title & Larger */}
        <span className={`block text-base font-bold truncate transition-colors
          ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {title || 'Untitled File'}
        </span>

        {/* Display Name (title) - Now Subtitle & Smaller */}
        <span className={`block text-[12px] font-medium truncate mb-2
          ${isDark ? 'text-[#aaa]' : 'text-slate-500'}`}>
          {display_name}
        </span>

        <div className={`flex justify-between text-[12px] font-medium
          ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          <span>{size}</span>
          <span>{time}</span>
        </div>
      </div>
    </>
  );

  const containerClass = `rounded-lg overflow-hidden transition-all no-underline group cursor-pointer border
    ${isDark 
      ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] hover:-translate-y-1' 
      : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-1'}`;

  return isLink ? (
   <Link to={`/file/${id}`} className={containerClass}>{Content}</Link> 
  ) : (
    <div className={containerClass}>{Content}</div>
  );
};

export default FileCard;