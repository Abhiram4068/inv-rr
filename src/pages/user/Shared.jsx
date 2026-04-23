import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getSharedFiles, revokeShare } from '../../services/shareService';
import { getFileVisuals } from '../../utils/fileUtils';
import { formatDateTime } from "../../utils/dateFormatter";

const Shared = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false); 
  const [selectedFile, setSelectedFile] = useState(null);   
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

  const [sharedFiles, setSharedFiles] = useState([]);  
  const [totalShares, setTotalShares] = useState(0);


const fetchSharedFiles = async () => {
  try {
    const response = await getSharedFiles(1, 5);
    setSharedFiles(response.data.data);
    setTotalShares(response.data.total_mails_send);
  } catch (error) {
    console.error('Error fetching shared files:', error);
  }
};
  useEffect(() => {
fetchSharedFiles();
}, []);

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
      
  return (
    <div className={`flex-1 min-w-0 transition-colors duration-300 overflow-y-auto no-scrollbar relative ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* --- TOAST NOTIFICATION --- */}
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
            <i className="fa-plus fa"></i> New Document
          </button>
        </div>

  {/* PAGE HEADER */}
<div className="flex justify-between items-end mb-6">
  <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Shared Files</h1>
  <div className="flex items-center gap-4">
    <div className={`${isDark ? 'text-neutral-500' : 'text-slate-500'} text-sm`}>
      {totalShares} items shared
    </div>
    <Link 
      to="/viewallshares"
      className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
    >
      <span>View All</span>
      <i className="fa-solid fa-chevron-right text-[8px]"></i>
    </Link>
  </div>
</div>

        {/* SECTION 1: ACTIVELY SHARED */}
        <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-neutral-900 bg-transparent' : 'bg-white border-slate-200 shadow-sm'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-widest border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]' : 'text-slate-400 border-slate-100 bg-slate-50'}`}>
                <th className="p-4 font-medium">File Name</th>
                <th className="p-4 font-medium">Shared With</th>
                <th className="p-4 font-medium">Send Date & Time</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-50'}`}>
              {sharedFiles.map((file) => {
                const visuals = getFileVisuals(file.content_type || file.file_name);
                const hasBeenAccessed = !!file.accessed_at;

                return (
                  <tr key={file.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <i className={`fa-solid ${visuals.icon}`} style={{ color: visuals.color }}></i>
<Link to={`/file/${file.file_id}`}>
  <span className={`
    block line-clamp-2 break-all max-w-[250px] leading-tight
    ${isDark ? 'text-white' : 'text-slate-700'}
  `}>
    {file.file_name}
  </span>
</Link>                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{file.recipient_email}</td>
                    <td className={`p-4 text-sm ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{formatDateTime(file.created_at)}</td>
                    <td className="p-4 text-sm flex items-center justify-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold  ${isDark ? ' text-emerald-500' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right">
                    <div className="flex justify-end gap-2">
                    {/* VIEW ACTION */}
                    <button 
                      onClick={() => { setSelectedFile(file); setViewModalOpen(true); }} 
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'hover:bg-neutral-800 text-blue-400' 
                          : 'hover:bg-slate-100 text-blue-600'
                      }`}
                      title="View Details"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    
                    {/* REVOKE ACTION OR PLACEHOLDER */}
                    {!hasBeenAccessed ? (
                      <button 
                        onClick={() => { setSelectedFile(file); setModalOpen(true); }} 
                        className={`p-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'hover:bg-neutral-800 text-red-400' 
                            : 'hover:bg-slate-100 text-red-500'
                        }`}
                        title="Revoke Access"
                      >
                        <i className="fa-solid fa-link-slash"></i>
                      </button>
                    ) : (
                      // placeholder keeps spacing
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
              {recentShares.map((share) => {
                const visuals = getFileVisuals(share.file);
                return (
                  <tr key={share.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 text-sm text-blue-500 font-medium truncate max-w-[200px]">{share.email}</td>
                    <td className={`p-4 text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-3">
                        <i className={`fa-solid ${visuals.icon}`} style={{ color: visuals.color }}></i>
                        <span className="truncate max-w-[200px]">{share.file}</span>
                      </div>
                    </td>
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
                );
              })}
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

      {/* DETAILS MODAL */}
      {viewModalOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
  <div className={`p-8 rounded-xl w-full max-w-lg shadow-2xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
    
    {/* MODAL HEADER */}
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

    {/* DETAILS GRID */}
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
          <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Created On</p>
          <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{formatDateTime(selectedFile.created_at)}</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Expires On</p>
          <p className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>{formatDateTime(selectedFile.expiration_datetime)}</p>
        </div>

        {selectedFile.is_active ? (
        <div>
          <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Last Accessed</p>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDateTime(selectedFile.accessed_at) || 'Not yet accessed'}</p>
        </div>
):(
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

    {/* CLOSE BUTTON */}
    <button 
      onClick={() => setViewModalOpen(false)}
      className={`w-full mt-10 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'}`}
    >
      Done
    </button>
  </div>
</div>
      )}

      {/* REVOKE MODAL */}
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

export default Shared;