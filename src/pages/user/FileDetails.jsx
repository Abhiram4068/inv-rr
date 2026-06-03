import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { updateFile, getFileById,  archiveFile, deleteFile, getFileViewUrl, downloadFile} from '../../services/fileService';
import ShareModal from '../../components/ShareModal';
import { getCollections, addFileToCollection } from '../../services/collectionService';
import { useNavigate } from 'react-router-dom';
import { getFileMeta } from '../../utils/fileIcons';

const FileDetails = () => {

  const { id } = useParams();
  const navigate=useNavigate()


  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  //states for file list handling
  const [file, setFile] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setLoading] = useState(true);
  const [showAllShares, setShowAllShares] = useState(false);

  //states for file update handling
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");


  const fetchFile = async () => {
    try {
      const res = await getFileById(id);
      setFile(res.data);
      console.log(res.data);
      setIsStarred(res.data.is_starred);
      setFileData({
        display_name: res.data.display_name || res.data.original_name,
        original_name: res.data.original_name,
        description:
          res.data.description || "You haven't added any description yet."
      });
      setTempName(res.data.display_name || "");
      setTempDesc(res.data.description || "");
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [id]);

useEffect(() => {
  if (!file?.file_url) return;
  const ct = file.content_type || '';
  if (!ct.startsWith('image/') && ct !== 'application/pdf') return;

  setPreviewLoading(true);
  setPreviewError(false);

  // The file_url is now a Supabase Signed URL, so we can use it directly
  setPreviewUrl(file.file_url);
  setPreviewLoading(false);

  return () => {
    setPreviewUrl(null);
  };
}, [file?.file_url]);
  // Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'light');
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
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });


  // State for File Data
  const [fileData, setFileData] = useState({
    original_name: "",
    description: "",
    display_name: "",
  });

  const [collections, setCollections] = useState([]);
  const [organizeSearch, setOrganizeSearch] = useState("");
  const [organizeLoading, setOrganizeLoading] = useState(false);
  const [collectionsPage, setCollectionsPage] = useState(1);
const [collectionsTotalPages, setCollectionsTotalPages] = useState(1);

  const [tempName, setTempName] = useState(fileData.display_name);
  const [tempDesc, setTempDesc] = useState(fileData.description);

const showToast = (msg, type = 'success') => {
  setToast({ visible: true, message: msg, type: type, animateOut: false });
};
  // Toast auto-dismiss with clean slide-up exit animation
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, animateOut: true }));
        setTimeout(() => {
          setToast({ visible: false, message: '', type: 'success', animateOut: false });
        }, 350);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

const fetchCollections = async (page = 1) => {
  setOrganizeLoading(true);
  try {
    const res = await getCollections("", "created_at", "desc", page);
    setCollections(res.data.results || []);
    setCollectionsTotalPages(Math.ceil(res.data.count / 12));
  } catch (error) {
    showToast("Failed to load collections");
  } finally {
    setOrganizeLoading(false);
  }
};

useEffect(() => {
  if (activeModal === 'organize') {
    fetchCollections(1);
    setCollectionsPage(1);
  }
}, [activeModal]);

