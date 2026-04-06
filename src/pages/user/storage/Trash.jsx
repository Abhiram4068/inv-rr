import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const TrashManagement = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
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

  // Mock Data for Trash
  const trashFiles = [
    { id: 1, name: "Old_Project_Draft.zip", type: "archive", size: "420 MB", deletedDate: "2 days ago", color: "#ffa900", icon: "fa-file-zipper" },
    { id: 2, name: "Unused_Asset_01.png", type: "image", size: "4.5 MB", deletedDate: "5 days ago", color: "#10b981", icon: "fa-file-image" },
    { id: 3, name: "Raw_Footage_Blurry.mp4", type: "video", size: "1.8 GB", deletedDate: "1 week ago", color: "#3b82f6", icon: "fa-file-video" },
    { id: 4, name: "Meeting_Notes_July.pdf", type: "pdf", size: "1.2 MB", deletedDate: "3 days ago", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 5, name: "Temp_Database_Export.sql", type: "database", size: "210 MB", deletedDate: "6 hours ago", color: "#8b5cf6", icon: "fa-database" },
  ];

  const filteredFiles = trashFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDeleteModal = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const openRestoreModal = (file) => {
    setSelectedFile(file);
    setRestoreModalOpen(true);
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
          <Link to="/dashboard" className={`${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>Home</Link>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <Link to="/storage-management" className={`${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>Storage Management</Link>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <span className={isDark ? 'text-white' : 'text-slate-800'}>Trash</span>
        </nav>
      </div>

      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trash</h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Items in trash will be permanently deleted after 30 days</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className={`flex-1 md:w-[300px] p-[10px_16px] rounded-xl flex items-center border transition-all ${
            isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search trash..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none ml-3 w-full outline-none text-sm font-medium" 
            />
          </div>
          <button className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
            isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}>
            Empty Trash
          </button>
        </div>
      </div>

      {/* Content Area - Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-[#808080] border-[#1a1a1a]' : 'text-slate-400 border-slate-200'}`}>
              <th className="p-6 font-bold">File Name</th>
              <th className="p-6 font-bold">Deleted</th>
              <th className="p-6 font-bold">Size</th>
              <th className="p-6 font-bold text-center">View</th>
              <th className="p-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#111]' : 'divide-slate-200/50'}`}>
            {filteredFiles.map((file) => (
              <tr 
                key={file.id} 
                className={`group transition-all duration-200 border-b last:border-none ${isDark ? 'hover:bg-[#111] border-[#111]' : 'hover:bg-white/50 border-slate-200/30'}`}
              >
                <td className="p-4 text-sm font-bold">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-[#111] group-hover:bg-[#1a1a1a]' : 'bg-white shadow-sm'}`}>
                      <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                    </div>
                    <span className={`truncate max-w-[250px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.name}</span>
                  </div>
                </td>
                <td className={`p-4 text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>{file.deletedDate}</td>
                <td className={`p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.size}</td>
                <td className="p-4 text-sm text-center">
                  <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-[#808080] hover:text-white hover:bg-[#1a1a1a]' : 'text-slate-400 hover:text-blue-600 hover:bg-white shadow-sm'}`}>
                    <i className="fa-solid fa-eye text-xs"></i>
                  </button>
                </td>
                <td className="p-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openRestoreModal(file)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                        isDark ? 'bg-[#111] hover:bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => openDeleteModal(file)}
                      className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredFiles.length === 0 && (
          <div className="py-20 text-center">
            <i className={`fa-solid fa-trash-can text-4xl mb-4 ${isDark ? 'text-[#333]' : 'text-slate-200'}`}></i>
            <p className={`text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Trash is empty. No items to display.</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          {filteredFiles.length} items currently in bin
        </p>
        <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
           Total Trash Size: <span className={isDark ? 'text-white font-bold ml-1' : 'text-blue-600 font-bold ml-1'}>2.44 GB</span>
        </span>
      </div>

      {/* MODALS (Restore & Delete) */}
      {[
        { 
          show: isRestoreModalOpen, 
          close: () => setRestoreModalOpen(false), 
          icon: "fa-rotate-left", 
          color: "blue", 
          title: "Restore File?", 
          desc: "will be moved back to its original location.",
          btnText: "Restore" 
        },
        { 
          show: isDeleteModalOpen, 
          close: () => setDeleteModalOpen(false), 
          icon: "fa-triangle-exclamation", 
          color: "red", 
          title: "Delete Permanently?", 
          desc: "This action cannot be undone. It will be lost forever.",
          btnText: "Delete Forever" 
        }
      ].map((modal, idx) => modal.show && (
        <div key={idx} className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className={`p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl border transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.color === 'red' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
               <i className={`fa-solid ${modal.icon} text-xl`}></i>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{modal.title}</h3>
            <p className={`text-sm mb-8 leading-relaxed font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
              <span className={isDark ? 'text-white' : 'text-slate-800'}>{selectedFile?.name}</span> {modal.desc}
            </p>
            <div className="flex gap-3">
              <button 
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-[#1a1a1a] text-white hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} 
                onClick={modal.close}
              >
                Cancel
              </button>
              <button 
                className={`flex-1 py-3.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${
                  modal.color === 'red' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                }`} 
                onClick={modal.close}
              >
                {modal.btnText}
              </button>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
};

export default TrashManagement;