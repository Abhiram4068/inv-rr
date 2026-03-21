import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const OldFilesManager = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

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

  // Mock Data focused on old, unaccessed files
  const oldFiles = [
    { id: 1, name: "Legacy_Project_Assets_2022.zip", type: "archive", size: "1.4 GB", lastAccessed: "14 months ago", date: "Jan 12, 2022", color: "#808080", icon: "fa-file-zipper" },
    { id: 2, name: "Old_Financial_Spreadsheet.xlsx", type: "document", size: "12 MB", lastAccessed: "2 years ago", date: "Mar 20, 2021", color: "#10b981", icon: "fa-file-excel" },
    { id: 3, name: "Draft_Video_Outtakes.mov", type: "video", size: "3.2 GB", lastAccessed: "11 months ago", date: "May 05, 2023", color: "#3b82f6", icon: "fa-file-video" },
    { id: 4, name: "Temporary_SQL_Export.sql", type: "database", size: "450 MB", lastAccessed: "9 months ago", date: "Aug 18, 2023", color: "#8b5cf6", icon: "fa-database" },
    { id: 5, name: "Unused_HighRes_Textures.rar", type: "archive", size: "890 MB", lastAccessed: "18 months ago", date: "Oct 30, 2022", color: "#ffa900", icon: "fa-file-zipper" },
  ];

  const filteredFiles = oldFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()} 
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-[#111]' : 'hover:bg-white shadow-sm'}`}
        >
          <i className={`fa-solid fa-arrow-left text-sm ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
        </button>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link to="/storage/storage-cleanup" className={`${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>Home</Link>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <Link to="/storage-management" className={`${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>Storage Management</Link>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <span className={isDark ? 'text-white' : 'text-slate-800'}>Old Files</span>
        </nav>
      </div>

      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Old Files</h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Review files that haven't been opened in over 6 months</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className={`flex-1 md:w-[300px] p-[10px_16px] rounded-xl flex items-center border transition-all ${
            isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search old files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none ml-3 w-full outline-none text-sm font-medium" 
            />
          </div>
        </div>
      </div>

      {/* Content Area - Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-[#808080] border-[#1a1a1a]' : 'text-slate-400 border-slate-200'}`}>
              <th className="p-6 font-bold">File Name</th>
              <th className="p-6 font-bold">Last Accessed</th>
              <th className="p-6 font-bold">Size</th>
              <th className="p-6 font-bold text-center">View</th>
              <th className="p-6 font-bold text-right">Manage</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#111]' : 'divide-slate-200/50'}`}>
            {filteredFiles.map((file) => (
              <tr 
                key={file.id} 
                className={`group transition-all duration-200 ${isDark ? 'hover:bg-[#111]' : 'hover:bg-white/50'}`}
              >
                <td className="p-4 text-sm font-bold">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-[#111] group-hover:bg-[#1a1a1a]' : 'bg-white shadow-sm'}`}>
                      <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                    </div>
                    <div className="flex flex-col">
                      <span className={`truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.name}</span>
                      <span className={`text-[10px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Created {file.date}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-[11px] font-bold  transition-colors ${
                    isDark 
                    ? 'text-[#808080]' 
                    : ' text-slate-500'
                  }`}>
                    {file.lastAccessed}
                  </span>
                </td>
                <td className={`p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.size}</td>
                <td className="p-4 text-sm text-center">
                  <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-[#808080] hover:text-white bg-[#111] hover:bg-[#1a1a1a]' : 'text-slate-400 hover:text-blue-600 bg-white shadow-sm hover:shadow-md'}`}>
                    <i className="fa-solid fa-eye text-xs"></i>
                  </button>
                </td>
                <td className="p-4 text-sm text-right">
                  <button 
                    onClick={() => handleDeleteClick(file)}
                    className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredFiles.length === 0 && (
          <div className="py-20 text-center">
            <i className={`fa-solid fa-box-archive text-4xl mb-4 ${isDark ? 'text-[#333]' : 'text-slate-200'}`}></i>
            <p className={`text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>No old files detected. Everything is current!</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          Found {filteredFiles.length} files for review
        </p>
        <div className="flex gap-6 items-center">
          <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
            Recoverable Space: <span className={`font-bold ml-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>5.94 GB</span>
          </span>
          <button className={`px-5 py-2.5 text-[10px] uppercase tracking-widest rounded-lg border transition-all font-bold shadow-sm ${
            isDark ? 'text-white border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111]' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
          }`}>
            Sort by Date
          </button>
        </div>
      </div>

      {/* ARCHIVE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className={`p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl border transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/10 text-red-500`}>
               <i className="fa-solid fa-box-open text-xl"></i>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Move to Archive?</h3>
            <p className={`text-sm mb-8 leading-relaxed font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
              You haven't opened <span className={isDark ? 'text-white' : 'text-slate-800'}>{selectedFile?.name}</span> in over a year. Archiving it will free up space while keeping it safe.
            </p>
            <div className="flex gap-3">
              <button 
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-[#1a1a1a] text-white hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                onClick={() => setDeleteModalOpen(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default OldFilesManager;