const handleShareSuccess = (message) => {
  setActiveModal(null);

  setTimeout(() => {
    showToast(message || "File shared successfully");
  }, 150);

  fetchFile();
};
const saveDetails = async () => {
  setSaveLoading(true);
  setSaveError("");
    if (!tempName || tempName.trim() === "") {
    setSaveError("Display name cannot be empty.");
    setSaveLoading(false);
    return;
  }
  try {
    const res = await updateFile(id, { display_name: tempName, description: tempDesc?.trim() ? tempDesc.trim() : null });
    setFile(prev => ({ ...prev, ...res.data }));
    
    setFileData({
      display_name: tempName,
      original_name: fileData.original_name,
      description: tempDesc?.trim() ? tempDesc : "You haven't added any description yet."
    });
    setActiveModal(null);
    fetchFile()
    showToast("File details updated successfully");
  } catch (error) {
    console.log(error.response?.data.display_name);
    setSaveError(error.response?.data?.display_name?.[0])
  } finally {
    setSaveLoading(false);
  }
}

  const handleArchive = async() => {
    try{
      await archiveFile(id);
      setActiveModal(null);
      navigate("/files", { state: { toast: { message: "File moved to archive", type: "success" } } });
    }catch(error){
      showToast("Failed to move file to archive");
    }
  };
  const handleToggleStar = async () => {
    try {
      const newState = !isStarred;

      await updateFile(id, { is_starred: newState });

      setIsStarred(newState);
      showToast(newState ? "Added to Favorites" : "Removed from Favorites");

    } catch (error) {
      console.error("Failed to update star:", error);
      showToast("Failed to update favorite");
    }
  };
  const handleDelete = async () => {
    try{
      await deleteFile(id);
      setActiveModal(null);
      navigate("/files", { state: { toast: { message: "File moved to trash", type: "success" } } });
    }catch(error){
      showToast("Failed to move file to trash");
    }
  };

  const handleOrganize = async (collectionId) => {
    try {
      await addFileToCollection(collectionId, id);
      showToast("File added to collection");
      setActiveModal(null);
    } catch (error) {
      const msg = error.response?.data?.detail || "Failed to add to collection";
      showToast(msg);
    }
  };

const handleOpenFile = (e) => {
  e.preventDefault();

  if (!file?.file_url) {
    showToast("File URL not available", 2000, "error");
    return;
  }

  showToast("Opening file...", 2000);
  window.open(file.file_url, '_blank');
};

