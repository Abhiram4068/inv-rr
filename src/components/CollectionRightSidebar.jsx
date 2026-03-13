import React from 'react';

const CollectionRightSidebar = ({ info, onManage, onDelete }) => {
  return (
    <aside className="w-[320px] border-l border-[#555] p-6 flex flex-col bg-black overflow-y-auto hidden xl:flex">
      {/* Collection Details Card */}
      <div className="bg-[#0a0a0a] border border-[#555] rounded-xl p-5 mb-4">
        <h3 className="text-white text-base font-semibold mb-4">Collection Details</h3>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
          Created by you on Feb 01, 2026.
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Total Size</span>
            <span className="text-white font-medium">8.7 MB</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Files</span>
            <span className="text-white font-medium">12</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Visibility</span>
            <span className="text-white font-medium">Private</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-[#0a0a0a] border border-[#555] rounded-xl p-5 mb-6">
        <h3 className="text-white text-base font-semibold mb-4">Recent Activity</h3>
        <ul className="text-xs space-y-3 text-gray-500">
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>You uploaded <b className="text-gray-300 font-normal underline">Pitch_Deck.pdf</b></span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-400">•</span>
            <span>Collection renamed to <b className="text-gray-300 font-normal italic">Project Assets</b></span>
          </li>
        </ul>
      </div>

      {/* Action Buttons (Sticky at bottom) */}
      <div className="mt-auto space-y-3">
        <button 
          onClick={onManage}
          className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#555] hover:bg-[#111] text-white py-3 rounded-xl text-sm font-medium transition-all"
        >
          <i className="fa-solid fa-gear text-gray-400"></i>
          Manage Collection
        </button>
        
        <button 
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 bg-transparent border border-red-900/20 hover:bg-red-950/20 text-red-500 py-3 rounded-xl text-sm font-medium transition-all"
        >
          <i className="fa-solid fa-trash-can"></i>
          Delete Collection
        </button>
      </div>
    </aside>
  );
};

export default CollectionRightSidebar;