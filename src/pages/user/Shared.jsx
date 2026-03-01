import React, { useState } from 'react';

const Shared = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const sharedFiles = [
    { id: 1, name: "Final_Pitch_Deck.pdf", type: "pdf", sharedWith: "Public Link", views: "42 Views", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 2, name: "Budget_Sheet_Q1.xlsx", type: "excel", sharedWith: "abhiram@innovaturelabs.com", views: "12 Views", color: "#00c851", icon: "fa-file-excel" },
  ];

  const recentShares = [
    { id: 1, email: "abhiram@innovaturelabs.com", file: "Project_Spec_v2.docx", status: "Active", statusColor: "rgba(59, 130, 246, 0.1)", textColor: "#3b82f6" },
    { id: 2, email: "demo@innovaturelabs.com", file: "Branding_Guidelines.zip", status: "Expired", statusColor: "rgba(255, 68, 68, 0.1)", textColor: "#ff4444" },
  ];

  return (
    /* Use w-full and flex-1 to ensure it fills the space between sidebars */
    <div className="flex-1 min-w-0 bg-black overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 max-w-5xl">
        
        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-xl font-bold text-white">Shared Files</h1>
          <div className="text-neutral-500 text-sm">2 items actively shared</div>
        </div>

        {/* SECTION 1: ACTIVELY SHARED */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-neutral-900">
                <th className="pb-4 font-medium">File Name</th>
                <th className="pb-4 font-medium">Shared With</th>
                <th className="pb-4 font-medium">View Status</th>
                <th className="pb-4 font-medium text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {sharedFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-neutral-900/30 transition-colors">
                  <td className="py-5 text-sm text-white">
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${file.icon}`} style={{ color: file.color }}></i>
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm text-neutral-500">{file.sharedWith}</td>
                  <td className="py-5 text-sm">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      {file.views}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-right">
                    <button 
                      onClick={() => setModalOpen(true)}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Manage Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIEW ALL LINK */}
        <div className="mt-2 py-4 border-t border-neutral-900">
           <button className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
             <span>View All Shared Files</span>
             <i className="fa-solid fa-chevron-right text-[8px]"></i>
           </button>
        </div>

        {/* SECTION 2: RECENTLY SHARED WITH */}
        <div className="mt-16 mb-8">
          <h2 className="text-xl font-bold text-white">Recently Shared With</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-neutral-900">
                <th className="pb-4 font-medium">Email ID</th>
                <th className="pb-4 font-medium">File Name</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {recentShares.map((share) => (
                <tr key={share.id} className="group hover:bg-neutral-900/30 transition-colors">
                  <td className="py-5 text-sm text-blue-500 truncate max-w-[200px]">{share.email}</td>
                  <td className="py-5 text-sm text-white">{share.file}</td>
                  <td className="py-5 text-sm">
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded" 
                      style={{ backgroundColor: share.statusColor, color: share.textColor }}
                    >
                      {share.status}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-right">
                    <button 
                      onClick={() => setModalOpen(true)}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {/* VIEW ALL LINK */}
        <div className="mt-2 py-4 border-t border-neutral-900">
           <button className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
             <span>View All Shared Files</span>
             <i className="fa-solid fa-chevron-right text-[8px]"></i>
           </button>
        </div>
      </div>

      {/* MODAL (Fixed Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
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

export default Shared;