import React, { useState, useEffect } from 'react';
import { shareFile, bulkShareFiles } from '../services/shareService';
import useAuth from '../hooks/useAuth';

const SELF_SHARE_MSG = 'You cannot share files with yourself.';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => EMAIL_REGEX.test(String(email).trim());

const formatFieldLabel = (field) => {
  const labels = {
    recipient_emails: 'Recipient',
    expiration_datetime: 'Expiry',
    title: 'Title',
    message: 'Message',
    permission: 'Permission',
    download_limit: 'Download limit',
    view_limit: 'View limit',
    file_ids: 'Files',
  };
  return labels[field] || field.replace(/_/g, ' ');
};

const parseShareApiError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Failed to share files';
  if (typeof data === 'string') return data;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.detail === 'string') return data.detail;

  const messages = [];

  Object.entries(data).forEach(([field, value]) => {
    if (value == null) return;

    if (field === 'recipient_emails' && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([idx, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
        messages.push(`Recipient ${Number(idx) + 1}: ${text}`);
      });
      return;
    }

    if (Array.isArray(value)) {
      messages.push(`${formatFieldLabel(field)}: ${value.join(' ')}`);
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, nested]) => {
        const text = Array.isArray(nested) ? nested.join(' ') : String(nested);
        messages.push(`${formatFieldLabel(field)} ${key}: ${text}`);
      });
      return;
    }

    messages.push(`${formatFieldLabel(field)}: ${String(value)}`);
  });

  return messages.length ? messages.join(' ') : 'Failed to share files';
};

const validateRecipientEmails = (rawRecipients, ownerEmail) => {
  const errors = [];
  const seen = new Set();
  const validEmails = [];

  rawRecipients.forEach((raw, index) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (!isValidEmail(trimmed)) {
      errors.push(`Recipient ${index + 1}: Enter a valid email address.`);
      return;
    }

    const email = normalizeEmail(trimmed);
    if (ownerEmail && email === normalizeEmail(ownerEmail)) {
      errors.push(`Recipient ${index + 1}: ${SELF_SHARE_MSG}`);
      return;
    }
    if (seen.has(email)) {
      errors.push(`Recipient ${index + 1}: Duplicate email address.`);
      return;
    }

    seen.add(email);
    validEmails.push(email);
  });

  if (!validEmails.length && !errors.length) {
    return { ok: false, message: 'Please add at least one recipient email.' };
  }
  if (errors.length) {
    return { ok: false, message: errors.join(' ') };
  }

  return { ok: true, emails: validEmails };
};

const validateExpiration = (isCustomExpiry, customExpiry, presetExpiry) => {
  if (isCustomExpiry) {
    const raw = String(customExpiry ?? '').trim();
    if (!raw) {
      return { ok: false, message: 'Expiry: Enter link expiry in hours (1–168).' };
    }
    if (!/^\d+$/.test(raw)) {
      return { ok: false, message: 'Expiry: A valid whole number of hours is required.' };
    }
    const hours = Number(raw);
    if (hours < 1 || hours > 168) {
      return { ok: false, message: 'Expiry: Must be between 1 and 168 hours.' };
    }
    return { ok: true, hours };
  }

  const hours = Number(presetExpiry);
  if (!Number.isFinite(hours) || !Number.isInteger(hours) || hours < 1 || hours > 168) {
    return { ok: false, message: 'Expiry: Please select a valid link expiry.' };
  }
  return { ok: true, hours };
};

const validateOptionalLimit = (value, label) => {
  if (value == null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
    return `${label} must be a whole number greater than 0.`;
  }
  return null;
};

const validateShareForm = ({
  recipients,
  ownerEmail,
  title,
  isCustomExpiry,
  customExpiry,
  presetExpiry,
  permission,
  downloadLimit,
  viewLimit,
  isBulk,
}) => {
  const errors = [];

  const recipientCheck = validateRecipientEmails(recipients, ownerEmail);
  if (!recipientCheck.ok) errors.push(recipientCheck.message);

  if (!title?.trim()) {
    errors.push('Title: Title is required.');
  } else if (title.trim().length > 500) {
    errors.push('Title: Must be 500 characters or fewer.');
  }

  const expiryCheck = validateExpiration(isCustomExpiry, customExpiry, presetExpiry);
  if (!expiryCheck.ok) errors.push(expiryCheck.message);

  if (!isBulk) {
    const downloadErr = validateOptionalLimit(downloadLimit, 'Download limit');
    if (downloadErr) errors.push(downloadErr);

    if (permission === 'view_only' || permission === 'view_download') {
      const viewErr = validateOptionalLimit(viewLimit, 'View limit');
      if (viewErr) errors.push(viewErr);
    }
  }

  if (errors.length) {
    return { ok: false, message: errors.join(' ') };
  }

  return {
    ok: true,
    emails: recipientCheck.emails,
    expirationHours: expiryCheck.hours,
  };
};

const FILE_ICON_MAP = (fileName = '', contentType = '') => {
  const lower = fileName.toLowerCase();
  const ct = contentType.toLowerCase();
  if (lower.endsWith('.pdf') || ct.includes('pdf')) return { icon: 'fa-file-pdf', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  if (lower.endsWith('.doc') || lower.endsWith('.docx') || ct.includes('word')) return { icon: 'fa-file-word', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || ct.includes('excel')) return { icon: 'fa-file-excel', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx') || ct.includes('powerpoint')) return { icon: 'fa-file-powerpoint', color: '#f97316', bg: 'rgba(249,115,22,0.12)' };
  if (/\.(png|jpe?g|gif|webp)$/.test(lower) || ct.includes('image')) return { icon: 'fa-file-image', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' };
  if (/\.(mp4|mov|mkv|webm)$/.test(lower) || ct.includes('video')) return { icon: 'fa-file-video', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' };
  if (lower.endsWith('.zip') || lower.endsWith('.rar') || ct.includes('zip')) return { icon: 'fa-file-zipper', color: '#eab308', bg: 'rgba(234,179,8,0.12)' };
  return { icon: 'fa-file', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
};

const PERMISSION_META = {
  view_only: { icon: 'fa-eye', label: 'View Only', color: '#3b82f6', desc: 'Can read in browser' },
  view_download: { icon: 'fa-download', label: 'View + Download', color: '#22c55e', desc: 'Can save to device' },
  one_time_download: { icon: 'fa-file-arrow-down', label: 'One-time Download', color: '#f59e0b', desc: 'Link expires after 1 use' },
  full_access: { icon: 'fa-lock-open', label: 'Full Access', color: '#a855f7', desc: 'No restrictions' },
};

const EXPIRY_LABELS = { 24: '24 Hours', 48: '48 Hours', 168: '7 Days' };

const BULK_ZIP_META = {
  icon: 'fa-file-zipper',
  label: 'ZIP Download',
  color: '#f59e0b',
  desc: 'Recipients download the full package as a ZIP file.',
};

const ShareModal = ({
  isOpen,
  onClose,
  fileIds,
  fileNames,
  isBulk = false,
  onShareSuccess,
  isDark = true,
}) => {
  const { user } = useAuth();
  const ownerEmail = user?.email || '';

  const [recipients, setRecipients] = useState(['']);
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

  const showToast = (msg, type = 'success') => setToast({ visible: true, message: msg, type, animateOut: false });

  useEffect(() => {
    if (!toast.visible) return;
    const duration = toast.type === 'error' ? 6000 : 3000;
    const out = setTimeout(() => {
      setToast(prev => ({ ...prev, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, duration);
    return () => clearTimeout(out);
  }, [toast.visible, toast.type]);

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

  const isSelfRecipient = (email) => {
    if (!ownerEmail || !email.trim()) return false;
    return normalizeEmail(email) === normalizeEmail(ownerEmail);
  };

  const handleShare = async () => {
    const validation = validateShareForm({
      recipients,
      ownerEmail,
      title: shareData.title,
      isCustomExpiry,
      customExpiry,
      presetExpiry: shareData.expiration_datetime,
      permission: shareData.permission,
      downloadLimit: shareData.download_limit,
      viewLimit: shareData.view_limit,
      isBulk,
    });

    if (!validation.ok) {
      showToast(validation.message, 'error');
      return;
    }

    const payload = {
      recipient_emails: validation.emails,
      expiration_datetime: validation.expirationHours,
      title: shareData.title.trim(),
      message: shareData.message,
      permission: isBulk ? 'view_download' : shareData.permission,
      download_limit: isBulk
        ? null
        : shareData.permission === 'one_time_download' ? 1
          : shareData.permission === 'view_download' ? shareData.download_limit
            : null,
      view_limit: isBulk
        ? null
        : (shareData.permission === 'view_only' || shareData.permission === 'view_download')
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
      showToast(parseShareApiError(err), 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // ── Derived preview data ──────────────────────────────────────
  const fileName = isBulk ? null : (fileNames?.[0] || 'Untitled File');
  const fileMeta = FILE_ICON_MAP(fileName || '');
  const perm = isBulk
    ? BULK_ZIP_META
    : (PERMISSION_META[shareData.permission] || PERMISSION_META.view_only);
  const validRecipients = recipients.filter(r => r.trim() !== '');
  const expiryLabel = isCustomExpiry
    ? (customExpiry ? `${customExpiry}h custom` : 'Custom')
    : (EXPIRY_LABELS[shareData.expiration_datetime] || '48 Hours');

  const s = isDark;

  const inputNormal = s
    ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]'
    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-400';
  const inputSelf = s
    ? 'bg-red-500/10 border-red-500/70 text-white focus:border-red-500 placeholder:text-[#555]'
    : 'bg-red-50 border-red-400 text-slate-900 focus:border-red-500 placeholder:text-slate-400';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[10001] pointer-events-none transition-all duration-[350ms]
            ${toast.animateOut ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <div className={`flex items-start gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto w-[min(calc(100vw-2rem),520px)]
            ${s ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
              ${toast.type === 'error'
                ? (s ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500')
                : (s ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')}`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
            </div>
            <span className="flex-1 leading-relaxed tracking-wide text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}

      <div
        className={`border w-full max-w-[960px] rounded-2xl shadow-2xl flex flex-col md:flex-row md:overflow-hidden overflow-y-auto overscroll-contain my-auto
          ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}
        style={{ maxHeight: 'min(92vh, calc(100vh - 1.5rem))' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ═══════════════ FORM (top on mobile, left on desktop) ═══════════════ */}
        <div className={`order-1 flex-none md:flex-1 md:min-h-0 p-4 sm:p-6 lg:p-8 border-b md:border-b-0 md:border-r md:overflow-y-auto no-scrollbar
          ${s ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
          <h2 className={`text-lg sm:text-xl font-bold mb-5 sm:mb-8 ${s ? 'text-white' : 'text-slate-900'}`}>
            {isBulk ? `Bulk Share ${fileIds.length} Files` : 'Share File'}
          </h2>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>Tistle</label>
              <input
                value={shareData.title}
                onChange={e => setShareData({ ...shareData, title: e.target.value })}
                placeholder="e.g. Important Project Updates"
                className={`w-full border rounded-xl p-3 sm:p-4 text-sm outline-none transition-all ${inputNormal}`}
              />
            </div>

            {/* Recipients */}
            <div>
              <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>Recipient Emails</label>
              <div className="space-y-3">
                {recipients.map((email, i) => {
                  const selfEmail = isSelfRecipient(email);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
                        <input
                          value={email}
                          onChange={(e) => handleEmailChange(i, e.target.value)}
                          placeholder="Enter email address..."
                          type="email"
                          autoComplete="email"
                          className={`flex-1 min-w-0 border rounded-xl p-3 sm:p-4 text-sm outline-none transition-all
                            ${selfEmail ? inputSelf : inputNormal}`}
                        />
                        {recipients.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove recipient"
                            onClick={() => removeRecipient(i)}
                            className={`border w-full sm:w-11 md:w-[54px] h-11 sm:h-[54px] rounded-xl flex items-center justify-center transition-all flex-shrink-0
                              ${s ? 'bg-[#111] border-[#1a1a1a] text-[#888] hover:text-red-400 hover:border-red-500/40' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-red-500'}`}
                          >
                            <i className="fa-solid fa-xmark text-sm" />
                          </button>
                        )}
                      </div>
                      {selfEmail && (
                        <p className={`text-[11px] pl-1 font-medium ${s ? 'text-red-400' : 'text-red-600'}`}>{SELF_SHARE_MSG}</p>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addRecipient}
                  className={`mt-1 flex items-center gap-2 text-xs font-semibold transition-colors
                    ${s ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  <i className="fa-solid fa-plus text-[10px]" />
                  Add recipient
                </button>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>Message</label>
              <textarea
                value={shareData.message}
                onChange={e => setShareData({ ...shareData, message: e.target.value })}
                placeholder="Write a note to recipients..."
                rows="3"
                className={`w-full border rounded-xl p-4 text-sm outline-none resize-none transition-all
                  ${s ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-[#333] placeholder:text-[#333]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-300 placeholder:text-slate-300'}`}
              />
            </div>

            {/* Permission — single-file shares only; bulk is always ZIP download */}
            {isBulk ? (
              <div className={`p-4 rounded-xl border ${s ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
                    <i className="fa-solid fa-file-zipper text-amber-500 text-sm" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold mb-1 ${s ? 'text-amber-400' : 'text-amber-700'}`}>ZIP package share</p>
                    <p className={`text-[11px] leading-relaxed ${s ? 'text-[#888]' : 'text-amber-800/80'}`}>
                      {fileIds.length} files are bundled into one archive. Recipients download the ZIP to access everything — view/download permissions do not apply.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
            <div>
              <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>Access Permission</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(PERMISSION_META).map(([value, meta]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setShareData({ ...shareData, permission: value, download_limit: null })}
                    className={`text-left p-4 rounded-xl border transition-all
                      ${shareData.permission === value
                        ? 'border-blue-500/50 bg-blue-600/10'
                        : s ? 'border-[#1a1a1a] bg-[#050505] hover:bg-[#111]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className={`flex items-center gap-2 mb-1 text-xs font-bold
                      ${shareData.permission === value ? 'text-blue-500' : s ? 'text-white' : 'text-slate-700'}`}>
                      <i className={`fa-solid ${meta.icon}`} /> {meta.label}
                    </div>
                    <div className={`text-[10px] ${s ? 'text-[#444]' : 'text-slate-400'}`}>{meta.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {shareData.permission === 'view_download' && (
                  <div>
                    <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>Download limit</label>
                    <input type="number" min="1" value={shareData.download_limit || ''} onChange={e => setShareData({ ...shareData, download_limit: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited"
                      className={`w-full border rounded-xl p-4 text-sm outline-none transition-all ${s ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`} />
                  </div>
                )}
                {(shareData.permission === 'view_only' || shareData.permission === 'view_download') && (
                  <div>
                    <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>View limit</label>
                    <input type="number" min="1" value={shareData.view_limit || ''} onChange={e => setShareData({ ...shareData, view_limit: e.target.value ? Number(e.target.value) : null })} placeholder="Unlimited"
                      className={`w-full border rounded-xl p-4 text-sm outline-none transition-all ${s ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`} />
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Expiry */}
            <div>
              <label className={`block text-[11px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#808080]' : 'text-slate-400'}`}>Link Expiry</label>
              <div className="relative">
                <select
                  value={isCustomExpiry ? 'custom' : shareData.expiration_datetime}
                  onChange={e => {
                    if (e.target.value === 'custom') { setIsCustomExpiry(true); }
                    else { setIsCustomExpiry(false); setShareData({ ...shareData, expiration_datetime: e.target.value }); }
                  }}
                  className={`w-full border rounded-xl p-4 text-sm outline-none cursor-pointer appearance-none
                    ${s ? 'bg-[#050505] border-[#1a1a1a] text-[#808080]' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="168">7 Days</option>
                  <option value="custom">Custom (Hours)</option>
                </select>
                <i className={`fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${s ? 'text-[#444]' : 'text-slate-400'}`} />
              </div>
              {isCustomExpiry && (
                <input type="number" min="1" max="168" value={customExpiry} onChange={e => setCustomExpiry(e.target.value)} placeholder="Enter expiry in hours (max 168)"
                  className={`mt-3 w-full border rounded-xl p-4 text-sm outline-none transition-all ${s ? 'bg-[#050505] border-[#1a1a1a] text-white focus:border-blue-500/50 placeholder:text-[#333]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-300'}`} />
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════ DRAFT PREVIEW (bottom on mobile, right on desktop) ═══════════════ */}
        <div className={`order-2 flex-none md:flex md:flex-col md:shrink-0 md:min-h-0 w-full md:w-[320px] md:max-w-[320px] ${s ? 'bg-black' : 'bg-slate-200'}`}>
          {/* Preview header */}
          <div className={`px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b ${s ? 'bg-black border-[#1f1f1f]' : 'bg-slate-200 border-slate-200'}`}>
            <p className={`text-[10px] uppercase font-bold tracking-[0.15em] ${s ? 'text-[#444]' : 'text-slate-400'}`}>Draft</p>
          </div>

          {/* Preview body — scrollable only on desktop sidebar */}
          <div className="md:flex-1 md:min-h-0 md:overflow-y-auto no-scrollbar p-4 sm:p-5 space-y-3">

            {/* ── File chip ── */}
            <div className={`flex items-center gap-3 p-3 rounded   border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: fileMeta.bg }}>
                {isBulk
                  ? <i className="fa-solid fa-boxes-stacked text-sm" style={{ color: '#3b82f6' }} />
                  : <i className={`fa-solid ${fileMeta.icon} text-sm`} style={{ color: fileMeta.color }} />
                }
              </div>
              <div className="min-w-0">
                <p className={`text-[12px] font-semibold truncate ${s ? 'text-white' : 'text-slate-800'}`}>
                  {isBulk ? `${fileIds.length} files selected` : (fileName || 'Untitled File')}
                </p>
                <p className={`text-[10px] ${s ? 'text-[#444]' : 'text-slate-400'}`}>
                  {isBulk ? 'ZIP package · download only' : 'Secure shared link'}
                </p>
              </div>
            </div>

            {/* ── Title ── */}
            <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
              <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${s ? 'text-[#444]' : 'text-slate-400'}`}>Subject</p>
              <p className={`text-[13px] font-semibold ${shareData.title ? (s ? 'text-white' : 'text-slate-800') : (s ? 'text-[#2a2a2a]' : 'text-slate-300')}`}>
                {shareData.title || 'No title yet…'}
              </p>
            </div>

            {/* ── Message ── */}
            {shareData.message ? (
              <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${s ? 'text-[#444]' : 'text-slate-400'}`}>Message</p>
                <p className={`text-[12px] leading-relaxed overflow-y-auto no-scrollbar ${s ? 'text-[#aaa]' : 'text-slate-600'}`} style={{ maxHeight: '72px' }}>{shareData.message}</p>              </div>
            ) : null}

            {/* ── Recipients ── */}
            <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
              <p className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${s ? 'text-[#444]' : 'text-slate-400'}`}>
                Recipients
                {validRecipients.length > 0 && (
                  <span className="ml-2 text-blue-500 normal-case font-medium">{validRecipients.length}</span>
                )}
              </p>
              {validRecipients.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {validRecipients.slice(0, 4).map((email, i) => {
                    const self = isSelfRecipient(email);
                    return (
                    <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md
                     ${self
                       ? (s ? 'text-red-400 bg-red-500/10' : 'text-red-700 bg-red-50')
                       : (s ? 'text-blue-400' : 'text-blue-600')}`}>
                      <i className="fa-solid fa-user text-[8px]" />
                      {email.length > 18 ? email.slice(0, 18) + '…' : email}
                    </span>
                  );})}
                  {validRecipients.length > 4 && (
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-lg border ${s ? 'bg-[#111] border-[#222] text-[#666]' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                      +{validRecipients.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <p className={`text-[11px] ${s ? 'text-[#2a2a2a]' : 'text-slate-300'}`}>No recipients added yet</p>
              )}
            </div>

            {/* ── Delivery / permission + expiry row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                <p className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 ${s ? 'text-[#444]' : 'text-slate-400'}`}>
                  {isBulk ? 'Delivery' : 'Access'}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: perm.color + '20' }}>
                    <i className={`fa-solid ${perm.icon} text-[9px]`} style={{ color: perm.color }} />
                  </div>
                  <span className="text-[10px] font-semibold leading-tight" style={{ color: perm.color }}>{perm.label}</span>
                </div>
              </div>

              <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                <p className={`text-[10px] uppercase font-bold tracking-widest mb-1.5 ${s ? 'text-[#444]' : 'text-slate-400'}`}>Expires</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${s ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                    <i className="fa-solid fa-clock text-[9px] text-amber-500" />
                  </div>
                  <span className={`text-[10px] font-semibold ${s ? 'text-amber-400' : 'text-amber-600'}`}>{expiryLabel}</span>
                </div>
              </div>
            </div>

            {/* ── Limits row (single-file shares only) ── */}
            {!isBulk && (shareData.permission === 'view_download' || shareData.permission === 'view_only') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(shareData.permission === 'view_only' || shareData.permission === 'view_download') && (
                  <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${s ? 'text-[#444]' : 'text-slate-400'}`}>Views</p>
                    <p className={`text-[12px] font-bold ${s ? 'text-white' : 'text-slate-700'}`}>
                      {shareData.view_limit ? `Max ${shareData.view_limit}` : '∞'}
                    </p>
                  </div>
                )}
                {shareData.permission === 'view_download' && (
                  <div className={`p-3 rounded border ${s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
                    <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${s ? 'text-[#444]' : 'text-slate-400'}`}>Downloads</p>
                    <p className={`text-[12px] font-bold ${s ? 'text-white' : 'text-slate-700'}`}>
                      {shareData.download_limit ? `Max ${shareData.download_limit}` : '∞'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── One-time chip (single-file only) ── */}
            {!isBulk && shareData.permission === 'one_time_download' && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${s ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs" />
                <p className={`text-[11px] font-medium ${s ? 'text-amber-400' : 'text-amber-700'}`}>Link will self-destruct after first download</p>
              </div>
            )}

            {/* ── Readiness indicator ── */}
            <div className={`p-3 rounded-xl border ${shareData.title && validRecipients.length > 0
                ? (s ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')
                : (s ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200')
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${shareData.title && validRecipients.length > 0 ? 'bg-emerald-500' : (s ? 'bg-[#333]' : 'bg-slate-300')}`} />
                <p className={`text-[11px] font-medium ${shareData.title && validRecipients.length > 0
                    ? (s ? 'text-emerald-400' : 'text-emerald-700')
                    : (s ? 'text-[#444]' : 'text-slate-400')
                  }`}>
                  {shareData.title && validRecipients.length > 0
                    ? 'Ready to send'
                    : !shareData.title && validRecipients.length === 0
                      ? 'Add a title and recipients to continue'
                      : !shareData.title
                        ? 'Add a title to continue'
                        : 'Add at least one recipient'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`p-4 sm:p-5 border-t space-y-2 sticky bottom-0 md:static ${s ? 'bg-black border-[#1f1f1f]' : 'bg-slate-200 border-slate-200'}`}>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSharing && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
              {isSharing ? 'Sending…' : 'Send Invites'}
            </button>
            <button
              onClick={onClose}
              disabled={isSharing}
              className={`w-full py-3 border rounded-xl font-bold text-xs transition-colors disabled:opacity-50
                ${s ? 'border-[#1a1a1a] text-[#808080] hover:bg-[#111]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
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