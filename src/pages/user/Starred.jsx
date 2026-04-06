import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getStarredFiles } from '../../services/fileService';
import { getStarredCollection } from '../../services/collectionService';


const StarredItems = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
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
  const [toast, setToast] = useState({ visible: false, message: '' });

  // --- THEME SYNC EFFECT ---
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

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // --- HANDLERS ---


  const handleUnstarFolder = (e, id) => {
    e.preventDefault(); 
    setStarredCollections(collection.filter(folder => folder.id !== id));
    showToast("Folder unpinned successfully");
  };
const getFileIcon = (contentType) => {
  if (!contentType) return { icon: "fa-file", color: "#9ca3af" };
  // PDF
  if (contentType.includes("pdf")) {
    return { icon: "fa-file-pdf", color: "#ff4444" };
  }
  // Excel
  if (
    contentType.includes("excel") ||
    contentType.includes("spreadsheet") ||
    contentType.includes("sheet")
  ) {
    return { icon: "fa-file-excel", color: "#00c851" };
  }
  // Word
  if (
    contentType.includes("word") ||
    contentType.includes("document")
  ) {
    return { icon: "fa-file-word", color: "#3b82f6" };
  }
  // Images
  if (contentType.includes("image")) {
   return { icon: "fa-file-image", color: "#22c55e" };
  }
  // Videos
  if (contentType.includes("video")) {
    return { icon: "fa-file-video", color: "#a855f7" };
  }
  return { icon: "fa-file", color: "#9ca3af" };
};
  return (
    <div className={`flex-1 flex overflow-hidden relative transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* --- RECTANGLE PILL TOAST --- */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-800 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className="fa-solid fa-circle-check text-emerald-500 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar">
        
        {/* Search and Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className={`w-full max-w-[450px] border p-[10px_16px] rounded-xl flex items-center transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search Starred Files..." 
              className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} 
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button className={`flex-1 md:flex-none p-[10px_20px] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border ${isDark ? 'bg-[#1a1a1a] text-white border-[#333] hover:opacity-80' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
                <i className="fa-solid fa-filter text-xs"></i> Filter
             </button>
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
  <div className="py-16 text-center">
    <div className={`text-sm font-bold ${isDark ? "text-[#808080]" : "text-slate-500"}`}>
      No starred files found.
    </div>
  </div>
):(
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {starredFiles.map((item) => {
                const { icon, color } = getFileIcon(item.content_type);

                return (
                <Link key={item.id} to={`/file/${item.id}`}>
                <div className={`rounded-lg overflow-hidden transition-all hover:-translate-y-1 group cursor-pointer relative border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:shadow-md'}`}>

                <div 
                className="absolute top-3 right-3 z-20 cursor-pointer"
                onClick={() => handleUnstarItem(item.id)}
                >
                <i className="fa-solid fa-star text-[#f59e0b] hover:scale-125 transition-transform"></i>
                </div>

                <div className={`h-[140px] flex items-center justify-center relative border-b ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'}`}>
                <i 
                className={`fa-solid ${icon} text-[40px] absolute z-10 group-hover:scale-110 transition-transform`} 
                style={{ color }}
                ></i>
                </div>

                <div className="p-4">
                <span className={`block text-sm font-bold mb-2 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
                {item.original_name}
                </span>

                <div className={`flex justify-between text-[12px] ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                <span> {item.created_at}</span>
                <span>{item.file_size}</span>
                </div>
                </div>

                </div>
                </Link>
                );
                })}
          </div>
)
}

          
          {/* VIEW ALL STARRED FILES LINK */}
          <div className="mt-4">
            <Link to="/starred-files" className={`text-sm font-medium hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              View all starred files
            </Link>
          </div>
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
  <div className="py-16 text-center">
    <div className={`text-sm font-bold ${isDark ? "text-[#808080]" : "text-slate-500"}`}>
      No starred collections found.
    </div>
  </div>
):(
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {starredCollections.map((collection) => (
              <Link key={collection.id} to="/viewcollection">
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
          <div className="mt-4">
            <Link to="/starred-folders" className={`text-sm font-medium hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              View all starred Collections
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StarredItems;