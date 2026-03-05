import React, { useState } from 'react';

const FileDetails = () => {
  // State for Modal visibility
  const [activeModal, setActiveModal] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  
  // State for File Data
  const [fileData, setFileData] = useState({
    name: "Project_Proposal_2024.pdf",
    description: "This document contains the final project proposal for the 2024 infrastructure upgrade. Please review the security protocols on page 12 before sharing externally."
  });

  const [tempName, setTempName] = useState(fileData.name);
  const [tempDesc, setTempDesc] = useState(fileData.description);

  const saveDetails = () => {
    setFileData({ name: tempName, description: tempDesc });
    setActiveModal(null);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black text-white font-sans">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 flex flex-col gap-8">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-900/20">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{fileData.name}</h1>
              <p className="text-[#808080] text-sm mt-1 font-medium">Uploaded by you • PDF Document</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsStarred(!isStarred)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                isStarred 
              ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]'
              }`}
              title={isStarred ? "Remove from Favorites" : "Add to Favorites"}
            >
              <i className={`${isStarred ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
            </button>
            <button 
              onClick={() => setActiveModal('share')}
              className="flex-1 md:flex-none px-5 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#111] transition-all"
            >
              <i className="fa-solid fa-share-nodes"></i> Share
            </button>
            <button className="flex-1 md:flex-none px-5 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#111] transition-all">
              <i className="fa-solid fa-folder-plus"></i> Organize
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            <div className="aspect-video bg-[#050505] border border-[#1a1a1a] rounded-2xl flex flex-col items-center justify-center text-[#444]">
              <i className="fa-solid fa-eye-slash text-4xl mb-4 opacity-30"></i>
              <span className="text-sm font-medium">Preview not available for this file type</span>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="text-[11px] uppercase text-[#606060] font-bold tracking-widest mb-4">Description</div>
              <p className="text-[#e3e3e3] text-sm leading-relaxed">{fileData.description}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="text-[11px] uppercase text-[#606060] font-bold tracking-widest mb-6">Properties</div>
              <div className="space-y-5">
                {[ 
                  { label: "Size", val: "4.2 MB" },
                  { label: "Created", val: "Feb 14, 2026" },
                  { label: "Modified", val: "2 hours ago" }
                ].map((prop, i) => (
                  <div key={i} className={`flex justify-between items-center ${i !== 2 ? 'border-b border-[#111] pb-3' : ''}`}>
                    <span className="text-[11px] text-[#404040] font-bold uppercase">{prop.label}</span>
                    <span className="text-sm font-medium">{prop.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3"><i className="fa-solid fa-eye text-[#444]"></i> Open File</button>
              <button className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3"><i className="fa-solid fa-download text-[#444]"></i> Download</button>
              <button onClick={() => setActiveModal('edit')} className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3"><i className="fa-solid fa-pen text-[#444]"></i> Edit Details</button>
              <button onClick={() => setActiveModal('archive')} className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3 text-blue-500"><i className="fa-solid fa-box-archive"></i> Archive</button>
              <button onClick={() => setActiveModal('delete')} className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3 text-red-500"><i className="fa-solid fa-trash"></i> Move to Trash</button>
            </div>
          </div>
        </div>

        {/* Shared With Section */}
        <div className="mt-auto border-t border-[#1a1a1a] pt-8 mb-10">
          <h3 className="text-sm font-bold mb-5">Shared With</h3>
          <div className="flex flex-wrap gap-3">
            {['abhiram@innovaturelabs.com', 'demo@innovaturelabs.com'].map((email, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 rounded-full flex items-center gap-3 text-xs group">
                <div className="w-5 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[8px]">{email[0].toUpperCase()}</div>
                <span className="text-[#808080]">{email}</span>
                <i className="fa-solid fa-xmark text-[#444] cursor-pointer hover:text-white transition-colors"></i>
              </div>
            ))}
            <button onClick={() => setActiveModal('share')} className="border border-dashed border-[#333] px-4 py-2 rounded-full text-xs text-[#808080] hover:text-white hover:border-white transition-all flex items-center gap-2">
              <i className="fa-solid fa-plus"></i> Add Person
            </button>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Share Modal - INCREASED SIZE & PREVIEW */}
      {activeModal === 'share' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[800px] rounded-l overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Left Side: Form */}
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#1a1a1a]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Share Document</h2>
              </div>

              <div className="space-y-6">
                {/* Recipient Input */}
                <div>
                  <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Recipient Email</label>
           <div className="space-y-3">
                    {recipients.map((email, index) => (
                      <div key={index} className="flex gap-2 group">
                        <input 
                          value={email}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                          placeholder="email@example.com" 
                          type="email" 
                          className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#333] outline-none transition-all text-white placeholder:text-[#222]" 
                        />
                        {index === recipients.length - 1 ? (
                          <button 
                            onClick={addRecipient}
                            className="bg-[#111] border border-[#1a1a1a] w-[46px] h-[46px] rounded-xl flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-all shadow-lg"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        ) : (
                          <button 
                            onClick={() => removeRecipient(index)}
                            className="bg-[#111] border border-[#1a1a1a] w-[46px] h-[46px] rounded-xl flex items-center justify-center text-[#444] hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Message</label>
                  <textarea placeholder="Write a note..." rows="4" className="w-full bg-[#050505] border border-[#1a1a1a] rounded-l p-3 text-sm focus:border-[#333] outline-none transition-all text-white placeholder:text-[#333] resize-none"></textarea>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Expiry</label>
                    <select className="w-full bg-[#050505] border border-[#1a1a1a] rounded-l p-3 text-sm outline-none text-[#808080] cursor-pointer appearance-none">
                      <option>7 Days</option>
                      <option>24 Hours</option>
                      <option>Never</option>
                    </select>
                  </div>
                  {/* <div>
                    <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Access</label>
                    <div className="h-[46px] flex items-center px-4 bg-[#111] border border-[#1a1a1a] rounded-xl text-xs text-[#606060]">
                      <i className="fa-solid fa-lock mr-2"></i> View Only
                    </div>
                  </div> */}
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-[#1a1a1a] rounded-l font-bold text-xs hover:bg-[#111] transition-colors text-[#808080]">Cancel</button>
                <button className="flex-1 py-3 bg-[#3b82f6] text-white rounded-l font-bold text-xs hover:opacity-90 transition-opacity">Send Link</button>
              </div>
            </div>

            {/* Right Side: Preview Panel */}
            <div className="w-full md:w-[320px] bg-[#050505] p-8 flex flex-col">
                <div className="text-[10px] uppercase text-[#444] font-bold tracking-widest mb-6">Recipient Preview</div>
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1a1a1a] rounded-xl p-6 bg-[#0a0a0a]/50">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-blue-500/20">
                        <i className="fa-solid fa-file-pdf"></i>
                    </div>
                    <p className="text-xs font-bold text-center mb-1 truncate w-full">{fileData.name}</p>
                    <p className="text-[10px] text-[#444] mb-6">4.2 MB • Secure Link</p>
                    
                    <div className="w-full h-[32px] bg-[#111] rounded-lg border border-[#1a1a1a] flex items-center px-3 gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] text-[#808080] font-mono uppercase tracking-tighter">Encryption Active</span>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-[10px] text-[#444] leading-relaxed italic">
                        "Recipients will see a secure download page with your branding and custom message."
                    </p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[450px] rounded-xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Edit Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">File Name</label>
                <input value={tempName} onChange={(e) => setTempName(e.target.value)} type="text" className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#333] outline-none text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Description</label>
                <textarea value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} rows="4" className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#333] outline-none text-white resize-none"></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-[#1a1a1a] rounded-xl font-bold text-xs hover:bg-[#111] transition-colors">Cancel</button>
              <button onClick={saveDetails} className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {activeModal === 'archive' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[400px] rounded-xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-xl mb-6 mx-auto">
              <i className="fa-solid fa-box-archive"></i>
            </div>
            <h2 className="text-lg font-bold mb-2">Archive File?</h2>
            <p className="text-[#808080] text-sm mb-8">This will move the file to read-only mode.</p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-[#1a1a1a] rounded-xl font-bold text-xs hover:bg-[#111] transition-colors">Cancel</button>
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[400px] rounded-xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-xl mb-6 mx-auto">
              <i className="fa-solid fa-trash-can"></i>
            </div>
            <h2 className="text-lg font-bold mb-2">Move to Trash?</h2>
            <p className="text-[#808080] text-sm mb-8">Items are deleted after 30 days.</p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-[#1a1a1a] rounded-xl font-bold text-xs hover:bg-[#111] transition-colors">Cancel</button>
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetails;

