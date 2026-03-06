import React from 'react';
import { Link } from "react-router-dom";

const StarredItems = () => {
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
              placeholder="Search Starred Files..." 
              className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" 
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button className="flex-1 md:flex-none bg-[#1a1a1a] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-opacity hover:opacity-80 flex items-center justify-center gap-2 border border-[#333]">
                <i className="fa-solid fa-filter text-xs"></i> Filter
             </button>
          </div>
        </div>

        {/* SECTION: Starred Documents */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[18px] md:text-[20px] font-semibold text-white flex items-center gap-2">
              <i className="fa-solid fa-star text-[#f59e0b] text-lg"></i> Starred Items
            </div>
            <div className="text-[#808080] text-xs">5 Items Total</div>
          </div>
          <hr className="border-0 border-t border-[#1a1a1a] mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            
            {/* Starred Item 1 */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer relative">
              <div className="absolute top-3 right-3 z-20">
                <i className="fa-solid fa-star text-[#f59e0b] hover:scale-125 transition-transform"></i>
              </div>
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-pdf text-[40px] text-[#ff4444] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Brand_Guidelines_2026.pdf</span>
                <div className="flex justify-between text-[12px] text-[#808080]">
                  <span>Starred Jan 12</span>
                  <span>2.4 MB</span>
                </div>
              </div>
            </div>

            {/* Starred Item 2 */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer relative">
              <div className="absolute top-3 right-3 z-20">
                <i className="fa-solid fa-star text-[#f59e0b]"></i>
              </div>
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-excel text-[40px] text-[#00c851] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Financial_Projections.xlsx</span>
                <div className="flex justify-between text-[12px] text-[#808080]">
                  <span>Starred Feb 05</span>
                  <span>842 KB</span>
                </div>
              </div>
            </div>

            {/* Starred Item 3 */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer relative">
              <div className="absolute top-3 right-3 z-20">
                <i className="fa-solid fa-star text-[#f59e0b]"></i>
              </div>
              <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                <i className="fa-solid fa-file-word text-[40px] text-[#3b82f6] absolute z-10 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="p-4">
                <span className="block text-sm font-medium mb-2 truncate text-white">Legal_Contract_Final.docx</span>
                <div className="flex justify-between text-[12px] text-[#808080]">
                  <span>Starred Feb 20</span>
                  <span>45 KB</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION: Starred Folders (Optional variant) */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[18px] md:text-[20px] font-semibold text-white">Pinned Folders</div>
          </div>
          <hr className="border-0 border-t border-[#1a1a1a] mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <Link to="/viewcollection">
  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:border-[#333] transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      <i className="fa-solid fa-folder text-2xl text-[#3b82f6]"></i>
      <div>
        <div className="text-sm font-medium text-white">Project Assets</div>
        <div className="text-[11px] text-[#808080]">24 item(s)</div>
      </div>
    </div>
    <i className="fa-solid fa-star text-[#f59e0b] text-xs"></i>
  </div>
</Link>
            <Link to="/viewcollection">
  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:border-[#333] transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      <i className="fa-solid fa-folder text-2xl text-[#3b82f6]"></i>
      <div>
        <div className="text-sm font-medium text-white">Client Documents</div>
        <div className="text-[11px] text-[#808080]">0 item(s)</div>
      </div>
    </div>
    <i className="fa-solid fa-star text-[#f59e0b] text-xs"></i>
  </div>
</Link>
       
          </div>
        </div>
      </main>

    
    </div>
  );
};

export default StarredItems;