import React, { useState } from 'react';
import { Link } from "react-router-dom";

const ManageStorage = () => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const storageFiles = [
    { id: 1, name: "Raw_Footage_4K.mp4", type: "video", size: "2.4 GB", category: "Large File", date: "Oct 12, 2023", color: "#3b82f6", icon: "fa-file-video" },
    { id: 2, name: "Backup_Database_March.sql", type: "database", size: "1.8 GB", category: "Old File", date: "Mar 10, 2023", color: "#808080", icon: "fa-database" },
    { id: 3, name: "Product_Photos_HighRes.zip", type: "archive", size: "950 MB", category: "Large File", date: "Oct 08, 2023", color: "#ffa900", icon: "fa-file-zipper" },
    { id: 4, name: "Logo_Final_v2_COPY.png", type: "image", size: "12 MB", category: "Duplicate", date: "Sep 05, 2023", color: "#10b981", icon: "fa-file-image" },
    { id: 5, name: "Project_Proposal_Draft.pdf", type: "pdf", size: "420 MB", category: "Unused", date: "Jan 28, 2022", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 6, name: "Windows_System_Image.iso", type: "image", size: "4.2 GB", category: "Large File", date: "Aug 15, 2023", color: "#8b5cf6", icon: "fa-compact-disc" },
    { id: 7, name: "Cache_Logs_Old.txt", type: "text", size: "85 MB", category: "Trash", date: "Feb 22, 2023", color: "#808080", icon: "fa-file-lines" },
  ];

  const filteredFiles = storageFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.category.toLowerCase().includes(searchQuery.toLowerCase())
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
  <Link
    to="/"
    className="text-[#808080] hover:text-white cursor-pointer"
  > Home</Link>

  <i className="fa-solid fa-chevron-right text-[10px] text-[#333]"></i>
    <Link
    to="/storage-management"
    className="text-[#808080] hover:text-white cursor-pointer"
  >Storage Management</Link>

  <i className="fa-solid fa-chevron-right text-[10px] text-[#333]"></i>

  <span className="font-semibold text-white">
    Cleanup Recommendations
  </span>
</nav>
      </div>

      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Cleanup Recommendations</h1>
          <p className="text-sm text-[#808080]">Reviewing {storageFiles.length} files that are consuming significant space</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-[300px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
            <i className="fa fa-search text-[#808080]"></i>
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" 
            />
          </div>
        </div>
      </div>

      {/* Content Area - Data Table */}
      <div className="  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-[#808080] border-b border-[#1a1a1a]">
                <th className="p-6 font-semibold">File Name</th>
                <th className="p-6 font-semibold">Size</th>
                <th className="p-6 font-semibold">Added</th>
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
                      <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-semibold text-white">{file.size}</td>
                  <td className="p-4 text-sm text-[#808080]">{file.date}</td>
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
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFiles.length === 0 && (
            <div className="py-20 text-center">
              <i className="fa-solid fa-broom text-[#333] text-4xl mb-4"></i>
              <p className="text-[#808080] text-sm">No files found to clean up.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats - Matched to Dashboard Style */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#808080] uppercase tracking-widest font-medium">
          Showing {filteredFiles.length} recommended actions
        </p>
        <div className="flex gap-6 items-center">
          <span className="text-[10px] text-[#808080] uppercase tracking-widest">
            Potential Saving: <span className="text-white font-bold ml-1">11.2 GB</span>
          </span>
          <button className="px-5 py-2.5 text-[10px] uppercase tracking-widest text-white border border-[#1a1a1a] rounded-lg bg-[#0a0a0a] hover:bg-[#111] transition-colors font-bold">
            Next Page
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-trash-can text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Permanently Delete?</h3>
            <p className="text-sm text-[#808080] mb-8 leading-relaxed">
              You are about to delete <span className="text-white font-medium">{selectedFile?.name}</span>. This will free up {selectedFile?.size} of storage.
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

export default ManageStorage;