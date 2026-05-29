import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { dashboardService } from '../../services/dashboardService';
import {
  uploadFileChunk,
  getChunkUploadStatus,
  controlChunkUpload,
} from '../../services/fileService';

const CHUNK_SIZE = 10 * 1024 * 1024;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_CHUNK_RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ALLOWED_CONTENT_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'application/pdf',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'application/xml',
  'text/xml',
]);

const getFileCategory = (rawFile) => {
  const t = rawFile.type || '';
  if (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') return 'image';
  if (t === 'application/pdf') return 'pdf';
  if (t.includes('word') || t.includes('document')) return 'word';
  if (t.includes('sheet') || t.includes('excel') || t === 'text/csv') return 'excel';
  if (t.includes('powerpoint') || t.includes('presentation')) return 'ppt';
  if (t === 'text/plain') return 'text';
  if (t === 'application/json' || t === 'application/xml' || t === 'text/xml') return 'code';
  if (t === 'application/zip' || t === 'application/x-zip-compressed') return 'zip';
  return 'other';
};

const CATEGORY_ICON = {
  pdf:   { icon: 'fa-file-pdf',   color: '#e24b4a' },
  word:  { icon: 'fa-file-word',  color: '#378add' },
  excel: { icon: 'fa-file-excel', color: '#1d9e75' },
  ppt:   { icon: 'fa-file-powerpoint', color: '#d85a30' },
  text:  { icon: 'fa-file-lines', color: '#888780' },
  code:  { icon: 'fa-file-code',  color: '#7f77dd' },
  zip:   { icon: 'fa-file-zipper', color: '#ba7517' },
  other: { icon: 'fa-file',       color: '#888780' },
};

const FilePreviewThumb = ({ file, isDark }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const category = getFileCategory(file.raw);

  useEffect(() => {
    if (category !== 'image') return;
    const url = URL.createObjectURL(file.raw);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file.raw, category]);

  return (
    
    <div className="relative shrink-0 w-10 h-10">
      {category === 'image' && previewUrl ? (
        <div className={`w-10 h-10 rounded-lg border overflow-hidden ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
          <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
          <i
            className={`fa-solid ${CATEGORY_ICON[category]?.icon || 'fa-file'}`}
            style={{ fontSize: 18, color: CATEGORY_ICON[category]?.color || '#888' }}
          />
        </div>
      )}
    </div>
  );
};

const DuplicateModal = ({ isDark, file, onResolve }) => {
  if (!file) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
    }}>
      <div style={{
        width: 380, borderRadius: 16, padding: 28,
        background: isDark ? '#0d0d0d' : '#ffffff',
        border: `0.5px solid ${isDark ? '#1e1e1e' : '#e2e8f0'}`,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 16,
          background: isDark ? 'rgba(251,191,36,0.1)' : '#fffbeb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 20, color: '#f59e0b' }} aria-hidden="true" />
        </div>
        <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 6px', color: isDark ? '#fff' : '#1e293b' }}>
          Duplicate file detected
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.6, margin: '0 0 16px', color: isDark ? '#555' : '#64748b' }}>
          A file with the same content exists. How would you like to handle{' '}
          <strong style={{ color: isDark ? '#888' : '#475569' }}>"{file.name}"</strong>?
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8, marginBottom: 20,
          border: `0.5px solid ${isDark ? '#1e1e1e' : '#e2e8f0'}`,
          background: isDark ? '#111' : '#f8fafc',
          fontSize: 12,
        }}>
          <i className="fa-solid fa-file" style={{ color: isDark ? '#444' : '#94a3b8' }} aria-hidden="true" />
          <span style={{ flex: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isDark ? '#fff' : '#334155' }}>
            {file.name}
          </span>
          <span style={{ color: isDark ? '#444' : '#94a3b8' }}>{file.size} MB</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => onResolve('replace')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#fff', color: '#000', fontWeight: 600, fontSize: 13,
          }}>
            <i className="fa-solid fa-arrows-rotate" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span>Replace existing</span>
              <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400, marginTop: 2 }}>Overwrite the old file with this one</span>
            </span>
          </button>
          <button onClick={() => onResolve('keep_both')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: isDark ? '#111' : '#f8fafc',
            border: `0.5px solid ${isDark ? '#222' : '#e2e8f0'}`,
            color: isDark ? '#fff' : '#334155',
          }}>
            <i className="fa-solid fa-copy" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span>Keep both</span>
              <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400, marginTop: 2 }}>Save as a renamed copy alongside the original</span>
            </span>
          </button>
          <button onClick={() => onResolve(null)} style={{
            width: '100%', padding: '10px', borderRadius: 12, border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            color: isDark ? '#444' : '#94a3b8',
          }}>
            Cancel upload
          </button>
        </div>
      </div>
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

const Dashboard = () => {
  const navigate = useNavigate();
  // --- THEME STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // --- UPLOAD FUNCTIONALITY STATE ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(null);
  const fileInputRef = useRef(null);
  const resolveRef = useRef(null);
  const uploadControlRef = useRef({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        showToast("Failed to fetch dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Theme Sync Logic
  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'light');
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

  // Toast auto-dismiss with clean slide-up exit animation
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, animateOut: true }));
        setTimeout(() => {
          setToast({ visible: false, message: '', type: 'success', animateOut: false });
        }, 350);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type: type, animateOut: false });
  };

  const isDark = theme === 'dark';

  // --- FILE HANDLING LOGIC ---
  const patchFile = useCallback((id, patch) =>
    setSelectedFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f)), []);

  const askDuplicateAction = useCallback((file) =>
    new Promise((resolve) => { resolveRef.current = resolve; setDuplicateModal({ file }); }), []);

  const handleModalResolve = (action) => {
    setDuplicateModal(null);
    if (resolveRef.current) { resolveRef.current(action); resolveRef.current = null; }
  };

  const isDuplicateError = (error) => {
    const errData = error?.response?.data;
    const status = error?.response?.status;
    if (errData?.duplicate === true || String(errData?.duplicate).toLowerCase() === 'true') return true;
    if (status === 409 && (errData?.error || '').includes('duplicate')) return true;
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
      return { uploadId: `${file.id}_${Math.random().toString(36).substr(2, 9)}`, startChunk: file.nextChunkIndex || 0 };
    }
    try {
      const { data } = await getChunkUploadStatus(file.uploadId);
      return { uploadId: data.upload_id, startChunk: data.next_chunk ?? file.nextChunkIndex ?? 0, progress: data.progress_percent ?? 0 };
    } catch {
      return { uploadId: file.uploadId, startChunk: file.nextChunkIndex || 0, progress: file.progress || 0 };
    }
  };

  const uploadSingleFile = async (file, duplicateAction = null) => {
    const totalChunks = Math.ceil(file.raw.size / CHUNK_SIZE);
    const session = await resolveUploadSession(file);
    const uploadId = session.uploadId;
    let startChunk = session.startChunk;

    uploadControlRef.current[file.id] = { pauseRequested: false, cancelRequested: false };

    patchFile(file.id, {
      status: 'uploading', uploadId, totalChunks,
      nextChunkIndex: startChunk,
      progress: session.progress ?? file.progress ?? 0,
      duplicateAction: duplicateAction || file.duplicateAction || null,
    });

    let lastResponse = null;

    for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex++) {
      const waitResult = await waitWhilePaused(file.id);
      if (waitResult === 'cancelled') {
        patchFile(file.id, { status: 'pending', progress: 0, uploadId: null, nextChunkIndex: 0 });
        return { cancelled: true };
      }

      const start = chunkIndex * CHUNK_SIZE;
      const chunk = file.raw.slice(start, Math.min(start + CHUNK_SIZE, file.raw.size));

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
        if (uploadControlRef.current[file.id]?.pauseRequested) await waitWhilePaused(file.id);
        if (uploadControlRef.current[file.id]?.cancelRequested) {
          patchFile(file.id, { status: 'pending', progress: 0, uploadId: null, nextChunkIndex: 0 });
          return { cancelled: true };
        }
        try {
          const response = await uploadFileChunk(formData);
          lastResponse = response;
          chunkDone = true;
          const data = response?.data || {};
          const progress = data.progress_percent ?? Math.round(((chunkIndex + 1) / totalChunks) * 100);
          patchFile(file.id, { progress, nextChunkIndex: data.next_chunk ?? chunkIndex + 1, uploadId });
          if (response.status === 201 || data.status === 'completed') {
            patchFile(file.id, { status: 'completed', progress: 100 });
            return lastResponse;
          }
        } catch (error) {
          if (isDuplicateError(error)) throw error;
          chunkRetries += 1;
          if (chunkRetries >= MAX_CHUNK_RETRIES) {
            patchFile(file.id, { status: 'paused', uploadId, nextChunkIndex: chunkIndex });
            try { await controlChunkUpload(uploadId, 'pause'); } catch { }
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
    uploadControlRef.current[file.id] = { ...(uploadControlRef.current[file.id] || {}), pauseRequested: true };
    patchFile(file.id, { status: 'paused' });
    if (file.uploadId) try { await controlChunkUpload(file.uploadId, 'pause'); } catch { }
  };

  const handleResume = async (file) => {
    uploadControlRef.current[file.id] = { pauseRequested: false, cancelRequested: false };
    if (file.uploadId) try { await controlChunkUpload(file.uploadId, 'resume'); } catch { }
    try {
      await uploadSingleFile(file, file.duplicateAction || null);
    } catch (err) {
      if (isDuplicateError(err)) {
        const action = await askDuplicateAction(file);
        if (!action) { patchFile(file.id, { status: 'paused' }); return; }
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
      if (file.status !== 'paused') patchFile(file.id, { status: 'error' });
      const errData = err?.response?.data;
      showToast(errData?.error || errData?.content_type?.[0] || `Upload failed for "${file.name}"`, 'error');
    }
  };

  const handleCancelUpload = async (file) => {
    uploadControlRef.current[file.id] = { pauseRequested: true, cancelRequested: true };
    if (file.uploadId) try { await controlChunkUpload(file.uploadId, 'cancel'); } catch { }
    patchFile(file.id, { status: 'pending', progress: 0, uploadId: null, nextChunkIndex: 0 });
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
      if (file.status !== 'paused') patchFile(file.id, { status: 'paused' });
      const errData = err?.response?.data;
      showToast(
        errData?.error || errData?.content_type?.[0] || errData?.file?.[0] || errData?.file_size?.[0] ||
        `Upload interrupted for "${file.name}". Press Resume to continue.`,
        'error'
      );
      return false;
    }
  };

  const handleZoneClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files)
      .filter(file => {
        if (!file.type && file.size % 4096 === 0) { showToast('Folders are not supported', 'error'); return false; }
        if (file.type && !ALLOWED_CONTENT_TYPES.has(file.type)) {
          showToast(`"${file.name}" — type not allowed`, 'error');
          return false;
        }
        if (file.size > MAX_FILE_BYTES) { showToast(`"${file.name}" exceeds 100MB`, 'error'); return false; }
        return true;
      })
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        raw: file,
        status: 'pending',
        progress: 0,
        uploadId: null,
        nextChunkIndex: 0,
        totalChunks: Math.ceil(file.size / CHUNK_SIZE),
      }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    const f = selectedFiles.find(f => f.id === id);
    if (f?.status === 'uploading') handleCancelUpload(f);
    setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUpload = async () => {
    const pending = selectedFiles.filter(f => f.status === 'pending');
    if (!pending.length) { showToast('Please select files first.', 'error'); return; }
    let successCount = 0;
    for (const file of pending) { const ok = await processFileUpload(file); if (ok) successCount++; }
    if (successCount > 0) {
      showToast(`${successCount} file(s) uploaded successfully`, 'success');
      setTimeout(() => { 
        setSelectedFiles(prev => prev.filter(f => f.status !== 'completed')); 
        if (fileInputRef.current) fileInputRef.current.value = null; 
      }, 1200);
    }
  };

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'}`}>
      
      {duplicateModal && (
        <DuplicateModal isDark={isDark} file={duplicateModal.file} onResolve={handleModalResolve} />
      )}

      {/* Professional Top-Sliding Toast */}
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
            animation: !toast.animateOut ? 'slideDownProfessional 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
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
            
            <span className="flex-1 leading-normal tracking-wide text-[13px]">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDownProfessional {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .professional-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .professional-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .professional-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#222' : '#cbd5e1'};
          border-radius: 10px;
        }
        .professional-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#333' : '#94a3b8'};
        }
      `}</style>

      {/* 1. TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link to="/schedules" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-regular fa-calendar-days text-blue-500"></i> Schedules
          </Link>
          <Link to="/reports" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-solid fa-chart-line text-emerald-500"></i> View Reports
          </Link>
          <Link to="/threads" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
          <i className="fa-solid fa-code-branch text-red-500"></i> Threads
          </Link>
          <Link to="/starred" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-slate-300 hover:bg-[#111] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}>
            <i className="fa-solid fa-star text-yellow-300"></i> Starred
          </Link>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/upload-file" className="flex-1 md:flex-none bg-blue-600 text-white p-[10px_24px] rounded-xl font-bold text-xs transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
            <i className="fa fa-plus text-[10px]"></i> New Document
          </Link>
        </div>
      </div>

      {/* 2. TOP SECTION: GRAPH & UPLOAD AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Storage Visualizer */}
        <div className={`lg:col-span-1 border rounded-3xl p-6 flex flex-col items-center justify-center transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="w-full flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Storage Overview</span>

          </div>
          
          <div className="relative flex items-center justify-center py-2">
             <svg className="w-44 h-44 transform -rotate-90">
                <circle cx="88" cy="88" r="75" stroke="currentColor" strokeWidth="12" fill="transparent" className={`${isDark ? 'text-[#111]' : 'text-slate-100'}`} />
                <circle cx="88" cy="88" r="75" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="471" strokeDashoffset={471 - (471 * ((dashboardData?.storage_summary?.percentage_used || 0) / 100))} strokeLinecap="round" className="text-blue-600 transition-all duration-1000" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{dashboardData?.storage_summary?.percentage_used || 0}%</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Used</span>
             </div>
          </div>

          <div className="w-full flex flex-col gap-4 mt-4 px-2">
            <div className="flex justify-between items-end">
              <div>
                <div className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{dashboardData?.storage_summary?.storage_used_human || '0 B'}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total space used</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-500">{dashboardData?.storage_summary?.free_storage_human || '0 B'}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Remaining</div>
              </div>
            </div>
            
          <button
            onClick={() => navigate("/storage/storage-cleanup")}
            className={`w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              isDark
                ? 'bg-[#111] text-white border border-[#222] hover:bg-[#1a1a1a]'
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-white hover:shadow-md'
            }`}
          >
            Manage Storage
          </button>
          </div>
        </div>

        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`lg:col-span-2 border-2 border-dashed rounded-3xl p-6 flex flex-col transition-all min-h-[340px] ${
            isDragging ? 'border-blue-500 bg-blue-500/5' : 
            isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {selectedFiles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center cursor-pointer" onClick={handleZoneClick}>
               <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-blue-50'}`}>
                <i className="fa-solid fa-cloud-arrow-up text-2xl text-blue-500"></i>
              </div>
              <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Click or drag file to upload</h3>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Maximum single file size: 100MB</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{selectedFiles.length} item(s) selected</span>
                <button onClick={() => setSelectedFiles([])} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Discard All</button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 mb-4 professional-scrollbar space-y-3" style={{ maxHeight: '200px' }}>
                {selectedFiles.map(file => {
                  const isProcessing = ['uploading', 'paused', 'completed'].includes(file.status);
                  return (
                    <div key={file.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isDark ? 'bg-black border-[#1a1a1a]' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <FilePreviewThumb file={file} isDark={isDark} />
                        <div className="min-w-0">
                            <p className="text-xs font-bold truncate max-w-[200px] leading-none mb-1">{file.name}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">{file.size} MB</span>
                                {isProcessing && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${file.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {STATUS_LABELS[file.status]} {file.progress}%
                                    </span>
                                )}
                            </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {file.status === 'uploading' && (
                            <button onClick={() => handlePause(file)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all" title="Pause">
                                <i className="fa-solid fa-pause text-[10px]"></i>
                            </button>
                        )}
                        {(file.status === 'paused' || file.status === 'error') && file.uploadId && (
                            <button onClick={() => handleResume(file)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Resume">
                                <i className="fa-solid fa-play text-[10px]"></i>
                            </button>
                        )}
                        {file.status === 'pending' && (
                            <button onClick={() => removeFile(file.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Remove">
                                <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                        )}
                        {file.status === 'completed' && (
                            <div className="p-2 text-emerald-500">
                                <i className="fa-solid fa-circle-check text-xs"></i>
                            </div>
                        )}
                        {/* Always allow clearing individual items that are not actively uploading */}
                        {file.status !== 'uploading' && file.status !== 'completed' && file.status !== 'pending' && (
                             <button onClick={() => removeFile(file.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Remove">
                                <i className="fa-solid fa-trash-can text-[10px]"></i>
                             </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={handleUpload}
                disabled={!selectedFiles.some(f => f.status === 'pending')}
                className={`mt-auto w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                    selectedFiles.some(f => f.status === 'pending') 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
                    : 'bg-slate-600/20 text-slate-500 cursor-not-allowed border border-slate-800/10'
                }`}
              >
                {selectedFiles.some(f => f.status === 'uploading') ? "Processing Upload..." : "Confirm & Start Upload"}
              </button>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple className="hidden" />
        </div>
      </div>

      {/* 3. KPI ROW (Moved down as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Files in System" value={dashboardData?.kpi?.total_files || 0} sub="Total Files in System" isDark={isDark} />
          <StatCard label="Total Sent" value={dashboardData?.kpi?.total_sent || 0} sub="Files delivered" isDark={isDark} />
          <StatCard label="Shared Contacts" value={dashboardData?.kpi?.shared_contacts || 0} sub="Active recipients" isDark={isDark} />
          <div className={`border p-5 rounded-2xl flex flex-col justify-center transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="text-[10px] text-blue-500 uppercase tracking-widest font-black mb-1">Next Report In</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{dashboardData?.kpi?.next_report_days !== null && dashboardData?.kpi?.next_report_days !== undefined ? dashboardData.kpi.next_report_days : '-'} <span className={`text-sm ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>days</span></div>
            <div className={`text-[10px] mt-1 font-bold uppercase ${isDark ? 'text-[#444]' : 'text-slate-300'}`}>Monthly Cycle</div>
          </div>
      </div>

      {/* 4. ACTIVITY & LINKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`border rounded-xl p-6 transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`font-bold text-sm uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Activities</div>
            <div
              onClick={() => navigate("/recent")}
              className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline"
            >
              View all logs
            </div>          </div>
          <div className="space-y-3">
            {dashboardData?.recent_activities?.map((act, index) => (
                <ActivityItem key={index} icon={act.icon} title={act.title} sub={act.sub} time={act.time} isDark={isDark} />
            ))}
            {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                <div className={`text-sm font-medium ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>No recent activities</div>
            )}
          </div>
        </div>

        <div className={`border rounded-xl p-6 transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className={`font-bold text-sm uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Active Shared Links</div>
            <div className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Manage links</div>
          </div>
          <div className="space-y-3">
            {dashboardData?.active_links?.map((link, index) => (
                <SharedLinkItem key={index} title={link.title} expiry={link.expiry} clicks={link.clicks} active={link.active} isDark={isDark} />
            ))}
            {(!dashboardData?.active_links || dashboardData.active_links.length === 0) && (
                <div className={`text-sm font-medium ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>No active links</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

/* --- MINI COMPONENTS --- */
const StatCard = ({ label, value, sub, isDark }) => (
  <div className={`border p-5 rounded-2xl transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#222]' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'}`}>
    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
    <div className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{label}</div>
    <div className={`text-[10px] mt-1 font-medium ${isDark ? 'text-[#333]' : 'text-slate-300'}`}>{sub}</div>
  </div>
);

const ActivityItem = ({ icon, title, sub, time, isDark }) => (
  <div className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer group ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#0f0f0f]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200'}`}>
    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-4 transition-all ${isDark ? 'bg-black border-[#1a1a1a] group-hover:border-blue-500/50' : 'bg-white border-slate-200 group-hover:border-blue-400'}`}>
      <i className={`fa-solid ${icon} text-[16px] ${isDark ? 'text-[#333]' : 'text-blue-500'} group-hover:text-blue-500`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold truncate ${isDark ? 'text-[#ccc] group-hover:text-white' : 'text-slate-700 group-hover:text-blue-600'}`}>{title}</p>
      <p className={`text-[11px] font-medium ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{sub}</p>
    </div>
    <div className={`text-[10px] font-bold uppercase ml-2 ${isDark ? 'text-[#333]' : 'text-slate-300'}`}>{time}</div>
  </div>
);

const SharedLinkItem = ({ title, expiry, clicks, active, isDark }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#0f0f0f]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200'}`}>
    <div className="flex items-center min-w-0">
      <div className={`w-2 h-2 rounded-full mr-4 ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : (isDark ? 'bg-[#222]' : 'bg-slate-300')}`}></div>
      <div className="min-w-0">
        <p className={`text-sm font-bold truncate ${isDark ? 'text-[#ccc]' : 'text-slate-700'}`}>{title}</p>
        <p className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{clicks} views • {expiry}</p>
      </div>
    </div>
    <i className={`fa-solid fa-arrow-up-right-from-square text-[10px] ${isDark ? 'text-[#222]' : 'text-slate-300'}`}></i>
  </div>
);

export default Dashboard;