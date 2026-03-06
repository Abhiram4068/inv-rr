import React, { useState } from 'react';

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
    <div className="flex-1 min-w-0 bg-black overflow-y-auto no-scrollbar min-h-screen">
      <div className="py-10 px-12 lg:px-24 max-w-[1600px] mx-auto">
        
        {/* BREADCRUMB */}
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 text-sm group bg-transparent border-none cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
          <span>Back to Storage Overview</span>
        </button>

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Cleanup Recommendations</h1>
            <p className="text-neutral-500 text-sm mt-1">Reviewing {storageFiles.length} files that are consuming significant space</p>
          </div>
          
          <div className="relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-neutral-800 text-white text-sm rounded-full py-3 pl-10 pr-6 w-full md:w-80 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          {/* Changed to border-collapse to make the bottom border lines connect across the row */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-800">
                <th className="pb-6 pl-4 font-semibold">File Name</th>
                <th className="pb-6 font-semibold">Size</th>
                <th className="pb-6 font-semibold">Added</th>
                <th className="pb-6 font-semibold">Last Modified</th>
                <th className="pb-6 font-semibold text-center">View Details</th>
                <th className="pb-6 font-semibold text-right pr-4">Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr 
                  key={file.id} 
                  className="group hover:bg-neutral-900/60 transition-all duration-200"
                >
                  {/* Added 'border-b border-neutral-900' to every cell to create the line between rows */}
                  <td className="py-4 pl-4 text-sm text-white border-b border-neutral-900">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center group-hover:bg-black transition-colors">
                        <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>

                  <td className="py-4 text-sm border-b border-neutral-900">
                    <span className="text-white font-semibold">
                      {file.size}
                    </span>
                  </td>

                  <td className="py-4 text-sm text-neutral-500 border-b border-neutral-900">
                    {file.date}
                  </td>

                  <td className="py-4 text-sm text-neutral-500 border-b border-neutral-900">
                    {file.date}
                  </td>

                  <td className="py-4 text-sm text-center border-b border-neutral-900">
                    <button className="text-neutral-500 hover:text-white transition-colors bg-neutral-900/50 hover:bg-neutral-800 p-2.5 rounded-lg">
                      <i className="fa-solid fa-eye text-xs"></i>
                    </button>
                  </td>

                  <td className="py-4 pr-4 text-sm text-right border-b border-neutral-900">
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => handleDeleteClick(file)}
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
              <i className="fa-solid fa-broom text-neutral-800 text-4xl mb-4"></i>
              <p className="text-neutral-500 text-sm">No files found to clean up.</p>
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <div className="mt-12 pt-8 flex items-center justify-between">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-medium">
            Showing {filteredFiles.length} recommended actions
          </p>
          <div className="flex gap-6 items-center">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
              Potential Saving: <span className="text-white font-bold ml-1">11.2 GB</span>
            </span>
            <div className="flex gap-2">
               <button className="px-5 py-2.5 text-[10px] uppercase tracking-widest text-white border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors font-bold">
                 Next Page
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-trash-can text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Permanently Delete?</h3>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
              You are about to delete <span className="text-white font-medium">{selectedFile?.name}</span>. This will free up {selectedFile?.size} of storage.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3.5 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
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
    </div>
  );
};

export default ManageStorage;