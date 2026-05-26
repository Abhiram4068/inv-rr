import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  uploadFileChunk,
  getChunkUploadStatus,
  controlChunkUpload,
} from '../../services/fileService';
import { getFileMeta } from '../../utils/fileIcons'; 
const CHUNK_SIZE = 10 * 1024 * 1024;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_CHUNK_RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Allowed types (mirrors backend) ─────────────────────────────────────────
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



// ─── File preview thumbnail ───────────────────────────────────────────────────
const FilePreviewThumb = ({ file, statusDotClass, isDark }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const meta = getFileMeta(file.raw.type || '');
  const isImage = meta.category === 'image';

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file.raw);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file.raw, isImage]);

  const dotBorder = isDark ? '#0a0a0a' : '#ffffff';

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: 48, height: 48 }}>
      {isImage && previewUrl ? (
        <div style={{
          width: 48, height: 48,
          borderRadius: 8,
          border: '0.5px solid var(--color-border-tertiary)',
          overflow: 'hidden',
        }}>
          <img
            src={previewUrl}
            alt={file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{
          width: 48, height: 48,
          borderRadius: 8,
          border: '0.5px solid var(--color-border-tertiary)',
          background: isDark ? '#111' : '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <i
            className={`fa-solid ${meta.icon}`}
            style={{
              fontSize: meta.fontSize ?? 22,
              color: meta.color,
              transform: meta.transform ?? 'none',
            }}
            aria-hidden="true"
          />
        </div>
      )}
      <span style={{
        position: 'absolute', bottom: -4, right: -4,
        width: 12, height: 12,
        borderRadius: '50%',
        border: `2px solid ${dotBorder}`,
      }} className={statusDotClass} />
    </div>
  );
};

// ─── Duplicate modal ──────────────────────────────────────────────────────────
const DuplicateModal = ({ isDark, file, onResolve }) => {
  if (!file) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
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
          <i className="ti ti-alert-triangle" style={{ fontSize: 20, color: '#f59e0b' }} aria-hidden="true" />
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
          <i className="ti ti-file" style={{ color: isDark ? '#444' : '#94a3b8' }} aria-hidden="true" />
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
            <i className="ti ti-refresh" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
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
            <i className="ti ti-copy" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
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

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending: 'Waiting',
  uploading: 'Uploading',
  paused: 'Paused',
  completed: 'Completed',
  error: 'Failed',
};

const STATUS_DOT_CLASS = {
  pending: 'bg-[#333]',
  uploading: 'bg-amber-400 animate-pulse',
  paused: 'bg-blue-400',
  completed: 'bg-emerald-500',
  error: 'bg-red-500',
};

const STATUS_BADGE = {
  uploading: { bg: 'rgba(245,158,11,0.15)', color: '#b45309' },
  paused:    { bg: 'rgba(96,165,250,0.15)', color: '#1d4ed8' },
  completed: { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
  error:     { bg: 'rgba(239,68,68,0.15)',  color: '#dc2626' },
};

// ─── Main component ───────────────────────────────────────────────────────────
const UploadFilesMain = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [duplicateModal, setDuplicateModal] = useState(null);
  const fileInputRef = useRef(null);
  const resolveRef = useRef(null);
  const uploadControlRef = useRef({});

  const isDark = theme === 'dark';

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
    if (!toast.visible) return;
    const dismissTimer = setTimeout(() => {
      setToast(prev => ({ ...prev, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, 3500);
    return () => clearTimeout(dismissTimer);
  }, [toast.visible]);

  const showToast = (message, type = 'success') =>
    setToast({ visible: true, message, type, animateOut: false });

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

  const handleFiles = (files) => {
    const newFiles = Array.from(files)
      .filter(file => {
        if (!file.type && file.size % 4096 === 0) { showToast('Folders are not supported', 'error'); return false; }
        // Frontend MIME pre-check — backend magic is the source of truth
        if (file.type && !ALLOWED_CONTENT_TYPES.has(file.type)) {
          showToast(`"${file.name}" — file type not allowed`, 'error');
          return false;
        }
        if (file.size > MAX_FILE_BYTES) { showToast(`"${file.name}" exceeds the 100 MB limit`, 'error'); return false; }
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

  const handleFileChange = (e) => { if (e.target.files.length > 0) handleFiles(e.target.files); };
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files); };
  const removeFile = (id) => { const f = selectedFiles.find(f => f.id === id); if (f?.status === 'uploading') handleCancelUpload(f); setSelectedFiles(prev => prev.filter(f => f.id !== id)); };
  const clearAllFiles = () => { selectedFiles.forEach(f => { if (['uploading', 'paused'].includes(f.status)) handleCancelUpload(f); }); setSelectedFiles([]); if (fileInputRef.current) fileInputRef.current.value = null; showToast('Cleared all files', 'success'); };

  const handleUpload = async () => {
    const pending = selectedFiles.filter(f => f.status === 'pending');
    if (!pending.length) { showToast('Please select files first.', 'error'); return; }
    let successCount = 0;
    for (const file of pending) { const ok = await processFileUpload(file); if (ok) successCount++; }
    if (successCount > 0) {
      showToast(`${successCount} file(s) uploaded successfully`, 'success');
      setTimeout(() => { setSelectedFiles(prev => prev.filter(f => f.status !== 'completed')); if (fileInputRef.current) fileInputRef.current.value = null; }, 1200);
    }
  };

  const showProgress = (file) => ['uploading', 'paused', 'completed'].includes(file.status);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main style={{
      flex: 1, overflowY: 'visible', padding: 40,
      background: isDark ? '#000' : '#E6EBF2',
      position: 'relative', transition: 'background 0.3s',
    }}>
      {duplicateModal && (
        <DuplicateModal isDark={isDark} file={duplicateModal.file} onResolve={handleModalResolve} />
      )}

      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: 24, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', zIndex: 9999,
          pointerEvents: 'none',
          transition: 'all 350ms cubic-bezier(0.16,1,0.3,1)',
          opacity: toast.animateOut ? 0 : 1,
          transform: toast.animateOut ? 'translateY(-24px) scale(0.95)' : 'translateY(0) scale(1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 20px', borderRadius: 12,
            background: isDark ? '#0d0d0d' : '#fff',
            border: `0.5px solid ${isDark ? '#1e1e1e' : '#f1f5f9'}`,
            fontSize: 13, fontWeight: 500, pointerEvents: 'auto',
            minWidth: 300, maxWidth: 450,
            color: isDark ? '#e2e8f0' : '#1e293b',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: toast.type === 'error'
                ? (isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2')
                : (isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4'),
              color: toast.type === 'error' ? '#f87171' : '#34d399',
            }}>
              <i className={`ti ${toast.type === 'error' ? 'ti-alert-circle' : 'ti-circle-check'}`} style={{ fontSize: 13 }} aria-hidden="true" />
            </div>
            <span style={{ flex: 1, letterSpacing: '0.01em' }}>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: isDark ? '#fff' : '#1e293b' }}>
          Upload files
        </h2>
        <p style={{ marginTop: 4, fontWeight: 400, color: isDark ? '#808080' : '#64748b', fontSize: 14 }}>
          Large files upload in 10 MB chunks. You can pause and resume anytime.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => { if (fileInputRef.current) fileInputRef.current.value = null; fileInputRef.current?.click(); }}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        style={{
          width: '100%', height: 320,
          border: `2px dashed ${isDragging ? '#3b82f6' : isDark ? '#1a1a1a' : '#cbd5e1'}`,
          borderRadius: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', marginBottom: 20, textAlign: 'center',
          background: isDragging ? 'rgba(59,130,246,0.05)' : isDark ? '#0a0a0a' : '#fff',
          transition: 'all 0.2s',
        }}
      >
        <i className="ti ti-cloud-upload" style={{ fontSize: 40, color: '#3b82f6', marginBottom: 12 }} aria-hidden="true" />
        <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#fff' : '#475569' }}>
          Drop files here or click to upload
        </span>
        <span style={{ fontSize: 12, marginTop: 4, color: isDark ? '#555' : '#94a3b8' }}>
          Max 100 MB per file
        </span>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple style={{ display: 'none' }} />
      </div>

      {/* File list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {selectedFiles.map(file => {
          const badge = STATUS_BADGE[file.status];
          return (
            <div key={file.id} style={{
              padding: 14, borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 14,
              border: `0.5px solid ${isDark ? '#1a1a1a' : '#e2e8f0'}`,
              background: isDark ? '#0a0a0a' : '#fff',
            }}>
              {/* Thumbnail with status dot */}
              <FilePreviewThumb
                file={file}
                isDark={isDark}
                statusDotClass={STATUS_DOT_CLASS[file.status] || STATUS_DOT_CLASS.pending}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 500, margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: isDark ? '#fff' : '#334155',
                  }}>
                    {file.name}
                  </p>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    flexShrink: 0, whiteSpace: 'nowrap',
                   
                    color: badge ? badge.color : isDark ? '#888' : '#64748b',
                  }}>
                    {STATUS_LABELS[file.status] || file.status}
                  </span>
                </div>

                <span style={{ fontSize: 11, color: isDark ? '#808080' : '#94a3b8', fontWeight: 500 }}>
                  {file.size} MB
                </span>

                {showProgress(file) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 99, background: isDark ? '#222' : '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{
                        width: `${file.progress || 0}%`, height: '100%', borderRadius: 99,
                        background: file.status === 'completed' ? '#10b981' : '#f59e0b',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, width: 32, textAlign: 'right', color: isDark ? '#808080' : '#64748b' }}>
                      {file.progress || 0}%
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {file.status === 'uploading' && (
                  <>
                    <button onClick={() => handlePause(file)} title="Pause" style={{
                      padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
                      cursor: 'pointer', color: '#f59e0b', display: 'flex', alignItems: 'center',
                    }}>
                      <i className="ti ti-player-pause" style={{ fontSize: 15 }} aria-label="Pause" />
                    </button>
                    <i className="ti ti-loader-2" style={{ fontSize: 15, color: '#f59e0b', padding: '0 4px' }} aria-hidden="true" />
                  </>
                )}
                {(['paused', 'error'].includes(file.status) && file.uploadId) && (
                  <>
                    <button onClick={() => handleResume(file)} title="Resume" style={{
                      padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
                      cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center',
                    }}>
                      <i className="ti ti-player-play" style={{ fontSize: 15 }} aria-label="Resume" />
                    </button>
                    <button onClick={() => handleCancelUpload(file)} title="Cancel" style={{
                      padding: 8, borderRadius: 8, border: 'none', background: 'transparent',
                      cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center',
                    }}>
                      <i className="ti ti-player-stop" style={{ fontSize: 15 }} aria-label="Cancel" />
                    </button>
                  </>
                )}
                {file.status === 'completed' && (
                  <i className="ti ti-circle-check" style={{ fontSize: 16, color: '#10b981', padding: '0 8px' }} aria-hidden="true" />
                )}
                {file.status === 'pending' && (
                   <button onClick={() => removeFile(file.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Remove">
                      <i className="fa-solid fa-xmark text-xs"></i>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16,
        paddingTop: 20, marginTop: 20,
        borderTop: `0.5px solid ${isDark ? '#1a1a1a' : '#e2e8f0'}`,
      }}>
        {selectedFiles.length > 0 && (
          <button onClick={clearAllFiles} style={{
            fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none',
            cursor: 'pointer', color: isDark ? '#808080' : '#64748b',
          }}>
            Clear all
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFiles.some(f => f.status === 'pending')}
          style={{
            padding: '12px 30px', borderRadius: 25, fontWeight: 600, fontSize: 14,
            border: 'none', cursor: selectedFiles.some(f => f.status === 'pending') ? 'pointer' : 'not-allowed',
            background: selectedFiles.some(f => f.status === 'pending')
              ? (isDark ? '#e3e3e3' : '#1e293b')
              : '#6b7280',
            color: selectedFiles.some(f => f.status === 'pending')
              ? (isDark ? '#000' : '#fff')
              : '#fff',
            opacity: selectedFiles.some(f => f.status === 'pending') ? 1 : 0.4,
            transition: 'all 0.2s',
          }}
        >
          Confirm &amp; Upload
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ti-loader-2 { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .bg-\\[\\#333\\] { background: #333; }
        .bg-amber-400 { background: #f59e0b; }
        .bg-blue-400 { background: #60a5fa; }
        .bg-emerald-500 { background: #10b981; }
        .bg-red-500 { background: #ef4444; }
      `}</style>
    </main>
  );
};

export default UploadFilesMain;