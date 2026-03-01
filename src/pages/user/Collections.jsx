import React, { useState } from 'react';

const Collections = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');

  const collectionsData = [
    { id: 1, name: "Project Assets", files: 24, size: "1.2 GB" },
    { id: 2, name: "Client Deliverables", files: 12, size: "450 MB" },
    { id: 3, name: "Marketing Q1", files: 85, size: "2.4 GB" },
    { id: 4, name: "Personal Photos", files: "1.2k", size: "5.1 GB" },
    { id: 5, name: "Legal Documents", files: 5, size: "12 MB" },
    { id: 6, name: "Backups", files: 2, size: "8.4 GB" },
  ];

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
    <div className="flex-1 min-w-0 bg-black overflow-y-auto custom-scrollbar">
      <div className="p-6 lg:p-[24px_40px]">
        
        {/* HEADER ACTION ROW */}
        <div className="flex justify-between items-center mb-[30px] gap-4">
          <div className="flex-1 max-w-[450px] bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-[10px] rounded-[12px] flex items-center">
            <i className="fa fa-search text-[#808080]"></i>
            <input 
              type="text" 
              placeholder="Search Drive" 
              className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm"
            />
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-[#3b82f6] text-white px-5 py-[10px] rounded-[10px] font-semibold text-sm flex items-center gap-[10px] whitespace-nowrap hover:opacity-90 transition-opacity"
          >
            <i className="fa fa-folder-plus"></i> New Collection
          </button>
        </div>

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="text-[20px] font-semibold text-white">My Collections</div>
          <div className="text-[#808080] text-sm">6 collections</div>
        </div>

        {/* FOLDER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {collectionsData.map((folder) => (
            <a 
              key={folder.id} 
               href="/viewcollection"
              className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-[12px] flex items-center gap-4 hover:bg-[#111] hover:border-[#333] transition-all group"
            >
              <i className="fa-solid fa-folder text-[24px] text-[#fbbf24]"></i>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate">{folder.name}</span>
                <span className="text-[11px] text-[#808080] mt-[2px]">{folder.files} files • {folder.size}</span>
              </div>
            </a>
          ))}
        </div>

      </div>

      {/* NEW COLLECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[4px] flex justify-center items-center z-[2000] p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-[420px] p-6 rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            
            <div className="flex justify-between items-center mb-6 text-lg font-semibold text-white">
              <span>Create New Collection</span>
              <i 
                className="fa-solid fa-xmark text-[#808080] cursor-pointer hover:text-white transition-colors" 
                onClick={() => setModalOpen(false)}
              ></i>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] text-[#808080] mb-2 uppercase tracking-[0.5px]">Collection Name</label>
              <input 
                type="text" 
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g. Brand Guidelines"
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg p-3 text-white outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] text-[#808080] mb-2 uppercase tracking-[0.5px]">Description</label>
              <textarea 
                rows="3" 
                value={collectionDesc}
                onChange={(e) => setCollectionDesc(e.target.value)}
                placeholder="What's inside this collection?"
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-lg p-3 text-white outline-none focus:border-[#3b82f6] transition-colors resize-none"
              ></textarea>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                className="flex-1 bg-transparent text-[#808080] border border-[#1a1a1a] py-3 rounded-lg font-semibold hover:bg-[#111] hover:text-white transition-all"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-[2] bg-[#3b82f6] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
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