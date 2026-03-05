import React from 'react';

// You mentioned you have a FileCard component, 
// Ensure it receives these props or map them accordingly.
const RecentActivityMain = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] custom-scrollbar">
        
        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="w-full max-w-[450px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
            <i className="fa fa-search text-[#808080]"></i>
            <input 
              type="text" 
              placeholder="Search Your Files..." 
              className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" 
            />
          </div>
          <button className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
            <i className="fa fa-plus"></i> New Document
          </button>
        </div>

        {/* SECTION: Recently Added */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[18px] md:text-[20px] font-semibold text-white">Recently Added</div>
            <div className="text-[#3b82f6] text-xs cursor-pointer hover:underline">View All</div>
          </div>
          <hr className="border-0 border-t border-[#1a1a1a] mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Replace these divs with your <FileCard /> component */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer">
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-image text-[40px] text-[#808080] absolute z-10 group-hover:scale-110 transition-transform"></i>
                <img src="https://via.placeholder.com/300x140/222/444" alt="preview" className="w-full h-full object-cover opacity-40" />
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Hero_Section_v1.png</span>
                <div className="flex justify-between text-[12px] text-[#808080]">
                  <span>Uploaded 10m ago</span>
                  <span className="text-[#00c851]">New</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer">
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-lines text-[40px] text-[#808080] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Meeting_Notes_Feb28.txt</span>
                <div className="flex justify-between text-[12px] text-[#808080]">
                  <span>Uploaded 1h ago</span>
                  <span>12 KB</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer">
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-video text-[40px] text-[#808080] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Project_Demo.mp4</span>
                <div className="flex justify-between text-[12px] text-[#808080]">
                  <span>Uploaded 3h ago</span>
                  <span>45.2 MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Recently Shared With You */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[18px] md:text-[20px] font-semibold text-white">Added Last Week</div>
            <div className="text-[#3b82f6] text-xs cursor-pointer hover:underline">View All</div>
          </div>
          <hr className="border-0 border-t border-[#1a1a1a] mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer">
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-pdf text-[40px] text-[#808080] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Final_Budget_Draft.pdf</span>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[8px] font-bold">AB</div>
                  <span className="text-[11px] text-[#808080]">From abhiram@innovature...</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#808080]">
                  <span>Shared 4h ago</span>
                  <span className="text-[#3b82f6]">Can Edit</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer">
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-excel text-[40px] text-[#808080] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">User_Analytics_Q1.xlsx</span>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] flex items-center justify-center text-[8px] font-bold">D</div>
                  <span className="text-[11px] text-[#808080]">From demo@innovature...</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#808080]">
                  <span>Shared Yesterday</span>
                  <span className="text-[#808080]">View Only</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-[#1a1a1a] rounded-lg h-[218px] flex flex-col items-center justify-center text-[#808080] hover:border-[#333] transition-colors cursor-default">
              <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2 opacity-50"></i>
              <span className="text-xs">No more recent shares</span>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT INSIGHTS SIDEBAR */}
      {/* <aside className="hidden lg:block w-[320px] p-[24px_20px] border-l border-[#1a1a1a] bg-black">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-4">
          <div className="text-base font-semibold mb-3 text-white">Activity Summary</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#808080]">Added Today</span>
              <span className="text-xs font-semibold text-white">12 files</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#808080]">Shares Received</span>
              <span className="text-xs font-semibold text-white">4 folders</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#808080]">Recent Downloads</span>
              <span className="text-xs font-semibold text-white">8 items</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
          <div className="text-[13px] font-semibold mb-2 text-white">Sync Status</div>
          <div className="flex items-center gap-2 text-[#00c851] text-[12px] mb-3">
            <i className="fa-solid fa-circle-check"></i>
            <span>All files up to date</span>
          </div>
          <p className="text-[11px] text-[#808080] leading-relaxed">
            Your cloud storage was last synchronized at 7:34 PM today.
          </p>
        </div>
      </aside> */}
    </div>
  );
};

export default RecentActivityMain;