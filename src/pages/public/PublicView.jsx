import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getFileIcon = (contentType, shareType) => {
  if (shareType === 'zip_bundle') return { icon: 'fa-file-zipper', color: '#f59e0b' };
  if (contentType?.includes('pdf')) return { icon: 'fa-file-pdf', color: '#ef4444' };
  if (contentType?.includes('image')) return { icon: 'fa-file-image', color: '#3b82f6' };
  if (contentType?.includes('word') || contentType?.includes('msword')) return { icon: 'fa-file-word', color: '#2b579a' };
  if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) return { icon: 'fa-file-excel', color: '#217346' };
  if (contentType?.includes('powerpoint') || contentType?.includes('presentation')) return { icon: 'fa-file-powerpoint', color: '#d24726' };
  if (contentType?.includes('zip') || contentType?.includes('rar')) return { icon: 'fa-file-zipper', color: '#fabd2f' };
  if (contentType?.includes('text')) return { icon: 'fa-file-lines', color: '#9ca3af' };
  return { icon: 'fa-file', color: '#888' };
};

const ShareTypeBanner = ({ shareType, fileData }) => {
  if (shareType === 'zip_bundle') {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)',
        borderRadius: 12, padding: '12px 14px', marginBottom: '1.25rem', textAlign: 'left',
      }}>
        <i className="fa-solid fa-box-archive" style={{ fontSize: 16, color: '#f59e0b', marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', margin: '0 0 4px' }}>ZIP package share</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
            {fileData.file_count > 1
              ? `${fileData.file_count} files bundled into one archive. Download the ZIP to access everything.`
              : 'Multiple files were sent as a single ZIP archive. Use download to get the package.'}
          </p>
        </div>
      </div>
    );
  }

  if (shareType === 'standard' && fileData.permission === 'one_time_download') {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)',
        borderRadius: 12, padding: '12px 14px', marginBottom: '1.25rem', textAlign: 'left',
      }}>
        <i className="fa-solid fa-download" style={{ fontSize: 16, color: '#22c55e', marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', margin: '0 0 4px' }}>One-time download</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
            Use the download button below. After you download once, this link cannot be used again.
          </p>
        </div>
      </div>
    );
  }

  if (shareType === 'scheduled') {
    const when = fileData.scheduled_for
      ? new Date(fileData.scheduled_for).toLocaleString(undefined, {
          dateStyle: 'medium', timeStyle: 'short',
        })
      : null;
    const delivered = fileData.delivered_at
      ? new Date(fileData.delivered_at).toLocaleString(undefined, {
          dateStyle: 'medium', timeStyle: 'short',
        })
      : null;

    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)',
        borderRadius: 12, padding: '12px 14px', marginBottom: '1.25rem', textAlign: 'left',
      }}>
        <i className="fa-solid fa-clock" style={{ fontSize: 16, color: '#818cf8', marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', margin: '0 0 4px' }}>Scheduled delivery</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
            This file was sent automatically on a schedule
            {when ? ` (planned for ${when})` : ''}
            {delivered ? `. Delivered ${delivered}.` : '.'}
          </p>
          {fileData.scheduled_title ? (
            <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0', fontStyle: 'italic' }}>
              “{fileData.scheduled_title}”
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
};

const ExternalShareView = () => {
  const { token } = useParams();

  const [phase, setPhase] = useState('loading');
  const [fileData, setFileData] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [revokedModalVisible, setRevokedModalVisible] = useState(false);

  useEffect(() => {
    const loadShare = async () => {
      try {
        const res = await fetch(`${API}/files/public/${token}/`);
        const data = await res.json();

        if (!res.ok) {
          setBackendError(data.error || 'Access denied.');
          if (res.status === 410 || (data.error && data.error.toLowerCase().includes('expired'))) {
            setPhase('expired');
          } else if (data.error && data.error.toLowerCase().includes('used')) {
            setPhase('used');
          } else if (data.error && data.error.toLowerCase().includes('revoked')) {
            setPhase('revoked');
            setRevokedModalVisible(true);
          } else {
            setPhase('error');
          }
          return;
        }

        setFileData(data);
        const shareType = data.share_type || 'standard';
        const oneTimeUsed = data.permission === 'one_time_download' && data.is_active === false;
        if (shareType === 'standard' && oneTimeUsed) {
          setPhase('used');
          return;
        }
        setPhase('ready');
      } catch {
        setPhase('error');
        setBackendError('Something went wrong while connecting to the server.');
      }
    };
    loadShare();
  }, [token]);

  const shareType = fileData?.share_type || 'standard';
  const enforcesLimits = fileData?.enforces_limits ?? (shareType === 'standard');

  const canView = fileData
    && shareType !== 'zip_bundle'
    && fileData.permission !== 'one_time_download'
    && (!enforcesLimits
      || fileData.view_limit == null
      || (fileData.view_count ?? 0) < fileData.view_limit);

  const oneTimeConsumed = fileData?.permission === 'one_time_download' && fileData?.is_active === false;

  const canDownload = fileData && !oneTimeConsumed && (
    shareType === 'zip_bundle'
    || (fileData.permission !== 'view_only' && (
      !enforcesLimits
      || fileData.permission === 'one_time_download'
      || (fileData.download_limit == null
        || (fileData.download_count ?? 0) < fileData.download_limit)
    ))
  );

  const handleAction = async (action) => {
    if (actionLoading) return;
    if (shareType === 'zip_bundle' && action === 'view') return;

    setActionLoading(action);
    try {
      const res = await fetch(`${API}/files/public/${token}/?action=${action}`);
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Access denied.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (action === 'download') {
        const a = document.createElement('a');
        a.href = url;
        const baseName = fileData?.file_name || 'file';
        a.download = shareType === 'zip_bundle'
          ? (baseName.toLowerCase().endsWith('.zip') ? baseName : `${baseName}.zip`)
          : baseName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (shareType === 'standard' && fileData?.permission === 'one_time_download') {
          setFileData((prev) => ({ ...prev, is_active: false, accessed: true }));
          setPhase('used');
        } else if (enforcesLimits && fileData?.download_limit != null) {
          setFileData((prev) => ({
            ...prev,
            download_count: (prev.download_count || 0) + 1,
          }));
        }
      } else {
        const win = window.open(url, '_blank');
        if (!win) window.location.assign(url);
        if (enforcesLimits && fileData?.view_limit != null) {
          setFileData((prev) => ({
            ...prev,
            view_count: (prev.view_count || 0) + 1,
          }));
        }
      }

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;
    if (bytes < mb) return `${(bytes / kb).toFixed(1)} KB`;
    if (bytes < gb) return `${(bytes / mb).toFixed(1)} MB`;
    return `${(bytes / gb).toFixed(1)} GB`;
  };

  const formatExpiry = (iso) => {
    if (!iso) return '';
    const diff = new Date(iso) - new Date();
    const hrs = Math.round(diff / 36e5);
    if (hrs <= 0) return 'Expiring now';
    if (hrs < 24) return `Exp. in ${hrs}h`;
    return `Exp. in ${Math.round(hrs / 24)}d`;
  };

  const formatAccessedAt = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const readyTitle = {
    standard: 'Ready to Access',
    zip_bundle: 'ZIP package ready',
    scheduled: 'Scheduled file ready',
  }[shareType] || 'Ready to Access';

  const accentColor = {
    loading: '#3b82f6', ready: '#22c55e',
    expired: '#f59e0b', revoked: '#ef4444', error: '#ef4444', used: '#22c55e',
  }[phase] || '#3b82f6';

  const renderLimitStats = () => {
    if (!enforcesLimits) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
        <div style={{ background: '#0f0f11', border: '1px solid #1a1a1c', borderRadius: 12, padding: '10px 14px', textAlign: 'left' }}>
          <p style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px', fontWeight: 600 }}>Views</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fileData.view_count || 0}</span>
            <span style={{ fontSize: 11, color: '#444' }}>/ {fileData.view_limit ?? '∞'}</span>
          </div>
        </div>
        <div style={{ background: '#0f0f11', border: '1px solid #1a1a1c', borderRadius: 12, padding: '10px 14px', textAlign: 'left' }}>
          <p style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px', fontWeight: 600 }}>Downloads</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fileData.download_count || 0}</span>
            <span style={{ fontSize: 11, color: '#444' }}>/ {fileData.download_limit ?? '∞'}</span>
          </div>
        </div>
        <div style={{ gridColumn: 'span 2', background: '#0f0f11', border: '1px solid #1a1a1c', borderRadius: 12, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Access Type</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fefafaff', padding: '2px 8px', borderRadius: 6 }}>
            {fileData.permission?.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div style={{ display: 'grid', gridTemplateColumns: canView && canDownload ? '1fr 1fr' : '1fr', gap: 12 }}>
      {canView && (
        <button
          type="button"
          onClick={() => handleAction('view')}
          disabled={actionLoading !== null}
          style={{
            padding: '14px', borderRadius: 10, background: '#111', border: '1px solid #222',
            color: actionLoading === 'view' ? '#666' : 'white', fontSize: 14, fontWeight: 600,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <i className="fa-solid fa-eye" style={{ fontSize: 14, color: '#3b82f6' }} />
          {actionLoading === 'view' ? 'Opening…' : 'View File'}
        </button>
      )}
      {canDownload && (
        <button
          type="button"
          onClick={() => handleAction('download')}
          disabled={actionLoading !== null}
          style={{
            padding: '14px', borderRadius: 10,
            background: shareType === 'zip_bundle' ? '#b45309' : '#0f52bdff',
            border: 'none', color: 'white', fontSize: 14, fontWeight: 600,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <i className={`fa-solid ${shareType === 'zip_bundle' ? 'fa-file-zipper' : 'fa-download'}`} style={{ fontSize: 14 }} />
          {actionLoading === 'download'
            ? 'Fetching…'
            : (shareType === 'zip_bundle' ? 'Download ZIP' : 'Download')}
        </button>
      )}
    </div>
  );

  const renderBody = () => {
    if (phase === 'loading') {
      return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{
            width: 48, height: 48, border: '2px solid #1a1a1a', borderTop: '2px solid #3b82f6',
            borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite',
          }}
          />
          <p style={{ fontSize: 14, color: '#808080', margin: 0 }}>Checking link security…</p>
        </div>
      );
    }

    if (phase === 'expired') {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20, background: '#451a0320',
            border: '1px solid #f59e0b30', marginBottom: '1.5rem',
          }}
          >
            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 28, color: '#f59e0b' }} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Access Expired</h1>
          <p style={{ fontSize: 14, color: '#808080', margin: 0, lineHeight: 1.6 }}>
            {backendError || 'This secure link has reached its time limit.'}
          </p>
        </div>
      );
    }

    if (phase === 'revoked') {
      return (
        <div style={{ textAlign: 'center', opacity: 0.25, filter: 'blur(1.5px)', pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20, background: '#ef444420',
            border: '1px solid #ef444430', marginBottom: '1.5rem',
          }}
          >
            <i className="fa-solid fa-ban" style={{ fontSize: 28, color: '#ef4444' }} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Access Revoked</h1>
          <p style={{ fontSize: 14, color: '#808080', margin: 0, lineHeight: 1.6 }}>This link has been revoked.</p>
        </div>
      );
    }

    if (phase === 'used') {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20, background: '#052e1620',
            border: '1px solid #22c55e30', marginBottom: '1.5rem',
          }}
          >
            <i className="fa-solid fa-circle-check" style={{ fontSize: 28, color: '#22c55e' }} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Download Complete</h1>
          <p style={{ fontSize: 14, color: '#808080', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            This file has already been downloaded. One-time links expire after a single use.
          </p>
        </div>
      );
    }

    if (phase === 'error') {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20, background: '#ef444420',
            border: '1px solid #ef444430', marginBottom: '1.5rem',
          }}
          >
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 28, color: '#ef4444' }} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Invalid Link</h1>
          <p style={{ fontSize: 14, color: '#808080', margin: 0, lineHeight: 1.6 }}>
            {backendError || 'The link you followed is invalid or has been deleted.'}
          </p>
        </div>
      );
    }

    const fileIconData = getFileIcon(fileData.content_type, shareType);
    const subtitle = fileData.bundle_message || fileData.scheduled_message;
    const accessedLabel = formatAccessedAt(fileData.accessed_at);

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 80, height: 80, borderRadius: 24, background: '#111',
          border: '1px solid #1a1a1a', marginBottom: '1.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
        >
          <i className={`fa-solid ${fileIconData.icon}`} style={{ fontSize: 32, color: fileIconData.color }} />
        </div>

        <h1 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>{readyTitle}</h1>
        <p style={{ fontSize: 14, color: '#808080', margin: '0 0 4px' }}>
          Shared by{' '}
          <span style={{ color: '#e6d2d2ff', fontWeight: 500 }}>{fileData.sender_name}</span>
        </p>
        <p style={{ fontSize: 12, color: '#5f5f5f', margin: '0 0 1.25rem', letterSpacing: '0.2px' }}>
          {fileData.sender_email}
        </p>

        <ShareTypeBanner shareType={shareType} fileData={fileData} />

        <div style={{
          background: '#000', border: '1px solid #1a1a1a', borderRadius: 10,
          padding: '16px 18px', marginBottom: '1.25rem', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${fileIconData.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          >
            <i className={`fa-solid ${fileIconData.icon}`} style={{ fontSize: 18, color: fileIconData.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 600, margin: 0, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            >
              {fileData.file_name}
            </p>
            <p style={{ fontSize: 12, color: '#666', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{formatSize(fileData.file_size)}</span>
              {shareType === 'zip_bundle' && fileData.file_count > 1 && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#333' }} />
                  <span>{fileData.file_count} files</span>
                </>
              )}
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#333' }} />
              <span>{formatExpiry(fileData.expiration_datetime)}</span>
            </p>
            {accessedLabel ? (
              <p style={{
                fontSize: 12, color: '#22c55e', margin: '6px 0 0',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              >
                <i className="fa-solid fa-circle-check" style={{ fontSize: 10 }} />
                Link opened {accessedLabel}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: '#555', margin: '6px 0 0' }}>
                Opens are recorded when you visit this page
              </p>
            )}
            {subtitle ? (
              <p style={{ fontSize: 12, color: '#555', margin: '6px 0 0', lineHeight: 1.4 }}>{subtitle}</p>
            ) : null}
          </div>
        </div>

        {renderLimitStats()}
        {renderActionButtons()}

        {!canView && !canDownload && enforcesLimits && (
          <div style={{
            marginTop: 16, padding: '12px', background: '#ef444410',
            border: '1px solid #ef444420', borderRadius: 12, color: '#ef4444', fontSize: 13, fontWeight: 500,
          }}
          >
            <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }} />
            Access limit reached for this link.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col lg:flex-row font-['Inter'] antialiased">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        button:active { transform: scale(0.98); }
        .* { scrollbar-width: none; -ms-overflow-style: none; }
*::-webkit-scrollbar { display: none; }
      `}</style>

      {revokedModalVisible && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)', animation: 'backdropIn 0.3s ease',
          }}
        >
          <div style={{
            width: '100%', maxWidth: 420, background: '#0c0c0e', border: '1px solid #2a1a1a',
            borderRadius: 20, padding: '2.5rem 2rem', textAlign: 'center',
            boxShadow: '0 0 0 1px rgba(239,68,68,0.08), 0 32px 80px rgba(0,0,0,0.7)',
            animation: 'fadeInScale 0.35s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative', overflow: 'hidden',
          }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', opacity: 0.7,
            }}
            />
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: 22,
              background: 'linear-gradient(135deg, #2a0a0a, #1a0606)',
              border: '1px solid rgba(239,68,68,0.25)', marginBottom: '1.5rem',
            }}
            >
              <i className="fa-solid fa-ban" style={{ fontSize: 28, color: '#ef4444' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Access Revoked</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 2rem', lineHeight: 1.7, padding: '0 0.5rem' }}>
              {backendError || 'The sender has revoked access to this file. This link is no longer valid.'}
            </p>
            <button
              type="button"
              onClick={() => setRevokedModalVisible(false)}
              style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-black border-r border-[#1e1e20] relative sticky top-0 h-screen">
        <div className="relative z-10">
          <div className="text-xl font-bold tracking-tight text-white mb-24">HiveDrive</div>
          <h1 className="text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-8">
            Securely <br />
            <span className="text-blue-400 font-bold italic">Shared Access.</span>
          </h1>
          <p className="text-[#a1a1aa] text-lg max-w-sm leading-relaxed font-light">
            Access shared files, ZIP packages, and scheduled deliveries from one secure link.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 md:p-10 lg:p-16 py-10 bg-[#09090b] relative lg:h-screen lg:overflow-y-auto">
        <div
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: 500, height: 500, borderRadius: '50%', background: `${accentColor}05`,
            filter: 'blur(100px)', pointerEvents: 'none', transition: 'background 0.8s ease',
          }}
        />

        <div className="w-full max-w-[440px] z-10 pb-10">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="text-xl font-bold tracking-tight text-white">HiveDrive<span className="text-blue-500">.</span></div>
          </div>

          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-8 sm:p-10 relative shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              opacity: 0.5,
            }}
            />
            {renderBody()}
          </div>

          <div className="text-center mt-12">
            <p className="text-[10px] text-[#4a4a4a] uppercase tracking-[0.25em] font-medium m-0">
              HiveDrive Secure Share
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalShareView;
