import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getFileVisuals } from '../../utils/fileUtils';
import { getSharedFiles, revokeShare } from '../../services/shareService';
import { formatDateTime } from "../../utils/dateFormatter";

const ViewAllShares = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ visible: false, message: '' });

  // --- DATA STATE ---
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
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const showToast = (msg) => setToast({ visible: true, message: msg });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
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

  useEffect(() => {
    fetchSharedFiles();
  }, [currentPage]);

  const handleRevokeShare = async (fileId) => {
    try {
      await revokeShare(fileId);
      showToast("Link revoked successfully");
      fetchSharedFiles();
    } catch (error) {
      console.error('Error revoking share:', error);
      showToast("Failed to revoke share");
    }
  };

  const isDark = theme === 'dark';

  const filteredFiles = sharedFiles.filter(file => 
    file.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalShares / rowsPerPage) || 1;
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;

  return (
    <div className={`w-full transition-colors duration-300 min-h-screen relative ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* --- TOAST NOTIFICATION --- */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-800 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      <div className="p-6 lg:p-10 pb-60 max-w-6xl mx-auto">
        
        {/* BREADCRUMB */}
        <Link to='/shared' className={`flex items-center gap-2 transition-colors mb-6 text-sm group ${isDark ? 'text-neutral-500 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
          <span className="font-bold">Back to Shared</span>
        </Link>

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>All Shared Files</h1>
            <p className={`text-sm mt-1 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Managing shared files across your hivedrive</p>
          </div>
          
          <div className="relative group">
            <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs transition-colors ${isDark ? 'text-neutral-600 group-focus-within:text-blue-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}></i>
            <input 
              type="text" 
              placeholder="Search files or emails..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={`text-sm rounded-full py-2.5 pl-10 pr-6 w-full md:w-80 focus:outline-none transition-all border ${
                isDark 
                ? 'bg-neutral-900/50 border-neutral-800 text-white focus:border-neutral-600 focus:bg-neutral-900' 
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 shadow-sm'
              }`}
            />
          </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className={`border rounded-xl overflow-hidden shadow-2xl transition-colors ${isDark ? 'border-neutral-900' : 'border-slate-200'}`}>
          
          {/* TOP PAGINATION BAR */}
          <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Shared Files</h3>
              <p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                Showing {totalShares === 0 ? 0 : indexOfFirstRow + 1}-{indexOfFirstRow + filteredFiles.length} of {totalShares}
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
                <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]/70' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                  <th className="py-4 pl-6 font-bold">File Name</th>
                  <th className="py-4 font-bold">Recipient</th>
                  <th className="py-4 font-bold">Send Date & Time</th>
                  <th className="py-4 font-bold">Status</th>
                  <th className="py-4 pr-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
                {filteredFiles.map((file) => {
                  const visuals = getFileVisuals(file.file_name || file.content_type);
                  const hasBeenAccessed = !!file.accessed_at;
                  return (
                    <tr key={file.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                      <td className="py-5 pl-6 text-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors`}>
                            <i className={`fa-solid ${visuals.icon} text-base`} style={{ color: visuals.color }}></i>
                          </div>
                          <Link to={`/file/${file.file_id}`}>
                            <span className={`font-bold block line-clamp-2 break-all max-w-[250px] leading-tight ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.file_name}</span>
                          </Link>
                        </div>
                      </td>
                      <td className="py-5 text-sm">
                        <span className={`font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{file.recipient_email}</span>
                      </td>
                      <td className={`py-5 text-sm ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {formatDateTime(file.created_at)}
                      </td>
                      <td className="py-5 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isDark ? 'text-emerald-500' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {file.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-5 pr-6 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedFile(file); setViewModalOpen(true); }}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          {!hasBeenAccessed && !file.revoked_at && file.status !== 'Revoked' ? (
                            <button 
                              onClick={() => { setSelectedFile(file); setModalOpen(true); }}
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-red-400' : 'hover:bg-slate-100 text-red-500'}`}
                              title="Revoke Access"
                            >
                              <i className="fa-solid fa-link-slash"></i>
                            </button>
                          ) : (
                            <div className="p-2 w-[40px] h-[40px]"></div> 
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {viewModalOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className={`p-8 rounded-xl w-full max-w-lg shadow-2xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>
                  Share Details
                </p>
                <div className="flex items-center gap-3">
                  <i 
                    className={`fa-solid ${getFileVisuals(selectedFile.content_type || selectedFile.file_name).icon} text-xl`} 
                    style={{ color: getFileVisuals(selectedFile.content_type || selectedFile.file_name).color }}
                  ></i>
                  <h3 className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {selectedFile.file_name}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)} 
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-100 text-slate-400'} hover:text-red-500`}
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Owner</p>
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedFile.owner_email}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Recipient</p>
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedFile.recipient_email}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Expires On</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>{formatDateTime(selectedFile.expiration_datetime)}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Created On</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{formatDateTime(selectedFile.created_at)}</p>
                </div>
                
                {selectedFile.is_active ? (
                  <div>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Last Accessed</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDateTime(selectedFile.accessed_at) || 'Not yet accessed'}</p>
                  </div>
                ) : (
                  <div>
                    <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Revoked On</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDateTime(selectedFile.revoked_at)}</p>
                  </div>
                )}
                
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>File Size</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{(selectedFile.file_size / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Status</p>
                  <span className={`text-[10px] px-2 py-0 rounded font-bold inline-block ${selectedFile.is_active ? ' text-emerald-500 ' : ' text-red-500 '}`}>
                    {selectedFile.status}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setViewModalOpen(false)}
              className={`w-full mt-10 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'}`}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --- REVOKE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className={`p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <div className="mb-4">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl"></i>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Revoke Access?</h3>
            <p className={`text-sm mb-8 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
              Are you sure you want to disable this link? {selectedFile?.recipient_email} will no longer be able to view this file.
            </p>
            <div className="flex gap-3">
              <button 
                className={`flex-1 py-3 rounded-xl text-sm font-bold ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} 
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors" 
                onClick={() => { setModalOpen(false); handleRevokeShare(selectedFile.id); }}
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