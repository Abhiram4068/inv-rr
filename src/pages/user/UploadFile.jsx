import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  uploadFileChunk,
  getChunkUploadStatus,
  controlChunkUpload,
} from '../../services/fileService';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB — must match backend MAX_CHUNK_BYTES
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB per file
const MAX_CHUNK_RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Duplicate Modal ──────────────────────────────────────────────────────────
const DuplicateModal = ({ isDark, file, onResolve }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      style={{ animation: 'fadeIn 0.2s ease' }}>
      <div className={`w-[380px] rounded-2xl p-7 shadow-2xl border transition-colors
        ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e]' : 'bg-white border-slate-200'}`}
        style={{ animation: 'slideUp 0.2s ease' }}>

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

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-5 border text-xs
          ${isDark ? 'bg-[#111] border-[#1e1e1e]' : 'bg-slate-50 border-slate-200'}`}>
          <i className={`fa-solid fa-file ${isDark ? 'text-[#444]' : 'text-slate-400'}`}></i>
          <span className={`font-semibold flex-1 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
            {file.name}
          </span>
          <span className={isDark ? 'text-[#444]' : 'text-slate-400'}>{file.size} MB</span>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => onResolve('replace')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm
              bg-white text-black hover:bg-[#e5e5e5] active:scale-[0.98] transition-all">
            <i className="fa-solid fa-rotate text-base flex-shrink-0"></i>
            <span className="flex flex-col text-left">
              <span className="text-sm font-bold">Replace Existing</span>
              <span className="text-[10px] opacity-60 font-medium mt-0.5">Overwrite the old file with this one</span>
            </span>
          </button>

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
        @keyframes slideDownProfessional {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const STATUS_LABELS = {
  pending: 'Waiting',
  uploading: 'Uploading',
  paused: 'Paused',
  completed: 'Completed',
  error: 'Failed',
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UploadFilesMain = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [duplicateModal, setDuplicateModal] = useState(null);
  const fileInputRef = useRef(null);
  const resolveRef = useRef(null);
  const uploadControlRef = useRef({});

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => { window.removeEventListener('storage', handleStorageChange); clearInterval(interval); };
  }, [theme]);

  useEffect(() => {
    if (toast.visible) {
      const dismissTimer = setTimeout(() => {
        setToast(prev => ({ ...prev, animateOut: true }));
        setTimeout(() => {
          setToast({ visible: false, message: '', type: 'success', animateOut: false });
        }, 350);
      }, 3500);
      return () => clearTimeout(dismissTimer);
    }
  }, [toast.visible]);

  const showToast = (message, type = 'success') =>
    setToast({ visible: true, message, type, animateOut: false });

  const isDark = theme === 'dark';

  const patchFile = useCallback((id, patch) => {
    setSelectedFiles(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

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

  const isDuplicateError = (error) => {
    const errData = error?.response?.data;
    const status = error?.response?.status;
    if (errData?.duplicate === true || String(errData?.duplicate).toLowerCase() === 'true') {
      return true;
    }
    if (status === 409) {
      const raw = errData?.error || '';
      return raw.includes('duplicate');
    }
    if (errData?.failed?.[0]?.reason?.duplicate) return true;
    return false;
  };

  const waitWhilePaused = async (fileId) => {
    while (true) {
      const ctrl = uploadControlRef.current[fileId];
      if (ctrl?.cancelRequested) return 'cancelled';
      if (!ctrl?.pauseRequested) return 'continue';
      await sleep(250);
    }
  };

  const resolveUploadSession = async (file) => {
    if (!file.uploadId) {
      const uploadId = `${file.id}_${Math.random().toString(36).substr(2, 9)}`;
      return { uploadId, startChunk: file.nextChunkIndex || 0 };
    }
    try {
      const { data } = await getChunkUploadStatus(file.uploadId);
      return {
        uploadId: data.upload_id,
        startChunk: data.next_chunk ?? file.nextChunkIndex ?? 0,
        progress: data.progress_percent ?? 0,
      };
    } catch {
      return {
        uploadId: file.uploadId,
        startChunk: file.nextChunkIndex || 0,
        progress: file.progress || 0,
      };
    }
  };

  const uploadSingleFile = async (file, duplicateAction = null) => {
    const totalChunks = Math.ceil(file.raw.size / CHUNK_SIZE);
    const session = await resolveUploadSession(file);
    const uploadId = session.uploadId;
    let startChunk = session.startChunk;

    uploadControlRef.current[file.id] = {
      pauseRequested: false,
      cancelRequested: false,
    };

    patchFile(file.id, {
      status: 'uploading',
      uploadId,
      totalChunks,
      nextChunkIndex: startChunk,
      progress: session.progress ?? file.progress ?? 0,
      duplicateAction: duplicateAction || file.duplicateAction || null,
    });

    let lastResponse = null;

    for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex++) {
      const waitResult = await waitWhilePaused(file.id);
      if (waitResult === 'cancelled') {
        patchFile(file.id, {
          status: 'pending',
          progress: 0,
          uploadId: null,
          nextChunkIndex: 0,
        });
        return { cancelled: true };
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.raw.size);
      const chunk = file.raw.slice(start, end);

      const formData = new FormData();
      formData.append('upload_id', uploadId);
      formData.append('chunk_index', chunkIndex);
      formData.append('total_chunks', totalChunks);
      formData.append('file_name', file.raw.name);
      formData.append('file_size', file.raw.size);
      formData.append('content_type', file.raw.type || 'application/octet-stream');
      formData.append('file', chunk);

      const action = duplicateAction || file.duplicateAction;
      if (action) formData.append('action', action);

      let chunkRetries = 0;
      let chunkDone = false;

      while (chunkRetries < MAX_CHUNK_RETRIES && !chunkDone) {
        if (uploadControlRef.current[file.id]?.pauseRequested) {
          await waitWhilePaused(file.id);
        }
        if (uploadControlRef.current[file.id]?.cancelRequested) {
          patchFile(file.id, { status: 'pending', progress: 0, uploadId: null, nextChunkIndex: 0 });
          return { cancelled: true };
        }

        try {
          const response = await uploadFileChunk(formData);
          lastResponse = response;
          chunkDone = true;

          const data = response?.data || {};
          const progress = data.progress_percent
            ?? Math.round(((chunkIndex + 1) / totalChunks) * 100);

          patchFile(file.id, {
            progress,
            nextChunkIndex: data.next_chunk ?? chunkIndex + 1,
            uploadId,
          });

          if (response.status === 201 || data.status === 'completed') {
            patchFile(file.id, { status: 'completed', progress: 100 });
            return lastResponse;
          }
        } catch (error) {
          if (isDuplicateError(error)) throw error;

          chunkRetries += 1;
          if (chunkRetries >= MAX_CHUNK_RETRIES) {
            patchFile(file.id, {
              status: 'paused',
              uploadId,
              nextChunkIndex: chunkIndex,
            });
            try {
              await controlChunkUpload(uploadId, 'pause');
            } catch { /* ignore */ }
            throw error;
          }
          await sleep(1000 * chunkRetries);
        }
      }
    }

    patchFile(file.id, { status: 'completed', progress: 100 });
    return lastResponse;
  };

  const handlePause = async (file) => {
    uploadControlRef.current[file.id] = {
      ...(uploadControlRef.current[file.id] || {}),
      pauseRequested: true,
    };
    patchFile(file.id, { status: 'paused' });
    if (file.uploadId) {
      try {
        await controlChunkUpload(file.uploadId, 'pause');
      } catch { /* ignore */ }
    }
  };

  const handleResume = async (file) => {
    uploadControlRef.current[file.id] = {
      pauseRequested: false,
      cancelRequested: false,
    };
    if (file.uploadId) {
      try {
        await controlChunkUpload(file.uploadId, 'resume');
      } catch { /* ignore */ }
    }
    try {
      await uploadSingleFile(file, file.duplicateAction || null);
    } catch (err) {
      if (isDuplicateError(err)) {
        const action = await askDuplicateAction(file);
        if (!action) {
          patchFile(file.id, { status: 'paused' });
          return;
        }
        patchFile(file.id, { duplicateAction: action });
        try {
          await uploadSingleFile({ ...file, duplicateAction: action }, action);
          patchFile(file.id, { status: 'completed', progress: 100 });
          showToast(`"${file.name}" uploaded`, 'success');
        } catch (retryErr) {
          patchFile(file.id, { status: 'error' });
          showToast(retryErr?.response?.data?.error || `Failed to upload "${file.name}"`, 'error');
        }
        return;
      }
      if (file.status !== 'paused') {
        patchFile(file.id, { status: 'error' });
      }
      const errData = err?.response?.data;
      const msg = errData?.error || errData?.content_type?.[0] || `Upload failed for "${file.name}"`;
      showToast(msg, 'error');
    }
  };

  const handleCancelUpload = async (file) => {
    uploadControlRef.current[file.id] = {
      pauseRequested: true,
      cancelRequested: true,
    };
    if (file.uploadId) {
      try {
        await controlChunkUpload(file.uploadId, 'cancel');
      } catch { /* ignore */ }
    }
    patchFile(file.id, {
      status: 'pending',
      progress: 0,
      uploadId: null,
      nextChunkIndex: 0,
    });
  };

  const processFileUpload = async (file) => {
    try {
      const result = await uploadSingleFile(file, null);
      if (result?.cancelled) return false;
      patchFile(file.id, { status: 'completed', progress: 100 });
      return true;
    } catch (err) {
      if (isDuplicateError(err)) {
        const action = await askDuplicateAction(file);
        if (!action) {
          patchFile(file.id, { status: 'paused', uploadId: file.uploadId });
          showToast(`Skipped "${file.name}"`, 'error');
          return false;
        }
        patchFile(file.id, { duplicateAction: action, status: 'uploading' });
        try {
          await uploadSingleFile({ ...file, duplicateAction: action }, action);
          patchFile(file.id, { status: 'completed', progress: 100 });
          return true;
        } catch (retryErr) {
          patchFile(file.id, { status: retryErr?.response ? 'paused' : 'error' });
          showToast(retryErr?.response?.data?.message || `Failed to upload "${file.name}"`, 'error');
          return false;
        }
      }

      if (file.status !== 'paused') {
        patchFile(file.id, { status: 'paused' });
      }
      const errData = err?.response?.data;
      const fieldError = errData?.content_type?.[0] || errData?.file?.[0] || errData?.file_size?.[0];
      const backendError =
        errData?.error ||
        fieldError ||
        `Upload interrupted for "${file.name}". Press Resume to continue.`;
      showToast(backendError, 'error');
      return false;
    }
  };

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
      .map(file => {
        if (file.size > MAX_FILE_BYTES) {
          showToast(`"${file.name}" exceeds the 100 MB file limit`, 'error');
          return null;
        }
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2),
          raw: file,
          status: 'pending',
          progress: 0,
          uploadId: null,
          nextChunkIndex: 0,
          totalChunks: Math.ceil(file.size / CHUNK_SIZE),
        };
      })
      .filter(Boolean);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileChange = (e) => { if (e.target.files.length > 0) handleFiles(e.target.files); };
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    const file = selectedFiles.find(f => f.id === id);
    if (file?.status === 'uploading') {
      handleCancelUpload(file);
    }
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(f => {
      if (f.status === 'uploading' || f.status === 'paused') {
        handleCancelUpload(f);
      }
    });
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
    showToast('Cleared all files', 'success');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please select files first.', 'error');
      return;
    }

    const pending = selectedFiles.filter(f => f.status === 'pending');
    let successCount = 0;

    for (const file of pending) {
      const ok = await processFileUpload(file);
      if (ok) successCount += 1;
    }

    if (successCount > 0) {
      showToast(`${successCount} file(s) uploaded successfully`, 'success');
      setTimeout(() => {
        setSelectedFiles(prev => prev.filter(f => f.status !== 'completed'));
        if (fileInputRef.current) fileInputRef.current.value = null;
      }, 1200);
    }
  };

  const statusDot = {
    pending: 'bg-[#333]',
    uploading: 'bg-amber-400 animate-pulse',
    paused: 'bg-blue-400',
    completed: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  const showProgress = (file) =>
    ['uploading', 'paused', 'completed'].includes(file.status);

  return (
    <main className={`flex-1 overflow-y-auto p-10 no-scrollbar transition-colors duration-300 relative
      ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>

      {duplicateModal && (
        <DuplicateModal
          isDark={isDark}
          file={duplicateModal.file}
          onResolve={handleModalResolve}
        />
      )}

      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none
            transition-all duration-[350ms]
            ${toast.animateOut
              ? 'opacity-0 -translate-y-6 scale-95'
              : 'opacity-100 translate-y-0 scale-100'
            }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animation: !toast.animateOut ? 'slideDownProfessional 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
            ${isDark
              ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200'
              : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error'
                ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500')
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')
              }`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
            </div>
            <span className="flex-1 leading-normal tracking-wide text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className={`text-2xl font-bold m-0 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Upload Files
        </h2>
        <p className={`mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
          Large files upload in 10 MB chunks. You can pause and resume anytime.
        </p>
      </div>

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
        <span className={`text-xs mt-1 ${isDark ? 'text-[#555]' : 'text-slate-400'}`}>
          Max 100 MB per file
        </span>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
      </div>

      <div className="flex flex-col gap-2.5">
        {selectedFiles.map(file => (
          <div key={file.id}
            className={`p-4 rounded-xl flex items-center gap-4 border shadow-sm
              ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>

            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[file.status] || statusDot.pending}`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold m-0 truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  {file.name}
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                  ${file.status === 'uploading' ? 'bg-amber-400/20 text-amber-400'
                    : file.status === 'paused' ? 'bg-blue-400/20 text-blue-400'
                    : file.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500'
                    : file.status === 'error' ? 'bg-red-500/20 text-red-400'
                    : isDark ? 'bg-[#222] text-[#888]' : 'bg-slate-100 text-slate-500'}`}>
                  {STATUS_LABELS[file.status] || file.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                  {file.size} MB
                  {file.totalChunks > 1 && ` · ${file.totalChunks} chunks`}
                </span>
              </div>

              {showProgress(file) && (
                <div className="flex items-center gap-2 mt-2 max-w-full">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#222]' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full transition-all duration-300 ${file.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${file.progress || 0}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                    {file.progress || 0}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {file.status === 'uploading' && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePause(file)}
                    title="Pause"
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-amber-400' : 'hover:bg-slate-100 text-amber-600'}`}
                  >
                    <i className="fa-solid fa-pause text-sm" />
                  </button>
                  <i className="fa-solid fa-spinner fa-spin text-amber-400 text-sm px-1" />
                </>
              )}

              {(file.status === 'paused' || file.status === 'error') && file.uploadId && (
                <>
                  <button
                    type="button"
                    onClick={() => handleResume(file)}
                    title="Resume"
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-emerald-400' : 'hover:bg-slate-100 text-emerald-600'}`}
                  >
                    <i className="fa-solid fa-play text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelUpload(file)}
                    title="Cancel upload"
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-red-400' : 'hover:bg-slate-100 text-red-500'}`}
                  >
                    <i className="fa-solid fa-stop text-sm" />
                  </button>
                </>
              )}

              {file.status === 'completed' && (
                <i className="fa-solid fa-check text-emerald-500 text-sm px-2" />
              )}

              {file.status === 'pending' && (
                <i
                  className="fa-solid fa-xmark text-[#ff4444] cursor-pointer hover:scale-125 transition-transform p-2"
                  onClick={() => removeFile(file.id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

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
          disabled={!selectedFiles.some(f => f.status === 'pending')}
          className={`px-[30px] py-3 rounded-[25px] font-bold transition-all duration-200 shadow-lg
            ${selectedFiles.some(f => f.status === 'pending')
              ? `${isDark ? 'bg-[#e3e3e3] text-black hover:opacity-90 hover:-translate-y-0.5 cursor-pointer' : 'bg-slate-800 text-white hover:opacity-90 hover:-translate-y-0.5 cursor-pointer'}`
              : 'opacity-40 cursor-not-allowed bg-slate-500 text-white'}`}>
          Confirm &amp; Upload
        </button>
      </div>
    </main>
  );
};

export default UploadFilesMain;
