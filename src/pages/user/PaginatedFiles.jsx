import React, { useState, useEffect } from 'react';
import FileCard from '../../components/FileCard';
import { Link } from "react-router-dom";

const PaginatedFiles = () => {
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

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className={`w-full max-w-[450px] border p-[10px_16px] rounded-xl flex items-center transition-colors shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
          <input 
            type="text" 
            placeholder="Search Your Files..." 
            className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} 
          />
        </div>
        <Link to="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl no-underline font-semibold text-sm transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
          <i className="fa-solid fa-plus"></i> New Document
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className={`text-[18px] md:text-[20px] font-semibold transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>My Files</div>
        <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm`}>1,248 items</div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        <FileCard title="Project_Proposal_2024.pdf" size="4.2 MB" time="2h ago" iconClass="fa-file-pdf" isLink={true} />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="Q4_Financial_Report.docx" size="1.8 MB" time="Yesterday" iconClass="fa-file-word" />
        <FileCard title="branding_assets.zip" size="124 MB" time="3 days ago" iconClass="fa-file-zipper" />
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-center items-center gap-2 py-6">
        <button className={`border w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <i className="fa fa-chevron-left text-xs"></i>
        </button>
        <button className={`w-10 h-10 rounded-lg font-semibold border transition-all ${isDark ? 'bg-[#0a0a0a] border-[#3b82f6] text-[#3b82f6]' : 'bg-blue-600 border-blue-600 text-white'}`}>1</button>
        <button className={`border w-10 h-10 rounded-lg transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>2</button>
        <button className={`border w-10 h-10 rounded-lg transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>3</button>
        <button className={`border w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <i className="fa fa-chevron-right text-xs"></i>
        </button>
      </div>

      {/* Mobile Storage Warning */}
      <div className="lg:hidden mt-8 space-y-4">
        <div className={`border rounded-xl p-5 transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Storage Status</div>
          <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-[#222]' : 'bg-slate-100'}`}>
            <div className="w-[93%] h-full bg-[#ff4444]"></div>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>14.08 GB of 15 GB used (93%)</p>
        </div>
      </div>
    </main>
  );
};

export default PaginatedFiles;