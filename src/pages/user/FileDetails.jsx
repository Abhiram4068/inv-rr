import React, { useState, useEffect } from 'react';

const FileDetails = () => {
  // State for Modal visibility
  const [activeModal, setActiveModal] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '' });
  
  // Security and Recipients State
  const [isProtected, setIsProtected] = useState(false);
  const [recipients, setRecipients] = useState(['']);
  
  // State for File Data
  const [fileData, setFileData] = useState({
    name: "Project_Proposal_2024.pdf",
    description: "This document contains the final project proposal for the 2024 infrastructure upgrade. Please review the security protocols on page 12 before sharing externally."
  });

  const [tempName, setTempName] = useState(fileData.name);
  const [tempDesc, setTempDesc] = useState(fileData.description);

  // Toast Helper
  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Handlers for dynamic recipients
  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index) => {
    const updated = recipients.filter((_, i) => i !== index);
    setRecipients(updated.length ? updated : ['']);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...recipients];
    updated[index] = value;
    setRecipients(updated);
  };

  const saveDetails = () => {
    setFileData({ name: tempName, description: tempDesc });
    setActiveModal(null);
    showToast("File details updated successfully");
  };

  const handleShare = () => {
    setActiveModal(null);
    showToast(`File shared with ${recipients.filter(r => r !== '').length} recipients`);
  };

  const handleArchive = () => {
    setActiveModal(null);
    showToast("File moved to archive");
  };

  const handleDelete = () => {
    setActiveModal(null);
    showToast("File moved to trash");
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black text-white font-sans relative">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white text-black px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

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
              onClick={() => {
                const newStarredState = !isStarred;
                setIsStarred(newStarredState);
                showToast(newStarredState ? "Added to Favorites" : "Removed from Favorites");
              }}
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
              <button 
                onClick={() => showToast("Opening file...")}
                className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3"
              >
                <i className="fa-solid fa-eye text-[#444]"></i> Open File
              </button>
              <button 
                onClick={() => showToast("Downloading file...")}
                className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3"
              >
                <i className="fa-solid fa-download text-[#444]"></i> Download
              </button>
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

      {activeModal === 'share' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[800px] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#1a1a1a] max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Share Document</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Recipient Emails</label>
                  <div className="space-y-3">
                    {recipients.map((email, index) => (
                      <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                          value={email} 
                          onChange={(e) => handleEmailChange(index, e.target.value)} 
                          placeholder="Enter email address..." 
                          type="email" 
                          className="flex-1 bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all text-white placeholder:text-[#333]" 
                        />
                        {index === recipients.length - 1 ? (
                          <button onClick={addRecipient} className="bg-blue-600/10 border border-blue-500/30 w-[46px] h-[46px] rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><i className="fa-solid fa-plus"></i></button>
                        ) : (
                          <button onClick={() => removeRecipient(index)} className="bg-[#111] border border-[#1a1a1a] w-[46px] h-[46px] rounded-xl flex items-center justify-center text-[#444] hover:text-red-500 hover:border-red-500/30 transition-all"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Message</label>
                  <textarea placeholder="Write a note..." rows="4" className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm focus:border-[#333] outline-none transition-all text-white placeholder:text-[#333] resize-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Link Expiry</label>
                    <div className="relative">
                      <select className="w-full bg-[#050505] border border-[#1a1a1a] rounded-xl p-3 text-sm outline-none text-[#808080] cursor-pointer appearance-none">
                        <option>7 Days</option>
                        <option>24 Hours</option>
                        <option>Never</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#444] pointer-events-none"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-[#808080] font-bold tracking-widest mb-2">Security Access</label>
                    <button 
                      onClick={() => {
                          const nextState = !isProtected;
                          setIsProtected(nextState);
                          showToast(nextState ? "Identity Validation Enabled" : "Security Disabled");
                      }}
                      className={`w-full h-[46px] flex items-center justify-between px-4 rounded-xl border transition-all ${
                        isProtected ? 'bg-blue-600/10 border-blue-500/50' : 'bg-[#111] border-[#1a1a1a] hover:bg-[#151515]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid fa-shield-halved text-xs ${isProtected ? 'text-blue-500' : 'text-[#444]'}`}></i>
                        <span className={`text-[11px] font-bold uppercase tracking-tight ${isProtected ? 'text-blue-500' : 'text-[#606060]'}`}>
                          Email Validation
                        </span>
                      </div>
                      <div className={`w-7 h-3.5 rounded-full relative transition-colors ${isProtected ? 'bg-blue-600' : 'bg-[#333]'}`}>
                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${isProtected ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-10">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-[#1a1a1a] rounded-xl font-bold text-xs hover:bg-[#111] transition-colors text-[#808080]">Cancel</button>
                <button onClick={handleShare} className="flex-1 py-3 bg-[#3b82f6] text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">Send Invites</button>
              </div>
            </div>
            
            <div className="w-full md:w-[320px] bg-[#050505] p-8 flex flex-col">
                <div className="text-[10px] uppercase text-[#444] font-bold tracking-widest mb-6">Recipient Preview</div>
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1a1a1a] rounded-2xl p-6 bg-[#0a0a0a]/50">
                    <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-blue-500/20">
                        <i className="fa-solid fa-file-pdf"></i>
                    </div>
                    <p className="text-xs font-bold text-center mb-1 truncate w-full">{fileData.name}</p>
                    <p className="text-[10px] text-[#444] mb-6">4.2 MB • Secure Link</p>
                    
                    <div className={`w-full h-[32px] rounded-lg border flex items-center px-3 gap-2 transition-all ${isProtected ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#111] border-[#1a1a1a]'}`}>
                        <div className={`w-2 h-2 rounded-full ${isProtected ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-[9px] text-[#808080] font-mono uppercase tracking-tighter">
                          {isProtected ? 'Identity Check ON' : 'Encryption Active'}
                        </span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={handleArchive} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">Archive</button>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetails;