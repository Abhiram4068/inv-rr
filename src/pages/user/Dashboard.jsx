import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";

const Dashboard = () => {
  // --- THEME STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // --- UPLOAD FUNCTIONALITY STATE ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Theme Sync Logic
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

  // Toast Timer Logic
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type: type });
  };

  const isDark = theme === 'dark';

  // --- FILE HANDLING LOGIC ---
  const handleZoneClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleFiles = (files) => {
    const filteredFiles = Array.from(files).filter(file => {
      const isFolder = !file.type && file.size % 4096 === 0;
      if (isFolder) {
        showToast("Ignored folders!", 'error');
        return false;
      }
      return true;
    });

    const newFiles = filteredFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      raw: file,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      showToast('Please select files first.', 'error');
      return;
    }
    // Placeholder for backend call
    showToast(`${selectedFiles.length} file(s) ready for upload`, 'success');
  };

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-circle-check text-emerald-500'} text-lg`}></i>
            {toast.message}
          </div>
        </div>
      )}

      {/* 1. TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className={`w-full max-w-[500px] border p-[12px_20px] rounded-2xl flex items-center shadow-sm transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <i className={`fa fa-search ${isDark ? 'text-[#444]' : 'text-slate-400'}`}></i>
          <input type="text" placeholder="Search files, logs, or schedules..." className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className={`flex-1 md:flex-none border p-[10px_20px] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <i className="fa-solid fa-gear"></i> Settings
          </button>
          <Link to="/upload-file" className="flex-1 md:flex-none bg-blue-600 text-white p-[10px_24px] rounded-xl font-bold text-xs transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
            <i className="fa fa-plus text-[10px]"></i> New Document
          </Link>
        </div>
      </div>

      {/* 2. KPI & UPLOAD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: 4 Stat Tiles */}
        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Total Sent" value="8,492" sub="Files delivered" isDark={isDark} />
          <StatCard label="Shared Contacts" value="142" sub="Active recipients" isDark={isDark} />
          
          <div className={`border p-5 rounded-2xl flex flex-col justify-center transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="text-[10px] text-blue-500 uppercase tracking-widest font-black mb-1">Next Report In</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>5 <span className={`text-sm ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>days</span></div>
            <div className={`text-[10px] mt-1 font-bold uppercase ${isDark ? 'text-[#444]' : 'text-slate-300'}`}>Weekly Cycle</div>
          </div>

          <div className={`border p-5 rounded-2xl transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Storage used</span>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>14.08 <span className={`text-xs ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>GB</span></div>
            <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-100'}`}>
              <div className="bg-blue-500 h-full w-[93%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Functional Drag & Drop */}
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`lg:col-span-2 border-2 border-dashed rounded-3xl p-6 flex flex-col transition-all min-h-[280px] ${
            isDragging ? 'border-blue-500 bg-blue-500/5' : 
            isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {selectedFiles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center cursor-pointer" onClick={handleZoneClick}>
               <div className={`w-12 h-12 rounded-2xl mb-3 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-blue-50'}`}>
                <i className="fa-solid fa-cloud-arrow-up text-xl text-blue-500"></i>
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Click or drag file to upload</h3>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Max file size 50MB</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{selectedFiles.length} Files Selected</span>
                <button onClick={() => setSelectedFiles([])} className="text-[10px] font-bold text-red-500 uppercase">Clear All</button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-2 no-scrollbar">
                {selectedFiles.map(file => (
                  <div key={file.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-black border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-file text-blue-500 text-xs"></i>
                      <span className="text-xs font-bold truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold opacity-50">{file.size}MB</span>
                      <i onClick={() => removeFile(file.id)} className="fa-solid fa-xmark text-red-500 cursor-pointer p-1"></i>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleUpload}
                className="mt-auto w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all"
              >
                Confirm & Upload
              </button>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple className="hidden" />
        </div>
      </div>

      {/* 4. ACTIVITY & LINKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`border rounded-xl p-6 transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`font-bold text-sm uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Activities</div>
            <div className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">View all logs</div>
          </div>
          <div className="space-y-3">
            <ActivityItem icon="fa-folder" title="Q1_Financial_Review" sub="Folder • Shared with 8 people" time="2h ago" isDark={isDark} />
            <ActivityItem icon="fa-file-pdf" title="Project_Brief_V2" sub="PDF Document • Modified 5h ago" time="5h ago" isDark={isDark} />
            <ActivityItem icon="fa-file-zipper" title="Assets_Export" sub="Archive • Downloaded 12 times" time="Yesterday" isDark={isDark} />
          </div>
        </div>

        <div className={`border rounded-xl p-6 transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`font-bold text-sm uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Shared Links</div>
            <div className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Manage links</div>
          </div>
          <div className="space-y-3">
            <SharedLinkItem title="hivedrive.io/s/bk82k9" expiry="Expires in 2 days" clicks="124" active={true} isDark={isDark} />
            <SharedLinkItem title="hivedrive.io/s/pw15x2" expiry="Expired" clicks="45" active={false} isDark={isDark} />
            <SharedLinkItem title="hivedrive.io/s/ml09z4" expiry="Expires in 5 days" clicks="12" active={true} isDark={isDark} />
          </div>
        </div>
      </div>
    </main>
  );
};

/* --- MINI COMPONENTS --- */
const StatCard = ({ label, value, sub, isDark }) => (
  <div className={`border p-5 rounded-2xl transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#222]' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'}`}>
    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
    <div className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{label}</div>
    <div className={`text-[10px] mt-1 font-medium ${isDark ? 'text-[#333]' : 'text-slate-300'}`}>{sub}</div>
  </div>
);

const ActivityItem = ({ icon, title, sub, time, isDark }) => (
  <div className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#0f0f0f]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200'}`}>
    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-4 transition-all ${isDark ? 'bg-black border-[#1a1a1a] group-hover:border-blue-500/50' : 'bg-white border-slate-200 group-hover:border-blue-400'}`}>
      <i className={`fa-solid ${icon} text-[16px] ${isDark ? 'text-[#333]' : 'text-blue-500'} group-hover:text-blue-500`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold truncate ${isDark ? 'text-[#ccc] group-hover:text-white' : 'text-slate-700 group-hover:text-blue-600'}`}>{title}</p>
      <p className={`text-[11px] font-medium ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{sub}</p>
    </div>
    <div className={`text-[10px] font-bold uppercase ml-2 ${isDark ? 'text-[#333]' : 'text-slate-300'}`}>{time}</div>
  </div>
);

const SharedLinkItem = ({ title, expiry, clicks, active, isDark }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#0f0f0f]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200'}`}>
    <div className="flex items-center min-w-0">
      <div className={`w-2 h-2 rounded-full mr-4 ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : (isDark ? 'bg-[#222]' : 'bg-slate-300')}`}></div>
      <div className="min-w-0">
        <p className={`text-sm font-bold truncate ${isDark ? 'text-[#ccc]' : 'text-slate-700'}`}>{title}</p>
        <p className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{clicks} views • {expiry}</p>
      </div>
    </div>
    <i className={`fa-solid fa-arrow-up-right-from-square text-[10px] ${isDark ? 'text-[#222]' : 'text-slate-300'}`}></i>
  </div>
);

export default Dashboard;