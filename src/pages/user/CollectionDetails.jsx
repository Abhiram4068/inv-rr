import React, { useState } from 'react';
import { useOutletContext, useNavigate } from "react-router-dom";

const CollectionDetails = () => {
  const { isManageOpen, setIsManageOpen, isDeleteOpen, setIsDeleteOpen } = useOutletContext();
  const navigate = useNavigate(); // Hook for navigation

  const [collectionInfo, setCollectionInfo] = useState({
    name: "Project Assets",
    description: "All the employee details"
  });

  const files = [
    { name: "Final_Pitch_Deck.pdf", size: "4.2 MB", time: "2h ago", icon: "fa-file-pdf", path: "/uploads/Final_Pitch_Deck.pdf" },
    { name: "Meeting_Notes_Feb.docx", size: "1.1 MB", time: "Yesterday", icon: "fa-file-word", path: "/uploads/Meeting_Notes_Feb.docx" },
    { name: "Logo_Concept_V1.png", size: "850 KB", time: "Feb 18, 2026", icon: "fa-image", path: "/uploads/Logo_Concept_V1.png" },
    { name: "Budget_Forecast.xlsx", size: "2.4 MB", time: "Feb 15, 2026", icon: "fa-file-excel", path: "/uploads/Budget_Forecast.xlsx" }
  ];

  const handleSave = () => {
    setIsManageOpen(false);
  };

  // Function to handle file click
  const handleFileClick = (file) => {
    // Navigates to /file-details and passes the specific file object as state
    navigate('/details', { state: { file } });
  };

  return (
    <div className="collection-container" style={{ width: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      
      <main className="file-explorer-main" style={{ padding: '24px 40px', flexGrow: 1 }}>
        
        {/* Search Header */}
        <div className="header-action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
          <div className="search-container" style={{ width: '100%', maxWidth: '450px', background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <i className="fa fa-search" style={{ color: '#808080' }}></i>
            <input 
              type="text" 
              placeholder={`Search in '${collectionInfo.name}'...`} 
              style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '12px', width: '100%', outline: 'none', fontSize: '14px' }} 
            />
          </div>
           <a href="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl no-underline font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
          <i className="fa fa-plus"></i> Upload Files
        </a>
        </div>

        {/* Title Area */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div className="page-title-area" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <i className="fa-solid fa-arrow-left back-btn" style={{ color: '#808080', cursor: 'pointer', fontSize: '18px' }} onClick={() => navigate(-1)}></i>
            <div className="page-title" style={{ fontSize: '20px', fontWeight: 600 }}>{collectionInfo.name}</div>
          </div>
          <div style={{ color: '#808080', fontSize: '14px' }}>12 items in collection</div>
        </div>

        {/* Grid */}
        <div className="file-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {files.map((file, idx) => (
            <div 
              key={idx} 
              className="file-card" 
              onClick={() => handleFileClick(file)} // Click Trigger
              style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
            >
              <div className="file-thumb" style={{ height: '140px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid #1a1a1a' }}>
                <i className={`fa-solid ${file.icon}`} style={{ fontSize: '40px', color: '#808080', position: 'absolute', zIndex: 2 }}></i>
                <div style={{ width: '100%', height: '100%', background: '#111', opacity: 0.4 }}></div>
              </div>
              <div className="file-info" style={{ padding: '16px' }}>
                <span className="file-name" style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </span>
                <div className="file-meta-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#808080' }}>
                  <span>{file.size}</span>
                  <span>{file.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '20px 0' }}>
          <button className="page-btn active" style={{ background: '#0a0a0a', border: '1px solid #3b82f6', color: '#3b82f6', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>1</button>
        </div>
      </main>

      {/* MODALS (Manage/Delete remain the same) */}
      {/* ... (Your existing modal code) ... */}

    </div>
  );
};

export default CollectionDetails;