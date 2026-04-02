import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { updateFile, getFileById,  archiveFile, deleteFile} from '../../services/fileService';
import { useNavigate } from 'react-router-dom';


const FileDetails = () => {

  const { id } = useParams();
  const navigate=useNavigate()
  //states for file list handling
  const [file, setFile] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setLoading] = useState(true);

  //states for file update handling
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");


  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await getFileById(id);
        setFile(res.data);
        console.log(res.data);
        setIsStarred(res.data.is_starred);
        setFileData({
          display_name: res.data.display_name || "Untitled",
          original_name: res.data.original_name || "Untitled",
          description: res.data.description || "No description available."
        });
        setTempName(res.data.display_name || "");
        setTempDesc(res.data.description || "");
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);


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
    original_name: "",
    description: "",
    display_name: "",
  });

  const [tempName, setTempName] = useState(fileData.display_name);
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

const saveDetails = async () => {
  setSaveLoading(true);
  setSaveError("");
  try {
    const res = await updateFile(id, { display_name: tempName, description: tempDesc });
    setFile(prev => ({ ...prev, ...res.data }));
    
    setFileData({
      display_name: tempName,
      original_name: fileData.original_name,
      description: tempDesc
    });
    setActiveModal(null);
    showToast("File details updated successfully");
  } catch (error) {
    setSaveError(error.message);
  } finally {
    setSaveLoading(false);
  }
}

  const handleShare = () => {
    setActiveModal(null);
    showToast(`File shared with ${recipients.filter(r => r !== '').length} recipients`);
  };

  const handleArchive = async() => {
    try{
      await archiveFile(id);
      setActiveModal(null);
      showToast("File moved to archive");
      navigate("/files");
    }catch(error){
      showToast("Failed to move file to archive");
    }
    
  };

  const handleDelete = async () => {
    try{
      await deleteFile(id);
      setActiveModal(null);
      showToast("File moved to trash");
      navigate("/files");
    }catch(error){
      showToast("Failed to move file to trash");
    }
    
  };
  const sizeFormatter = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "-";
      if (trimmed.includes("MB") || trimmed.includes("KB") || trimmed.includes("GB")) return trimmed;
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return sizeFormatter(parsed);
      return trimmed;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) return "-";

    const mb = value / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = value / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const timeFormatter = (isoOrDate) => {
    if (!isoOrDate) return "-";
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);

    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const iconClassForFile = (f) => {
    const name = f?.original_name || "";
    const ct = f?.content_type || "";
    const lower = String(name).toLowerCase();

    if (lower.endsWith(".pdf") || String(ct).includes("pdf")) return "fa-file-pdf";
    if ((lower.endsWith(".doc") || lower.endsWith(".docx")) || String(ct).includes("word")) return "fa-file-word";
    if ((lower.endsWith(".xls") || lower.endsWith(".xlsx")) || String(ct).includes("excel")) return "fa-file-excel";
    if ((lower.endsWith(".ppt") || lower.endsWith(".pptx")) || String(ct).includes("powerpoint")) return "fa-file-powerpoint";
    if ((lower.endsWith(".zip") || lower.endsWith(".rar")) || String(ct).includes("zip")) return "fa-file-zipper";
    if (/\.(png|jpe?g|gif|webp)$/.test(lower) || String(ct).includes("image")) return "fa-file-image";
    if (/\.(mp4|mov|mkv|webm)$/.test(lower) || String(ct).includes("video")) return "fa-file-video";
    if (lower.endsWith(".txt") || String(ct).includes("text")) return "fa-file-lines";
    return "fa-file";
  };

  const getFileDocType = (f) => {
    const name = f?.original_name || "";
    const lower = String(name).toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF Document";
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "Word Document";
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "Excel Spreadsheet";
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "Image";
    return "File";
  };

  if (fetchLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (fetchError) return (
    <div className="flex-1 flex items-center justify-center text-red-500 text-sm font-bold">
      {fetchError}
    </div>
  );
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
              <i className={`fa-solid ${iconClassForFile(file)}`}></i>
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.display_name}</h1>
              <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1 font-medium`}>Uploaded by you • {getFileDocType(file)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newState = !isStarred;
                setIsStarred(newState);
                showToast(newState ? "Added to Favorites" : "Removed from Favorites");
              }}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${isStarred
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
                  { label: "Original Name", val: fileData.original_name || "-" },
                { label: "Size", val: sizeFormatter(file?.file_size) },
                { label: "Created", val: file?.created_at ? new Date(file.created_at).toLocaleDateString() : "-" },
                { label: "Modified", val: timeFormatter(file?.updated_at || file?.created_at) }
                ].map((prop, i) => (
                  <div key={i} className={`flex justify-between items-center ${i !== 3 ? (isDark ? 'border-b border-[#111] pb-3' : 'border-b border-slate-100 pb-3') : ''}`}>
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
                            className={`w-full h-[46px] flex items-center justify-between px-4 rounded-xl border transition-all ${isProtected ? 'bg-blue-600/10 border-blue-500/50' : 'bg-[#111] border-[#1a1a1a] hover:bg-[#151515]'
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
                        <span className="text-[9px]  text-[#808080] font-mono uppercase tracking-tighter">
                          {isProtected ? 'Identity Check ON' : 'Encryption Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeModal === 'edit' && (
              <>
                <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Display Name</label>
                    <input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      type="text"
                      className={`w-full border rounded-xl p-3 text-sm outline-none transition-all ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Description</label>
                    <textarea
                      value={tempDesc}
                      onChange={(e) => setTempDesc(e.target.value)}
                      rows="4"
                      className={`w-full border rounded-xl p-3 text-sm outline-none resize-none transition-all ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {saveError && (
                  <div className="mt-4 flex items-center gap-2 text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => { setActiveModal(null); setSaveError(""); }}
                    className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveDetails}
                    disabled={saveLoading}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {saveLoading && (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
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