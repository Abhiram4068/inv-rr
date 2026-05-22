import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import * as pdfjsLib from 'pdfjs-dist';
import { getFileMeta } from "../utils/fileIcons";
import { deleteFile, updateFile } from '../services/fileService';
import ShareModal from './ShareModal';

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

  const handleShareSuccess = () => {
    setActiveModal(null);
    showToast(`Shared successfully`);
  };

  // ── Delete ───────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false);

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

              {/* Delete */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('delete'); }}
                className={`transition-all text-[13px] ${isDark ? 'text-[#666] hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                title="Delete"
              >
                <i className="fa-regular fa-trash-can" />
              </button>
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
              <ShareModal
                isOpen={true}
                onClose={() => setActiveModal(null)}
                fileIds={[id]}
                fileNames={[display_name]}
                isBulk={false}
                isDark={isDark}
                onShareSuccess={handleShareSuccess}
              />
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

          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;