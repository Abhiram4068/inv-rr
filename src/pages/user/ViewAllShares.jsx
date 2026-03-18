import React, { useState } from 'react';
import { Link } from "react-router-dom";
const ViewAllShares = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded dataset for a "View All" experience
  const allSharedFiles = [
    { id: 1, name: "Final_Pitch_Deck.pdf", type: "pdf", sharedWith: "Public Link", views: "42 Views", date: "Oct 12, 2023", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 2, name: "Budget_Sheet_Q1.xlsx", type: "excel", sharedWith: "abhiram@innovaturelabs.com", views: "12 Views", date: "Oct 10, 2023", color: "#00c851", icon: "fa-file-excel" },
    { id: 3, name: "Project_Spec_v2.docx", type: "word", sharedWith: "demo@innovaturelabs.com", views: "8 Views", date: "Oct 08, 2023", color: "#3b82f6", icon: "fa-file-word" },
    { id: 4, name: "Branding_Guidelines.zip", type: "zip", sharedWith: "Public Link", views: "156 Views", date: "Oct 05, 2023", color: "#ffa900", icon: "fa-file-zipper" },
    { id: 5, name: "User_Research_Video.mp4", type: "video", sharedWith: "marketing@team.com", views: "24 Views", date: "Sep 28, 2023", color: "#ff3547", icon: "fa-file-video" },
    { id: 6, name: "API_Documentation.md", type: "code", sharedWith: "dev-group@internal.com", views: "91 Views", date: "Sep 22, 2023", color: "#a66efa", icon: "fa-file-code" },
    { id: 6, name: "API_Documentation.md", type: "code", sharedWith: "dev-group@internal.com", views: "91 Views", date: "Sep 22, 2023", color: "#a66efa", icon: "fa-file-code" },
  { id: 6, name: "API_Documentation.md", type: "code", sharedWith: "dev-group@internal.com", views: "91 Views", date: "Sep 22, 2023", color: "#a66efa", icon: "fa-file-code" },
  
  { id: 6, name: "API_Documentation.md", type: "code", sharedWith: "dev-group@internal.com", views: "91 Views", date: "Sep 22, 2023", color: "#a66efa", icon: "fa-file-code" },
  
  ];

  const filteredFiles = allSharedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.sharedWith.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-w-0 bg-black overflow-y-auto no-scrollbar min-h-screen">
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        
        {/* BREADCRUMB / BACK NAVIGATION */}
        <Link href='/shared'className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 text-sm group">
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
          <span>Back to Shared</span>
       </Link>

        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Shared Files</h1>
            <p className="text-neutral-500 text-sm mt-1">Managing {allSharedFiles.length} shared assets across your workspace</p>
          </div>
          
          <div className="relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs group-focus-within:text-blue-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search files or emails..."
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
                <th className="pb-4 pl-4 font-semibold">File Name</th>
                <th className="pb-4 font-semibold">Recipient</th>
                <th className="pb-4 font-semibold">Shared Date</th>
                <th className="pb-4 font-semibold">Analytics</th>
                <th className="pb-4 pr-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-neutral-900/40 transition-colors">
                  <td className="py-5 pl-4 text-sm text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                        <i className={`fa-solid ${file.icon} text-base`} style={{ color: file.color }}></i>
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm">
                    <span className={file.sharedWith.includes('@') ? "text-blue-500" : "text-neutral-400"}>
                      {file.sharedWith}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-neutral-500">
                    {file.date}
                  </td>
                  <td className="py-5 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/5 text-emerald-500 text-[10px] font-bold border border-emerald-500/10">
                      <i className="fa-solid fa-chart-line mr-1.5"></i>
                      {file.views}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-sm text-right">
                    <div className="flex justify-end gap-4">
                      <button className="text-neutral-500 hover:text-white transition-colors">
                        <i className="fa-solid fa-link text-xs"></i>
                      </button>
                      <button 
                        onClick={() => setModalOpen(true)}
                        className="text-blue-500 hover:text-blue-400 font-semibold"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFiles.length === 0 && (
            <div className="py-20 text-center">
              <i className="fa-solid fa-folder-open text-neutral-800 text-4xl mb-4"></i>
              <p className="text-neutral-500 text-sm">No files match your search criteria.</p>
            </div>
          )}
        </div>

        {/* PAGINATION (Footer) */}
        <div className="mt-8 pt-6 border-t border-neutral-900 flex items-center justify-between">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
            Showing {filteredFiles.length} of {allSharedFiles.length} files
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-[10px] uppercase tracking-widest text-neutral-500 border border-neutral-800 rounded hover:bg-neutral-900 transition-colors disabled:opacity-30">Previous</button>
            <button className="px-4 py-2 text-[10px] uppercase tracking-widest text-white border border-neutral-800 rounded bg-neutral-900 hover:bg-neutral-800 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* RE-USED MODAL FROM YOUR COMPONENT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-shield-halved text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Manage Share Link</h3>
            <p className="text-sm text-neutral-500 mb-8">
              Anyone with the link can currently view this file. You can revoke access immediately.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
                onClick={() => setModalOpen(false)}
              >
                Keep Active
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors"
                onClick={() => setModalOpen(false)}
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllShares;