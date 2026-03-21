import React, { useState, useEffect } from 'react';

const FileDetails = () => {
  // Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';

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

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const addRecipient = () => setRecipients([...recipients, '']);
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
    <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 flex flex-col gap-8">
        
        {/* Top Header Section */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 text-white">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.name}</h1>
              <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1 font-medium`}>Uploaded by you • PDF Document</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const newState = !isStarred;
                setIsStarred(newState);
                showToast(newState ? "Added to Favorites" : "Removed from Favorites");
              }}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                isStarred 
                  ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                  : (isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600')
              }`}
            >
              <i className={`${isStarred ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
            </button>
            <button 
              onClick={() => setActiveModal('share')}
              className={`flex-1 md:flex-none px-5 py-2.5 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <i className="fa-solid fa-share-nodes"></i> Share
            </button>
            <button className={`flex-1 md:flex-none px-5 py-2.5 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
              <i className="fa-solid fa-folder-plus"></i> Organize
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            <div className={`aspect-video border rounded-2xl flex flex-col items-center justify-center transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-[#444]' : 'bg-white border-slate-200 text-slate-300'}`}>
              <i className="fa-solid fa-eye-slash text-4xl mb-4 opacity-30"></i>
              <span className="text-sm font-medium">Preview not available for this file type</span>
            </div>

            <div className={`border rounded-2xl p-6 transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`text-[11px] uppercase font-bold tracking-widest mb-4 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Description</div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-[#e3e3e3]' : 'text-slate-600'}`}>{fileData.description}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className={`text-[11px] uppercase font-bold tracking-widest mb-6 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Properties</div>
              <div className="space-y-5">
                {[ 
                  { label: "Size", val: "4.2 MB" },
                  { label: "Created", val: "Feb 14, 2026" },
                  { label: "Modified", val: "2 hours ago" }
                ].map((prop, i) => (
                  <div key={i} className={`flex justify-between items-center ${i !== 2 ? (isDark ? 'border-b border-[#111] pb-3' : 'border-b border-slate-100 pb-3') : ''}`}>
                    <span className={`text-[11px] font-bold uppercase ${isDark ? 'text-[#404040]' : 'text-slate-400'}`}>{prop.label}</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{prop.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => showToast("Opening...")} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}><i className="fa-solid fa-eye opacity-50"></i> Open File</button>
              <button onClick={() => showToast("Downloading...")} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}><i className="fa-solid fa-download opacity-50"></i> Download</button>
              <button onClick={() => setActiveModal('edit')} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}><i className="fa-solid fa-pen opacity-50"></i> Edit Details</button>
              <button onClick={() => setActiveModal('archive')} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 text-blue-500 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-blue-50'}`}><i className="fa-solid fa-box-archive"></i> Archive</button>
              <button onClick={() => setActiveModal('delete')} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 text-red-500 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-red-50'}`}><i className="fa-solid fa-trash"></i> Move to Trash</button>
            </div>
          </div>
        </div>

        {/* Shared With Section */}
        <div className={`mt-auto border-t pt-8 mb-10 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Shared With</h3>
          <div className="flex flex-wrap gap-3">
            {['abhiram@innovaturelabs.com', 'demo@innovaturelabs.com'].map((email, i) => (
              <div key={i} className={`border px-4 py-2 rounded-full flex items-center gap-3 text-xs transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                <div className="w-5 h-5 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center text-[8px] font-bold">{email[0].toUpperCase()}</div>
                <span className={`${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>{email}</span>
                <i className={`fa-solid fa-xmark cursor-pointer transition-colors ${isDark ? 'text-[#444] hover:text-white' : 'text-slate-300 hover:text-red-500'}`}></i>
              </div>
            ))}
            <button onClick={() => setActiveModal('share')} className={`border border-dashed px-4 py-2 rounded-full text-xs transition-all flex items-center gap-2 ${isDark ? 'border-[#333] text-[#808080] hover:text-white hover:border-white' : 'border-slate-300 text-slate-400 hover:text-blue-600 hover:border-blue-600'}`}>
              <i className="fa-solid fa-plus"></i> Add Person
            </button>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
          <div className={`border w-full max-w-[450px] rounded-2xl p-8 shadow-2xl transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            
            {activeModal === 'edit' && (
              <>
                <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>File Name</label>
                    <input value={tempName} onChange={(e) => setTempName(e.target.value)} type="text" className={`w-full border rounded-xl p-3 text-sm outline-none transition-all ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`} />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Description</label>
                    <textarea value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} rows="4" className={`w-full border rounded-xl p-3 text-sm outline-none resize-none transition-all ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}></textarea>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setActiveModal(null)} className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Cancel</button>
                  <button onClick={saveDetails} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Save Changes</button>
                </div>
              </>
            )}

            {(activeModal === 'archive' || activeModal === 'delete') && (
              <div className="text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl mb-6 mx-auto ${activeModal === 'archive' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                  <i className={`fa-solid ${activeModal === 'archive' ? 'fa-box-archive' : 'fa-trash-can'}`}></i>
                </div>
                <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeModal === 'archive' ? 'Archive File?' : 'Move to Trash?'}</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>{activeModal === 'archive' ? 'This will move the file to read-only mode.' : 'Items are deleted after 30 days.'}</p>
                <div className="flex gap-3">
                  <button onClick={() => setActiveModal(null)} className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Cancel</button>
                  <button onClick={activeModal === 'archive' ? handleArchive : handleDelete} className={`flex-1 py-3 text-white rounded-xl font-bold text-xs transition-all ${activeModal === 'archive' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {activeModal === 'archive' ? 'Archive' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetails;