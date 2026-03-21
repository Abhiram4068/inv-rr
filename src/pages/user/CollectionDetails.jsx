import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, Link } from "react-router-dom";

const CollectionDetails = () => {
  const { isManageOpen, setIsManageOpen, isDeleteOpen, setIsDeleteOpen } = useOutletContext();
  const navigate = useNavigate();

  // 1. Theme State Sync
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

  const [collectionInfo, setCollectionInfo] = useState({
    name: "Project Assets",
    description: "All the employee details"
  });

  const [isStarred, setIsStarred] = useState(false);

  const files = [
    { name: "Final_Pitch_Deck.pdf", size: "4.2 MB", time: "2h ago", icon: "fa-file-pdf", path: "/uploads/Final_Pitch_Deck.pdf" },
    { name: "Meeting_Notes_Feb.docx", size: "1.1 MB", time: "Yesterday", icon: "fa-file-word", path: "/uploads/Meeting_Notes_Feb.docx" },
    { name: "Logo_Concept_V1.png", size: "850 KB", time: "Feb 18, 2026", icon: "fa-image", path: "/uploads/Logo_Concept_V1.png" },
    { name: "Budget_Forecast.xlsx", size: "2.4 MB", time: "Feb 15, 2026", icon: "fa-file-excel", path: "/uploads/Budget_Forecast.xlsx" }
  ];

  const handleSave = () => {
    setIsManageOpen(false);
  };

  const handleFileClick = (file) => {
    navigate('/details', { state: { file } });
  };

  return (
    <div className="collection-container transition-colors duration-300" style={{ width: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: isDark ? 'transparent' : '#E6EBF2' }}>
      
      <main className="file-explorer-main" style={{ padding: '24px 40px', flexGrow: 1 }}>
        
        {/* Search Header */}
        <div className="header-action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
          <div className="search-container transition-colors" style={{ width: '100%', maxWidth: '450px', background: isDark ? '#0a0a0a' : '#fff', border: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <i className="fa fa-search" style={{ color: isDark ? '#808080' : '#94a3b8' }}></i>
            <input 
              type="text" 
              placeholder={`Search in '${collectionInfo.name}'...`} 
              style={{ background: 'transparent', border: 'none', color: isDark ? 'white' : '#1e293b', marginLeft: '12px', width: '100%', outline: 'none', fontSize: '14px' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setIsStarred(!isStarred)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                isStarred 
                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                : (isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#333]' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600')
              }`}
              title={isStarred ? "Remove from Favorites" : "Add to Favorites"}
            >
              <i className={`${isStarred ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
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
            <div className="page-title" style={{ fontSize: '20px', fontWeight: 600, color: isDark ? 'white' : '#1e293b' }}>{collectionInfo.name}</div>
          </div>
          <div style={{ color: isDark ? '#808080' : '#64748b', fontSize: '14px' }}>12 items in collection</div>
        </div>

        {/* Grid */}
        <div className="file-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {files.map((file, idx) => (
            <div 
              key={idx} 
              className="file-card transition-all" 
              onClick={() => handleFileClick(file)} 
              style={{ background: isDark ? '#0a0a0a' : '#fff', border: isDark ? '1px solid #1a1a1a' : '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="file-thumb" style={{ height: '140px', background: isDark ? '#111' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: isDark ? '1px solid #1a1a1a' : '1px solid #E6EBF2' }}>
                <i className={`fa-solid ${file.icon}`} style={{ fontSize: '40px', color: isDark ? '#333' : '#3b82f6', position: 'absolute', zIndex: 2 }}></i>
              </div>
              <div className="file-info" style={{ padding: '16px' }}>
                <span className="file-name" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isDark ? '#ccc' : '#334155' }}>
                  {file.name}
                </span>
                <div className="file-meta-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isDark ? '#444' : '#94a3b8' }}>
                  <span>{file.size}</span>
                  <span>{file.time}</span>
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
                value={collectionInfo.name}
                onChange={(e) => setCollectionInfo({ ...collectionInfo, name: e.target.value })}
                className={`w-full border p-3 rounded-lg text-sm outline-none transition-colors ${isDark ? 'bg-black border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'}`}
              />
              <textarea
                value={collectionInfo.description}
                onChange={(e) => setCollectionInfo({ ...collectionInfo, description: e.target.value })}
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
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;