import React, { useState, useRef } from 'react';

const UploadFilesMain = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
    // Logic for API call goes here
    setSelectedFiles([]);
  };

  return (
    <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold m-0 text-white">Upload Files</h2>
        <p className="text-[#808080] mt-1">
          Attach files to your drive by dropping them below.
        </p>
      </div>

      {/* Drop Zone - Height increased to 400px */}
      <div
        className={`w-full h-[400px] bg-[#0a0a0a] border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 mb-5 text-center
          ${isDragging ? 'border-[#3b82f6] bg-[#0f0f0f]' : 'border-[#1a1a1a] hover:border-[#3b82f6] hover:bg-[#0f0f0f]'}`}
        onClick={handleZoneClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <i className="fa-solid fa-cloud-arrow-up text-4xl text-[#3b82f6] mb-2.5"></i>
        <span className="text-white text-sm">Drop files here or click to upload</span>
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
            className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300"
          >
            <i className="fa-solid fa-file text-[#808080]"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-white m-0">{file.name}</p>
              <span className="text-xs text-[#808080]">{file.size} MB</span>
            </div>
            <i
              className="fa-solid fa-xmark text-[#ff4444] cursor-pointer hover:scale-110 transition-transform"
              onClick={() => removeFile(file.id)}
            ></i>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-5 border-t border-[#1a1a1a] mt-5">
        <button
          onClick={handleUpload}
          className="bg-[#e3e3e3] text-black px-[30px] py-3 border-none rounded-[25px] font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
        >
          Confirm & Upload
        </button>
      </div>
    </main>
  );
};

export default UploadFilesMain;