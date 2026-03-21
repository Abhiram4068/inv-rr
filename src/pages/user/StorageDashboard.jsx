import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const StorageDashboard = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const allFiles = [
    { name: "Raw_Footage_4K.mp4", size: "2.4 GB", type: "Videos", icon: "fa-video" },
    { name: "Backup_Database_March.sql", size: "1.8 GB", type: "Others", icon: "fa-database" },
    { name: "Summer_Vacation_01.jpg", size: "12 MB", type: "Images", icon: "fa-image" },
    { name: "Product_Photos_HighRes.zip", size: "950 MB", type: "Others", icon: "fa-file-zipper" },
    { name: "Marketing_Video_Final.mp4", size: "1.1 GB", type: "Videos", icon: "fa-video" },
    { name: "Annual_Report_2025.pdf", size: "420 MB", type: "Documents", icon: "fa-file-pdf" },
    { name: "Old_Project_Assets.iso", size: "380 MB", type: "Others", icon: "fa-compact-disc" },
    { name: "Hero_Banner_v2.png", size: "45 MB", type: "Images", icon: "fa-image" },
    { name: "Legal_Contract_Final.docx", size: "2 MB", type: "Documents", icon: "fa-file-word" },
  ];

  const storageByFormat = [
    { format: "All", size: "14.08 GB", color: isDark ? "#ffffff" : "#1e293b", icon: "fa-layer-group" },
    { format: "Videos", size: "8.4 GB", color: "#3b82f6", icon: "fa-video" },
    { format: "Images", size: "3.2 GB", color: "#10b981", icon: "fa-image" },
    { format: "Documents", size: "1.5 GB", color: "#f59e0b", icon: "fa-file-lines" },
    { format: "Others", size: "0.98 GB", color: "#8b5cf6", icon: "fa-ellipsis-h" },
  ];

  const filteredFiles = selectedCategory === "All" 
    ? allFiles.slice(0, 6) 
    : allFiles.filter(file => file.type === selectedCategory);

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar transition-colors duration-300 min-h-screen ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => window.history.back()} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-[#111] text-[#808080] hover:text-white' : 'hover:bg-white text-slate-400 hover:text-slate-800 shadow-sm'}`}>
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </button>
        <nav className="flex items-center gap-2 text-sm text-[#808080]">
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Home</span>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Storage Overview</span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className={`lg:col-span-2 border p-8 rounded-2xl relative ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className={`text-[10px] uppercase tracking-widest mb-1 font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Workspace Capacity</div>
              <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>14.08 GB <span className={`text-lg font-normal ${isDark ? 'text-[#333]' : 'text-slate-300'}`}>/ 50 GB</span></div>
            </div>
            <div className="text-xs px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full font-bold uppercase">28% Used</div>
          </div>
          
          <div className={`w-full h-2.5 rounded-full overflow-hidden flex mb-8 ${isDark ? 'bg-[#111]' : 'bg-slate-100'}`}>
            <div style={{ width: '45%' }} className="h-full bg-[#3b82f6]"></div>
            <div style={{ width: '20%' }} className="h-full bg-[#10b981]"></div>
            <div style={{ width: '15%' }} className="h-full bg-[#f59e0b]"></div>
            <div style={{ width: '10%' }} className="h-full bg-[#8b5cf6]"></div>
          </div>

          <div className="flex flex-wrap gap-6">
            {storageByFormat.filter(f => f.format !== "All").map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className={`text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>{item.format}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`border p-8 rounded-2xl flex flex-col justify-center text-center group transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#3b82f6]/30' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'}`}>
          <div className="w-14 h-14 rounded-2xl bg-[#3b82f6]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <i className="fa-solid fa-bolt text-[#3b82f6] text-xl"></i>
          </div>
          <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>35.92 GB</div>
          <div className={`text-[10px] uppercase tracking-widest mb-6 font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Free Space Available</div>
          <Link to='/storage/storage-cleanup' className={`w-full py-3 rounded-xl text-xs font-bold transition-colors uppercase tracking-widest ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>Manage Storage</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
         
        {/* LEFT SIDE: Categories */}
        <div className="lg:col-span-4 space-y-3">
          <div className="px-2 mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Categories</h3>
          </div>
          {storageByFormat.map((item, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedCategory(item.format)}
              className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 group border ${
                selectedCategory === item.format 
                ? (isDark ? 'bg-[#111] border-[#333]' : 'bg-white border-blue-200 shadow-sm') 
                : (isDark ? 'hover:bg-[#0a0a0a] border-transparent hover:border-[#1a1a1a]' : 'hover:bg-white border-transparent hover:border-slate-200')
              }`}
            >
              {selectedCategory === item.format && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ backgroundColor: item.color }}></div>
              )}
              
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                selectedCategory === item.format 
                ? (isDark ? 'bg-black border border-[#222]' : 'bg-slate-50 border border-slate-100') 
                : (isDark ? 'bg-[#111]' : 'bg-slate-100')
              }`}>
                <i className={`fa-solid ${item.icon} text-sm`} style={{ color: item.color }}></i>
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-bold ${selectedCategory === item.format ? (isDark ? 'text-white' : 'text-blue-600') : (isDark ? 'text-[#808080]' : 'text-slate-600')}`}>{item.format}</p>
                <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#555]' : 'text-slate-400'}`}>{item.size}</p>
              </div>

              {selectedCategory === item.format && (
                <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: Files List */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                {selectedCategory} Files
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isDark ? 'bg-[#111] text-[#555]' : 'bg-white text-slate-400 border border-slate-200'}`}>{filteredFiles.length} Items</span>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-[#3b82f6] hover:text-blue-400 transition-colors">
              Sort by Size <i className="fa-solid fa-arrow-down-wide-short ml-1"></i>
            </button>
          </div>

          <div className="space-y-2">
            {filteredFiles.map((file, i) => (
              <ActivityItem key={i} icon={file.icon} title={file.name} type={file.type} size={file.size} isDark={isDark} />
            ))}
            
            {filteredFiles.length === 0 && (
              <div className={`flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                <i className={`fa-solid fa-folder-open text-4xl mb-3 ${isDark ? 'text-[#1a1a1a]' : 'text-slate-100'}`}></i>
                <p className={`text-sm font-medium ${isDark ? 'text-[#333]' : 'text-slate-400'}`}>No files found here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

const ActivityItem = ({ icon, title, type, size, isDark }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111] hover:border-[#222]' : 'bg-white border-slate-200 hover:shadow-sm hover:border-blue-200'}`}>
    <div className="flex items-center overflow-hidden flex-1">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isDark ? 'bg-[#111]' : 'bg-slate-50'}`}>
          <i className={`fa-solid ${icon} text-base transition-colors ${isDark ? 'text-[#555] group-hover:text-white' : 'text-slate-400 group-hover:text-blue-500'}`}></i>
      </div>
      <div className="overflow-hidden">
        <p className={`m-0 text-sm font-bold truncate ${isDark ? 'text-white/90' : 'text-slate-700'}`}>{title}</p>
        <span className={`text-[10px] font-bold uppercase tracking-tight ${isDark ? 'text-[#555]' : 'text-slate-400'}`}>{type}</span>
      </div>
    </div>
    
    <div className="flex items-center gap-6 ml-4">
      <div className="text-right hidden sm:block">
        <span className={`text-sm font-bold ${isDark ? 'text-white/80' : 'text-slate-600'}`}>{size}</span>
      </div>
      <div className="flex items-center gap-2">
         <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[#808080] hover:text-red-500">
           <i className="fa-solid fa-trash-can text-xs"></i>
         </button>
         <i className={`fa-solid fa-ellipsis-vertical text-xs ${isDark ? 'text-[#222]' : 'text-slate-200'}`}></i>
      </div>
    </div>
  </div>
);

export default StorageDashboard;