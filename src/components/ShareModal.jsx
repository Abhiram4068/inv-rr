import React, { useState, useEffect } from 'react';
import { shareFile, bulkShareFiles } from '../services/shareService';

const ShareModal = ({ 
  isOpen, 
  onClose, 
  fileIds, 
  fileNames, 
  isBulk = false,
  onShareSuccess,
  isDark = true
}) => {
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

  if (!isOpen) return null;

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
let response;

if (isBulk) {
  payload.file_ids = fileIds;
  response = await bulkShareFiles(payload);
} else {
  response = await shareFile(fileIds[0], payload);
}

setTimeout(() => {
  onShareSuccess?.(response.data.message);
  onClose();
}, 300);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to share files';
      showToast(msg, 'error');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
        {/* Toast inside modal */}
        {toast.visible && (
            <div
            className={`fixed top-6 left-0 right-0 flex justify-center z-[10001] pointer-events-none transition-all duration-[350ms]
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

      <div 
        className={`border w-full max-w-[900px] min-h-[560px] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row
          ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left column — form */}
        <div className={`flex-1 p-8 border-b md:border-b-0 md:border-r max-h-[90vh] overflow-y-auto no-scrollbar
          ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isBulk ? `Bulk Share ${fileIds.length} Files` : 'Share File'}
          </h2>

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
                  { value: 'view_only',         icon: 'fa-eye',             label: 'View only',         desc: 'Read in browser, no download' },
                  { value: 'view_download',     icon: 'fa-download',        label: 'View + Download',   desc: 'Can save file to device' },
                  { value: 'one_time_download', icon: 'fa-file-arrow-down', label: 'One-time Download', desc: 'Link dies after 1 download' },
                  { value: 'full_access',       icon: 'fa-lock-open',       label: 'Full Access',       desc: 'No restrictions' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
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

              {/* Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {(shareData.permission === 'view_download') && (
                  <div>
                    <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                      Download limit
                    </label>
                    <input
                      type="number" min="1"
                      value={shareData.download_limit || ''}
                      onChange={(e) => setShareData({ ...shareData, download_limit: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Unlimited"
                      className={`w-full border rounded-xl p-4 text-sm outline-none transition-all
                        ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                                 : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                    />
                  </div>
                )}
                {(shareData.permission === 'view_only' || shareData.permission === 'view_download') && (
                  <div>
                    <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                      View limit
                    </label>
                    <input
                      type="number" min="1"
                      value={shareData.view_limit || ''}
                      onChange={(e) => setShareData({ ...shareData, view_limit: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Unlimited"
                      className={`w-full border rounded-xl p-4 text-sm outline-none transition-all
                        ${isDark ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
                                 : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`}
                    />
                  </div>
                )}
              </div>
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
                  type="button"
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
                <i className={`fa-solid ${isBulk ? 'fa-boxes-stacked' : 'fa-file'}`} />
              </div>
              <p className={`text-sm font-bold text-center mb-1 truncate w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isBulk ? `${fileIds.length} Files Selected` : (fileNames?.[0] || 'Selected File')}
              </p>
              <p className={`text-xs mb-6 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
                {isBulk ? 'Bulk Bundle' : 'Secure Link'}
              </p>
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
              onClick={onClose}
              disabled={isSharing}
              className={`w-full py-4 border rounded-xl font-bold text-xs transition-colors disabled:opacity-50
                ${isDark ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
