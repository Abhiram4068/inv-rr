import React, { useState } from 'react';

const Trash = () => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setRestoreModalOpen] = useState(false);
  const [isClearAllModalOpen, setClearAllModalOpen] = useState(false); // New state
  const [selectedFile, setSelectedFile] = useState(null);

  const trashFiles = [
    { id: 1, name: "Old_Contract_v1.pdf", type: "pdf", deletedDate: "Feb 20, 2026", color: "#ff4444", icon: "fa-file-pdf" },
    { id: 2, name: "blurred_photo.jpg", type: "image", deletedDate: "Feb 18, 2026", color: "#808080", icon: "fa-image" },
  ];

  const handleOpenDeleteModal = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const handleOpenRestoreModal = (file) => {
    setSelectedFile(file);
    setRestoreModalOpen(true);
  };

  return (
    <div className="flex-1 min-w-0 bg-black overflow-y-auto no-scrollbar">
      <div className="py-10 px-12 lg:px-24 max-w-[1600px] mx-auto">
        
        {/* PAGE HEADER */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Trash Management</h1>
            <div className="text-neutral-500 text-sm">{trashFiles.length} items</div>
          </div>
          <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
            Items in the trash will be permanently deleted after 30 days. 
            Restoring a file will move it back to its original location.
          </p>
        </div>

        {/* SECTION: TRASHED FILES */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-neutral-500 border-b border-neutral-900">
                <th className="pb-4 pl-4 font-medium">File Name</th>
                <th className="pb-4 font-medium">Deleted Date</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 pr-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {trashFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-neutral-900/30 transition-colors">
                  <td className="py-5 pl-4 text-sm text-white">
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${file.icon}`} style={{ color: file.color }}></i>
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm text-neutral-500">{file.deletedDate}</td>
                  <td className="py-5 text-sm">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-400">
                      Pending Deletion
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-sm text-right">
                    <div className="flex justify-end gap-4">
                        <button 
                            onClick={() => handleOpenRestoreModal(file)}
                            className="text-emerald-500 hover:underline font-medium"
                        >
                            Restore
                        </button>
                        <button 
                            onClick={() => handleOpenDeleteModal(file)}
                            className="text-red-500 hover:underline font-medium"
                        >
                            Delete Forever
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM DIVIDER / CLEAR ALL */}
        <div className="mt-2 py-4 border-t border-neutral-900">
           <button 
             onClick={() => setClearAllModalOpen(true)}
             className="flex items-center justify-between w-full text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
            >
             <span>Clear All Trash</span>
             <i className="fa-solid fa-trash-can text-[10px]"></i>
           </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Permanently?</h3>
            <p className="text-sm text-neutral-500 mb-8">
              This action cannot be undone. <span className="text-white">{selectedFile?.name}</span> will be removed forever.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE MODAL */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Restore File?</h3>
            <p className="text-sm text-neutral-500 mb-8">
              Are you sure you want to restore <span className="text-white">{selectedFile?.name}</span> to its original location?
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
                onClick={() => setRestoreModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors"
                onClick={() => setRestoreModalOpen(false)}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Clear All Trash?</h3>
            <p className="text-sm text-neutral-500 mb-8">
              All <span className="text-white">{trashFiles.length} items</span> will be permanently removed. This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-neutral-800 text-white text-sm font-bold hover:bg-neutral-700 transition-colors"
                onClick={() => setClearAllModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors"
                onClick={() => setClearAllModalOpen(false)}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;