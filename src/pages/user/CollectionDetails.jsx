import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import { useParams } from "react-router-dom"
import { getCollectionById } from '../../services/collectionService';
import { getCollectionFiles } from '../../services/collectionService';

const CollectionDetails = () => {
  const { isManageOpen, setIsManageOpen, isDeleteOpen, setIsDeleteOpen, handleUpdateCollection,handleDeleteCollection   } = useOutletContext();
  const navigate = useNavigate();
  const { id } = useParams()
  // 1. Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [ collectionFile, setCollectionFile ] = useState([]);
  const [ totalFiles, setTotalFiles ] = useState(0)

  const [error, setError]=useState("");
  const [loading, setLoading]=useState(true)

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


  useEffect(()=>{
    const FetchCollectionInfo = async()=>{
      try{
        setLoading(true)
        const [collectionRes, FileRes] = await Promise.all([
          getCollectionById(id),
          getCollectionFiles(id)
        ]);
        setCollectionInfo(collectionRes.data);
        setCollectionFile(FileRes.data.collection_files);
        setTotalFiles(FileRes.data.count)
      }catch(err){
        setError(err.response?.data?.detail || "Failed to load collection details")
      }finally{
        setLoading(false);
      }
    };
    if(id){
      FetchCollectionInfo();
    }
    },[id])

  const isDark = theme === 'dark';

  const [isStarred, setIsStarred] = useState(false);

const [formData, setFormData] = useState({
  name: "",
  description: ""
});


 const handleSave = () => {
  handleUpdateCollection(formData);
  setCollectionInfo({ ...collectionInfo, ...formData });
};
useEffect(() => {
  if (collectionInfo) {
    setFormData({
      name: collectionInfo.name,
      description: collectionInfo.description
    });
  }
}, [collectionInfo]);

  const handleFileClick = (file) => {
    navigate('/details', { state: { file } });
  };

  return (
    <div className="collection-container transition-colors duration-300" style={{ width: '100%', height: '100%', overflowY: 'hidden', display: 'flex', flexDirection: 'column', background: isDark ? 'transparent' : '#E6EBF2' }}>
      
      <main className="file-explorer-main" style={{ padding: '24px 40px', flexGrow: 1 }}>
        
        {/* Search Header */}
        <div className="header-action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
          <div className="search-container transition-colors" style={{ width: '100%', maxWidth: '450px', background: isDark ? '#0a0a0a' : '#fff', border: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <i className="fa fa-search" style={{ color: isDark ? '#808080' : '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder={`Search in '${collectionInfo?.name || ""}'...`}
              style={{ background: 'transparent', border: 'none', color: isDark ? 'white' : '#1e293b', marginLeft: '12px', width: '100%', outline: 'none', fontSize: '14px' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setIsStarred(!isStarred)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                collectionInfo?.is_starred
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                : (isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600')
              }`}
              title={isStarred ? "Remove from Favorites" : "Add to Favorites"}
            >
              <i className={`${ collectionInfo?.is_starred ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
            </button>

            <Link to="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl no-underline font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-plus"></i> Upload Files
            </Link>
          </div>
        </div>
              
        {/* Title Area */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div className="page-title-area" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <i className="fa-solid fa-arrow-left back-btn" style={{ color: isDark ? '#808080' : '#64748b', cursor: 'pointer', fontSize: '18px' }} onClick={() => navigate(-1)}></i>
            <div className="page-title" style={{ fontSize: '20px', fontWeight: 600, color: isDark ? 'white' : '#1e293b' }}>{collectionInfo?.name} </div>
          </div>
          <div style={{ color: isDark ? '#808080' : '#64748b', fontSize: '14px' }}>{totalFiles} item(s) in this collection</div>
        </div>

{/* Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
  {collectionFile.map((file, idx) => (
    <div
      key={idx}
      onClick={() => handleFileClick(file)}
      className={`cursor-pointer border rounded-xl overflow-hidden transition-all ${
        isDark
          ? 'bg-[#0a0a0a] border-[#1a1a1a]'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div
        className={`h-[140px] flex items-center justify-center relative border-b ${
          isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-[#f8fafc] border-[#E6EBF2]'
        }`}
      >
        <i
          className={`fa-solid ${file.icon} text-[40px] z-[2] ${
            isDark ? 'text-[#333]' : 'text-[#3b82f6]'
          }`}
        ></i>
      </div>
      <div className="p-4">
        <span
          className={`text-sm font-semibold mb-2 block whitespace-nowrap overflow-hidden text-ellipsis ${
            isDark ? 'text-[#ccc]' : 'text-[#334155]'
          }`}
        >
          {file.file_name}
        </span>
        <div
          className={`flex justify-between text-xs ${
            isDark ? 'text-[#444]' : 'text-[#94a3b8]'
          }`}
        >
          <span>{file.file_size}</span>
          <span>{file.added_at}</span>
        </div>
      </div>
    </div>
  ))}
</div>

        {/* Pagination */}
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '20px 0' }}>
          <button className="page-btn active" style={{ background: isDark ? '#0a0a0a' : '#fff', border: '1px solid #3b82f6', color: '#3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>1</button>
        </div>
      </main>

      {/* Modals */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-8 rounded-2xl w-full max-w-md shadow-2xl`}>
            <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-semibold mb-6`}>Manage Collection</h3>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full border p-3 rounded-lg text-sm outline-none transition-colors ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full border p-3 rounded-lg text-sm outline-none transition-colors h-24 ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsManageOpen(false)} className={`px-4 py-2 rounded-lg border transition-colors ${isDark ? 'border-[#1a1a1a] text-gray-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl`}>
            <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-bold mb-3`}>Delete Collection?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. All files will remain but the collection grouping will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className={`flex-1 py-2 border rounded-lg transition-colors ${isDark ? 'border-[#1a1a1a] text-gray-400' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Cancel</button>
              <button onClick={handleDeleteCollection} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;