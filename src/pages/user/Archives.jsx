import React, { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import { getArchives, unarchiveFile, deleteArchivedFiles, bulkUnarchiveFiles } from '../../services/fileService';
import { sizeFormatter } from '../../utils/sizeFormatter';
import { getFileMeta } from '../../utils/fileIcons';
import { formatDateTime } from '../../utils/dateFormatter';

const ArchivesList = () => {
  // --- THEME ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'light');
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

  // --- STATE ---
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [archives, setArchives] = useState([]);
  const [totalArchives, setTotalArchives] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rowsPerPage = 7;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [restoreAllModal, setRestoreAllModal] = useState(false);

  useEffect(() => {
  const timer = setTimeout(() => {
  setDebouncedSearch(searchQuery);
  }, 300); // 300ms delay

  return () => clearTimeout(timer);
  }, [searchQuery]);
// --- TOAST STATE ---
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type: type, animateOut: false });
  };

  // Toast auto-dismiss with clean slide-up exit animation
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, animateOut: true }));
        setTimeout(() => {
          setToast({ visible: false, message: '', type: 'success', animateOut: false });
        }, 350);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // --- FETCH ---
  const fetchArchives = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getArchives(currentPage, debouncedSearch);
      // adjust these keys to match your actual API response shape
      setArchives(res.data.data ?? res.data.results ?? []);
      setTotalArchives(res.data.total ?? res.data.count ?? 0);
    } catch (err) {
      setError("Failed to load archives.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

const handleUnarchive = async () => {
  if (!unarchiveTarget) return;

  try {
     setActionLoading(true);
    // Optional: show loading state later if needed
    await unarchiveFile(unarchiveTarget.id);
    setUnarchiveTarget(null);
    showToast("File restored successfully");

    // ✅ Option 1 (recommended for now): refetch from backend
    await fetchArchives();

  } catch (err) {
    console.error("Unarchive failed", err);
    setToast({ visible: true, message: "Failed to restore file. Try again.", type: 'error', animateOut: false });
  }finally{
     setActionLoading(false);
  }
};

const handleRestoreAll = async () => {
  if (archives.length === 0) return;
  try {
    setActionLoading(true);
    await bulkUnarchiveFiles(archives.map(f => f.id));
    showToast("All files on this page restored");
    await fetchArchives();
    setRestoreAllModal(false);
  } catch (err) {
    showToast("Failed to restore all files", "error");
  } finally {
    setActionLoading(false);
  }
};

const handleDeleteArchive=async(item)=>{
  try{
     setActionLoading(true);
      await deleteArchivedFiles([item.id]);
    showToast("File deleted successfully");
    await fetchArchives();
  }catch(err){
    showToast("Failed to delete file");
  }
}

  const totalPages = Math.ceil(totalArchives / rowsPerPage) || 1;
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;

  return (
    <div className={`flex-1 min-h-screen p-6 lg:p-10 overflow-y-auto no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'}`}>
      {/* Professional Top-Sliding Toast */}
      {toast.visible && (
        <div 
          className={`fixed top-6 left-0 right-0 flex justify-center z-[10000] pointer-events-none
            transition-all duration-[350ms]
            ${toast.animateOut 
              ? 'opacity-0 -translate-y-6 scale-95' 
              : 'opacity-100 translate-y-0 scale-100'
            }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animation: !toast.animateOut ? 'slideDownProfessional 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
          }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
            ${isDark 
              ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' 
              : 'bg-white border-slate-100 text-slate-800'}`}>
            
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error' 
                ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500') 
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')
              }`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
            </div>
            
            <span className="flex-1 leading-normal tracking-wide text-[13px]">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDownProfessional {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .archive-table-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .archive-table-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .archive-table-scroll::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 99px;
        }
        .archive-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .archive-table-scroll {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 transparent;
        }
      `}</style>
      {/* --- UNARCHIVE CONFIRMATION MODAL --- */}
      {unarchiveTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-box-open text-2xl"></i>
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Restore File?</h2>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to unarchive <strong>{unarchiveTarget.original_name}</strong>? It will be moved back to your active files.
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
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg "
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RESTORE ALL CONFIRMATION MODAL --- */}
      {restoreAllModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-boxes-stacked text-2xl"></i>
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Restore All?</h2>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to unarchive all <strong>{archives.length}</strong> items on this page? They will be moved back to your active files.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRestoreAllModal(false)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreAll}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? <><i className="fa-solid fa-circle-notch animate-spin mr-2"></i>Restoring...</> : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
{deleteTarget && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-trash text-2xl"></i>
        </div>
        <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Delete File?
        </h2>
        <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
          Are you sure you want to permanently delete <strong className={isDark ? 'text-white' : 'text-slate-800'}>{deleteTarget.original_name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            disabled={actionLoading}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Cancel
          </button>
          <button
            disabled={actionLoading}
            onClick={async () => {
              try {
                setActionLoading(true);
                await deleteArchivedFiles([deleteTarget.id]);
                setDeleteTarget(null);
                showToast("File deleted successfully");
                await fetchArchives();
              } catch (err) {
                showToast("Failed to delete file");
              } finally {
                setActionLoading(false);
              }
            }}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {actionLoading
              ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Deleting...</>
              : <><i className="fa-solid fa-trash"></i> Yes, Delete</>}
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
              {/* File icon + name */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 flex items-center justify-center flex-shrink-0 `}>
                  <i className={`fa-solid ${getFileMeta(selectedArchive.content_type || "").icon} text-2xl`} style={{ color: getFileMeta(selectedArchive.content_type || "").color }}></i>
                </div>
                <div>
                  <span className={`px-0 py-0  text-[10px] font-bold  uppercase tracking-widest ${isDark ? 'text-slate-400 ' : ' text-slate-500 '}`}>
                     {selectedArchive.status}
                  </span>
                  <h3 className={`text-base font-bold mt-1.5 leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {selectedArchive.original_name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 `}>
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Archived On</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {formatDateTime(selectedArchive.archived_at)}
                  </p>
                </div>
                <div className={`p-3`}>
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">File Size</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {selectedArchive.file_size
                      ? sizeFormatter(selectedArchive.file_size)
                      : '—'}
                  </p>
                </div>
                <div className={`p-3 `}>
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Content Type</p>
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {selectedArchive.content_type || '—'}
                  </p>
                </div>
                <div className={`p-3`}>
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Uploaded On</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {formatDateTime(selectedArchive.created_at)}
                  </p>
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

      {/* --- HEADER & SEARCH --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Archives</h1>
          <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1`}>Manage and restore your historical file deliveries.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-64">
            <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${isDark ? 'text-neutral-600 group-focus-within:text-blue-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}></i>
            <input
              type="text"
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs rounded-xl py-2.5 pl-10 pr-6 w-full focus:outline-none transition-all border ${isDark ? 'bg-neutral-900/50 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'}`}
            />
          </div>
          <button
            onClick={() => setRestoreAllModal(true)}
            disabled={archives.length === 0 || loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border
              ${isDark 
                ? 'bg-[#0d0d0d] border-[#1e1e1e] text-blue-400 hover:bg-[#151515] hover:border-blue-500/30' 
                : 'bg-white border-slate-100 text-blue-600 hover:bg-slate-50 shadow-blue-500/5'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <i className="fa-solid fa-rotate-left"></i>
            Restore All
          </button>
        </div>
      </div>

      {/* --- CONTENT TABLE --- */}
      <div className={`border rounded-xl overflow-hidden animate-in fade-in duration-400 shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>

        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Archive Records</h3>
            <p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
              {loading
                ? 'Loading...'
                : `Showing ${totalArchives === 0 ? 0 : indexOfFirstRow + 1}–${Math.min(indexOfFirstRow + archives.length, totalArchives)} of ${totalArchives}`}
            </p>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <span className={`text-[10px] font-bold uppercase px-2 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-neutral-800' : 'border-slate-200'} ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : (isDark ? 'bg-neutral-900 text-white hover:border-neutral-600' : 'bg-white text-slate-800 hover:bg-slate-50')}`}
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-neutral-800' : 'border-slate-200'} ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : (isDark ? 'bg-neutral-900 text-white hover:border-neutral-600' : 'bg-white text-slate-800 hover:bg-slate-50')}`}
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto archive-table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-slate-100 bg-slate-50'}`}>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest pl-6">File Name</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Archived at</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest text-center">Size</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className={`text-sm ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>Loading archives...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                  </td>
                </tr>
              ) : archives.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                <p className={`text-sm ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                      No archives found.
                      {searchQuery && " Try a different search."}
                    </p>
                                
                </td>
                </tr>
              ) : (
                archives.map((item) => {
                  const meta = getFileMeta(item.content_type || "");
                  return (
                    <tr key={item.id} className={`border-b transition-colors ${isDark ? 'border-[#0a0a0a] hover:bg-[#080808]' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10  flex items-center justify-center `}>
                            <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color }}></i>
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.original_name}</p>
                            <p className={`text-[10px] font-bold  ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
                             
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-600'}`}>
                           {formatDateTime(item.archived_at)}
                          </p>
                          
                        </div>
                      </td>
                      <td className="p-4 text-center">
                       <div className={`text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-600'}`}>
                          {item.file_size
                            ? sizeFormatter(item.file_size)
                            : '—'}
                        </div>
                        <div className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
                          {item.content_type || '—'}
                        </div>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedArchive(item)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                          onClick={() => setUnarchiveTarget(item)}
                          className={`p-2 rounded-xl transition-colors ${
                            isDark
                              ? 'hover:bg-neutral-800 text-red-400'
                              : 'hover:bg-slate-100 text-red-600'
                          }`}
                          title="Unarchive File"
                        >
                        <i className="fa-solid fa-rotate-left"></i>      
                        </button>
                       <button
                          onClick={() => setDeleteTarget(item)}
                          className={`p-2 rounded-xl transition-colors ${
                            isDark
                              ? 'hover:bg-neutral-800 text-red-500'
                              : 'hover:bg-slate-100 text-red-600'
                          }`}
                          title="Delete File"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArchivesList;