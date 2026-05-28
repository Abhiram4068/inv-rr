import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getFileVisuals } from '../../utils/fileUtils';
import { getSharedFiles, revokeShare } from '../../services/shareService';
import { formatDateTime } from "../../utils/dateFormatter";

const ViewAllShares = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });
  const [sharedFiles, setSharedFiles] = useState([]);
  const [totalShares, setTotalShares] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const rowsPerPage = 7;

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => { window.removeEventListener('storage', handleStorageChange); clearInterval(interval); };
  }, [theme]);

  const isDark = theme === 'dark';

  const showToast = (msg, type = 'success') => setToast({ visible: true, message: msg, type, animateOut: false });

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Active':   return isDark ? 'text-emerald-400' : 'text-emerald-600';
      case 'Expired':  return isDark ? 'text-amber-400'   : 'text-amber-600';
      case 'Revoked':  return isDark ? 'text-red-400'     : 'text-red-600';
      case 'Accessed': return isDark ? 'text-blue-400'    : 'text-blue-600';
      default: return '';
    }
  };

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const fetchSharedFiles = async () => {
    try {
      const response = await getSharedFiles(currentPage, rowsPerPage);
      setSharedFiles(response.data.data);
      setTotalShares(response.data.total_mails_send);
    } catch (error) {
      console.error('Error fetching shared files:', error);
    }
  };

  useEffect(() => { fetchSharedFiles(); }, [currentPage]);

  const handleRevokeShare = async (fileId) => {
    try {
      await revokeShare(fileId);
      showToast("Link revoked successfully");
      fetchSharedFiles();
    } catch {
      showToast("Failed to revoke share", "error");
    }
  };

  const filteredFiles = sharedFiles.filter(file =>
    file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalShares / rowsPerPage) || 1;
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;

  const permissionLabel = (p) => {
    if (p === 'view_only') return 'View only';
    if (p === 'view_download') return 'View + DL';
    if (p === 'one_time_download') return 'One-time';
    return 'Full access';
  };
  const permissionIcon = (p) => {
    if (p === 'view_only') return 'fa-eye';
    if (p === 'view_download') return 'fa-download';
    if (p === 'one_time_download') return 'fa-file-arrow-down';
    return 'fa-lock-open';
  };
  const permissionColor = (p) => {
    if (p === 'view_only') return isDark ? 'text-blue-400' : 'text-blue-600';
    if (p === 'view_download') return isDark ? 'text-purple-400' : 'text-purple-600';
    if (p === 'one_time_download') return isDark ? 'text-amber-400' : 'text-amber-600';
    return isDark ? 'text-emerald-400' : 'text-emerald-600';
  };

  return (
    <div className={`w-full transition-colors duration-300 relative ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>

      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[10000] pointer-events-none transition-all duration-[350ms]
            ${toast.animateOut ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[280px] max-w-[420px]
            ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error' ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500') : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')}`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
            </div>
            <span className="flex-1 leading-normal tracking-wide text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>All Shared Files</h1>
            <p className={`text-xs sm:text-sm mt-1 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Managing shared files across your HiveDrive</p>
          </div>
          <div className="relative group w-full sm:w-auto">
            <i className={`fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-neutral-600' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search files or emails..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={`text-sm rounded-full py-2.5 pl-9 pr-5 w-full sm:w-72 focus:outline-none transition-all border
                ${isDark ? 'bg-neutral-900/50 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'}`}
            />
          </div>
        </div>

        {/* Table container */}
        <div className={`border rounded-lg overflow-hidden shadow-2xl
  ${isDark
    ? 'border-neutral-900 bg-[#050505]'
    : 'border-slate-200 bg-slate-50/50'}
`}>

          {/* Pagination bar */}
          <div className={`px-4 sm:px-6 py-4 border-b flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div>
              <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Shared Files</h3>
              <p className={`text-[10px] font-bold mt-0.5 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                Showing {totalShares === 0 ? 0 : indexOfFirstRow + 1}–{indexOfFirstRow + filteredFiles.length} of {totalShares}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all
                  ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : ''}
                  ${isDark ? 'border-neutral-800 bg-neutral-900 text-white hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
              >
                <i className="fa-solid fa-chevron-left text-[10px]" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all
                  ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : ''}
                  ${isDark ? 'border-neutral-800 bg-neutral-900 text-white hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
              >
                <i className="fa-solid fa-chevron-right text-[10px]" />
              </button>
            </div>
          </div>

          {/* ── DESKTOP TABLE (md+) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table
  className={`w-full text-left border-collapse ${
    isDark ? 'bg-[#050505]' : 'bg-slate-50/50'
  }`}
>
              <thead>
                <tr className={`text-[10px] uppercase tracking-[0.12em] border-b
                  ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]/70' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                  <th className="py-3.5 pl-6 pr-3 font-bold w-[220px]">File Name</th>
                  <th className="py-3.5 px-3 font-bold w-[180px]">Recipient</th>
                  <th className="py-3.5 px-3 font-bold w-[160px]">Sent</th>
                  <th className="py-3.5 px-3 font-bold w-[80px]">Status</th>
                  <th className="py-3.5 px-3 font-bold w-[160px]">Permission</th>
                  <th className="py-3.5 pl-3 pr-6 font-bold text-right w-[90px]">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <i className={`fa-solid fa-share-nodes text-3xl mb-3 block ${isDark ? 'text-neutral-700' : 'text-slate-300'}`} />
                      <p className={`text-sm font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>No shared files found</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-neutral-700' : 'text-slate-300'}`}>Files you share will appear here</p>
                    </td>
                  </tr>
                ) : filteredFiles.map((file) => {
                  const visuals = getFileVisuals(file.file_name || file.content_type);
                  const hasBeenAccessed = !!file.accessed_at;
                  return (
                    <tr key={file.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                      {/* File name */}
                      <td className="py-4 pl-6 pr-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                            <i className={`fa-solid ${visuals.icon} text-base`} style={{ color: visuals.color }} />
                          </div>
                          <Link to={`/file/${file.file_id}`} className="min-w-0">
                            <span className={`font-bold block truncate max-w-[140px] leading-tight ${isDark ? 'text-white hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'} transition-colors`} title={file.file_name}>
                              {file.file_name}
                            </span>
                          </Link>
                        </div>
                      </td>
                      {/* Recipient */}
                      <td className="py-4 px-3 text-sm max-w-[180px]">
                        <span className={`font-medium block truncate ${isDark ? 'text-neutral-400' : 'text-slate-600'}`} title={file.recipient_email}>
                          {file.recipient_email}
                        </span>
                      </td>
                      {/* Date */}
                      <td className={`py-4 px-3 text-xs ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {formatDateTime(file.created_at)}
                      </td>
                      {/* Status */}
                      <td className="py-4 px-3 text-sm">
                        <span className={`text-[10px] font-bold ${getStatusClasses(file.status)}`}>{file.status}</span>
                      </td>
                      {/* Permission */}
                      <td className="py-4 px-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${permissionColor(file.permission)}`}>
                            <i className={`fa-solid ${permissionIcon(file.permission)} text-[9px]`} />
                            {permissionLabel(file.permission)}
                          </span>
                          {file.permission !== 'one_time_download' && file.view_limit !== null && (
                            <span className={`text-[10px] ${file.views_remaining === 0 ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-neutral-600' : 'text-slate-400')}`}>
                              {file.view_count}/{file.view_limit} views
                            </span>
                          )}
                          {file.permission === 'one_time_download' && (
                            <span className={`text-[10px] ${file.download_count >= 1 ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-neutral-600' : 'text-slate-400')}`}>
                              {file.download_count >= 1 ? 'Used' : 'Not used'}
                            </span>
                          )}
                          {file.permission === 'view_download' && file.download_limit !== null && (
                            <span className={`text-[10px] ${file.downloads_remaining === 0 ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-neutral-600' : 'text-slate-400')}`}>
                              {file.download_count}/{file.download_limit} dl
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6 text-sm text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setSelectedFile(file); setViewModalOpen(true); }}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye text-sm" />
                          </button>
                          {!hasBeenAccessed && !file.revoked_at && file.status !== 'Revoked' && file.status !== 'Expired' ? (
                            <button
                              onClick={() => { setSelectedFile(file); setModalOpen(true); }}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-red-400' : 'hover:bg-slate-100 text-red-500'}`}
                              title="Revoke Access"
                            >
                              <i className="fa-solid fa-link-slash text-sm" />
                            </button>
                          ) : (
                            <div className="w-9 h-9" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS (below md) ── */}
          <div className="md:hidden divide-y" style={{ borderColor: isDark ? '#171717' : '#f1f5f9' }}>
            {filteredFiles.length === 0 ? (
              <div className="py-16 text-center">
                <i className={`fa-solid fa-share-nodes text-3xl mb-3 block ${isDark ? 'text-neutral-700' : 'text-slate-300'}`} />
                <p className={`text-sm font-semibold ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>No shared files found</p>
              </div>
            ) : filteredFiles.map((file) => {
              const visuals = getFileVisuals(file.file_name || file.content_type);
              const hasBeenAccessed = !!file.accessed_at;
              return (
                <div key={file.id} className={`p-4 transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                  {/* Top row: icon + name + actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                        <i className={`fa-solid ${visuals.icon} text-lg`} style={{ color: visuals.color }} />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/file/${file.file_id}`}>
                          <p className={`text-sm font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`} title={file.file_name}>
                            {file.file_name}
                          </p>
                        </Link>
                        <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} title={file.recipient_email}>
                          {file.recipient_email}
                        </p>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setSelectedFile(file); setViewModalOpen(true); }}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                      >
                        <i className="fa-solid fa-eye text-sm" />
                      </button>
                      {!hasBeenAccessed && !file.revoked_at && file.status !== 'Revoked' && file.status !== 'Expired' ? (
                        <button
                          onClick={() => { setSelectedFile(file); setModalOpen(true); }}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-red-400' : 'hover:bg-slate-100 text-red-500'}`}
                        >
                          <i className="fa-solid fa-link-slash text-sm" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {/* Bottom row: status + permission + date */}
                  <div className="flex flex-wrap items-center gap-2 pl-12">
                    <span className={`text-[10px] font-bold ${getStatusClasses(file.status)}`}>{file.status}</span>
                    <span className={`text-neutral-600 text-[10px]`}>·</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${permissionColor(file.permission)}`}>
                      <i className={`fa-solid ${permissionIcon(file.permission)} text-[9px]`} />
                      {permissionLabel(file.permission)}
                    </span>
                    <span className={`text-neutral-600 text-[10px]`}>·</span>
                    <span className={`text-[10px] ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>{formatDateTime(file.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DETAILS MODAL ── */}
      {viewModalOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className={`w-full max-w-lg shadow-2xl border rounded-xl overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            {/* Modal header */}
            <div className={`px-6 pt-6 pb-4 border-b ${isDark ? 'border-neutral-900' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 min-w-0">
                  <i
                    className={`fa-solid ${getFileVisuals(selectedFile.content_type || selectedFile.file_name).icon} text-xl flex-shrink-0`}
                    style={{ color: getFileVisuals(selectedFile.content_type || selectedFile.file_name).color }}
                  />
                  <div className="min-w-0">
                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-0.5 ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>Share Details</p>
                    <h3 className={`text-base font-bold leading-tight truncate max-w-[280px] sm:max-w-xs ${isDark ? 'text-white' : 'text-slate-800'}`} title={selectedFile.file_name}>
                      {selectedFile.file_name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className={`p-2 rounded-full flex-shrink-0 transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500 hover:text-red-400' : 'hover:bg-slate-100 text-slate-400 hover:text-red-500'}`}
                >
                  <i className="fa-solid fa-xmark text-lg" />
                </button>
              </div>
            </div>

            {/* Modal body — scrollable on small screens */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '65vh' }}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {[
                  { label: 'Owner',      val: selectedFile.owner_email,     truncate: true },
                  { label: 'Recipient',  val: selectedFile.recipient_email,  truncate: true },
                  { label: 'Expires On', val: formatDateTime(selectedFile.expiration_datetime), color: isDark ? 'text-red-400' : 'text-red-500' },
                  { label: 'Created On', val: formatDateTime(selectedFile.created_at), color: isDark ? 'text-neutral-400' : 'text-slate-600' },
                  selectedFile.is_active
                    ? { label: 'Last Accessed', val: formatDateTime(selectedFile.accessed_at) || 'Not yet accessed' }
                    : { label: 'Revoked On',    val: formatDateTime(selectedFile.revoked_at) },
                  { label: 'File Size',  val: `${(selectedFile.file_size / 1024).toFixed(2)} KB` },
                ].map((item, i) => (
                  <div key={i}>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{item.label}</p>
                    <p className={`text-sm font-medium ${item.truncate ? 'truncate' : ''} ${item.color || (isDark ? 'text-white' : 'text-slate-800')}`}>{item.val}</p>
                  </div>
                ))}

                {/* Status */}
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Status</p>
                  <span className={`text-[10px] font-bold ${selectedFile.is_active ? 'text-emerald-500' : 'text-red-500'}`}>{selectedFile.status}</span>
                </div>

                {/* Permission */}
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Permission</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1.5
                    ${selectedFile.permission === 'view_only' ? (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                    : selectedFile.permission === 'view_download' ? (isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600')
                    : selectedFile.permission === 'one_time_download' ? (isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')
                    : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')}`}>
                    <i className={`fa-solid ${permissionIcon(selectedFile.permission)}`} />
                    {selectedFile.permission === 'view_only' ? 'View only'
                     : selectedFile.permission === 'view_download' ? 'View + Download'
                     : selectedFile.permission === 'one_time_download' ? 'One-time'
                     : 'Full access'}
                  </span>
                </div>

                {/* Downloads */}
                {(selectedFile.permission === 'view_download' || selectedFile.permission === 'one_time_download') && (
                  <div className="col-span-2">
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Downloads</p>
                    {selectedFile.permission === 'one_time_download' ? (
                      <p className={`text-sm font-medium ${selectedFile.download_count >= 1 ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`}>
                        {selectedFile.download_count >= 1 ? 'Downloaded (link used)' : 'Not yet downloaded'}
                      </p>
                    ) : selectedFile.download_limit !== null ? (
                      <div>
                        <p className={`text-sm font-medium mb-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedFile.download_count} / {selectedFile.download_limit} used</p>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${selectedFile.downloads_remaining === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((selectedFile.download_count / selectedFile.download_limit) * 100, 100)}%` }} />
                        </div>
                        <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                          {selectedFile.downloads_remaining === 0 ? 'Limit reached' : `${selectedFile.downloads_remaining} remaining`}
                        </p>
                      </div>
                    ) : (
                      <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{selectedFile.download_count} downloads · No limit</p>
                    )}
                  </div>
                )}

                {/* Views */}
                {selectedFile.permission !== 'one_time_download' && (
                  <div className="col-span-2">
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Views</p>
                    {selectedFile.view_limit !== null ? (
                      <div>
                        <p className={`text-sm font-medium mb-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedFile.view_count} / {selectedFile.view_limit} used</p>
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${selectedFile.views_remaining === 0 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min((selectedFile.view_count / selectedFile.view_limit) * 100, 100)}%` }} />
                        </div>
                        <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                          {selectedFile.views_remaining === 0 ? 'Limit reached' : `${selectedFile.views_remaining} remaining`}
                        </p>
                      </div>
                    ) : (
                      <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{selectedFile.view_count} views · No limit</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={`px-6 pb-6 pt-4 border-t ${isDark ? 'border-neutral-900' : 'border-slate-100'}`}>
              <button
                onClick={() => setViewModalOpen(false)}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
                  ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVOKE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className={`p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl border ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <div className="mb-4">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Revoke Access?</h3>
            <p className={`text-sm mb-8 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
              Are you sure you want to disable this link?{' '}
              <span className="font-semibold break-all">{selectedFile?.recipient_email}</span>{' '}
              will no longer be able to view this file.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => { setModalOpen(false); handleRevokeShare(selectedFile.id); }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Revoke Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllShares;