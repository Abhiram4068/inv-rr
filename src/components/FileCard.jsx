import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import * as pdfjsLib from 'pdfjs-dist';
import { getFileMeta } from "../utils/fileIcons";
import { deleteFile, updateFile } from '../services/fileService';
import { shareFile } from '../services/shareService';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const PdfThumb = ({ fileUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!fileUrl || !canvasRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const viewport = page.getViewport({ scale: 0.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      } catch (e) {
        console.warn('PDF preview failed:', e);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [fileUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-contain"
      style={{ background: '#fff' }}
    />
  );
};

const FileCard = ({
  id,
  title,
  display_name,
  originalName,
  size,
  time,
  iconClass,
  isLink = false,
  fileUrl,
  contentType,
  isStarred,
  onToggleStar,
  onDeleted,   // callback so parent can remove the card from the list after delete
  // ── New Selection Props ──────────────────────────────────────
  showSelection = false,
  isSelected = false,
  onSelectChange,
  onRemove, // callback to remove from collection
}) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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
  const fileMeta = getFileMeta(contentType);

  // ── Modal state ──────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState(null); // 'share' | 'delete' | null

  // ── Toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type, animateOut: false });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const out = setTimeout(() => {
      setToast(prev => ({ ...prev, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, 3000);
    return () => clearTimeout(out);
  }, [toast.visible]);

  // ── Share state ──────────────────────────────────────────────
  const [recipients, setRecipients] = useState(['']);
  const [isProtected, setIsProtected] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState({
    title: '',
    message: '',
    expiration_datetime: 48,
    permission: 'view_only',
    download_limit: null,
    view_limit: null,
  });
  const [isCustomExpiry, setIsCustomExpiry] = useState(false);
  const [customExpiry, setCustomExpiry] = useState('');

  const addRecipient = () => setRecipients(prev => [...prev, '']);
  const removeRecipient = (i) => {
    const updated = recipients.filter((_, idx) => idx !== i);
    setRecipients(updated.length ? updated : ['']);
  };
  const handleEmailChange = (i, val) => {
    const updated = [...recipients];
    updated[i] = val;
    setRecipients(updated);
  };

  const handleShare = async () => {
    const validEmails = recipients.filter(r => r.trim() !== '');
    if (!validEmails.length) { showToast('Please add at least one recipient email', 'error'); return; }
    if (!shareData.title?.trim()) { showToast('Title is required', 'error'); return; }

    const payload = {
      recipient_emails: validEmails,
      expiration_datetime: isCustomExpiry ? Number(customExpiry) : Number(shareData.expiration_datetime),
      title: shareData.title,
      message: shareData.message,
      permission: shareData.permission,
      download_limit:
        shareData.permission === 'one_time_download' ? 1
          : shareData.permission === 'view_download' ? shareData.download_limit
            : null,
      view_limit:
        (shareData.permission === 'view_only' || shareData.permission === 'view_download')
          ? shareData.view_limit : null,
    };

    setIsSharing(true);
    try {
      const response = await shareFile(id, payload);

      setActiveModal(null);

      setTimeout(() => {
        showToast(response.data.message);
      }, 150);
      setRecipients(['']);
      setShareData({ title: '', message: '', expiration_datetime: 48, permission: 'view_only', download_limit: null, view_limit: null });
      setIsCustomExpiry(false);
      setCustomExpiry('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to share file';
      showToast(msg, 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteFile(id);
      setActiveModal(null);
      if (!onDeleted) {
        showToast('File moved to trash');
      }
      onDeleted?.(id);
    } catch {
      showToast('Failed to move file to trash', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Preview helpers ──────────────────────────────────────────
  const PreviewArea = () => {
    if (fileMeta.category === 'image' && fileUrl) {
      return <img src={fileUrl} alt={title} className="w-full h-full object-cover absolute inset-0" />;
    }
    if (fileMeta.category === 'pdf' && fileUrl) {
      return <PdfThumb fileUrl={fileUrl} />;
    }
    return null;
  };

  const HoverOverlay = () => (
    <div className="absolute inset-0 z-20 flex items-center justify-center  opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <span className="text-white text-[11px] font-semibold tracking-wide bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
        Click to view details
      </span>
    </div>
  );

  const iconClassForFile = () => {
    const name = originalName || '';
    const ct = contentType || '';
    const lower = String(name).toLowerCase();
    if (lower.endsWith('.pdf') || ct.includes('pdf')) return 'fa-file-pdf';
    if (lower.endsWith('.doc') || lower.endsWith('.docx') || ct.includes('word')) return 'fa-file-word';
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || ct.includes('excel')) return 'fa-file-excel';
    if (/\.(png|jpe?g|gif|webp)$/.test(lower) || ct.includes('image')) return 'fa-file-image';
    if (/\.(mp4|mov|mkv|webm)$/.test(lower) || ct.includes('video')) return 'fa-file-video';
    return 'fa-file';
  };

  // ── Card JSX ─────────────────────────────────────────────────
  const Content = (
    <>
      {/* Preview area */}
      <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors duration-300 overflow-hidden
        ${isDark ? 'bg-[#111] border-[#555]' : 'bg-slate-50 border-slate-100'}`}>

        {/* Selection Radio/Checkbox Overlaid on the Top-Left of the Preview */}
        <div
          className={`absolute top-3 left-3 z-30 transition-all duration-200 
            ${(showSelection || isSelected) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          onClick={(e) => {
            // Stop Link navigation or generic div click when changing selection state
            e.preventDefault();
            e.stopPropagation();
            onSelectChange?.(id, !isSelected);
          }}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-sm
            ${isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : isDark ? 'bg-black/50 border-white/30 text-transparent' : 'bg-white/80 border-slate-300 text-transparent hover:border-blue-500'}`}>
            <i className="fa-solid fa-check text-[10px]" />
          </div>
        </div>

        <PreviewArea />
        <HoverOverlay />
        {!fileMeta.canPreview && (
          <i
            className={`fa-solid ${fileMeta.icon} absolute z-10 group-hover:scale-110 transition-all`}
            style={{ color: fileMeta.color, fontSize: '64px', transform: 'rotate(-5deg)', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`block text-[12px] font-medium truncate ${isDark ? 'text-[#aaa]' : 'text-slate-500'}`}>
            {title}
          </span>


          {/* Action icons */}
          {!showSelection && (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Star */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newState = !isStarred;
                  try {
                    await updateFile(id, { is_starred: newState });
                    onToggleStar?.(id, newState);
                    showToast(newState ? 'Added to Starred' : 'Removed from Starred');
                  } catch {
                    showToast('Failed to update star', 'error');
                  }
                }}
                className={`transition-all text-[13px]
                  ${isStarred ? 'text-yellow-400' : isDark ? 'text-[#666] hover:text-yellow-400' : 'text-slate-400 hover:text-yellow-500'}`}
                title="Star"
              >
                <i className={`${isStarred ? 'fa-solid' : 'fa-regular'} fa-star`} />
              </button>

              {/* Share */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('share'); }}
                className={`transition-all text-[13px] ${isDark ? 'text-[#666] hover:text-blue-400' : 'text-slate-400 hover:text-blue-500'}`}
                title="Share"
              >
                <i className="fa-solid fa-share-nodes" />
              </button>

              {/* Remove from Collection */}
              {onRemove && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('remove'); }}
                  className={`transition-all text-[13px] ${isDark ? 'text-[#666] hover:text-orange-400' : 'text-slate-400 hover:text-orange-500'}`}
                  title="Remove from Collection"
                >
                  <i className="fa-solid fa-folder-minus" />
                </button>
              )}

              {/* Delete */}
              {!onRemove && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('delete'); }}
                  className={`transition-all text-[13px] ${isDark ? 'text-[#666] hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                  title="Delete"
                >
                  <i className="fa-regular fa-trash-can" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`flex justify-between text-[12px] font-medium ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          <span>{size}</span>
          <span>{time}</span>
        </div>
      </div>
    </>
  );

  const containerClass = `rounded-lg overflow-hidden transition-all no-underline group cursor-pointer border
    ${isSelected
      ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/30'
      : isDark
        ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] hover:-translate-y-1'
        : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-1'}`;

  return (
    <>
      {/* Card */}
      {isLink ? (
        <Link to={`/file/${id}`} className={containerClass}>{Content}</Link>
      ) : (
        <div
          className={containerClass}
          onClick={() => {
            if (showSelection) {
              onSelectChange?.(id, !isSelected);
            }
          }}
        >
          {Content}
        </div>
      )}

      {/* ── Toast ── */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none transition-all duration-[350ms]
            ${toast.animateOut ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
            ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error'
                ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500')
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')}`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
            </div>
            <span className="flex-1 leading-normal tracking-wide text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          {/* Stop click-through on modal box */}
          <div onClick={(e) => e.stopPropagation()}>

            {/* ════════════ SHARE MODAL ════════════ */}
            {activeModal === 'share' && (
              <div className={`border w-full max-w-[900px] min-h-[560px] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row
                ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>

                {/* Left column — form */}
                <div className={`flex-1 p-8 border-b md:border-b-0 md:border-r max-h-[90vh] overflow-y-auto no-scrollbar
                  ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
                  <h2 className={`text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Share File</h2>

                  <div className="space-y-6">

                    {/* Title */}
                    <div>
                      <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Title</label>
                      <input
                        value={shareData.title}
                        onChange={(e) => setShareData({ ...shareData, title: e.target.value })}
                        placeholder="e.g. Important Project Updates"
                        className={`w-full border rounded-xl p-4 text-sm outline-none transition-all
                          ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                      />
                    </div>

                    {/* Recipient emails */}
                    <div>
                      <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Recipient Emails</label>
                      <div className="space-y-3">
                        {recipients.map((email, i) => (
                          <div key={i} className="flex gap-3">
                            <input
                              value={email}
                              onChange={(e) => handleEmailChange(i, e.target.value)}
                              placeholder="Enter email address..."
                              type="email"
                              className={`flex-1 border rounded-xl p-4 text-sm outline-none transition-all
                                ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                            />
                            {i === recipients.length - 1 ? (
                              <button onClick={addRecipient} className="bg-blue-600/10 border border-blue-500/30 w-[54px] h-[54px] rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                                <i className="fa-solid fa-plus" />
                              </button>
                            ) : (
                              <button onClick={() => removeRecipient(i)} className={`border w-[54px] h-[54px] rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-[#111] border-[#1a1a1a] text-[#444] hover:text-red-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-red-500'}`}>
                                <i className="fa-solid fa-trash-can text-sm" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Message</label>
                      <textarea
                        value={shareData.message}
                        onChange={(e) => setShareData({ ...shareData, message: e.target.value })}
                        placeholder="Write a note to recipients..."
                        rows="4"
                        className={`w-full border rounded-xl p-4 text-sm outline-none resize-none transition-all
                          ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333] placeholder:text-[#333]'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-300 placeholder:text-slate-300'}`}
                      />
                    </div>

                    {/* Permission */}
                    <div>
                      <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Access Permission</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'view_only', icon: 'fa-eye', label: 'View only', desc: 'Read in browser, no download' },
                          { value: 'view_download', icon: 'fa-download', label: 'View + Download', desc: 'Can save file to device' },
                          { value: 'one_time_download', icon: 'fa-file-arrow-down', label: 'One-time Download', desc: 'Link dies after 1 download' },
                          { value: 'full_access', icon: 'fa-lock-open', label: 'Full Access', desc: 'No restrictions' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setShareData({ ...shareData, permission: opt.value, download_limit: null })}
                            className={`text-left p-4 rounded-xl border transition-all
                              ${shareData.permission === opt.value
                                ? 'border-blue-500/50 bg-blue-600/10'
                                : isDark ? 'border-[#1a1a1a] bg-[#050505] hover:bg-[#111]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                          >
                            <div className={`flex items-center gap-2 mb-1 text-xs font-bold
                              ${shareData.permission === opt.value ? 'text-blue-500' : isDark ? 'text-white' : 'text-slate-700'}`}>
                              <i className={`fa-solid ${opt.icon}`} /> {opt.label}
                            </div>
                            <div className={`text-[10px] ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>

                      {/* Download limit (view_download only) */}
                      {shareData.permission === 'view_download' && (
                        <div className="mt-4">
                          <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                            Download limit <span className={`normal-case font-normal ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>(blank = unlimited)</span>
                          </label>
                          <input
                            type="number" min="1"
                            value={shareData.download_limit || ''}
                            onChange={(e) => setShareData({ ...shareData, download_limit: e.target.value ? Number(e.target.value) : null })}
                            placeholder="e.g. 5"
                            className={`w-full border rounded-xl p-4 text-sm outline-none transition-all
                              ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                          />
                        </div>
                      )}

                      {/* View limit (view_only + view_download) */}
                      {(shareData.permission === 'view_only' || shareData.permission === 'view_download') && (
                        <div className="mt-4">
                          <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                            View limit <span className={`normal-case font-normal ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>(blank = unlimited)</span>
                          </label>
                          <input
                            type="number" min="1"
                            value={shareData.view_limit || ''}
                            onChange={(e) => setShareData({ ...shareData, view_limit: e.target.value ? Number(e.target.value) : null })}
                            placeholder="e.g. 3"
                            className={`w-full border rounded-xl p-4 text-sm outline-none transition-all
                              ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Expiry + Security */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Link Expiry</label>
                        <div className="relative">
                          <select
                            value={isCustomExpiry ? 'custom' : shareData.expiration_datetime}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setIsCustomExpiry(true);
                              } else {
                                setIsCustomExpiry(false);
                                setShareData({ ...shareData, expiration_datetime: e.target.value });
                              }
                            }}
                            className={`w-full border rounded-xl p-4 text-sm outline-none cursor-pointer appearance-none
                              ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-[#808080]' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                          >
                            <option value="24">24 Hours</option>
                            <option value="48">48 Hours</option>
                            <option value="168">7 Days</option>
                            <option value="custom">Custom (Hours)</option>
                          </select>
                          <i className={`fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${isDark ? 'text-[#444]' : 'text-slate-400'}`} />
                        </div>
                      </div>

                      {isCustomExpiry && (
                        <div className="md:col-span-2">
                          <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Custom Expiry (Hours)</label>
                          <input
                            type="number"
                            min="1"
                            max="168"
                            value={customExpiry}
                            onChange={(e) => setCustomExpiry(e.target.value)}
                            placeholder="Enter expiry in hours (max 168)"
                            className={`w-full border rounded-xl p-4 text-sm outline-none transition-all
                              ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                                       : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                          />
                        </div>
                      )}

                      <div>
                        <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>Security</label>
                        <button
                          onClick={() => setIsProtected(p => !p)}
                          className={`w-full h-[54px] flex items-center justify-between px-5 rounded-xl border transition-all
                            ${isProtected ? 'bg-blue-600/10 border-blue-500/50' : isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}
                        >
                          <div className="flex items-center gap-2">
                            <i className={`fa-solid fa-shield-halved text-sm ${isProtected ? 'text-blue-500' : isDark ? 'text-[#444]' : 'text-slate-400'}`} />
                            <span className={`text-[11px] font-bold uppercase tracking-tight ${isProtected ? 'text-blue-500' : isDark ? 'text-[#606060]' : 'text-slate-500'}`}>
                              Email Validation
                            </span>
                          </div>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${isProtected ? 'bg-blue-600' : isDark ? 'bg-[#333]' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isProtected ? 'right-0.5' : 'left-0.5'}`} />
                          </div>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right column — preview + actions */}
                <div className={`w-full md:w-[300px] p-8 flex flex-col justify-between ${isDark ? 'bg-[#050505]' : 'bg-slate-50/50'}`}>
                  <div>
                    <div className={`text-[11px] uppercase font-bold tracking-widest mb-6 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Preview</div>
                    <div className={`flex flex-col items-center border border-dashed rounded-2xl p-6 ${isDark ? 'border-[#1a1a1a] bg-[#0a0a0a]/50' : 'border-slate-200 bg-white'}`}>
                      <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-blue-500/20">
                        <i className={`fa-solid ${iconClassForFile()}`} />
                      </div>
                      <p className={`text-sm font-bold text-center mb-1 truncate w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>{display_name}</p>
                      <p className={`text-xs mb-6 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{size} • Secure Link</p>
                      <div className={`w-full h-[38px] rounded-lg border flex items-center px-3 gap-3
                        ${isProtected ? 'bg-blue-500/5 border-blue-500/20' : isDark ? 'bg-[#111] border-[#1a1a1a]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isProtected ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-tighter ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                          {isProtected ? 'Identity Check ON' : 'Encryption Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-8">
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSharing && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                      {isSharing ? 'Sending...' : 'Send Invites'}
                    </button>
                    <button
                      onClick={() => setActiveModal(null)}
                      disabled={isSharing}
                      className={`w-full py-4 border rounded-xl font-bold text-xs transition-colors disabled:opacity-50
                        ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ DELETE MODAL ════════════ */}
            {activeModal === 'delete' && (
              <div className={`border w-full max-w-[400px] rounded-2xl p-8 shadow-2xl text-center
                ${isDark ? 'bg-[#111111] border-[#2a2a2a] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xl mb-5 mx-auto">
                  <i className="fa-solid fa-trash-can" />
                </div>
                <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Move to Trash?</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{display_name}</span> will be permanently deleted after 30 days.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors
                      ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                    {isDeleting ? 'Deleting...' : 'Move to Trash'}
                  </button>
                </div>
              </div>
            )}

            {/* ════════════ REMOVE MODAL ════════════ */}
            {activeModal === 'remove' && (
              <div className={`border w-full max-w-[400px] rounded-2xl p-8 shadow-2xl text-center
                ${isDark ? 'bg-[#111111] border-[#2a2a2a] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <div className="w-14 h-14 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl mb-5 mx-auto">
                  <i className="fa-solid fa-folder-minus" />
                </div>
                <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Remove from Collection?</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{display_name}</span> will be removed from this collection, but not deleted from your system.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className={`flex-1 py-3 border rounded-xl font-bold text-xs transition-colors
                      ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIsRemoving(true);
                      try {
                        await onRemove(id);
                        setActiveModal(null);
                      } catch (err) {
                        showToast('Failed to remove from collection', 'error');
                      } finally {
                        setIsRemoving(false);
                      }
                    }}
                    disabled={isRemoving}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRemoving && <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;