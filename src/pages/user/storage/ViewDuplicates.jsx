import React, { useState } from 'react';

const DuplicateManager = () => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock Data focused on duplicate files
  const duplicateFiles = [
    { id: 1, name: "Logo_Final_v2_COPY.png", type: "image", size: "12 MB", category: "Duplicate", date: "Sep 05, 2023", color: "#10b981", icon: "fa-file-image", original: "Logo_Final_v2.png" },
    { id: 2, name: "Presentation_Backup_2.pptx", type: "document", size: "45 MB", category: "Duplicate", date: "Nov 12, 2023", color: "#f59e0b", icon: "fa-file-powerpoint", original: "Presentation.pptx" },
    { id: 3, name: "Hero_Video_Draft_1.mp4", type: "video", size: "1.2 GB", category: "Duplicate", date: "Jan 10, 2024", color: "#3b82f6", icon: "fa-file-video", original: "Hero_Video_Final.mp4" },
    { id: 4, name: "Database_Dump (1).sql", type: "database", size: "850 MB", category: "Duplicate", date: "Feb 22, 2024", color: "#808080", icon: "fa-database", original: "Database_Dump.sql" },
    { id: 5, name: "Archive_v2.zip", type: "archive", size: "420 MB", category: "Duplicate", date: "Mar 01, 2024", color: "#ffa900", icon: "fa-file-zipper", original: "Archive.zip" },
  ];

  const filteredFiles = duplicateFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.original.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar bg-black text-white min-h-screen">
      
      {/* Breadcrumb & Navigation - Matched to StorageDashboard Hierarchy */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()} 
          className="w-8 h-8 flex items-center justify-center hover:bg-[#111] transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-sm text-[#808080]"></i>
        </button>
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-[#808080] hover:text-white cursor-pointer">Home</span>
          <i className="fa-solid fa-chevron-right text-[10px] text-[#333]"></i>
          <span className="text-[#808080] hover:text-white cursor-pointer">Storage Management</span>
          <i className="fa-solid fa-chevron-right text-[10px] text-[#333]"></i>
          <span className="font-semibold text-white">Duplicate Files</span>
        </nav>
      </div>

      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Duplicate Finder</h1>
          <p className="text-sm text-[#808080]">Review and remove identical files to save space</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-[300px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
            <i className="fa fa-search text-[#808080]"></i>
            <input 
              type="text" 
              placeholder="Search duplicates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" 
            />
          </div>
        </div>
      </div>

      {/* Content Area - Data Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-[#808080] border-b border-[#1a1a1a]">
                <th className="p-6 font-semibold">Duplicate File</th>
                <th className="p-6 font-semibold">Original File</th>
                <th className="p-6 font-semibold">Size</th>
                <th className="p-6 font-semibold text-center">View</th>
                <th className="p-6 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr 
                  key={file.id} 
                  className="group hover:bg-[#111] transition-all duration-200 border-b border-[#111] last:border-none"
                >
                  <td className="p-4 text-sm text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors">
                        <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                        <span className="text-[10px] text-[#808080]">{file.date}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#808080] italic">
                    <i className="fa-solid fa-link text-[10px] mr-2"></i>
                    {file.original}
                  </td>
                  <td className="p-4 text-sm font-semibold text-white">{file.size}</td>
                  <td className="p-4 text-sm text-center">
                    <button className="text-[#808080] hover:text-white transition-colors bg-[#111] hover:bg-[#1a1a1a] p-2 rounded-lg">
                      <i className="fa-solid fa-eye text-xs"></i>
                    </button>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button 
                      onClick={() => handleDeleteClick(file)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFiles.length === 0 && (
            <div className="py-20 text-center">
              <i className="fa-solid fa-clone text-[#333] text-4xl mb-4"></i>
              <p className="text-[#808080] text-sm">No duplicates found. Your storage is clean!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#808080] uppercase tracking-widest font-medium">
          {filteredFiles.length} duplicate pairs identified
        </p>
        <div className="flex gap-6 items-center">
          <span className="text-[10px] text-[#808080] uppercase tracking-widest">
            Wasted Space: <span className="text-white font-bold ml-1">2.54 GB</span>
          </span>
          <button className="px-5 py-2.5 text-[10px] uppercase tracking-widest text-white border border-[#1a1a1a] rounded-lg bg-[#0a0a0a] hover:bg-[#111] transition-colors font-bold">
            Refresh Scan
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-trash-can text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Duplicate?</h3>
            <p className="text-sm text-[#808080] mb-8 leading-relaxed">
              You are removing the copy <span className="text-white font-medium">{selectedFile?.name}</span>. The original version will remain safe.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white text-sm font-bold hover:bg-[#222] transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DuplicateManager;