const handleDownload = async () => {
  try {
    if (!file?.file_url) {
      showToast("File URL not available", 1000, "error");
      return;
    }
    showToast("Preparing download...", 2000);
    
    // Fetch directly from the Supabase signed URL to avoid hitting the backend
    const res = await fetch(file.file_url);
    if (!res.ok) throw new Error("Network response was not ok");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file?.original_name || "downloaded_file");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    showToast("Download started", 1000);
  } catch (error) {
    showToast("Download failed", 1000, "error");
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

  const getFileDocType = (f) => {
    const name = f?.original_name || "";
    const lower = String(name).toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF Document";
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "Word Document";
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "Excel Spreadsheet";
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "Image";
    if (lower.endsWith(".zip") || lower.endsWith(".rar")) return "Zip File";
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
  const fileMeta = getFileMeta(file?.content_type || "");
  return (
    <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'}`}>

      {/* Professional Top-Sliding Toast */}
      {toast.visible && (
        <div 
          className={`fixed top-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none
          transition-all duration-[350ms]
          ${toast.animateOut 
            ? 'opacity-0 -translate-y-6 scale-95' 
            : 'opacity-100 translate-y-0 scale-100'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animation: !toast.animateOut ? 'slideDownProfessional 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
            pointerEvents: 'none'
          }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
            ${isDark 
              ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' 
              : 'bg-white border-slate-100 text-slate-800'}`}>
            
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error' 
                ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500') 
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')
              }`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
            </div>
            
            <span className="flex-1 leading-normal tracking-wide text-[13px]">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDownProfessional {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10 flex flex-col gap-8">
<div className="flex items-center gap-4">
    <button onClick={() => window.history.back()} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-[#111] text-[#808080] hover:text-white' : 'hover:bg-white text-slate-400 hover:text-slate-800 shadow-sm'}`}>
      <i className="fa-solid fa-arrow-left text-sm"></i>
    </button>
    <nav className="flex items-center gap-2 text-sm text-[#808080]">
      <span onClick={() => navigate('/files')} className="hover:text-blue-500 cursor-pointer transition-colors">Files</span>
      <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{fileData.display_name}</span>
    </nav>
  </div>
        {/* Top Header Section */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ color: fileMeta.color }}>
            <i className={`fa-solid ${fileMeta.icon}`}></i>          
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{fileData.display_name}</h1>
              <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1 font-medium`}>Uploaded by you • {getFileDocType(file)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStar}
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
            <button 
              onClick={() => setActiveModal('organize')}
              className={`flex-1 md:flex-none px-5 py-2.5 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
            >
              <i className="fa-solid fa-folder-plus"></i> Organize
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
<div className={`aspect-video border rounded-lg flex flex-col items-center justify-center overflow-hidden transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-[#444]' : 'bg-white border-slate-200 text-slate-300'}`}>
  {previewLoading ? (
    <div className="flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs">Loading preview...</span>
    </div>
  ) : previewError ? (
    <div className="flex flex-col items-center gap-3">
      <i className="fa-solid fa-triangle-exclamation text-3xl text-yellow-500 opacity-60"></i>
      <span className="text-xs font-medium">Failed to load preview</span>
    </div>
  ) : previewUrl && file?.content_type?.startsWith('image/') ? (
    <img src={previewUrl} alt={fileData.display_name} className="max-h-full max-w-full object-contain" />
  ) : previewUrl && file?.content_type === 'application/pdf' ? (
    <iframe src={`${previewUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-none" title="PDF Preview" />
  ) : (
    <div className="flex flex-col items-center gap-3">
      <i className="fa-solid fa-eye-slash text-4xl opacity-30"></i>
      <span className="text-sm font-medium">Preview not available for this file type</span>
    </div>
  )}
</div>

            <div className={` p-6 transition-colors`}>
              <div className={`text-[11px] uppercase font-bold tracking-widest mb-4 pb-2 border-b ${
    isDark ? 'text-[#606060] border-[#1a1a1a]' : 'text-slate-400 border-slate-100'
  }`}>
    Description
  </div>
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
              <button onClick={handleOpenFile} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}><i className="fa-solid fa-eye opacity-50"></i> Open File</button>
              <button onClick={handleDownload} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-3 ${isDark ? 'border-[#1a1a1a] hover:bg-[#111]' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}><i className="fa-solid fa-download opacity-50"></i> Download</button>
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
{(file?.shares || []).length === 0 && (
  <p className={`text-xs ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Not shared with anyone yet.</p>
)}

{(showAllShares ? (file?.shares || []) : (file?.shares || []).slice(0, 3)).map((share) => (
  <div key={share.id} className={`border px-4 py-2 rounded-full flex items-center gap-3 text-xs transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
    <div className="w-5 h-5 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center text-[8px] font-bold">
      {share.recipient_email[0].toUpperCase()}
    </div>
    <span className={`${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>{share.recipient_email}</span>
  </div>
))}

{(file?.shares || []).length > 3 && !showAllShares && (
  <button onClick={() => setShowAllShares(true)} className={`border px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]' : 'border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-400'}`}>
    +{(file?.shares || []).length - 3} more
  </button>
)}

{showAllShares && (file?.shares || []).length > 3 && (
  <button onClick={() => setShowAllShares(false)} className={`border px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]' : 'border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-400'}`}>
    Show less
  </button>
)}

<button onClick={() => setActiveModal('share')} className={`border border-dashed px-4 py-2 rounded-full text-xs transition-all flex items-center gap-2 ${isDark ? 'border-[#333] text-[#808080] hover:text-white hover:border-white' : 'border-slate-300 text-slate-400 hover:text-blue-600 hover:border-blue-600'}`}>
  <i className="fa-solid fa-plus"></i> Add Person
</button>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
          {activeModal === 'share' ? (
            <ShareModal
              isOpen={true}
              onClose={() => setActiveModal(null)}
              fileIds={[id]}
              fileNames={[fileData.display_name]}
              isBulk={false}
              isDark={isDark}
              onShareSuccess={handleShareSuccess}
            />
          ) : (
            <div className={`border w-full max-w-[450px] rounded-lg p-8 shadow-2xl transition-colors ${isDark ? 'bg-[#111111] border-[#2a2a2a] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              {activeModal === 'edit' && (
              <>
                <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`} >Display Name</label>
                    <input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      type="text"
                      placeholder="Identify your file with a display name."
                      className={`w-full border rounded-xl p-3 text-sm outline-none transition-all ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`} >Description</label>
                    <textarea
                      value={tempDesc}
                      onChange={(e) => setTempDesc(e.target.value)}
                      rows="4"
                      placeholder="Description for your file."
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

            {activeModal === 'organize' && (
              <div className="flex flex-col h-full max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
               <div>
  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Add to Collection</h2>
  <p className={`text-[11px] mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
</div>
                  <button onClick={() => setActiveModal(null)} className={`text-sm ${isDark ? 'text-[#444] hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <i className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-[#444]' : 'text-slate-400'}`}></i>
                  <input
                    type="text"
                    placeholder="Search collections..."
                    value={organizeSearch}
                    onChange={(e) => setOrganizeSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs outline-none transition-all ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                  />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar min-h-[300px]">
                  {organizeLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#444]">Loading Collections</span>
                    </div>
                  ) : collections.filter(c => c.name.toLowerCase().includes(organizeSearch.toLowerCase())).length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 content-start">
                      {collections
                        .filter(c => c.name.toLowerCase().includes(organizeSearch.toLowerCase()))
                        .map((col) => (
                          <button
                            key={col.id}
                            onClick={() => handleOrganize(col.id)}
className={`w-full text-left p-4 rounded-xl border flex items-center justify-between group transition-all ${
  isDark
    ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40'
    : 'bg-blue-50/60 border-blue-200 hover:border-blue-400 hover:bg-blue-100/70'
}`}                          >
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div
className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-colors ${
  isDark
    ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300'
    : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:text-blue-700'
}`}                               >
                                <i className="fa-solid fa-folder"></i>
                              </div>
                              <div className="truncate">
                                <p className={`text-xs font-bold truncate transition-colors ${isDark ? 'text-white' : 'text-slate-700 group-hover:text-blue-700'}`}>{col.name}</p>
                                <p className={`${isDark ? 'text-[#444]' : 'text-slate-400'} text-[10px] mt-0.5 truncate`}>{col.total_files || 0} items</p>
                              </div>
                            </div>
                            <i className={`fa-solid fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 flex-shrink-0 transition-all ${isDark ? 'text-[#333]' : 'text-blue-300'}`}></i>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                      <i className="fa-solid fa-folder-open text-3xl mb-4"></i>
                      <p className="text-xs font-medium">No collections found</p>
                    </div>
                  )}
                </div>
<div className="mt-6 pt-6 border-t border-[#1a1a1a] flex flex-col gap-3">
  <div className="flex items-center justify-between gap-2">
    <button
      disabled={collectionsPage === 1}
      onClick={() => { const p = collectionsPage - 1; setCollectionsPage(p); fetchCollections(p); }}
      className={`flex-1 py-2 border rounded-xl font-bold text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
    >
      <i className="fa-solid fa-chevron-left mr-1"></i> Prev
    </button>
    <span className={`text-[10px] font-bold ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{collectionsPage} / {collectionsTotalPages}</span>
    <button
      disabled={collectionsPage === collectionsTotalPages}
      onClick={() => { const p = collectionsPage + 1; setCollectionsPage(p); fetchCollections(p); }}
      className={`flex-1 py-2 border rounded-xl font-bold text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
    >
      Next <i className="fa-solid fa-chevron-right ml-1"></i>
    </button>
  </div>
  <div className="flex gap-3">
    <button onClick={() => setActiveModal(null)} className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-red-600 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-red-600 hover:text-white'}`}>Close</button>
    <button onClick={() => navigate('/collections')} className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-blue-600/10 text-blue-500 border border-blue-500/30 hover:bg-blue-600 hover:text-white' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white'}`}>View all collections</button>
  </div>
</div>
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
);
};

export default FileDetails;