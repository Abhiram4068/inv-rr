import React from 'react';

/**
 * Top-sliding toast (same pattern as PaginatedFiles.jsx).
 */
export default function TopToast({ toast, isDark }) {
  if (!toast?.visible) return null;

  return (
    <div
      className={`fixed top-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none transition-all duration-[350ms]
        ${toast.animateOut ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div
        className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
          ${isDark
            ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200'
            : 'bg-white border-slate-100 text-slate-800'}`}
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
            ${toast.type === 'error'
              ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500')
              : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')}`}
        >
          <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
        </div>
        <span className="flex-1 leading-normal tracking-wide text-[13px]">{toast.message}</span>
      </div>
    </div>
  );
}
