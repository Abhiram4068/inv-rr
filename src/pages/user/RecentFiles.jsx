import React, { useState, useEffect } from 'react';

const RecentActivityMain = () => {
  // 1. Theme State Sync Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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

  return (
    <div className={`flex-1 flex overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] custom-scrollbar">
        
        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className={`w-full max-w-[450px] border p-[10px_16px] rounded-xl flex items-center transition-colors shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search Your Files..." 
              className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} 
            />
          </div>
          <button className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-all hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10">
            <i className="fa fa-plus"></i> New Document
          </button>
        </div>

        {/* SECTION: Recently Added */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[18px] md:text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recently Added</div>
            <div className="text-[#3b82f6] text-xs cursor-pointer hover:underline font-bold">View All</div>
          </div>
          <hr className={`border-0 border-t mb-6 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-300'}`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* File Card 1 */}
            <div className={`border rounded-lg overflow-hidden transition-all hover:-translate-y-1 group cursor-pointer shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400'}`}>
              <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                <i className={`fa-solid fa-file-image text-[40px] absolute z-10 group-hover:scale-110 transition-transform ${isDark ? 'text-[#808080]' : 'text-slate-300'}`}></i>
                <img src="https://via.placeholder.com/300x140/222/444" alt="preview" className="w-full h-full object-cover opacity-40" />
              </div>
              <div className="p-4">
                <span className={`block text-sm font-medium mb-2 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>Hero_Section_v1.png</span>
                <div className="flex justify-between text-[12px]">
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>Uploaded 10m ago</span>
                  <span className="text-[#00c851] font-bold">New</span>
                </div>
              </div>
            </div>

            {/* File Card 2 */}
            <div className={`border rounded-lg overflow-hidden transition-all hover:-translate-y-1 group cursor-pointer shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400'}`}>
              <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                <i className={`fa-solid fa-file-lines text-[40px] absolute z-10 group-hover:scale-110 transition-transform ${isDark ? 'text-[#808080]' : 'text-slate-300'}`}></i>
              </div>
              <div className="p-4">
                <span className={`block text-sm font-medium mb-2 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>Meeting_Notes_Feb28.txt</span>
                <div className="flex justify-between text-[12px]">
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>Uploaded 1h ago</span>
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>12 KB</span>
                </div>
              </div>
            </div>

            {/* File Card 3 */}
            <div className={`border rounded-lg overflow-hidden transition-all hover:-translate-y-1 group cursor-pointer shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400'}`}>
              <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                <i className={`fa-solid fa-file-video text-[40px] absolute z-10 group-hover:scale-110 transition-transform ${isDark ? 'text-[#808080]' : 'text-slate-300'}`}></i>
              </div>
              <div className="p-4">
                <span className={`block text-sm font-medium mb-2 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>Project_Demo.mp4</span>
                <div className="flex justify-between text-[12px]">
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>Uploaded 3h ago</span>
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>45.2 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Recently Shared With You */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[18px] md:text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Added Last Week</div>
            <div className="text-[#3b82f6] text-xs cursor-pointer hover:underline font-bold">View All</div>
          </div>
          <hr className={`border-0 border-t mb-6 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-300'}`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className={`border rounded-lg overflow-hidden transition-all hover:-translate-y-1 group cursor-pointer shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400'}`}>
              <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                <i className={`fa-solid fa-file-pdf text-[40px] absolute z-10 group-hover:scale-110 transition-transform ${isDark ? 'text-[#808080]' : 'text-slate-300'}`}></i>
              </div>
              <div className="p-4">
                <span className={`block text-sm font-medium mb-2 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>Final_Budget_Draft.pdf</span>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-slate-200 text-slate-600'}`}>AB</div>
                  <span className={`text-[11px] ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>From abhiram@innovature...</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>Shared 4h ago</span>
                  <span className="text-[#3b82f6] font-bold">Can Edit</span>
                </div>
              </div>
            </div>

            <div className={`border rounded-lg overflow-hidden transition-all hover:-translate-y-1 group cursor-pointer shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400'}`}>
              <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                <i className={`fa-solid fa-file-excel text-[40px] absolute z-10 group-hover:scale-110 transition-transform ${isDark ? 'text-[#808080]' : 'text-slate-300'}`}></i>
              </div>
              <div className="p-4">
                <span className={`block text-sm font-medium mb-2 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>User_Analytics_Q1.xlsx</span>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold bg-[#3b82f6] text-white`}>D</div>
                  <span className={`text-[11px] ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>From demo@innovature...</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-400'}>Shared Yesterday</span>
                  <span className={isDark ? 'text-[#808080]' : 'text-slate-500'}>View Only</span>
                </div>
              </div>
            </div>

            <div className={`border-2 border-dashed rounded-lg h-[218px] flex flex-col items-center justify-center transition-colors cursor-default ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:border-[#333]' : 'border-slate-300 text-slate-400 hover:border-slate-400'}`}>
              <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2 opacity-50"></i>
              <span className="text-xs">No more recent shares</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecentActivityMain;