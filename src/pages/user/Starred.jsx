import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const StarredItems = () => {
  // --- STATE FOR STARRED ITEMS ---
  const [items, setItems] = useState([
    { id: 1, name: "Brand_Guidelines_2026.pdf", type: "pdf", date: "Jan 12", size: "2.4 MB", icon: "fa-file-pdf", color: "#ff4444" },
    { id: 2, name: "Financial_Projections.xlsx", type: "excel", date: "Feb 05", size: "842 KB", icon: "fa-file-excel", color: "#00c851" },
    { id: 3, name: "Legal_Contract_Final.docx", type: "word", date: "Feb 20", size: "45 KB", icon: "fa-file-word", color: "#3b82f6" },
  ]);

  const [folders, setFolders] = useState([
    { id: 1, name: "Project Assets", count: 24 },
    { id: 2, name: "Client Documents", count: 0 }
  ]);

  // --- TOAST STATE ---
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // --- HANDLERS ---
  const handleUnstarItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    showToast("Removed from Starred");
  };

  const handleUnstarFolder = (e, id) => {
    e.preventDefault(); // Prevent Link navigation
    setFolders(folders.filter(folder => folder.id !== id));
    showToast("Folder unpinned successfully");
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-black">
      
      {/* --- RECTANGLE PILL TOAST --- */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white text-black px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

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
            <div className="text-[#808080] text-xs">{items.length} Items Total</div>
          </div>
          <hr className="border-0 border-t border-[#1a1a1a] mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 group cursor-pointer relative">
                <div 
                  className="absolute top-3 right-3 z-20 cursor-pointer"
                  onClick={() => handleUnstarItem(item.id)}
                >
                  <i className="fa-solid fa-star text-[#f59e0b] hover:scale-125 transition-transform"></i>
                </div>
                <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
                  <i className={`fa-solid ${item.icon} text-[40px] absolute z-10 group-hover:scale-110 transition-transform`} style={{ color: item.color }}></i>
                </div>
                <div className="p-4">
                  <span className="block text-sm font-medium mb-2 truncate text-white">{item.name}</span>
                  <div className="flex justify-between text-[12px] text-[#808080]">
                    <span>Starred {item.date}</span>
                    <span>{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: Pinned Folders */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[18px] md:text-[20px] font-semibold text-white">Pinned Folders</div>
          </div>
          <hr className="border-0 border-t border-[#1a1a1a] mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {folders.map((folder) => (
              <Link key={folder.id} to="/viewcollection">
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between hover:border-[#333] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-folder text-2xl text-[#3b82f6]"></i>
                    <div>
                      <div className="text-sm font-medium text-white">{folder.name}</div>
                      <div className="text-[11px] text-[#808080]">{folder.count} item(s)</div>
                    </div>
                  </div>
                  <i 
                    className="fa-solid fa-star text-[#f59e0b] text-xs cursor-pointer p-2 hover:scale-125 transition-transform"
                    onClick={(e) => handleUnstarFolder(e, folder.id)}
                  ></i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StarredItems;