import React, { useState } from 'react';

const ViewOldFiles = () => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ageFilter, setAgeFilter] = useState("all"); // "all", "6m", "1y", "2y"

  // Dataset focused on files older than 1 year
  const oldFiles = [
    { id: 1, name: "Legacy_Project_Assets_2022.zip", location: "/Archives/Clients", size: "1.4 GB", lastAccessed: "Jan 12, 2024", age: 2.1, displayAge: "2.1 Years", color: "#a66efa", icon: "fa-file-zipper" },
    { id: 2, name: "Tax_Returns_FY21.pdf", location: "/Finance/Historical", size: "4.2 MB", lastAccessed: "Mar 10, 2022", age: 3.9, displayAge: "3.9 Years", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 3, name: "Old_Website_Backup.tar.gz", location: "/Backups/Web", size: "850 MB", lastAccessed: "Aug 15, 2023", age: 2.5, displayAge: "2.5 Years", color: "#ffa900", icon: "fa-file-code" },
    { id: 4, name: "Event_Photos_Summer22.iso", location: "/Media/Events", size: "3.8 GB", lastAccessed: "Jun 22, 2022", age: 3.7, displayAge: "3.7 Years", color: "#10b981", icon: "fa-compact-disc" },
    { id: 5, name: "Draft_Contract_Unsigned.docx", location: "/Legal/Drafts", size: "120 KB", lastAccessed: "Feb 05, 2023", age: 3.1, displayAge: "3.1 Years", color: "#3b82f6", icon: "fa-file-word" },
    { id: 6, name: "Project_Proposal_Draft.pdf", location: "/Projects/Podcast/Raw", size: "520 MB", lastAccessed: "Sept 20, 2025", age: 0.5, displayAge: "6 Months", color: "#f472b6", icon: "fa-file-audio" },
    { id: 7, name: "Meeting_Notes_Phase1.txt", location: "/Notes/2022", size: "15 KB", lastAccessed: "Dec 01, 2024", age: 1.2, displayAge: "1.2 Years", color: "#808080", icon: "fa-file-lines" },
  ];

  const filteredFiles = oldFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          file.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesAge = true;
    if (ageFilter === "6m") matchesAge = file.age >= 0.5;
    if (ageFilter === "1y") matchesAge = file.age >= 1.0;
    if (ageFilter === "2y") matchesAge = file.age >= 2.0;

    return matchesSearch && matchesAge;
  });

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

        {/* HEADER & SEARCH / FILTER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Old Files</h1>
            <p className="text-neutral-500 text-sm mt-1">Review files consuming space based on storage age</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* AGE FILTER DROPDOWN */}
            <div className="relative group">
              <select 
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="appearance-none bg-neutral-900/50 border border-neutral-800 text-white text-xs rounded-full py-2.5 pl-5 pr-10 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="6m">Older than 6 Months</option>
                <option value="1y">Older than 1 Year</option>
                <option value="2y">Older than 2 Years</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 text-[10px] pointer-events-none"></i>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs group-focus-within:text-blue-500 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-900/50 border border-neutral-800 text-white text-sm rounded-full py-2.5 pl-10 pr-6 w-full md:w-64 focus:outline-none focus:border-neutral-600 focus:bg-neutral-900 transition-all"
              />
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-900">
                <th className="pb-4 font-semibold">File Name</th>
                <th className="pb-4 font-semibold">Storage Location</th>
                <th className="pb-4 font-semibold">Last Accessed</th>
                <th className="pb-4 font-semibold text-right">Age</th>
                <th className="pb-4 font-semibold text-right pl-4">Size</th>
                <th className="pb-4 font-semibold text-right pl-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-neutral-900/40 transition-colors">
                  <td className="py-5 text-sm text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                        <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                      </div>
                      <span className="font-medium truncate max-w-[180px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm text-neutral-500 font-mono text-[11px]">
                    {file.location}
                  </td>
                  <td className="py-5 text-sm text-neutral-400">
                    {file.lastAccessed}
                  </td>
                  <td className="py-5 text-sm text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {file.displayAge}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-right">
                    <span className="text-white font-semibold">
                      {file.size}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-right">
                    <div className="flex justify-end gap-4">
                      <button className="text-neutral-500 hover:text-white transition-colors" title="Archive">
                        <i className="fa-solid fa-box-archive text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(file)}
                        className="text-red-500 hover:text-red-400 font-semibold text-xs"
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
              <i className="fa-solid fa-calendar-xmark text-neutral-800 text-4xl mb-4"></i>
              <p className="text-neutral-500 text-sm">No files match the selected filter.</p>
            </div>
          )}
        </div>

        {/* FOOTER STATS */}
        <div className="mt-8 pt-6 border-t border-neutral-900 flex items-center justify-between">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
            {filteredFiles.length} files found
          </p>
          <div className="flex gap-6 items-center">
            <button className="px-6 py-2.5 text-[10px] uppercase tracking-widest text-white font-bold bg-[#1a1a1a] border border-neutral-800 rounded hover:bg-neutral-800 transition-colors">
              Archive Filtered
            </button>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-clock-rotate-left text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Old Asset?</h3>
            <p className="text-sm text-neutral-500 mb-8">
              This file is <span className="text-white">{selectedFile?.displayAge}</span> old. Are you sure?
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors" onClick={() => setDeleteModalOpen(false)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOldFiles;