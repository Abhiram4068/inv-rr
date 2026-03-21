import React, { useState, useRef, useEffect } from 'react';

const UploadFilesMain = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  // Trigger file selection
  const handleZoneClick = () => {
    fileInputRef.current.click();
  };

  // Process files from input or drop
  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      raw: file,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
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
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select files first.');
      return;
    }
    alert(`Uploading ${selectedFiles.length} files...`);
    setSelectedFiles([]);
  };

  return (
    <main className={`flex-1 overflow-y-auto p-10 no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold m-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>Upload Files</h2>
        <p className={`mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Attach files to your drive by dropping them below.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`w-full h-[400px] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 mb-5 text-center shadow-sm
          ${isDragging 
            ? 'border-[#3b82f6] bg-[#3b82f6]/5' 
            : isDark 
              ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#3b82f6] hover:bg-[#0f0f0f]' 
              : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-white'}`}
        onClick={handleZoneClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
        />
      </div>

      {/* Previews */}
      <div className="flex flex-col gap-2.5">
        {selectedFiles.map((file) => (
          <div
            key={file.id}
            className={`p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300 border shadow-sm ${
              isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'
            }`}
          >
            <i className={`fa-solid fa-file ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <div className="flex-1">
              <p className={`text-sm font-bold m-0 ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.name}</p>
              <span className={`text-xs font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>{file.size} MB</span>
            </div>
            <i
              className="fa-solid fa-xmark text-[#ff4444] cursor-pointer hover:scale-125 transition-transform p-2"
              onClick={() => removeFile(file.id)}
            ></i>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className={`flex justify-end pt-5 border-t mt-5 ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
        <button
          onClick={handleUpload}
          className={`px-[30px] py-3 rounded-[25px] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-lg ${
            isDark ? 'bg-[#e3e3e3] text-black' : 'bg-slate-800 text-white'
          }`}
        >
          Confirm & Upload
        </button>
      </div>
    </main>
  );
};

export default UploadFilesMain;