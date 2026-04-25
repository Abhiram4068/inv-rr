import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import {getCollectionById,   getCollectionFiles,   updateCollection,   addFileToCollection } from '../../services/collectionService';
import { formatDateTime } from '../../utils/dateFormatter';
import { sizeFormatter } from '../../utils/sizeFormatter';
import { getFiles, getFileById } from '../../services/fileService';
import FileCard from '../../components/FileCard';

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
  const [collectionPage, setCollectionPage] = useState(1);
  const [totalCollectionPages, setTotalCollectionPages] = useState(1);
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

  // --- Helpers for Consistent FileCard (Replicated from PaginatedFiles) ---
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

  const iconClassForFile = (file) => {
    const name = file?.file_name || file?.original_name || "";
    const ct = file?.content_type || "";
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
        getCollectionFiles(id, collectionPage)
      ]);
      setCollectionInfo(collectionRes.data);
      setCollectionFile(fileRes.data.results || fileRes.data.collection_files || []);
      setTotalFiles(fileRes.data.count || 0);
      setTotalCollectionPages(fileRes.data.next 
        ? collectionPage + 1 
        : collectionPage
      );
        
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
  }, [id, collectionPage]);

  // --- Fetch Global Files (For Modal) ---
  useEffect(() => {
    if (isAddFileOpen) {
      const fetchGlobalFiles = async () => {
        setFileLoading(true);
        try {
          const res = await getFiles(filePage, fileSearch);
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
      const fileRes = await getCollectionFiles(id, collectionPage);
      setCollectionFile(fileRes.data.results || fileRes.data.collection_files || []);
      setTotalFiles(fileRes.data.count || 0);
      setTotalCollectionPages(fileRes.data.next 
        ? collectionPage + 1 
        : collectionPage
      );
            setIsAddFileOpen(false); 
    } catch (err) {
      alert("Error adding file. It may already exist in this collection.");
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


  return (
    <div className="collection-container transition-colors duration-300" style={{ width: '100%', height: '100%', overflowY: 'hidden', display: 'flex', flexDirection: 'column', background: isDark ? 'transparent' : '#E6EBF2' }}>
      
      <main className="file-explorer-main no-scrollbar" style={{ padding: '24px 40px', flexGrow: 1, overflowY: 'auto' }}>
        
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
              
        {/* Page Title Area (With Relocated Pagination) */}
        {/* Page Title Area */}
<div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
  <div className="page-title-area" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
    <i className="fa-solid fa-arrow-left back-btn" style={{ color: isDark ? '#808080' : '#64748b', cursor: 'pointer', fontSize: '18px' }} onClick={() => navigate(-1)}></i>
    <div className="page-title" style={{ fontSize: '20px', fontWeight: 600, color: isDark ? 'white' : '#1e293b' }}>{collectionInfo?.name}</div>
  </div>
  
  {/* Right Side: Item count on top, Pagination below */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
    <div style={{ color: isDark ? '#808080' : '#64748b', fontSize: '14px', fontWeight: 500 }}>
      {totalFiles} item(s) in this collection
    </div>

    {totalCollectionPages > 1 && (
      <div className="flex items-center gap-3">
        <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
          Page {collectionPage} of {totalCollectionPages}
        </div>
        <div className="flex gap-1">
          <button 
            disabled={collectionPage === 1}
            onClick={() => setCollectionPage(p => p - 1)}
            className={`w-7 h-7 flex items-center justify-center rounded-md border text-[10px] transition-all ${isDark ? 'border-[#1a1a1a] hover:bg-[#111] text-gray-400 disabled:opacity-20' : 'border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40'}`}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            disabled={collectionPage >= totalCollectionPages}
            onClick={() => setCollectionPage(p => p + 1)}
            className={`w-7 h-7 flex items-center justify-center rounded-md border text-[10px] transition-all ${isDark ? 'border-[#1a1a1a] hover:bg-[#111] text-gray-400 disabled:opacity-20' : 'border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40'}`}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Collection Files Content */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 italic">Loading collection...</div>
        ) : collectionFile.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
              {collectionFile.map((file) => (
                <FileCard
                  key={file.file}
                  id={file.file}
                  title={file.file_name || file.original_name}
                  display_name={file.file_name}
                  size={sizeFormatter(file.file_size)}
                  time={timeFormatter(file.added_at)}
                  iconClass={iconClassForFile(file)}
                  isLink={true}
                   onClick={() => navigate(`/file/${file.file}`)}
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty State View */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[#111]' : 'bg-white shadow-sm'}`}>
              <i className="fa-solid fa-folder-open text-3xl text-gray-400 opacity-50"></i>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>This collection is empty</h3>
            <p className={`text-sm max-w-xs mb-8 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>You haven't added any files to this collection yet.</p>
            <button 
              onClick={() => setIsAddFileOpen(true)}
              className="text-[#3b82f6] border border-[#3b82f6]/30 px-6 py-2 rounded-lg font-medium hover:bg-[#3b82f6] hover:text-white transition-all text-sm"
            >
              <i className="fa-solid fa-plus mr-2"></i> Add files 
            </button>
          </div>
        )}
      </main>

      {/* --- ADD FILES MODAL (List Mode Table) --- */}
      {isAddFileOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-6 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl transition-all`}>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-xl font-semibold`}>Select Files to Add</h3>
              <button onClick={() => setIsAddFileOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Search Input */}
            <div className={`mb-6 flex items-center px-4 py-2.5 rounded-xl border transition-all ${isDark ? 'bg-black border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
              <i className="fa fa-search text-gray-500 mr-3"></i>
              <input 
                type="text" 
                placeholder="Search your library..." 
                className="bg-transparent border-none outline-none w-full text-sm"
                value={fileSearch}
                onChange={(e) => { setFileSearch(e.target.value); setFilePage(1); }}
              />
            </div>

            {/* List Mode Table */}
            <div className="flex-grow overflow-x-auto overflow-y-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-[#1a1a1a] text-[#808080]' : 'border-slate-200 text-slate-500'} text-[12px] uppercase tracking-wider`}>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  {fileLoading ? (
                    <tr><td colSpan="5" className="text-center py-20 text-gray-500 italic">Loading your library...</td></tr>
                  ) : allFiles.length > 0 ? (
                    allFiles.map((file) => (
                      <tr key={file.id} className={`group border-b last:border-0 transition-colors ${isDark ? 'border-[#1a1a1a] hover:bg-[#ffffff05]' : 'border-slate-50 hover:bg-slate-50/50'}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <i className={`fa-solid ${iconClassForFile(file)} text-lg text-[#3b82f6]`}></i>
                            <span className="font-medium truncate max-w-[200px]">{file.original_name || file.file_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-[#808080]">
                         {sizeFormatter(file.file_size)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => handleAddFile(file.id)}
                            className="bg-[#3b82f6] hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-20 text-gray-500">No files found matching your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Pagination */}
            <div className={`mt-6 pt-4 border-t flex items-center justify-between ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
              <div className="text-xs text-gray-500 font-medium">Page {filePage} of {totalFilePages}</div>
              <div className="flex gap-2">
                <button 
                  disabled={filePage === 1}
                  onClick={() => setFilePage(p => p - 1)}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all ${isDark ? 'border-[#1a1a1a] hover:bg-[#111] text-gray-400 disabled:opacity-20' : 'border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40'}`}
                >
                  Previous
                </button>
                <button 
                  disabled={filePage >= totalFilePages}
                  onClick={() => setFilePage(p => p + 1)}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all ${isDark ? 'border-[#1a1a1a] hover:bg-[#111] text-gray-400 disabled:opacity-20' : 'border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{/* --- MANAGE MODAL --- */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-4 rounded-2xl w-full max-w-md shadow-2xl transition-all`}>
            <div className="text-center mb-6">
              <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-bold mb-2`}>Edit Collection</h3>
              <p className="text-xs text-slate-500">Update your collection details below.</p>
            </div>
            
            <div className="space-y-3 mb-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Name</label>
                <input
                  type="text"
                  placeholder="Collection Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full border p-3 rounded-xl text-sm outline-none transition-all ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">Description</label>
                <textarea
                  placeholder="What is this collection for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full border p-3 rounded-xl text-sm outline-none h-24 resize-none transition-all ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsManageOpen(false)} 
                className={`flex-1 py-2.5 border rounded-xl text-sm font-medium transition-colors ${isDark ? 'border-[#1a1a1a] text-gray-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'} border p-8 rounded-2xl w-full max-w-md text-center shadow-2xl`}>
            <h3 className={`${isDark ? 'text-white' : 'text-slate-900'} text-lg font-bold mb-3`}>Delete Collection?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. All files will remain safe in your system.</p>
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