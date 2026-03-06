import React, { useState } from 'react';

const ViewDuplicates = () => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Dataset structured to show grouped duplicates
  const duplicateGroups = [
    { id: 1, groupId: "G1", name: "Project_Final_v1.pdf", location: "/Documents", size: "4.2 MB", date: "Oct 12, 2023", color: "#ff4444", icon: "fa-file-pdf", isOriginal: true },
    { id: 2, groupId: "G1", name: "Project_Final_v1 (1).pdf", location: "/Downloads", size: "4.2 MB", date: "Oct 15, 2023", color: "#ff4444", icon: "fa-file-pdf", isOriginal: false },
    
    { id: 3, groupId: "G2", name: "Company_Logo_HighRes.png", location: "/Assets/Branding", size: "12.5 MB", date: "Sep 05, 2023", color: "#10b981", icon: "fa-file-image", isOriginal: true },
    { id: 4, groupId: "G2", name: "logo-backup.png", location: "/Desktop/Old", size: "12.5 MB", date: "Sep 10, 2023", color: "#10b981", icon: "fa-file-image", isOriginal: false },
    { id: 5, groupId: "G2", name: "Copy of Company_Logo.png", location: "/Downloads", size: "12.5 MB", date: "Sep 12, 2023", color: "#10b981", icon: "fa-file-image", isOriginal: false },

    { id: 6, groupId: "G3", name: "Quarterly_Report_Q3.xlsx", location: "/Finance/2023", size: "1.2 MB", date: "Oct 01, 2023", color: "#3b82f6", icon: "fa-file-excel", isOriginal: true },
    { id: 7, groupId: "G3", name: "Quarterly_Report_Q3_Duplicate.xlsx", location: "/Shared/Finance", size: "1.2 MB", date: "Oct 02, 2023", color: "#3b82f6", icon: "fa-file-excel", isOriginal: false },
  ];

  const filteredFiles = duplicateGroups.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  return (
    <div className="flex-1 min-w-0 bg-black overflow-y-auto no-scrollbar min-h-screen">
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        
        {/* BREADCRUMB / BACK NAVIGATION */}
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 text-sm group bg-transparent border-none cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
          <span>Back to Storage Overview</span>
        </button>

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Duplicate Files</h1>
            <p className="text-neutral-500 text-sm mt-1">Found {duplicateGroups.length} redundant files across {new Set(duplicateGroups.map(f => f.groupId)).size} groups</p>
          </div>
          
          <div className="relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search file names or folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-neutral-800 text-white text-sm rounded-full py-2.5 pl-10 pr-6 w-full md:w-80 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all"
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-900">
                <th className="pb-4 font-semibold">File Name</th>
                <th className="pb-4 font-semibold">Folder Path</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold text-right">Size</th>
                <th className="pb-4 font-semibold text-right pl-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredFiles.map((file, index) => {
                // Determine if this is the start of a new group for visual spacing
                const isNewGroup = index > 0 && filteredFiles[index - 1].groupId !== file.groupId;
                
                return (
                  <tr key={file.id} className={`group hover:bg-neutral-900/40 transition-colors ${isNewGroup ? 'border-t-2 border-neutral-800' : ''}`}>
                    <td className="py-5 text-sm text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                          <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                        </div>
                        <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-5 text-sm text-neutral-500 font-mono text-[12px]">
                      {file.location}
                    </td>
                    <td className="py-5 text-sm">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          file.isOriginal 
                          ? 'bg-blue-500/5 text-blue-500 border-blue-500/20' 
                          : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                      }`}>
                        {file.isOriginal ? 'Original' : 'Duplicate'}
                      </span>
                    </td>
                    <td className="py-5 text-sm text-right">
                      <span className="text-white font-semibold">
                        {file.size}
                      </span>
                    </td>
                    <td className="py-5 text-sm text-right">
                      <div className="flex justify-end gap-4">
                        {!file.isOriginal && (
                          <button 
                            onClick={() => handleDeleteClick(file)}
                            className="text-red-500 hover:text-red-400 font-semibold text-xs"
                          >
                            Remove
                          </button>
                        )}
                        {file.isOriginal && (
                          <span className="text-neutral-700 text-xs italic">Keep</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredFiles.length === 0 && (
            <div className="py-20 text-center">
              <i className="fa-solid fa-copy text-neutral-800 text-4xl mb-4"></i>
              <p className="text-neutral-500 text-sm">No duplicate files found.</p>
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <div className="mt-8 pt-6 border-t border-neutral-900 flex items-center justify-between">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
            Showing {filteredFiles.length} files in duplicate sets
          </p>
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Wasted Space</p>
              <p className="text-white font-bold">29.2 MB</p>
            </div>
            <button className="px-6 py-2.5 text-[10px] uppercase tracking-widest text-white font-bold bg-blue-600 rounded hover:bg-blue-500 transition-colors shadow-lg">
              Auto-Clean Duplicates
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-clone text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Duplicate?</h3>
            <p className="text-sm text-neutral-500 mb-8">
              You are removing the copy at <span className="text-white">{selectedFile?.location}</span>. The original file will remain safe.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDuplicates;