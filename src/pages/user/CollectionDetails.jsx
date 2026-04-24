import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { 
  getCollectionById, 
  getCollectionFiles, 
  updateCollection, 
  addFileToCollection 
} from '../../services/collectionService';
import { getFiles } from '../../services/fileService';

const CollectionDetails = () => {
  const { 
    isManageOpen, 
    setIsManageOpen, 
    isDeleteOpen, 
    setIsDeleteOpen, 
    handleUpdateCollection, 
    handleDeleteCollection   
  } = useOutletContext();
  
  const navigate = useNavigate();
  const { id } = useParams();

  // --- States ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [collectionFile, setCollectionFile] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);

  // Add Files Modal States
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [fileSearch, setFileSearch] = useState("");
  const [filePage, setFilePage] = useState(1);
  const [totalFilePages, setTotalFilePages] = useState(1);
  const [fileLoading, setFileLoading] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const isDark = theme === 'dark';

  // --- Theme Sync ---
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

  // --- Fetch Collection Content ---
  const fetchCollectionContent = async () => {
    try {
      setLoading(true);
      const [collectionRes, fileRes] = await Promise.all([
        getCollectionById(id),
        getCollectionFiles(id)
      ]);
      setCollectionInfo(collectionRes.data);
      setCollectionFile(fileRes.data.collection_files || []);
      setTotalFiles(fileRes.data.count || 0);
      
      setFormData({
        name: collectionRes.data.name,
        description: collectionRes.data.description
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load collection details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCollectionContent();
  }, [id]);

  // --- Fetch Global Files (For Modal) ---
  useEffect(() => {
    if (isAddFileOpen) {
      const fetchGlobalFiles = async () => {
        setFileLoading(true);
        try {
          const res = await getFiles(filePage, fileSearch);
          // Adjusting for common DRF pagination wrappers
          setAllFiles(res.data.results || res.data.files || []); 
          setTotalFilePages(Math.ceil((res.data.count || 0) / 10));
        } catch (err) {
          console.error("Error fetching global files:", err);
        } finally {
          setFileLoading(false);
        }
      };
      fetchGlobalFiles();
    }
  }, [isAddFileOpen, filePage, fileSearch]);

  // --- Handlers ---
  const handleAddFile = async (fileId) => {
    try {
      await addFileToCollection(id, fileId);
      // Refresh current view
      const fileRes = await getCollectionFiles(id);
      setCollectionFile(fileRes.data.collection_files);
      setTotalFiles(fileRes.data.count);
      setIsAddFileOpen(false); 
    } catch (err) {
      alert("This file might already be in the collection or an error occurred.");
    }
  };

  const handleSave = () => {
    handleUpdateCollection(formData);
    setCollectionInfo({ ...collectionInfo, ...formData });
    setIsManageOpen(false);
  };

  const handleToggleStar = async () => {
    try {
      const newState = !collectionInfo?.is_starred;
      await updateCollection(id, { is_starred: newState });
      setCollectionInfo(prev => ({ ...prev, is_starred: newState }));
    } catch (error) {
      console.error("Failed to update star:", error);
    }
  };

  const handleFileClick = (fileId) => {
    navigate(`/file/${fileId}`);
  };

  return (
    <div className="collection-container transition-colors duration-300" style={{ width: '100%', height: '100%', overflowY: 'hidden', display: 'flex', flexDirection: 'column', background: isDark ? 'transparent' : '#E6EBF2' }}>
      
      <main className="file-explorer-main" style={{ padding: '24px 40px', flexGrow: 1, overflowY: 'auto' }}>
        
        {/* Header Actions */}
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
              onClick={handleToggleStar}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                collectionInfo?.is_starred
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                : (isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600')
              }`}
            >
              <i className={`${ collectionInfo?.is_starred ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
            </button>

            <button 
              onClick={() => setIsAddFileOpen(true)}
              className="bg-[#3b82f6] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <i className="fa-solid fa-plus"></i> Add Files
            </button>
          </div>
        </div>
              
        {/* Page Title */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div className="page-title-area" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <i className="fa-solid fa-arrow-left back-btn" style={{ color: isDark ? '#808080' : '#64748b', cursor: 'pointer', fontSize: '18px' }} onClick={() => navigate(-1)}></i>
            <div className="page-title" style={{ fontSize: '20px', fontWeight: 600, color: isDark ? 'white' : '#1e293b' }}>{collectionInfo?.name}</div>
          </div>
          <div style={{ color: isDark ? '#808080' : '#64748b', fontSize: '14px' }}>{totalFiles} item(s) in this collection</div>
        </div>

        {/* Collection Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          {collectionFile.map((file, idx) => (
            <div
              key={idx}
              onClick={() => handleFileClick(file.file_id)}
              className={`cursor-pointer border rounded-xl overflow-hidden transition-all ${
                isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className={`h-[140px] flex items-center justify-center relative border-b ${isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-[#f8fafc] border-[#E6EBF2]'}`}>
                <i className={`fa-solid ${file.icon || 'fa-file'} text-[40px] ${isDark ? 'text-[#333]' : 'text-[#3b82f6]'}`}></i>
              </div>
              <div className="p-4">
                <span className={`text-sm font-semibold mb-2 block truncate ${isDark ? 'text-[#ccc]' : 'text-[#334155]'}`}>
                  {file.file_name || file.original_name}
                </span>
                <div className={`flex justify-between text-xs ${isDark ? 'text-[#444]' : 'text-[#94a3b8]'}`}>
                  <span>{file.file_size}</span>
                  <span>{file.added_at}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- Modals --- */}

      {/* Manage Modal */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-8 rounded-2xl w-full max-w-md shadow-2xl`}>
            <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-semibold mb-6`}>Manage Collection</h3>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full border p-3 rounded-lg text-sm outline-none ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full border p-3 rounded-lg text-sm outline-none h-24 ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsManageOpen(false)} className={`px-4 py-2 rounded-lg border ${isDark ? 'border-[#1a1a1a] text-gray-400 hover:text-white' : 'border-slate-200 text-slate-500'}`}>Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl`}>
            <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-bold mb-3`}>Delete Collection?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Files will remain safe but the group will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteOpen(false)} className={`flex-1 py-2 border rounded-lg ${isDark ? 'border-[#1a1a1a] text-gray-400' : 'border-slate-200 text-slate-500'}`}>Cancel</button>
              <button onClick={handleDeleteCollection} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Files Modal */}
      {isAddFileOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-semibold`}>Select Files to Add</h3>
              <button onClick={() => setIsAddFileOpen(false)} className="text-gray-500 hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className={`mb-4 flex items-center px-3 py-2 rounded-lg border ${isDark ? 'bg-black border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
              <i className="fa fa-search text-gray-500 mr-2"></i>
              <input 
                type="text" 
                placeholder="Search your library..." 
                className="bg-transparent border-none outline-none w-full text-sm"
                value={fileSearch}
                onChange={(e) => { setFileSearch(e.target.value); setFilePage(1); }}
              />
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {fileLoading ? (
                <div className="text-center py-10 text-gray-500">Loading files...</div>
              ) : allFiles.length > 0 ? (
                allFiles.map((file) => (
                  <div key={file.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isDark ? 'hover:bg-[#111] border-[#1a1a1a]' : 'hover:bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${file.icon || 'fa-file'} text-blue-500`}></i>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        {file.original_name || file.file_name}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAddFile(file.id)}
                      className="text-xs bg-blue-600/10 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-bold"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">No files found.</div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
              <button 
                disabled={filePage === 1}
                onClick={() => setFilePage(p => p - 1)}
                className={`text-sm px-3 py-1 border rounded-md disabled:opacity-30 ${isDark ? 'text-white border-gray-700' : 'text-slate-600'}`}
              >Previous</button>
              <span className="text-xs text-gray-500 font-medium">Page {filePage} of {totalFilePages}</span>
              <button 
                disabled={filePage >= totalFilePages}
                onClick={() => setFilePage(p => p + 1)}
                className={`text-sm px-3 py-1 border rounded-md disabled:opacity-30 ${isDark ? 'text-white border-gray-700' : 'text-slate-600'}`}
              >Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;