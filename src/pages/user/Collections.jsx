import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getCollections } from '../../services/collectionService';

const Collections = () => {
  // 1. Theme State Sync Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');

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

  const [collections, setCollections]=useState([]);
  const [totalCollections, setTotalCollections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(()=>{
const fetchCollections=async () =>{
  try{
    setLoading(true);
    const res = await getCollections()
    setCollections(res.data.collections);
    setTotalCollections(res.data.total_collections);    
  }catch{
    setError("Failed to fetch collections");
  }finally{
    setLoading(false)
  }
};
fetchCollections();
},[]);
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};
  const handleCreate = () => {
    if (!collectionName) {
      alert("Please enter a collection name.");
      return;
    }
    alert(`Success! Collection "${collectionName}" has been created.`);
    setModalOpen(false);
    setCollectionName('');
    setCollectionDesc('');
  };

  return (
    /* Main Background: bg-black for dark, bg-[#E6EBF2] for light */
    <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      <div className="p-6 lg:p-[24px_40px]">
        
        {/* HEADER ACTION ROW */}
        <div className="flex justify-between items-center mb-[30px] gap-4">
          <div className={`flex-1 max-w-[450px] border px-4 py-[10px] rounded-[12px] flex items-center shadow-sm transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search Drive" 
              className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
            />
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-[#3b82f6] text-white px-5 py-[10px] rounded-[10px] font-semibold text-sm flex items-center gap-[10px] whitespace-nowrap hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
          >
            <i className="fa fa-folder-plus"></i> New Collection
          </button>
        </div>

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className={`text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Collections</div>
          <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm`}>{totalCollections} collections</div>
        </div>

{/* FOLDER GRID */}
{loading ? (
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
) : error ? (
  <div className="py-16 text-center">
    <div className={`text-sm font-bold ${isDark ? "text-[#ff6b6b]" : "text-red-600"}`}>
      {error}
    </div>
  </div>
) : collections.length === 0 ? (
  <div className="py-16 text-center">
    <div className={`text-sm font-bold ${isDark ? "text-[#808080]" : "text-slate-500"}`}>
      No collections found.
    </div>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
    {collections.map((folder) => (
      <Link 
        key={folder.id} 
        to={`/viewcollection/${folder.id}`}
        className={`border p-4 rounded-[11px] flex items-center gap-4 transition-all group ${
          isDark 
          ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111] hover:border-[#333]' 
          : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
        }`}
      >
        <i className="fa-solid fa-folder text-2xl text-[#3b82f6]"></i>
        <div className="flex flex-col overflow-hidden">
          <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
            {folder.name}
          </span>
          <span className={`text-[11px] mt-[2px] ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
            {folder.total_files} files • {folder.total_size ? formatSize(folder.total_size) : "0 B"}
          </span>
        </div>
      </Link>
    ))}
  </div>
)}

      </div>

      {/* NEW COLLECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[4px] flex justify-center items-center z-[2000] p-4">
          <div className={`border w-full max-w-[420px] p-6 rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            
            <div className={`flex justify-between items-center mb-6 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <span>Create New Collection</span>
              <i 
                className="fa-solid fa-xmark text-[#808080] cursor-pointer hover:text-white transition-colors" 
                onClick={() => setModalOpen(false)}
              ></i>
            </div>

            <div className="mb-5">
              <label className={`block text-[11px] mb-2 uppercase tracking-[0.5px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Collection Name</label>
              <input 
                type="text" 
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. Brand Guidelines"
                className={`w-full border rounded-lg p-3 outline-none transition-colors ${
                  isDark 
                  ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="mb-5">
              <label className={`block text-[11px] mb-2 uppercase tracking-[0.5px] font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Description</label>
              <textarea 
                rows="3" 
                value={collectionDesc}
                onChange={(e) => setCollectionDesc(e.target.value)}
                placeholder="What's inside this collection?"
                className={`w-full border rounded-lg p-3 outline-none transition-colors resize-none ${
                  isDark 
                  ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                }`}
              ></textarea>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                className={`flex-1 border py-3 rounded-lg font-semibold transition-all ${
                  isDark 
                  ? 'bg-transparent text-[#808080] border-[#1a1a1a] hover:bg-[#111] hover:text-white' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-[2] bg-[#3b82f6] text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-opacity"
                onClick={handleCreate}
              >
                Create Collection
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
    
  );
  
};

export default Collections;