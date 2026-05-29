import React, { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import { getDeletedFiles, restoreFile, clearTrashFile, bulkRestoreFiles, emptyTrash } from "../../../services/fileService";
import { sizeFormatter } from '../../../utils/sizeFormatter';

const TrashManagement = () => {
  // --- THEME STATE SYNC ---
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
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
  const [isBulkRestoreModalOpen, setBulkRestoreModalOpen] = useState(false);
  const [isEmptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [trashFiles, setTrashFiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const rowsPerPage = 12;

  // --- DEBOUNCED SEARCH ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- TOAST ---
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type, animateOut: false });
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
  const fetchTrashFiles = useCallback(async () => {
    setLoading(true);
    try {
      setError("");
      const res = await getDeletedFiles(currentPage, debouncedSearch);
      // Support both paginated and flat array responses
      setTrashFiles(res.data.data ?? res.data.results ?? res.data ?? []);
      setTotalFiles(res.data.total ?? res.data.count ?? (Array.isArray(res.data) ? res.data.length : 0));
      setTotalSize(res.data.total_size ?? 0);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to fetch"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchTrashFiles();
  }, [fetchTrashFiles]);

  // --- HANDLERS ---
  const handleRestoreFile = async () => {
    if (!selectedFile) return;
    try {
      setActionLoading(true);
      await restoreFile(selectedFile.id);
      setRestoreModalOpen(false);
      setSelectedFile(null);
      showToast("File restored successfully");
      await fetchTrashFiles();
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to restore",
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    try {
      setActionLoading(true);
      await clearTrashFile(selectedFile.id);
      setDeleteModalOpen(false);
      setSelectedFile(null);
      showToast("File permanently deleted");
      await fetchTrashFiles();
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to delete",
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const openRestoreModal = (file) => {
    setSelectedFile(file);
    setRestoreModalOpen(true);
  };

  const handleBulkRestore = async () => {
    try {
      setActionLoading(true);
      const fileIds = trashFiles.map(f => f.id);
      if (fileIds.length === 0) {
        showToast("No files to restore", "error");
        return;
      }
      await bulkRestoreFiles(fileIds);
      setBulkRestoreModalOpen(false);
      showToast(`${fileIds.length} files restored successfully`);
      await fetchTrashFiles();
    } catch (err) {
      showToast("Failed to restore files", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      setActionLoading(true);
      await emptyTrash();
      setEmptyTrashModalOpen(false);
      showToast("Trash emptied successfully");
      await fetchTrashFiles();
    } catch (err) {
      showToast("Failed to empty trash", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- PAGINATION ---
  const totalPages = Math.ceil(totalFiles / rowsPerPage) || 1;
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 no-scrollbar min-h-screen transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'}`}>

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
      `}</style>


      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Trash</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
            Items in trash will be permanently deleted after 30 days • <span className={isDark ? "text-blue-400" : "text-blue-600"}>{sizeFormatter(totalSize)} total</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-64">
            <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${isDark ? 'text-neutral-600 group-focus-within:text-blue-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}></i>
            <input
              type="text"
              placeholder="Search trash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs rounded-xl py-2.5 pl-10 pr-6 w-full focus:outline-none transition-all border ${isDark ? 'bg-neutral-900/50 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'}`}
            />
          </div>
          <button
            onClick={() => setBulkRestoreModalOpen(true)}
            disabled={trashFiles.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border
${isDark
                ? 'bg-[#0d0d0d] border-[#1e1e1e] text-blue-400 hover:bg-[#151515] hover:border-blue-500/30'
                : 'bg-white border-slate-100 text-blue-600 hover:bg-slate-50 shadow-blue-500/5'
              } disabled:opacity-30 disabled:cursor-not-allowed`}>
            <i className="fa-solid fa-rotate-left"></i>
            Restore All
          </button>
          <button
            onClick={() => setEmptyTrashModalOpen(true)}
            disabled={trashFiles.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
            Empty Trash
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className={`border rounded-xl overflow-hidden animate-in fade-in duration-400 shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>

        {/* Table Header Bar with Pagination */}
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Trash Records</h3>
            <p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
              {loading
                ? 'Loading...'
                : (() => {
                  const start = totalFiles === 0 ? 0 : indexOfFirstRow + 1;
                  const end = Math.min(indexOfFirstRow + trashFiles.length, totalFiles);
                  const safeEnd = end < start ? start : end;

                  return `Showing ${start}–${safeEnd} of ${totalFiles}`;
                })()}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-slate-100 bg-slate-50'}`}>
                <th className="p-4 pl-6 text-[10px] uppercase text-[#444] font-bold tracking-widest">File Name</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Deleted At</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Size</th>
                <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className={`text-sm ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>Loading trash...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                  </td>
                </tr>
              ) : trashFiles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <p className={`text-sm ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                      No files in trash.
                      {searchQuery && " Try a different search."}
                    </p>
                  </td>
                </tr>
              ) : (
                trashFiles.map((file) => (
                  <tr key={file.id} className={`border-b transition-colors ${isDark ? 'border-[#0a0a0a] hover:bg-[#080808]' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center`}>
                          <i className={`fa-solid fa-file text-lg ${isDark ? 'text-[#444]' : 'text-slate-300'}`}></i>
                        </div>
                        <div>
                          <p className={`text-sm font-bold truncate max-w-[220px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.original_name}</p>
                          <p className={`text-[10px] font-bold ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
                            Deleted on: {file.deleted_at ? new Date(file.deleted_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                      {file.deleted_at ? new Date(file.deleted_at).toLocaleString() : '—'}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.file_size || '—'}</span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openRestoreModal(file)}
                          className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-neutral-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                          title="Restore File"
                        >
                          <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button
                          onClick={() => openDeleteModal(file)}
                          className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-neutral-800 text-red-500' : 'hover:bg-slate-100 text-red-600'}`}
                          title="Delete Permanently"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          {totalFiles} items currently in bin
        </p>
        <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          Total Trash Size: <span className={isDark ? 'text-white font-bold ml-1' : 'text-blue-600 font-bold ml-1'}>{sizeFormatter(totalSize)}</span>
        </span>
      </div>

      {/* RESTORE MODAL */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-rotate-left text-2xl"></i>
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Restore File?</h2>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to restore{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-800'}>{selectedFile?.original_name}</strong>?
                {' '}It will be moved back to its original location.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRestoreModalOpen(false)}
                  disabled={actionLoading}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreFile}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading
                    ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Restoring...</>
                    : <><i className="fa-solid fa-rotate-left"></i> Confirm Restore</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark
            ? 'bg-[#0d0d0d] border-[#1a1a1a]'
            : 'bg-white border-slate-200'
            }`}>

            <div className="text-center">

              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-trash text-2xl"></i>
              </div>

              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'
                }`}>
                Delete File Permanently?
              </h2>

              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'
                }`}>
                Are you sure you want to permanently delete{" "}
                <strong className={isDark ? 'text-white' : 'text-slate-800'}>
                  {selectedFile?.original_name}
                </strong>?
                {" "}This action cannot be undone.
              </p>

              <div className="flex gap-3">

                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={actionLoading}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark
                    ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteFile}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading
                    ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                        Deleting...
                      </>
                    )
                    : (
                      <>
                        <i className="fa-solid fa-trash"></i>
                        Delete
                      </>
                    )}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
      {/* BULK RESTORE MODAL */}
      {isBulkRestoreModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-rotate-left text-2xl"></i>
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Restore All Files?</h2>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to restore all {trashFiles.length} items currently in the trash?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBulkRestoreModalOpen(false)}
                  disabled={actionLoading}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkRestore}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading
                    ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Restoring...</>
                    : <><i className="fa-solid fa-rotate-left"></i> Restore All</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY TRASH MODAL */}
      {isEmptyTrashModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0d0d0d] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Empty Trash?</h2>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to permanently delete all items in the trash? This action cannot be undone and will release your storage.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEmptyTrashModalOpen(false)}
                  disabled={actionLoading}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#1a1a1a] text-[#808080] hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmptyTrash}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading
                    ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Clearing...</>
                    : <><i className="fa-solid fa-trash"></i> Empty Trash</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TrashManagement;