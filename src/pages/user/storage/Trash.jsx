import React, { useState } from 'react';

const TrashManagement = () => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock Data for Trash
  const trashFiles = [
    { id: 1, name: "Old_Project_Draft.zip", type: "archive", size: "420 MB", deletedDate: "2 days ago", color: "#ffa900", icon: "fa-file-zipper" },
    { id: 2, name: "Unused_Asset_01.png", type: "image", size: "4.5 MB", deletedDate: "5 days ago", color: "#10b981", icon: "fa-file-image" },
    { id: 3, name: "Raw_Footage_Blurry.mp4", type: "video", size: "1.8 GB", deletedDate: "1 week ago", color: "#3b82f6", icon: "fa-file-video" },
    { id: 4, name: "Meeting_Notes_July.pdf", type: "pdf", size: "1.2 MB", deletedDate: "3 days ago", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 5, name: "Temp_Database_Export.sql", type: "database", size: "210 MB", deletedDate: "6 hours ago", color: "#8b5cf6", icon: "fa-database" },
  ];

  const filteredFiles = trashFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDeleteModal = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const openRestoreModal = (file) => {
    setSelectedFile(file);
    setRestoreModalOpen(true);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar bg-black text-white min-h-screen">
      
      {/* Breadcrumb & Navigation */}
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
          <span className="font-semibold text-white">Trash</span>
        </nav>
      </div>

      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-sm text-[#808080]">Items in trash will be permanently deleted after 30 days</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-[300px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
            <i className="fa fa-search text-[#808080]"></i>
            <input 
              type="text" 
              placeholder="Search trash..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" 
            />
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-all whitespace-nowrap">
            Empty Trash
          </button>
        </div>
      </div>

      {/* Content Area - Data Table (No border/bg) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.15em] text-[#808080] border-b border-[#1a1a1a]">
              <th className="p-6 font-semibold">File Name</th>
              <th className="p-6 font-semibold">Deleted</th>
              <th className="p-6 font-semibold">Size</th>
              <th className="p-6 font-semibold text-center">View</th>
              <th className="p-6 font-semibold text-right">Actions</th>
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
                    <span className="font-medium truncate max-w-[250px]">{file.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-[#808080]">{file.deletedDate}</td>
                <td className="p-4 text-sm font-semibold text-white">{file.size}</td>
                {/* View Column */}
                <td className="p-4 text-sm text-center">
                  <button className="text-[#808080] hover:text-white transition-colors  hover:bg-[#1a1a1a] p-2 rounded-lg">
                    <i className="fa-solid fa-eye text-xs"></i>
                  </button>
                </td>
                <td className="p-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openRestoreModal(file)}
                      className="bg-[#111] hover:bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-[#1a1a1a]"
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => openDeleteModal(file)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredFiles.length === 0 && (
          <div className="py-20 text-center">
            <i className="fa-solid fa-trash-can text-[#333] text-4xl mb-4"></i>
            <p className="text-[#808080] text-sm">Trash is empty. No items to display.</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#808080] uppercase tracking-widest font-medium">
          {filteredFiles.length} items currently in bin
        </p>
        <span className="text-[10px] text-[#808080] uppercase tracking-widest">
           Total Trash Size: <span className="text-white font-bold ml-1">2.44 GB</span>
        </span>
      </div>

      {/* RESTORE MODAL */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-rotate-left text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Restore File?</h3>
            <p className="text-sm text-[#808080] mb-8 leading-relaxed">
              <span className="text-white font-medium">{selectedFile?.name}</span> will be moved back to its original location.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white text-sm font-bold hover:bg-[#222]" onClick={() => setRestoreModalOpen(false)}>Cancel</button>
              <button className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500" onClick={() => setRestoreModalOpen(false)}>Restore</button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Permanently?</h3>
            <p className="text-sm text-[#808080] mb-8 leading-relaxed">
              This action cannot be undone. <span className="text-white font-medium">{selectedFile?.name}</span> will be lost forever.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white text-sm font-bold hover:bg-[#222]" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="flex-1 py-3.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500" onClick={() => setDeleteModalOpen(false)}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TrashManagement;