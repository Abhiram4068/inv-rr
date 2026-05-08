import React, { useState, useRef, useEffect, useCallback } from 'react';
import { uploadFile } from '../../services/fileService';

// ─── Duplicate Modal ──────────────────────────────────────────────────────────
const DuplicateModal = ({ isDark, file, onResolve }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.2s ease' }}>
      <div className={`w-[380px] rounded-2xl p-7 shadow-2xl border transition-colors
        ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e]' : 'bg-white border-slate-200'}`}
        style={{ animation: 'slideUp 0.2s ease' }}>

        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4
          ${isDark ? 'bg-amber-400/10' : 'bg-amber-50'}`}>
          <i className="fa-solid fa-triangle-exclamation text-amber-400 text-lg"></i>
        </div>

        <h3 className={`text-base font-bold mb-1.5 tracking-tight
          ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Duplicate File Detected
        </h3>
        <p className={`text-xs leading-relaxed mb-4
          ${isDark ? 'text-[#555]' : 'text-slate-500'}`}>
          A file with the same content already exists in your drive.
          How would you like to handle <strong className={isDark ? 'text-[#888]' : 'text-slate-700'}>
            "{file.name}"</strong>?
        </p>

        {/* File badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-5 border text-xs
          ${isDark ? 'bg-[#111] border-[#1e1e1e]' : 'bg-slate-50 border-slate-200'}`}>
          <i className={`fa-solid fa-file ${isDark ? 'text-[#444]' : 'text-slate-400'}`}></i>
          <span className={`font-semibold flex-1 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
            {file.name}
          </span>
          <span className={isDark ? 'text-[#444]' : 'text-slate-400'}>{file.size} MB</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Replace */}
          <button onClick={() => onResolve('replace')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm
              bg-white text-black hover:bg-[#e5e5e5] active:scale-[0.98] transition-all">
            <i className="fa-solid fa-rotate text-base flex-shrink-0"></i>
            <span className="flex flex-col text-left">
              <span className="text-sm font-bold">Replace Existing</span>
              <span className="text-[10px] opacity-60 font-medium mt-0.5">Overwrite the old file with this one</span>
            </span>
          </button>

          {/* Keep Both */}
          <button onClick={() => onResolve('keep_both')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm
              border active:scale-[0.98] transition-all
              ${isDark
                ? 'bg-[#111] border-[#222] text-white hover:bg-[#161616]'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'}`}>
            <i className="fa-regular fa-copy text-base flex-shrink-0"></i>
            <span className="flex flex-col text-left">
              <span className="text-sm font-bold">Keep Both</span>
              <span className="text-[10px] opacity-60 font-medium mt-0.5">Save as a renamed copy alongside the original</span>
            </span>
          </button>

          {/* Cancel */}
          <button onClick={() => onResolve(null)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors
              ${isDark ? 'text-[#444] hover:text-[#888]' : 'text-slate-400 hover:text-slate-600'}`}>
            Cancel upload
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UploadFilesMain = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [duplicateModal, setDuplicateModal] = useState(null); // { file }
  const fileInputRef = useRef(null);
  const resolveRef = useRef(null); // holds the Promise resolver

  // Theme sync
  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => { window.removeEventListener('storage', handleStorageChange); clearInterval(interval); };
  }, [theme]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [toast.visible]);

  const showToast = (message, type = 'success') => setToast({ visible: true, message, type });

  const isDark = theme === 'dark';

  // ── Ask user what to do with a duplicate ──────────────────────────────────
  const askDuplicateAction = useCallback((file) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDuplicateModal({ file });
    });
  }, []);

  const handleModalResolve = (action) => {
    setDuplicateModal(null);
    if (resolveRef.current) {
      resolveRef.current(action);
      resolveRef.current = null;
    }
  };

  // ── File selection ────────────────────────────────────────────────────────
  const handleZoneClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current?.click();
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files)
      .filter(file => {
        const isFolder = !file.type && file.size % 4096 === 0;
        if (isFolder) { showToast('Folders are not supported', 'error'); return false; }
        return true;
      })
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        raw: file,
        status: 'pending', // pending | uploading | done | error
      }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileChange = (e) => { if (e.target.files.length > 0) handleFiles(e.target.files); };
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => setSelectedFiles(prev => prev.filter(f => f.id !== id));
  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
    showToast('Cleared all files', 'success');
  };

  const setFileStatus = (id, status) =>
    setSelectedFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f));

  // ── Core upload (single file, with optional action) ───────────────────────
  const uploadSingleFile = async (file, action = null) => {
    setFileStatus(file.id, 'uploading');

    const formData = new FormData();
    formData.append('files', file.raw);
    if (action) formData.append('action', action);

    const response = await uploadFile(formData); // your axios/fetch wrapper
    return response; // expected shape: { data } or throws on error
  };

  // ── Main upload handler ───────────────────────────────────────────────────
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please select files first.', 'error');
      return;
    }

    const pending = selectedFiles.filter(f => f.status === 'pending');
    let successCount = 0;

    for (const file of pending) {
      try {
        await uploadSingleFile(file, null);
        setFileStatus(file.id, 'done');
        successCount++;
      } catch (err) {
        const errData = err?.response?.data;

        // ── Duplicate detected ─────────────────────────────────────────────
        // ── Duplicate detected ─────────────────────────────────────────────
const rawError = errData?.error || '';
const isDuplicate =
  (err?.response?.status === 409 || err?.response?.status === 500) &&
  (
    errData?.duplicate === true ||
    String(errData?.duplicate).toLowerCase() === 'true' ||
    rawError.includes("'duplicate': ['True']") ||
    rawError.includes('"duplicate": ["True"]')
  );

if (isDuplicate) {
          const action = await askDuplicateAction(file); // 'replace' | 'keep_both' | null

          if (!action) {
            // User cancelled this file
            setFileStatus(file.id, 'pending');
            showToast(`Skipped "${file.name}"`, 'error');
            continue;
          }

          // Re-fire with chosen action
          try {
            await uploadSingleFile(file, action);
            setFileStatus(file.id, 'done');
            successCount++;
          } catch (retryErr) {
            setFileStatus(file.id, 'error');
            const msg = retryErr?.response?.data?.error || `Failed to upload "${file.name}"`;
            showToast(msg, 'error');
          }
          continue;
        }

        // ── Other errors ───────────────────────────────────────────────────
        setFileStatus(file.id, 'error');
        const backendError =
          errData?.error ||
          errData?.files?.[0] ||
          errData?.non_field_errors?.[0] ||
          errData?.[0] ||
          `Failed to upload "${file.name}"`;
        showToast(backendError, 'error');
      }
    }

    if (successCount > 0) {
      showToast(`${successCount} file(s) uploaded successfully`, 'success');
      // Remove successfully uploaded files after brief delay
      setTimeout(() => {
        setSelectedFiles(prev => prev.filter(f => f.status !== 'done'));
        if (fileInputRef.current) fileInputRef.current.value = null;
      }, 1200);
    }
  };

  // ── Dot status colors ─────────────────────────────────────────────────────
  const statusDot = {
    pending:   'bg-[#333]',
    uploading: 'bg-amber-400 animate-pulse',
    done:      'bg-emerald-500',
    error:     'bg-red-500',
  };

  return (
    <main className={`flex-1 overflow-y-auto p-10 no-scrollbar transition-colors duration-300 relative
      ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>

      {/* Duplicate Modal */}
      {duplicateModal && (
        <DuplicateModal
          isDark={isDark}
          file={duplicateModal.file}
          onResolve={handleModalResolve}
        />
      )}

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]
          animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3
            ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
            <i className={`fa-solid text-lg ${toast.type === 'error'
              ? 'fa-circle-exclamation text-red-500'
              : 'fa-circle-check text-emerald-500'}`}></i>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold m-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Upload Files
        </h2>
        <p className={`mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Attach files to your drive by dropping them below.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`w-full h-[400px] border-2 border-dashed rounded-[20px] flex flex-col
          items-center justify-center cursor-pointer transition-all duration-300 mb-5 text-center shadow-sm
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
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
      </div>

      {/* File List */}
      <div className="flex flex-col gap-2.5">
        {selectedFiles.map(file => (
          <div key={file.id}
            className={`p-4 rounded-xl flex items-center gap-4
              animate-in fade-in slide-in-from-bottom-1 duration-300 border shadow-sm
              ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>

            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[file.status]}`} />

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold m-0 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
                {file.name}
              </p>
              <span className={`text-xs font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                {file.size} MB
              </span>
            </div>

            {file.status === 'uploading' ? (
              <i className="fa-solid fa-spinner fa-spin text-amber-400 text-sm" />
            ) : file.status === 'done' ? (
              <i className="fa-solid fa-check text-emerald-500 text-sm" />
            ) : file.status === 'error' ? (
              <i className="fa-solid fa-circle-exclamation text-red-400 text-sm" />
            ) : (
              <i className="fa-solid fa-xmark text-[#ff4444] cursor-pointer
                hover:scale-125 transition-transform p-2"
                onClick={() => removeFile(file.id)} />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`flex justify-end items-center gap-4 pt-5 border-t mt-5
        ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
        {selectedFiles.length > 0 && (
          <button onClick={clearAllFiles}
            className={`text-xs font-bold transition-colors
              ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-500 hover:text-red-500'}`}>
            Clear All
          </button>
        )}
        <button onClick={handleUpload}
          className={`px-[30px] py-3 rounded-[25px] font-bold cursor-pointer
            transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-lg
            ${isDark ? 'bg-[#e3e3e3] text-black' : 'bg-slate-800 text-white'}`}>
          Confirm &amp; Upload
        </button>
      </div>
    </main>
  );
};

export default UploadFilesMain;