import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { dashboardService } from '../../services/dashboardService';

const Dashboard = () => {
  // --- THEME STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // --- UPLOAD FUNCTIONALITY STATE ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        showToast("Failed to fetch dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link to="/schedules" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-regular fa-calendar-days text-blue-500"></i> Schedules
          </Link>
          <Link to="/reports" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-solid fa-chart-line text-emerald-500"></i> View Reports
          </Link>
          <Link to="/threads" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
          <i className="fa-solid fa-code-branch text-red-500"></i> Threads
          </Link>
          <Link to="/starred" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-solid fa-star text-yellow-300"></i> Starred
          </Link>
          <Link to="/reports?tab=downloads" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-solid fa-download text-purple-500"></i> Report Downloads
          </Link>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/upload-file" className="flex-1 md:flex-none bg-blue-600 text-white p-[10px_24px] rounded-xl font-bold text-xs transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
            <i className="fa fa-plus text-[10px]"></i> New Document
          </Link>
        </div>
      </div>

      {/* 2. TOP SECTION: GRAPH & UPLOAD AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Storage Visualizer */}
        <div className={`lg:col-span-1 border rounded-3xl p-6 flex flex-col items-center justify-center transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="w-full flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Storage Overview</span>
            <button className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1">
              Manage <i className="fa-solid fa-chevron-right text-[8px]"></i>
            </button>
          </div>
          
          <div className="relative flex items-center justify-center py-2">
             <svg className="w-44 h-44 transform -rotate-90">
                <circle cx="88" cy="88" r="75" stroke="currentColor" strokeWidth="12" fill="transparent" className={`${isDark ? 'text-[#111]' : 'text-slate-100'}`} />
                <circle cx="88" cy="88" r="75" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="471" strokeDashoffset={471 - (471 * ((dashboardData?.storage_summary?.percentage_used || 0) / 100))} strokeLinecap="round" className="text-blue-600 transition-all duration-1000" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{dashboardData?.storage_summary?.percentage_used || 0}%</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Used</span>
             </div>
          </div>

          <div className="w-full flex flex-col gap-4 mt-4 px-2">
            <div className="flex justify-between items-end">
              <div>
                <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{dashboardData?.storage_summary?.storage_used_human || '0 B'}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total space used</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-500">{dashboardData?.storage_summary?.free_storage_human || '0 B'}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Remaining</div>
              </div>
            </div>
            
            <button className={`w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-[#111] text-white border border-[#222] hover:bg-[#1a1a1a]' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-md'}`}>
              Manage Storage
            </button>
          </div>
        </div>

        {/* Functional Drag & Drop Area */}
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`lg:col-span-2 border-2 border-dashed rounded-3xl p-6 flex flex-col transition-all min-h-[340px] ${
            isDragging ? 'border-blue-500 bg-blue-500/5' : 
            isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {selectedFiles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center cursor-pointer" onClick={handleZoneClick}>
               <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-blue-50'}`}>
                <i className="fa-solid fa-cloud-arrow-up text-2xl text-blue-500"></i>
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Click or drag file to upload</h3>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Maximum single file size: 50MB</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{selectedFiles.length} Files Selected</span>
                <button onClick={() => setSelectedFiles([])} className="text-[10px] font-bold text-red-500 uppercase">Clear All</button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2 no-scrollbar">
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
                className="mt-auto w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Confirm & Start Upload
              </button>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple className="hidden" />
        </div>
      </div>

      {/* 3. KPI ROW (Moved down as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Files in System" value={dashboardData?.kpi?.total_files || 0} sub="Total Files in System" isDark={isDark} />
          <StatCard label="Total Sent" value={dashboardData?.kpi?.total_sent || 0} sub="Files delivered" isDark={isDark} />
          <StatCard label="Shared Contacts" value={dashboardData?.kpi?.shared_contacts || 0} sub="Active recipients" isDark={isDark} />
          <div className={`border p-5 rounded-2xl flex flex-col justify-center transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="text-[10px] text-blue-500 uppercase tracking-widest font-black mb-1">Next Report In</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{dashboardData?.kpi?.next_report_days !== null && dashboardData?.kpi?.next_report_days !== undefined ? dashboardData.kpi.next_report_days : '-'} <span className={`text-sm ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>days</span></div>
            <div className={`text-[10px] mt-1 font-bold uppercase ${isDark ? 'text-[#444]' : 'text-slate-300'}`}>Weekly Cycle</div>
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
            {dashboardData?.recent_activities?.map((act, index) => (
                <ActivityItem key={index} icon={act.icon} title={act.title} sub={act.sub} time={act.time} isDark={isDark} />
            ))}
            {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                <div className={`text-sm font-medium ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>No recent activities</div>
            )}
          </div>
        </div>

        <div className={`border rounded-xl p-6 transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`font-bold text-sm uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Shared Links</div>
            <div className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Manage links</div>
          </div>
          <div className="space-y-3">
            {dashboardData?.active_links?.map((link, index) => (
                <SharedLinkItem key={index} title={link.title} expiry={link.expiry} clicks={link.clicks} active={link.active} isDark={isDark} />
            ))}
            {(!dashboardData?.active_links || dashboardData.active_links.length === 0) && (
                <div className={`text-sm font-medium ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>No active links</div>
            )}
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