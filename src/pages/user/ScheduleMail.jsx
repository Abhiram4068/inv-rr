import React, { useState, useEffect } from 'react';

const ScheduleMail = () => {
  // 1. Theme State Sync Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [activeModal, setActiveModal] = useState(null);
  const [isProtected, setIsProtected] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedInPicker, setSelectedInPicker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Mock data for the Library Picker
  const libraryFiles = [
    { id: 1, name: "Technical_Specs.pdf", size: "1.2 MB", icon: "fa-file-pdf", color: "text-red-500" },
    { id: 2, name: "Marketing_Plan.docx", size: "850 KB", icon: "fa-file-word", color: "text-blue-500" },
    { id: 3, name: "Product_Demo.mp4", size: "24.5 MB", icon: "fa-file-video", color: "text-purple-500" },
    { id: 4, name: "User_Feedback.xlsx", size: "3.1 MB", icon: "fa-file-excel", color: "text-emerald-500" },
    { id: 5, name: "Brand_Assets.zip", size: "15.2 MB", icon: "fa-file-zipper", color: "text-yellow-500" },
    { id: 6, name: "Invoice_March.pdf", size: "450 KB", icon: "fa-file-pdf", color: "text-red-500" },
  ];

  const filteredFiles = libraryFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [attachedFile, setAttachedFile] = useState({ name: "Project_Proposal_2024.pdf", size: "4.2 MB", icon: "fa-file-pdf", color: "text-red-500" });
  const [recipients, setRecipients] = useState(['']);
  const [subject, setSubject] = useState("Weekly Project Update");
  const [message, setMessage] = useState(""); 
  const [scheduleDate, setScheduleDate] = useState("2026-03-20");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const showToast = (msg) => setToast({ visible: true, message: msg });

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

  const removeFile = () => {
    setAttachedFile(null);
    showToast("Attachment removed");
  };

  const confirmPickerSelection = () => {
    setAttachedFile(selectedInPicker);
    setSelectedInPicker(null);
    setIsPickerOpen(false);
    setSearchTerm("");
    showToast(`File updated`);
  };

  return (
    <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-800 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className="fa-solid fa-circle-check text-blue-500 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b ${isDark ? 'border-[#1a1a1a]' : 'border-slate-300'}`}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-900/20 text-white">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Schedule File Transfer</h1>
              <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1 font-medium`}>Schedule emails.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            {/* Subject and Message Card */}
            <div className={`border rounded-2xl p-6 space-y-6 shadow-sm transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-3 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Title</label>
                    <input 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full bg-transparent text-lg font-semibold outline-none focus:text-blue-500 transition-all ${isDark ? 'text-white' : 'text-slate-800'}`}
                      placeholder="What are you sending?"
                    />
                </div>
                <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-3 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows="4"
                      className={`w-full border rounded-xl p-4 text-sm outline-none focus:border-blue-500 transition-all resize-none ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                      placeholder="Add a note to your recipients..."
                    />
                </div>
            </div>

            {/* File Selection Card */}
            <div className={`border rounded-2xl p-6 flex flex-col gap-6 min-h-[300px] shadow-sm transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center">
                <div className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Selected HiveDrive File</div>
                {attachedFile && (
                  <button onClick={() => setIsPickerOpen(true)} className="text-[11px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-2">
                    <i className="fa-solid fa-rotate"></i> Change File
                  </button>
                )}
              </div>

              {attachedFile ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className={`group border p-5 rounded-xl flex items-center justify-between transition-all ${isDark ? 'bg-[#0a0a0a] border-blue-500/30 hover:border-blue-500' : 'bg-blue-50/30 border-blue-100 hover:border-blue-400'}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${isDark ? 'bg-[#111]' : 'bg-white shadow-sm'} ${attachedFile.color}`}>
                        <i className={`fa-solid ${attachedFile.icon}`}></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{attachedFile.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{attachedFile.size}</p>
                      </div>
                    </div>
                    <button onClick={removeFile} className="p-2 text-[#444] hover:text-red-500 transition-all">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors ${isDark ? 'border-[#111] text-[#444]' : 'border-slate-200 text-slate-300'}`}>
                    <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4 opacity-20"></i>
                    <p className="text-sm font-bold">No file selected</p>
                    <button onClick={() => setIsPickerOpen(true)} className="mt-6 px-6 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Browse Library</button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Recipients Section */}
            <div>
              <div className={`text-[11px] uppercase font-bold tracking-widest mb-4 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Deliver To</div>
              <div className="flex flex-col gap-3">
                {recipients.map((email, i) => (
                  <div key={i} className={`border px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs group transition-colors shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                    <div className="w-5 h-5 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0">
                      {email ? email[0].toUpperCase() : '?'}
                    </div>
                    <input 
                      value={email} 
                      onChange={(e) => handleEmailChange(i, e.target.value)}
                      placeholder="Recipient email"
                      className={`bg-transparent outline-none flex-1 ${isDark ? 'text-[#808080]' : 'text-slate-600'}`}
                    />
                    <i onClick={() => removeRecipient(i)} className="fa-solid fa-xmark text-[#444] cursor-pointer hover:text-red-500 transition-colors"></i>
                  </div>
                ))}
                <button onClick={addRecipient} className={`border border-dashed p-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${isDark ? 'border-[#333] text-[#808080] hover:text-white hover:border-white' : 'border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-600'}`}>
                  <i className="fa-solid fa-plus"></i> Add Recipient
                </button>
              </div>
            </div>

            {/* Schedule Section */}
            <div>
              <div className={`text-[11px] uppercase font-bold tracking-widest mb-6 ${isDark ? 'text-[#606060]' : 'text-slate-400'}`}>Schedule Properties</div>
              <div className="space-y-5">
                <div>
                    <label className={`text-[10px] font-bold block mb-2 uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Release Date</label>
                    <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className={`w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white' : 'bg-white border-slate-200 text-slate-700'}`} />
                </div>
                <div>
                    <label className={`text-[10px] font-bold block mb-2 uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Release Time</label>
                    <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={`w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white' : 'bg-white border-slate-200 text-slate-700'}`} />
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className={`flex flex-col gap-2 pt-4 border-t ${isDark ? 'border-[#1a1a1a]' : 'border-slate-300'}`}>
              <button 
                onClick={() => { setIsProtected(!isProtected); showToast(isProtected ? "Security Disabled" : "Identity Validation Enabled"); }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                  isProtected ? (isDark ? 'bg-blue-600/10 border-blue-500/50' : 'bg-blue-50 border-blue-200 shadow-sm') : (isDark ? 'bg-transparent border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50')
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid fa-shield-halved ${isProtected ? 'text-blue-500' : 'text-[#444]'}`}></i>
                    <span className={`text-xs font-bold ${!isDark && !isProtected ? 'text-slate-600' : ''}`}>Email Validation</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isProtected ? 'bg-blue-600' : 'bg-[#333]'}`}>
                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isProtected ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                {isProtected && (
                  <p className={`text-[10px] leading-tight font-medium ${isDark ? 'text-blue-400/80' : 'text-blue-600'}`}>
                    Recipients must enter their email to unlock the file.
                  </p>
                )}
              </button>
              
              <button onClick={() => { setAttachedFile(null); showToast("Cleared file"); }} className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 text-xs font-bold text-red-500 mb-6 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-red-50'}`}>
                <i className="fa-solid fa-trash-can"></i> Clear Selection
              </button>

              <button 
                onClick={() => setActiveModal('confirm')}
                disabled={!attachedFile}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 group disabled:opacity-50"
              >
                <span>Schedule Transfer</span>
                <i className="fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- FILE PICKER MODAL --- */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-[800px] h-[600px] rounded-2xl flex flex-col overflow-hidden shadow-2xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-[#1a1a1a] bg-[#050505]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>HiveDrive Library</h2>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Select a file to attach</p>
                </div>
                <button onClick={() => {setIsPickerOpen(false); setSearchTerm("");}} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDark ? 'hover:bg-[#111]' : 'hover:bg-slate-200'}`}>
                  <i className="fa-solid fa-xmark text-[#444]"></i>
                </button>
              </div>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-xs"></i>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your files..."
                  className={`w-full border rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:border-blue-500 transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 no-scrollbar">
              {filteredFiles.map((file) => {
                const isSelected = selectedInPicker?.id === file.id;
                return (
                  <div key={file.id} onClick={() => setSelectedInPicker(file)} className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col gap-3 ${isSelected ? 'bg-blue-600/10 border-blue-500 shadow-sm' : (isDark ? 'bg-[#050505] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-100 hover:border-blue-300 shadow-sm')}`}>
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isDark ? 'bg-[#111]' : 'bg-slate-50'} ${file.color}`}>
                        <i className={`fa-solid ${file.icon}`}></i>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : (isDark ? 'border-[#333]' : 'border-slate-200')}`}>
                        {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                      <p className={`text-[10px] font-bold ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{file.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`p-6 border-t flex justify-end items-center ${isDark ? 'border-[#1a1a1a] bg-[#050505]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex gap-3">
                <button onClick={() => {setIsPickerOpen(false); setSearchTerm("");}} className="px-6 py-2.5 text-xs font-bold text-[#808080]">Cancel</button>
                <button onClick={confirmPickerSelection} disabled={!selectedInPicker} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow-lg shadow-blue-500/20">Confirm Selection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {activeModal === 'confirm' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className={`border w-full max-w-[450px] rounded-2xl p-8 shadow-2xl text-center ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-2xl mb-6 mx-auto border border-blue-500/20">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Ready to Schedule?</h2>
            <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{attachedFile?.name}</span> will be shared with <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{recipients.filter(r => r !== '').length} recipients</span> on {scheduleDate}.
              {isProtected && <span className="block mt-2 text-blue-500 font-bold italic">Protection is enabled.</span>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Go Back</button>
              <button onClick={() => {setActiveModal(null); showToast("Transfer Scheduled Successfully");}} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleMail;