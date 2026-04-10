import React, { useState, useRef, useEffect } from 'react';
import { checkChunkStatus, uploadChunk, completeChunkUpload, cancelChunkUpload } from '../../services/fileService';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_RETRIES = 3;

const UploadFilesMain = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // { id: { uploadedChunks, totalChunks, status: 'pending'|'uploading'|'completed'|'error', progress: 0 } }
  const [isUploadingGlobal, setIsUploadingGlobal] = useState(false);
  const fileInputRef = useRef(null);

  // --- TOAST STATE ---
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

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

  // Toast Timer Logic
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type: type });
  };

  const isDark = theme === 'dark';

  // Trigger file selection
  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    fileInputRef.current.click();
  };

  // Process files from input or drop
  const handleFiles = (files) => {
    const filteredFiles = Array.from(files).filter(file => {
      const isFolder = !file.type && file.size % 4096 === 0;
      if (isFolder) {
        showToast("Ignored folders!", 'error');
        return false;
      }
      return true;
    });

    const newFiles = filteredFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      raw: file,
      uploadId: `${file.name}-${file.size}-${file.lastModified}`.replace(/[^a-zA-Z0-9.-]/g, "_")
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    
    // Initialize progress tracking
    const newProgress = {};
    newFiles.forEach(f => {
      newProgress[f.id] = { uploadedChunks: 0, totalChunks: Math.ceil(f.raw.size / CHUNK_SIZE), status: 'pending', progress: 0 };
    });
    setUploadProgress(prev => ({ ...prev, ...newProgress }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Drag and Drop Handlers
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
    setUploadProgress(prev => {
        const _progress = { ...prev };
        delete _progress[id];
        return _progress;
    });
  };

  // Clear all selected files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    showToast("Cleared all files", "success");
  };

  const updateProgress = (fileId, data) => {
    setUploadProgress(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], ...data }
    }));
  };

  const uploadSingleFile = async (fileObj) => {
    const { raw, uploadId, id } = fileObj;
    const totalChunks = Math.ceil(raw.size / CHUNK_SIZE);
    
    updateProgress(id, { status: 'uploading', totalChunks });

    try {
        // 1. Check existing chunks
        const statusResponse = await checkChunkStatus(uploadId);
        const uploadedChunksMap = new Set(statusResponse.data.uploaded_chunks || []);
        
        let successCount = uploadedChunksMap.size;
        updateProgress(id, { uploadedChunks: successCount, progress: Math.floor((successCount / totalChunks) * 100) });

        // 2. Upload missing chunks
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            if (uploadedChunksMap.has(chunkIndex)) {
                continue;
            }

            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, raw.size);
            const chunk = raw.slice(start, end);

            let attempt = 0;
            let success = false;

            while (attempt < MAX_RETRIES && !success) {
                try {
                  console.log(attempt)
                    const formData = new FormData();
                    formData.append("upload_id", uploadId);
                    formData.append("chunk_index", chunkIndex);
                    formData.append("file", chunk);
                    
                    await uploadChunk(formData);
                    success = true;
                    successCount++;
                    updateProgress(id, { 
                        uploadedChunks: successCount, 
                        progress: Math.floor((successCount / totalChunks) * 100),
                        retryAttempt: 0 // clear retry state on success 
                    });
                } catch (err) {
                    attempt++;
                    console.warn(`[Upload Retry] File: ${raw.name} | Chunk: ${chunkIndex} failed. Retrying... (${attempt}/${MAX_RETRIES})`);
                    
                    // Show retry in the UI
                    updateProgress(id, { retryAttempt: attempt });

                    if (attempt >= MAX_RETRIES) {
                        throw new Error(`Failed to upload chunk ${chunkIndex} after ${MAX_RETRIES} attempts.`);
                    }
                    // Wait briefly before retrying
                    await new Promise(res => setTimeout(res, 1000 * attempt));
                }
            }
        }

        // 3. Complete and assemble file
        await completeChunkUpload(uploadId, raw.name, raw.type || 'application/octet-stream', "");
        updateProgress(id, { status: 'completed', progress: 100 });
        return true;
    } catch (err) {
        console.error("Upload Error: ", err);
        // 4. Rollback on total failure
        try {
            await cancelChunkUpload(uploadId);
        } catch (cancelErr) {
            console.error("Rollback failed: ", cancelErr);
        }
        updateProgress(id, { status: 'error' });
        throw err;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please select files first.', 'error');
      return;
    }
    
    setIsUploadingGlobal(true);
    let successCount = 0;
    
    for (const file of selectedFiles) {
        if (uploadProgress[file.id]?.status === 'completed') {
            successCount++;
            continue; // Skip already completed
        }
        try {
            await uploadSingleFile(file);
            successCount++;
        } catch (err) {
            showToast(`Upload failed for ${file.name}. Rolled back chunks.`, 'error');
        }
    }

    setIsUploadingGlobal(false);
    
    if (successCount === selectedFiles.length) {
        showToast(`${successCount} file(s) uploaded successfully`, 'success');
        setTimeout(() => clearAllFiles(), 1500);
    } else {
        showToast(`Uploaded ${successCount}/${selectedFiles.length} files. Some failed.`, 'error');
    }
  };

  return (
    <main className={`flex-1 overflow-y-auto p-10 no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-circle-check text-emerald-500'} text-lg`}></i>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold m-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Upload Files</h2>
        <p className={`mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Attach files to your drive by dropping them below.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`w-full h-[400px] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 mb-5 text-center shadow-sm
          ${isUploadingGlobal ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
          ${isDragging 
            ? 'border-[#3b82f6] bg-[#3b82f6]/5' 
            : isDark 
              ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#3b82f6] hover:bg-[#0f0f0f]' 
              : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-white'}`}
        onClick={isUploadingGlobal ? null : handleZoneClick}
        onDragOver={isUploadingGlobal ? null : onDragOver}
        onDragLeave={isUploadingGlobal ? null : onDragLeave}
        onDrop={isUploadingGlobal ? null : onDrop}
      >
        <i className="fa-solid fa-cloud-arrow-up text-4xl text-[#3b82f6] mb-3"></i>
        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-600'}`}>
          Drop files here or click to upload
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          disabled={isUploadingGlobal}
        />
      </div>

      {/* Previews with Progress */}
      <div className="flex flex-col gap-2.5">
        {selectedFiles.map((file) => {
          const progress = uploadProgress[file.id] || { progress: 0, status: 'pending' };
          const isError = progress.status === 'error';
          const isCompleted = progress.status === 'completed';
          const isUploading = progress.status === 'uploading';

          return (
            <div
              key={file.id}
              className={`p-4 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300 border shadow-sm ${
                isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'
              } ${isError ? 'border-red-500/50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <i className={`fa-solid fa-file ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
                <div className="flex-1">
                  <p className={`text-sm font-bold m-0 ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>{file.size} MB</span>
                    {isUploading && (
                        <span className="text-xs font-bold text-blue-500 animate-pulse flex items-center gap-2">
                            (Uploading chunk {progress.uploadedChunks}/{progress.totalChunks}...)
                            {progress.retryAttempt > 0 && (
                                <span className="text-orange-500 fa-fade">
                                    <i className="fa-solid fa-rotate-right mr-1"></i> Retrying... ({progress.retryAttempt}/{MAX_RETRIES})
                                </span>
                            )}
                        </span>
                    )}
                    {isError && (
                        <span className="text-xs font-bold text-red-500">Failed & Rolled back</span>
                    )}
                    {isCompleted && (
                        <span className="text-xs font-bold text-emerald-500">Completed <i className="fa-solid fa-check"></i></span>
                    )}
                  </div>
                </div>
                {!isUploadingGlobal && (
                    <i
                        className="fa-solid fa-xmark text-[#ff4444] cursor-pointer hover:scale-125 transition-transform p-2"
                        onClick={() => removeFile(file.id)}
                    ></i>
                )}
              </div>

              {/* Progress Bar */}
              {(isUploading || isCompleted) && (
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden dark:bg-zinc-800">
                    <div 
                        className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        style={{ width: `${progress.progress}%` }}
                    />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className={`flex justify-end items-center gap-4 pt-5 border-t mt-5 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
        {selectedFiles.length > 0 && !isUploadingGlobal && (
          <button
            onClick={clearAllFiles}
            className={`text-xs font-bold transition-colors ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-500 hover:text-red-500'}`}
          >
            Clear All
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={isUploadingGlobal || selectedFiles.length === 0}
          className={`px-[30px] py-3 rounded-[25px] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-lg ${
            isUploadingGlobal 
                ? 'opacity-50 cursor-not-allowed bg-blue-500 text-white' 
                : isDark ? 'bg-[#e3e3e3] text-black' : 'bg-slate-800 text-white'
          }`}
        >
          {isUploadingGlobal ? (
            <span className="flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
            </span>
          ) : 'Confirm & Upload'}
        </button>
      </div>
    </main>
  );
};

export default UploadFilesMain;