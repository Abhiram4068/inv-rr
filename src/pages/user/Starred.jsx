import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getStarredFiles } from '../../services/fileService';
import { getStarredCollection } from '../../services/collectionService';
import { getFileMeta } from '../../utils/fileIcons';
import FileCard from '../../components/FileCard';

const StarredItems = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // --- STATE FOR STARRED ITEMS ---
  const [starredFiles, setStarredFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [errorFiles, setErrorFiles] = useState("");


  const [ starredCollections, setStarredCollections ] = useState([])
  const [ loadingCollections, setLoadingCollections ] = useState(true)
  const [ errorCollections, setErrorCollections ] = useState("")

  useEffect(()=>{
    const fetchStarredFiles=async ()=>{
      try{
        setLoadingFiles(true);
        const res = await getStarredFiles()
        setStarredFiles(Array.isArray(res.data) ? res.data : []);
      }catch(err){
        if (!err.response) {
          setErrorFiles("Server is unavailable. Please try again later.");
        } else if (err.response.status >= 500) {
          setErrorFiles("Server error. Please try again later.");
        } else if (err.response.status === 404) {
          setErrorFiles("No files found.");
        } else {
          setErrorFiles(err.response.data?.detail || "Something went wrong.");
        }
      }finally{
         setLoadingFiles(false)
      }
    }

    const fetchStarredCollections=async()=>{
      try{
        setLoadingCollections(true);
        const res=await getStarredCollection();
        setStarredCollections(Array.isArray(res.data) ? res.data : []);
      }catch(err){
        if (!err.response) {
          setErrorCollections("Server is unavailable. Please try again later.");
        } else if (err.response.status >= 500) {
          setErrorCollections("Server error. Please try again later.");
        } else if (err.response.status === 404) {
          setErrorCollections("No Collections found.");
        } else {
          setErrorCollections(err.response.data?.detail || "Something went wrong.");
        }
      }finally{
         setLoadingCollections(false)
      }
    }
    fetchStarredFiles();
    fetchStarredCollections();
  },[]);


  // --- TOAST STATE ---
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  // --- THEME SYNC EFFECT ---
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

  // --- HANDLERS ---


  const handleUnstarFolder = (e, id) => {
    e.preventDefault(); 
    setStarredCollections(prev => prev.filter(folder => folder.id !== id));
    showToast("Folder unpinned successfully");
  };

  const handleFileToggleStar = (fileId, newState) => {
    if (!newState) {
      setStarredFiles(prev => prev.filter(f => f.id !== fileId));
      showToast("Removed from Starred");
    }
  };
  return (
    <div className={`flex-1 flex overflow-hidden relative transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#EFEFEF]'}`}>
      
      {/* Professional Top-Sliding Toast */}
      {toast.visible && (
        <div 
          className={`fixed top-6 left-0 right-0 flex justify-center z-[10000] pointer-events-none
            transition-all duration-[350ms]
            ${toast.animateOut 
              ? 'opacity-0 -translate-y-6 scale-95' 
              : 'opacity-100 translate-y-0 scale-100'
            }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animation: !toast.animateOut ? 'slideDownProfessional 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar">
        {/* --- HEADER --- */}
<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
  <div>
    <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
      Starred Items
    </h1>

    <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1`}>
      Manage your important starred files and collections.
    </p>
  </div>
</div>
        
        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-0 ">
          <div className={`w-full max-w-[450px] p-[10px_16px] rounded-xl flex items-center transition-all `}>
            
          </div>
        </div>

        {/* SECTION: Starred Documents */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[18px] md:text-[20px] font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
               Starred Files
            </div>
            <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-xs`}>{starredFiles.length} Item(s) Total</div>
          </div>
          <hr className={`border-0 border-t mb-6 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`} />
{loadingFiles?(
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
) : errorFiles? (
    <div className="py-16 text-center">
    <div className={`text-sm font-bold ${isDark ? "text-[#ff6b6b]" : "text-red-600"}`}>
      {errorFiles}
    </div>
  </div>
):starredFiles.length === 0?(
  <div className="py-16 flex flex-col items-center justify-center gap-4">
    <div className={`text-sm font-bold ${isDark ? "text-[#808080]" : "text-slate-500"}`}>
      No starred files found.
    </div>
    <Link
      to="/files"
      className="inline-flex items-center gap-2 text-blue-400 px-5 py-2.5 text-sm font-semibold transition-all hover:underline"
    >
      <i className="fa-solid fa-folder-open"></i>
      Browse Files
    </Link>
  </div>
):(
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
{starredFiles.map((item) => (
  <FileCard
    key={item.id}
    id={item.id}
    title={item.original_name}
    display_name={item.display_name || item.description || "Untitled"}
    size={item.file_size}
    time={item.created_at}
    isLink={true}
    fileUrl={item.file_url}
    contentType={item.content_type}
    isStarred={true}
    onToggleStar={handleFileToggleStar}
    onDeleted={(fileId) => {
      setStarredFiles(prev => prev.filter(f => f.id !== fileId));
      showToast("File moved to trash");
    }}
  />
))}
          </div>
)
}

          
{/* VIEW ALL STARRED FILES LINK */}
{starredFiles.length > 0 && (
  <div className="mt-4">
    <Link to="/starred-files" className={`text-sm font-medium hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
      View all starred files
    </Link>
  </div>
)}
        </div>

        {/* SECTION: Pinned Collections */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[18px] md:text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Starred Collections</div>
                      <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-xs`}>{starredCollections.length} Item(s) Total</div>
          </div>
          <hr className={`border-0 border-t mb-6 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`} />

         
{loadingCollections?(
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
) : errorCollections? (
    <div className="py-16 text-center">
    <div className={`text-sm font-bold ${isDark ? "text-[#ff6b6b]" : "text-red-600"}`}>
      {errorCollections}
    </div>
  </div>
):starredCollections.length === 0?(
  <div className="py-16 flex flex-col items-center justify-center gap-4">
    <div className={`text-sm font-bold ${isDark ? "text-[#808080]" : "text-slate-500"}`}>
      No starred collections found.
    </div>
    <Link
      to="/collections"
className="inline-flex items-center gap-2 text-blue-400 px-5 py-2.5 text-sm font-semibold transition-all hover:underline"    >
      <i className="fa-solid fa-layer-group"></i>
      Browse Collections
    </Link>
  </div>
):(
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {starredCollections.map((collection) => (
              <Link key={collection.id} to={`/viewcollection/${collection.id}/`}>
                <div className={`rounded-lg p-4 flex items-center justify-between transition-all cursor-pointer group border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:shadow-sm'}`}>
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-folder text-2xl text-[#3b82f6]"></i>
                    <div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{collection.name}</div>
                      <div className={`text-[11px] ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>{collection.total_files} item(s)</div>
                    </div>
                  </div>
                  <i 
                    className="fa-solid fa-star text-[#f59e0b] text-xs cursor-pointer p-2 hover:scale-125 transition-transform"
                    onClick={(e) => handleUnstarFolder(e, collection.id)}
                  ></i>
                </div>
              </Link>
            ))}
          </div>
)}
{/* VIEW ALL STARRED FOLDERS LINK */}
{starredCollections.length > 0 && (
  <div className="mt-4">
    <Link to="/starred-collections" className={`text-sm font-medium hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
      View all starred Collections
    </Link>
  </div>
)}
          
        </div>
      </main>
    </div>
  );
};

export default StarredItems;