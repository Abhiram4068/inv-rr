import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const ViewAllShares = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const allSharedFiles = [
    { id: 1, name: "Final_Pitch_Deck.pdf", type: "pdf", sharedWith: "Public Link", views: "42 Views", date: "Oct 12, 2023", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 2, name: "Budget_Sheet_Q1.xlsx", type: "excel", sharedWith: "abhiram@innovaturelabs.com", views: "12 Views", date: "Oct 10, 2023", color: "#00c851", icon: "fa-file-excel" },
    { id: 3, name: "Project_Spec_v2.docx", type: "word", sharedWith: "demo@innovaturelabs.com", views: "8 Views", date: "Oct 08, 2023", color: "#3b82f6", icon: "fa-file-word" },
    { id: 4, name: "Branding_Guidelines.zip", type: "zip", sharedWith: "Public Link", views: "156 Views", date: "Oct 05, 2023", color: "#ffa900", icon: "fa-file-zipper" },
    { id: 5, name: "User_Research_Video.mp4", type: "video", sharedWith: "marketing@team.com", views: "24 Views", date: "Sep 28, 2023", color: "#ff3547", icon: "fa-file-video" },
    { id: 6, name: "API_Documentation.md", type: "code", sharedWith: "dev-group@internal.com", views: "91 Views", date: "Sep 22, 2023", color: "#a66efa", icon: "fa-file-code" },
  ];

  const filteredFiles = allSharedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.sharedWith.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        
        {/* BREADCRUMB / BACK NAVIGATION */}
        <Link to='/shared' className={`flex items-center gap-2 transition-colors mb-6 text-sm group ${isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
          <span className="font-bold">Back to Shared</span>
        </Link>

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>All Shared Files</h1>
            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Managing {allSharedFiles.length} shared assets across your workspace</p>
          </div>
          
          <div className="relative group">
            <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${isDark ? 'text-neutral-600 group-focus-within:text-blue-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}></i>
            <input 
              type="text" 
              placeholder="Search files or emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-sm rounded-full py-2.5 pl-10 pr-6 w-full md:w-80 focus:outline-none transition-all border ${
                isDark 
                ? 'bg-neutral-900/50 border-neutral-800 text-white focus:border-neutral-600 focus:bg-neutral-900' 
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'
              }`}
            />
          </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'bg-[#0a0a0a] border-neutral-900' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-900' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                <th className="py-4 pl-6 font-bold">File Name</th>
                <th className="py-4 font-bold">Recipient</th>
                <th className="py-4 font-bold">Shared Date</th>
                <th className="py-4 font-bold">Analytics</th>
                <th className="py-4 pr-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
              {filteredFiles.map((file) => (
                <tr key={file.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                  <td className="py-5 pl-6 text-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-neutral-900' : 'bg-slate-100'}`}>
                        <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                      </div>
                      <span className={`font-bold truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm">
                    <span className={`font-medium ${file.sharedWith.includes('@') ? "text-blue-500" : (isDark ? "text-neutral-400" : "text-slate-500")}`}>
                      {file.sharedWith}
                    </span>
                  </td>
                  <td className={`py-5 text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    {file.date}
                  </td>
                  <td className="py-5 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${isDark ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      <i className="fa-solid fa-chart-line mr-1.5"></i>
                      {file.views}
                    </span>
                  </td>
                  <td className="py-5 pr-6 text-sm text-right">
                    <div className="flex justify-end gap-4">
                      <button className={`transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>
                        <i className="fa-solid fa-link text-xs"></i>
                      </button>
                      <button 
                        onClick={() => setModalOpen(true)}
                        className="text-blue-500 hover:text-blue-400 font-bold"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFiles.length === 0 && (
            <div className="py-20 text-center">
              <i className={`fa-solid fa-folder-open text-4xl mb-4 ${isDark ? 'text-neutral-800' : 'text-slate-100'}`}></i>
              <p className={`text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>No files match your search criteria.</p>
            </div>
          )}
        </div>

        {/* PAGINATION (Footer) */}
        <div className={`mt-8 pt-6 border-t flex items-center justify-between ${isDark ? 'border-neutral-900' : 'border-slate-200'}`}>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
            Showing {filteredFiles.length} of {allSharedFiles.length} files
          </p>
          <div className="flex gap-2">
            <button className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border rounded transition-colors ${isDark ? 'text-neutral-500 border-neutral-800 hover:bg-neutral-900' : 'text-slate-500 bg-white border-slate-200 hover:bg-slate-50'}`}>Previous</button>
            <button className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border rounded transition-colors ${isDark ? 'text-white border-neutral-800 bg-neutral-900 hover:bg-neutral-800' : 'text-white bg-slate-800 border-slate-800 hover:bg-slate-900'}`}>Next</button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className={`p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl border ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-shield-halved text-xl"></i>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Manage Share Link</h3>
            <p className={`text-sm mb-8 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
              Anyone with the link can currently view this file. You can revoke access immediately.
            </p>
            <div className="flex gap-3">
              <button 
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setModalOpen(false)}
              >
                Keep Active
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                onClick={() => setModalOpen(false)}
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllShares;