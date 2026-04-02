import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const ArchivesList = () => {
  // Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState(null);

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

  // Mock archived data
  const archives = [
    {
      id: 101,
      title: "Annual Tax Returns 2025",
      archivedDate: "2026-01-15",
      originalDate: "2025-12-30",
      status: "Archived",
      recipients: ["finance@innovature.com", "audit@firm.com"],
      filesCount: 24,
      size: "145 MB",
      description: "Finalized tax documentation and supporting receipts for the 2025 fiscal year."
    },
    {
      id: 102,
      title: "Legacy Website Source",
      archivedDate: "2026-02-01",
      originalDate: "2025-11-20",
      status: "Archived",
      recipients: ["dev-backups@innovature.com"],
      filesCount: 1540,
      size: "2.4 GB",
      description: "Complete source code and database dump of the version 2.0 platform before migration."
    }
  ];

  const handleUnarchive = () => {
    console.log(`Unarchiving: ${unarchiveTarget.title}`);
    setUnarchiveTarget(null);
  };

  return (
    <div className={`flex-1 min-h-screen p-6 lg:p-10 overflow-y-auto no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* --- UNARCHIVE CONFIRMATION MODAL --- */}
      {unarchiveTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-box-open text-2xl"></i>
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Restore Schedule?</h2>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to unarchive <strong>{unarchiveTarget.title}</strong>? It will be moved back to your active schedules.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setUnarchiveTarget(null)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUnarchive}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {selectedArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-[#1a1a1a] bg-[#0d0d0d]' : 'border-slate-100 bg-slate-50'}`}>
              <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Archive Details</h2>
              <button onClick={() => setSelectedArchive(null)} className="text-[#444] hover:text-red-500 transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {selectedArchive.status}
                </span>
                <h3 className={`text-xl font-bold mt-3 leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedArchive.title}</h3>
                <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>{selectedArchive.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Original Date</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{selectedArchive.originalDate}</p>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Data Size</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{selectedArchive.size}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t flex gap-3 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
              <button 
                onClick={() => { setUnarchiveTarget(selectedArchive); setSelectedArchive(null); }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Unarchive Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Archive</h1>
          <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1`}>Manage and restore your historical file deliveries.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/schedules" className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-solid fa-arrow-left"></i> Active Schedules
          </Link>
        </div>
      </div>

      {/* --- CONTENT TABLE --- */}
      <div className={`border rounded-xl overflow-hidden animate-in fade-in duration-400 shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-slate-100 bg-slate-50'}`}>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">File Name</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Size</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {archives.map((item) => (
                <tr key={item.id} className={`border-b transition-colors ${isDark ? 'border-[#0a0a0a] hover:bg-[#080808]' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-slate-500 ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-100'}`}>
                        <i className="fa-solid fa-file-zipper"></i>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.title}</p>
                        <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Archived: {item.archivedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-600'}`}>{item.filesCount} Files</div>
                    <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{item.size}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border inline-block ${isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                     
                      <button 
                        onClick={() => setUnarchiveTarget(item)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                      >
                        Unarchive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArchivesList;