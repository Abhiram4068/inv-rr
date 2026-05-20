import React, { useState, useEffect } from 'react';
import { getRecentFiles, getFiles } from '../../services/fileService'; // Assuming getFiles can be used for Added
import { Link } from 'react-router-dom';
import FileCard from '../../components/FileCard';

const RecentActivityMain = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Separate states for the two sections
  const [recentAccessed, setRecentAccessed] = useState([]);
  const [recentAdded, setRecentAdded] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Toast State ──────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type, animateOut: false });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

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

  // Formatters
  const sizeFormatter = (value) => {
    if (!value) return "-";
    if (typeof value === "string") return value;
    const mb = value / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(value / 1024).toFixed(0)} KB`;
  };

  const timeFormatter = (isoOrDate) => {
    if (!isoOrDate) return "-";
    const d = new Date(isoOrDate.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const iconClassForFile = (file) => {
    const name = file?.original_name || "";
    const ct = file?.content_type || "";
    const lower = name.toLowerCase();
    if (lower.endsWith(".pdf") || ct.includes("pdf")) return "fa-file-pdf";
    if (lower.endsWith(".doc") || lower.endsWith(".docx") || ct.includes("word")) return "fa-file-word";
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || ct.includes("excel")) return "fa-file-excel";
    if (/\.(png|jpe?g|gif|webp)$/.test(lower) || ct.includes("image")) return "fa-file-image";
    return "fa-file";
  };

  // 3. Parallel API Fetching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Call both APIs in parallel
        const [accessedRes, addedRes] = await Promise.all([
          getRecentFiles(), // Endpoint for recently accessed
          getFiles(1, "")   // Endpoint for recently added (Page 1, no search)
        ]);

        // Process Accessed Files (Based on your JSON structure)
        setRecentAccessed(accessedRes.data.files || []);

        // Process Added Files (Based on your paginated JSON structure)
        const addedData = addedRes.data.results || addedRes.data.items || addedRes.data;
        setRecentAdded(Array.isArray(addedData) ? addedData.slice(0, 6) : []);

      } catch (err) {
        setError("Failed to sync activity data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const isDark = theme === 'dark';

  // Helper to render file grid
  const renderFileGrid = (files) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {files.map((file) => (
        <FileCard
          key={file.id}
          id={file.id}
          title={file.original_name}
          display_name={file.display_name || file.original_name}
          size={sizeFormatter(file.file_size)}
          time={timeFormatter(file.created_at)}
          iconClass={iconClassForFile(file)}
          isLink={true}
          fileUrl={file.file_url}
          contentType={file.content_type}
        />
      ))}
    </div>
  );

  return (
    <div className={`flex-1 flex overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      {/* Professional Top-Sliding Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[10000] pointer-events-none transition-all duration-[350ms]
            ${toast.animateOut ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
            ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error'
                ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500')
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')}`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
            </div>
            <span className="flex-1 leading-normal tracking-wide text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className={`w-full max-w-[450px] border p-[10px_16px] rounded-xl flex items-center transition-colors shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input type="text" placeholder="Search Your Activity..." className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} />
          </div>
          <Link to="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-all hover:bg-blue-600 flex items-center justify-center gap-2 no-underline shadow-lg shadow-blue-500/10">
            <i className="fa fa-plus"></i> New Document
          </Link>
        </div>

        {/* SECTION 1: Recently Accessed */}
        <div className="mb-14">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[18px] md:text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recently Accessed Files</div>
            {!loading && <span className="text-[11px] font-bold opacity-50 uppercase">{recentAccessed.length} File(s)</span>}
          </div>
          <hr className={`border-0 border-t mb-6 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-300'}`} />
          

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <div key={i} className={`h-32 rounded-xl animate-pulse ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`} />)}
             </div>
          ) : recentAccessed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentAccessed.map((file) => (
                <FileCard
                  key={file.id}
                  id={file.id}
                  title={file.original_name}
                  display_name={file.display_name || file.original_name}
                  size={sizeFormatter(file.file_size)}
                  time={timeFormatter(file.created_at)}
                  iconClass={iconClassForFile(file)}
                  isLink={true}
                  fileUrl={file.file_url}
                  contentType={file.content_type}
                  isStarred={file.is_starred}
                  onToggleStar={(fileId, newState) => {
                    setRecentAccessed(prev => prev.map(f => f.id === fileId ? { ...f, is_starred: newState } : f));
                  }}
                  onDeleted={(fileId) => {
                    setRecentAccessed(prev => prev.filter(f => f.id !== fileId));
                    showToast("File moved to trash");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 opacity-50">No Recent Activity.</div>
          )}
        </div>

        {/* SECTION 2: Recently Added Files */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[18px] md:text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recently Added Files</div>
            {recentAdded.length > 0 && (
              <Link to="/files" className="text-sm text-blue-500 hover:underline">View All</Link>
            )}
          </div>
          <hr className={`border-0 border-t mb-6 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-300'}`} />

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <div key={i} className={`h-32 rounded-xl animate-pulse ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`} />)}
             </div>
          ) : recentAdded.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentAdded.map((file) => (
                <FileCard
                  key={file.id}
                  id={file.id}
                  title={file.original_name}
                  display_name={file.display_name || file.original_name}
                  size={sizeFormatter(file.file_size)}
                  time={timeFormatter(file.created_at)}
                  iconClass={iconClassForFile(file)}
                  isLink={true}
                  fileUrl={file.file_url}
                  contentType={file.content_type}
                  isStarred={file.is_starred}
                  onToggleStar={(fileId, newState) => {
                    setRecentAdded(prev => prev.map(f => f.id === fileId ? { ...f, is_starred: newState } : f));
                  }}
                  onDeleted={(fileId) => {
                    setRecentAdded(prev => prev.filter(f => f.id !== fileId));
                    showToast("File moved to trash");
                  }}
                />
              ))}
              <Link to="/upload-file" className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all min-h-[200px] hover:border-blue-500 no-underline ${isDark ? 'border-[#1a1a1a] text-[#444]' : 'border-slate-200 text-slate-400'}`}>
                <i className="fa-solid fa-plus mb-2"></i>
                <span className="text-xs">Upload More</span>
              </Link>
            </div>
          ) : (
            <div className="text-center py-10 opacity-50">No files added yet.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecentActivityMain;