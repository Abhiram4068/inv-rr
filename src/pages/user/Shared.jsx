import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const Shared = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

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

  const sharedFiles = [
    { id: 1, name: "Final_Pitch_Deck.pdf", type: "pdf", sharedWith: "Public Link", views: "42 Views", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 2, name: "Budget_Sheet_Q1.xlsx", type: "excel", sharedWith: "abhiram@innovaturelabs.com", views: "12 Views", color: "#00c851", icon: "fa-file-excel" },
  ];

  const recentShares = [
    { id: 1, email: "abhiram@innovaturelabs.com", file: "Project_Spec_v2.docx", status: "Active", statusColor: "rgba(59, 130, 246, 0.1)", textColor: "#3b82f6" },
    { id: 2, email: "demo@innovaturelabs.com", file: "Branding_Guidelines.zip", status: "Expired", statusColor: "rgba(255, 68, 68, 0.1)", textColor: "#ff4444" },
  ];

  const showToast = (msg) => setToast({ visible: true, message: msg });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  return (
    <div className={`flex-1 min-w-0 transition-colors duration-300 overflow-y-auto no-scrollbar relative ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* --- RECTANGLE PILL TOAST --- */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-800 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      <div className="py-10 px-12 lg:px-24 max-w-[1600px] mx-auto">
        
        {/* TOP LABEL */}
        <div className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-4 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Recent</div>

        {/* SEARCH AND ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className={`w-full max-w-[450px] p-[10px_16px] rounded-xl flex items-center border transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search Your Files..." 
              className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} 
            />
          </div>
          <button className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            <i className="fa fa-plus"></i> New Document
          </button>
        </div>

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Shared Files</h1>
          <div className={`${isDark ? 'text-neutral-500' : 'text-slate-500'} text-sm`}>2 items actively shared</div>
        </div>

        {/* SECTION 1: ACTIVELY SHARED */}
        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-neutral-900 bg-transparent' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-widest border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>
                <th className="p-4 font-medium">File Name</th>
                <th className="p-4 font-medium">Shared With</th>
                <th className="p-4 font-medium">View Status</th>
                <th className="p-4 font-medium text-right">Manage</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-50'}`}>
              {sharedFiles.map((file) => (
                <tr key={file.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-4 text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${file.icon}`} style={{ color: file.color }}></i>
                      <span className={`truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.name}</span>
                    </div>
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{file.sharedWith}</td>
                  <td className="p-4 text-sm">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {file.views}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button onClick={() => setModalOpen(true)} className="text-blue-500 hover:text-blue-600 hover:underline font-bold transition-colors">
                      Manage Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIEW ALL LINK (SECTION 1) */}
        <div className={`mt-2 py-4 border-t ${isDark ? 'border-neutral-900' : 'border-slate-200'}`}>
          <Link 
            to="/viewallshares"
            className={`flex items-center justify-between w-full text-[10px] uppercase tracking-widest transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
          >
            <span>View All Shared Files</span>
            <i className="fa-solid fa-chevron-right text-[8px]"></i>
          </Link>
        </div>

        {/* SECTION 2: RECENTLY SHARED WITH */}
        <div className="mt-16 mb-8">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recently Shared With</h2>
        </div>
        
        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-neutral-900 bg-transparent' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-widest border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>
                <th className="p-4 font-medium">Email ID</th>
                <th className="p-4 font-medium">File Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-50'}`}>
              {recentShares.map((share) => (
                <tr key={share.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/30' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-4 text-sm text-blue-500 font-medium truncate max-w-[200px]">{share.email}</td>
                  <td className={`p-4 text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{share.file}</td>
                  <td className="p-4 text-sm">
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded font-bold border" 
                      style={{ 
                        backgroundColor: share.statusColor, 
                        color: share.textColor,
                        borderColor: share.textColor + '33'
                      }}
                    >
                      {share.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button onClick={() => setModalOpen(true)} className="text-blue-500 hover:text-blue-600 hover:underline font-bold transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIEW ALL LINK (SECTION 2) */}
        <div className={`mt-2 py-4 border-t ${isDark ? 'border-neutral-900' : 'border-slate-200'}`}>
          <Link 
            to="/viewallshares"
            className={`flex items-center justify-between w-full text-[10px] uppercase tracking-widest transition-colors ${isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
          >
            <span>View All Shared Files</span>
            <i className="fa-solid fa-chevron-right text-[8px]"></i>
          </Link>
        </div>
      </div>

      {/* MODAL (Fixed Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className={`p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Manage Share Link</h3>
            <p className={`text-sm mb-8 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
              Anyone with the link can currently view this file. You can revoke access immediately.
            </p>
            <div className="flex gap-3">
              <button 
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                onClick={() => setModalOpen(false)}
              >
                Keep Active
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                onClick={() => { setModalOpen(false); showToast("Access revoked successfully"); }}
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

export default Shared;