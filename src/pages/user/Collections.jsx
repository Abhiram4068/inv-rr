import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getCollections, createCollection } from '../../services/collectionService';

const Collections = () => {
  // 1. Theme State Sync Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'grid'); // 'grid' or 'list'

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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

useEffect(()=>{
const fetchCollections=async () =>{
  try{
    setLoading(true);
    const res = await getCollections(search, sortBy, sortOrder)
    setCollections(res.data.collections);
    setTotalCollections(res.data.total_collections);    
  }catch{
    setError("Failed to fetch collections");
  }finally{
    setLoading(false)
  }
};
fetchCollections();
},[search, sortBy, sortOrder]);

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

const handleCreate=async()=>{
  if(!collectionName.trim()){
    alert("Enter the collection name!")
    return;
  }
  try{
    setLoading(true)
    const payload={
      name: collectionName,
      description: collectionDesc
    };
    await createCollection(payload);
    const res=await getCollections(search, sortBy, sortOrder);
    setCollections(res.data.collections);
    setTotalCollections(res.data.total_collections); 
    setModalOpen(false);
    setCollectionName('');
    setCollectionDesc('');
  }catch(err){
    console.error(err);
    setError("Failed to create collection");
  }finally{
    setLoading(false);
  }
};

  return (
    <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      <div className="p-6 lg:p-[24px_40px]">
        
        {/* HEADER ACTION ROW */}
        <div className="flex justify-between items-center mb-[30px] gap-4">
          <div className={`flex-1 max-w-[450px] border px-4 py-[10px] rounded-[12px] flex items-center shadow-sm transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
        <input 
        type="text"
        placeholder="Search Collections"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
      />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const next = viewMode === 'grid' ? 'list' : 'grid';
                setViewMode(next);
                localStorage.setItem('viewMode', next);
              }}
              className={`p-[10px] rounded-[10px]  transition-all ${isDark ? ' text-[#808080] hover:text-white' : 'text-slate-500 hover:text-blue-500'}`}
              title={viewMode === 'grid' ? "Switch to List View" : "Switch to Grid View"}
            >
              <i className={`fa-solid ${viewMode === 'grid' ? 'fa-list' : 'fa-grip'}`}></i>
            </button>

            <button 
              onClick={() => setModalOpen(true)}
              className="bg-[#3b82f6] text-white px-5 py-[10px] rounded-[10px] font-semibold text-sm flex items-center gap-[10px] whitespace-nowrap hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
              <i className="fa fa-folder-plus"></i> New Collection
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className={`text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Collections</div>
          <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm`}>{totalCollections} collection(s)</div>
        </div>
<div className="flex items-center gap-2 mb-5 flex-wrap">
  {[
    { label: "Date Created", value: "created_at" },
    { label: "Name", value: "name" },
    { label: "Size", value: "total_size" },
    { label: "Files", value: "total_files" },
  ].map((opt) => (
    <button
      key={opt.value}
      onClick={() => {
        if (sortBy === opt.value) {
          setSortOrder(o => o === "asc" ? "desc" : "asc");
        } else {
          setSortBy(opt.value);
          setSortOrder("desc");
        }
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
        sortBy === opt.value
          ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
          : isDark
            ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]'
            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
      }`}
    >
      {opt.label}
      {sortBy === opt.value && (
        <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"} text-[10px]`}></i>
      )}
    </button>
  ))}
</div>
{/* CONTENT AREA */}
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
) : viewMode === 'grid' ? (
  /* GRID VIEW */
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
) : (
  /* LIST VIEW (TABLE FORMAT) */
  <div className="overflow-x-auto mb-10">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className={`border-b ${isDark ? 'border-[#1a1a1a] text-[#808080]' : 'border-slate-200 text-slate-500'} text-[12px] uppercase tracking-wider`}>
          <th className="px-4 py-3 font-semibold">Name</th>
          <th className="px-4 py-3 font-semibold">Size</th>
          <th className="px-4 py-3 font-semibold">Owner</th>
          <th className="px-4 py-3 font-semibold">Created At</th>
        </tr>
      </thead>
      <tbody className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
        {collections.map((folder) => (
          <tr key={folder.id} className={`group border-b last:border-0 transition-colors ${isDark ? 'border-[#1a1a1a] hover:bg-[#ffffff05]' : 'border-slate-100 hover:bg-white/50'}`}>
            <td className="px-4 py-4">
              <Link to={`/viewcollection/${folder.id}`} className="flex items-center gap-3">
                <i className="fa-solid fa-folder text-lg text-[#3b82f6]"></i>
                <span className="font-medium truncate max-w-[200px]">{folder.name}</span>
              </Link>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {folder.total_size ? formatSize(folder.total_size) : "0 B"}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
               <span className={`${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Me</span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              <span className={`${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '—'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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