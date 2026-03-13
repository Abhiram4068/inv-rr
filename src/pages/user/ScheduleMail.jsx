import React, { useState, useEffect } from 'react';

const ScheduleMail = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedInPicker, setSelectedInPicker] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const [attachedFiles, setAttachedFiles] = useState([
    { name: "Project_Proposal_2024.pdf", size: "4.2 MB", icon: "fa-file-pdf", color: "text-red-500" },
    { name: "Budget_Sheet.xlsx", size: "1.8 MB", icon: "fa-file-excel", color: "text-emerald-500" }
  ]);
  
  const [recipients, setRecipients] = useState(['']);
  const [subject, setSubject] = useState("Weekly Project Update");
  const [message, setMessage] = useState(""); 
  const [scheduleDate, setScheduleDate] = useState("2026-03-20");
  const [scheduleTime, setScheduleTime] = useState("09:00");

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

  const removeFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    showToast("Attachment removed");
  };

  const togglePickerSelection = (file) => {
    if (selectedInPicker.find(f => f.id === file.id)) {
      setSelectedInPicker(selectedInPicker.filter(f => f.id !== file.id));
    } else {
      setSelectedInPicker([...selectedInPicker, file]);
    }
  };

  const confirmPickerSelection = () => {
    setAttachedFiles([...attachedFiles, ...selectedInPicker]);
    setSelectedInPicker([]);
    setIsPickerOpen(false);
    setSearchTerm("");
    showToast(`${selectedInPicker.length} files added`);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black text-white font-sans relative">
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white text-black px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-blue-600 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 flex flex-col gap-8">
        
        {/* Header (Schedule Button Removed from here) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-900/20">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Schedule File Transfer</h1>
              <p className="text-[#808080] text-sm mt-1 font-medium">Drafting as: user@hivedrive.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setIsStarred(!isStarred);
                showToast(isStarred ? "Removed from Templates" : "Saved as Template");
              }}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                isStarred ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#444] hover:text-white'
              }`}
            >
              <i className={`${isStarred ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 space-y-6">
                <div>
                    <label className="block text-[10px] uppercase text-[#606060] font-bold tracking-widest mb-3">Title</label>
                    <input 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent text-lg font-semibold outline-none focus:text-blue-400 transition-all"
                    placeholder="What are you sending?"
                    />
                </div>
                <div>
                    <label className="block text-[10px] uppercase text-[#606060] font-bold tracking-widest mb-3">Message</label>
                    <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-sm outline-none focus:border-blue-500/30 transition-all resize-none placeholder:text-[#333]"
                    placeholder="Add a note to your recipients..."
                    />
                </div>
            </div>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-6 min-h-[300px]">
              <div className="flex justify-between items-center">
                <div className="text-[10px] uppercase text-[#606060] font-bold tracking-widest">Selected HiveDrive Files</div>
                <button 
                    onClick={() => setIsPickerOpen(true)}
                    className="text-[11px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-2"
                >
                    <i className="fa-solid fa-magnifying-glass"></i> Browse All Files
                </button>
              </div>

              {attachedFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="group bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-xl flex items-center justify-between hover:border-[#333] transition-all">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center text-lg ${file.color}`}>
                          <i className={`fa-solid ${file.icon}`}></i>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold truncate">{file.name}</p>
                          <p className="text-[10px] text-[#444] font-bold">{file.size}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(i)} className="opacity-0 group-hover:opacity-100 p-2 text-[#444] hover:text-red-500 transition-all">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsPickerOpen(true)}
                    className="border-2 border-dashed border-[#1a1a1a] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <i className="fa-solid fa-plus text-[#222] group-hover:text-blue-500"></i>
                    <span className="text-[10px] font-bold text-[#222] group-hover:text-blue-500 uppercase tracking-widest">Add Files</span>
                  </button>
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-[#111] rounded-2xl flex flex-col items-center justify-center text-[#444]">
                    <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4 opacity-20"></i>
                    <p className="text-sm font-bold">No files selected</p>
                    <button onClick={() => setIsPickerOpen(true)} className="mt-6 px-6 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Browse Library</button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="text-[11px] uppercase text-[#606060] font-bold tracking-widest mb-4">Deliver To</div>
              <div className="flex flex-col gap-3">
                {recipients.map((email, i) => (
                  <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs group">
                    <div className="w-5 h-5 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0">
                      {email ? email[0].toUpperCase() : '?'}
                    </div>
                    <input 
                      value={email} 
                      onChange={(e) => handleEmailChange(i, e.target.value)}
                      placeholder="Recipient email"
                      className="bg-transparent outline-none text-[#808080] flex-1 placeholder:text-[#333]"
                    />
                    <i onClick={() => removeRecipient(i)} className="fa-solid fa-xmark text-[#444] cursor-pointer hover:text-white transition-colors"></i>
                  </div>
                ))}
                <button onClick={addRecipient} className="border border-dashed border-[#333] p-2.5 rounded-xl text-[10px] font-bold text-[#808080] hover:text-white hover:border-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                  <i className="fa-solid fa-plus"></i> Add Recipient
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase text-[#606060] font-bold tracking-widest mb-6">Schedule Properties</div>
              <div className="space-y-5">
                <div>
                    <label className="text-[10px] text-[#444] font-bold block mb-2 uppercase">Release Date</label>
                    <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 text-sm outline-none focus:border-blue-500/50 transition-all text-white" />
                </div>
                <div>
                    <label className="text-[10px] text-[#444] font-bold block mb-2 uppercase">Release Time</label>
                    <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 text-sm outline-none focus:border-blue-500/50 transition-all text-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-[#1a1a1a]">
              <button 
                onClick={() => {
                    setIsProtected(!isProtected);
                    showToast(isProtected ? "Security Disabled" : "Identity Validation Enabled");
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                  isProtected ? 'bg-blue-600/10 border-blue-500/50' : 'bg-transparent border-[#1a1a1a] hover:bg-[#111]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid fa-shield-halved ${isProtected ? 'text-blue-500' : 'text-[#444]'}`}></i>
                    <span className="text-xs font-bold">Email Validation</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isProtected ? 'bg-blue-600' : 'bg-[#333]'}`}>
                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isProtected ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                {isProtected && (
                  <p className="text-[10px] text-blue-400/80 leading-tight">
                    Recipients must enter their email to unlock files.
                  </p>
                )}
              </button>
              
              <button onClick={() => { setAttachedFiles([]); showToast("Cleared all files"); }} className="w-full text-left p-3 rounded-xl border border-[#1a1a1a] hover:bg-[#111] text-xs font-bold transition-all flex items-center gap-3 text-red-500 mb-6">
                <i className="fa-solid fa-trash-can"></i> Clear Selection
              </button>

              {/* NEW: Schedule Mail Button (Moved to bottom) */}
              <button 
                onClick={() => setActiveModal('confirm')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group"
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[800px] h-[600px] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#1a1a1a] bg-[#050505]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">HiveDrive Library</h2>
                  <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest mt-1">Select files to attach</p>
                </div>
                <button onClick={() => {setIsPickerOpen(false); setSearchTerm("");}} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#111] transition-colors">
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
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 no-scrollbar">
              {filteredFiles.map((file) => {
                const isSelected = selectedInPicker.find(f => f.id === file.id);
                return (
                  <div key={file.id} onClick={() => togglePickerSelection(file)} className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col gap-3 ${isSelected ? 'bg-blue-600/10 border-blue-500/50' : 'bg-[#050505] border-[#1a1a1a] hover:border-[#333]'}`}>
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center text-lg ${file.color}`}>
                        <i className={`fa-solid ${file.icon}`}></i>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-[#333] group-hover:border-[#555]'}`}>
                        {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-[10px] text-[#444] font-bold">{file.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-[#1a1a1a] flex justify-between items-center bg-[#050505]">
              <span className="text-xs font-bold text-[#444] uppercase tracking-widest">{selectedInPicker.length} Files Selected</span>
              <div className="flex gap-3">
                <button onClick={() => {setIsPickerOpen(false); setSearchTerm("");}} className="px-6 py-2.5 text-xs font-bold text-[#808080]">Cancel</button>
                <button onClick={confirmPickerSelection} disabled={selectedInPicker.length === 0} className="px-6 py-2.5 bg-blue-600 rounded-xl text-xs font-bold disabled:opacity-50">Add to Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {activeModal === 'confirm' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[450px] rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center text-2xl mb-6 mx-auto border border-blue-500/20">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to Schedule?</h2>
            <p className="text-[#808080] text-sm mb-8 leading-relaxed">
              <span className="text-white font-bold">{attachedFiles.length} files</span> will be shared with <span className="text-white font-bold">{recipients.filter(r => r !== '').length} recipients</span> on {scheduleDate}.
              {isProtected && <span className="block mt-2 text-blue-500 font-bold italic">Protection is enabled.</span>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 border border-[#1a1a1a] rounded-xl font-bold text-xs hover:bg-[#111] transition-colors text-[#808080]">Go Back</button>
              <button onClick={() => {setActiveModal(null); showToast("Transfer Scheduled Successfully");}} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all">Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleMail;