import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API = 'http://127.0.0.1:8000/api';

const getFileIcon = (contentType) => {
  if (contentType?.includes('pdf')) return { icon: 'fa-file-pdf', color: '#ef4444' };
  if (contentType?.includes('image')) return { icon: 'fa-file-image', color: '#3b82f6' };
  if (contentType?.includes('word') || contentType?.includes('msword')) return { icon: 'fa-file-word', color: '#2b579a' };
  if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) return { icon: 'fa-file-excel', color: '#217346' };
  if (contentType?.includes('powerpoint') || contentType?.includes('presentation')) return { icon: 'fa-file-powerpoint', color: '#d24726' };
  if (contentType?.includes('zip') || contentType?.includes('rar')) return { icon: 'fa-file-zipper', color: '#fabd2f' };
  if (contentType?.includes('text')) return { icon: 'fa-file-lines', color: '#9ca3af' };
  return { icon: 'fa-file', color: '#888' };
};

const ExternalShareView = () => {
  const { token } = useParams();

  const [phase, setPhase] = useState('loading'); // loading | ready | expired | revoked | error
  const [fileData, setFileData] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // 'view' | 'download' | null
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
          } else if (data.error && (data.error.toLowerCase().includes('revoked') || data.error.toLowerCase().includes('used'))) {
            setPhase('revoked');
            setRevokedModalVisible(true);
          } else {
            setPhase('error');
          }
          return;
        }
        
        setFileData(data);
        setPhase('ready');
      } catch {
        setPhase('error');
        setBackendError('Something went wrong while connecting to the server.');
      }
    };
    loadShare();
  }, [token]);

  const handleAction = async (action) => {
    if (actionLoading) return;
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
        a.download = fileData?.file_name || 'file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Update local state for feedback
        if (fileData?.permission === 'one_time_download') {
            setPhase('revoked'); // Link is now dead
            setBackendError('This one-time link has already been used.');
            setRevokedModalVisible(true);
        } else if (fileData?.download_limit !== null) {
            setFileData(prev => ({ ...prev, download_count: (prev.download_count || 0) + 1 }));
        }
      } else {
        const win = window.open(url, '_blank');
        if (!win) {
          window.location.assign(url); // Fallback if popup blocked
        }
        if (fileData?.view_limit !== null) {
            setFileData(prev => ({ ...prev, view_count: (prev.view_count || 0) + 1 }));
        }
      }

      // Crucial: Wait before revoking so browser can actually read the blob
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

  // Conditions & Permissions
  const canView = fileData && 
                 fileData.permission !== 'one_time_download' && 
                 (fileData.view_limit === null || fileData.view_count < fileData.view_limit);

  const canDownload = fileData && 
                     fileData.permission !== 'view_only' && 
                     (fileData.permission === 'one_time_download' 
                        ? !fileData.accessed 
                        : (fileData.download_limit === null || fileData.download_count < fileData.download_limit)
                     );

  const accentColor = {
    loading: '#3b82f6', ready: '#22c55e',
    expired: '#f59e0b', revoked: '#ef4444', error: '#ef4444',
  }[phase] || '#3b82f6';

  const renderBody = () => {
    if (phase === 'loading') return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ width: 48, height: 48, border: '2px solid #1a1a1a', borderTop: '2px solid #3b82f6', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: 14, color: '#808080', margin: 0 }}>Checking link security…</p>
      </div>
    );

    if (phase === 'expired') return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 20, background: '#451a0320', border: '1px solid #f59e0b30', marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 28, color: '#f59e0b' }}></i>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Access Expired</h1>
        <p style={{ fontSize: 14, color: '#808080', margin: 0, lineHeight: 1.6 }}>
          {backendError || 'This secure link has reached its time limit.'}
        </p>
      </div>
    );

    if (phase === 'revoked') return (
      <div style={{ textAlign: 'center', opacity: 0.25, filter: 'blur(1.5px)', pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 20, background: '#ef444420', border: '1px solid #ef444430', marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-ban" style={{ fontSize: 28, color: '#ef4444' }}></i>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Access Revoked</h1>
        <p style={{ fontSize: 14, color: '#808080', margin: 0, lineHeight: 1.6 }}>This link has been revoked.</p>
      </div>
    );

    if (phase === 'error') return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 20, background: '#ef444420', border: '1px solid #ef444430', marginBottom: '1.5rem' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 28, color: '#ef4444' }}></i>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>Invalid Link</h1>
        <p style={{ fontSize: 14, color: '#808080', margin: 0, lineHeight: 1.6 }}>
          {backendError || 'The link you followed is invalid or has been deleted.'}
        </p>
      </div>
    );

    const fileIconData = getFileIcon(fileData.content_type);

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: 24, background: '#111', border: '1px solid #1a1a1a', marginBottom: '1.25rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <i className={`fa-solid ${fileIconData.icon}`} style={{ fontSize: 32, color: fileIconData.color }}></i>
        </div>
        
        <h1 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>Ready to Access</h1>
       <p style={{ fontSize: 14, color: '#808080', margin: '0 0 4px' }}>
  Shared by{" "}
  <span style={{ color: '#e6d2d2ff', fontWeight: 500 }}>
    {fileData.sender_name}
  </span>
</p><p
  style={{
    fontSize: 12,
    color: '#5f5f5f',
    margin: '0 0 2rem',
    fontWeight: 400,
    letterSpacing: '0.2px',
  }}
>
  {fileData.sender_email}
</p>

        <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: 10, padding: '16px 18px', marginBottom: '1.25rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${fileIconData.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <i className={`fa-solid ${fileIconData.icon}`} style={{ fontSize: 18, color: fileIconData.color }}></i>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileData.file_name}</p>
            <p style={{ fontSize: 12, color: '#666', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{formatSize(fileData.file_size)}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#333' }}></span>
              <span>{formatExpiry(fileData.expiration_datetime)}</span>
            </p>
          </div>
        </div>

        {/* Link Statistics Section */}
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

        <div style={{ display: 'grid', gridTemplateColumns: canView && canDownload ? '1fr 1fr' : '1fr', gap: 12 }}>
          {canView && (
            <button
              onClick={() => handleAction('view')}
              disabled={actionLoading !== null}
              style={{ padding: '14px', borderRadius: 10, background: '#111', border: '1px solid #222', color: actionLoading === 'view' ? '#666' : 'white', fontSize: 14, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#333'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#222'}
            >
              <i className="fa-solid fa-eye" style={{ fontSize: 14, color: '#3b82f6' }}></i>
              {actionLoading === 'view' ? 'Opening…' : 'View File'}
            </button>
          )}
          {canDownload && (
            <button
              onClick={() => handleAction('download')}
              disabled={actionLoading !== null}
              style={{ padding: '14px', borderRadius: 10, background: actionLoading === 'download' ? '#1d4ed8' : '#0f52bdff', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}
            >
              <i className="fa-solid fa-download" style={{ fontSize: 14 }}></i>
              {actionLoading === 'download' ? 'Fetching…' : 'Download'}
            </button>
          )}
        </div>

        {(!canView && !canDownload) && (
            <div style={{ padding: '12px', background: '#ef444410', border: '1px solid #ef444420', borderRadius: 12, color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }}></i>
                Access limit reached for this link.
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex font-['Inter'] antialiased">
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
      `}</style>
      
      {/* ── Revoked Modal Overlay ── */}
      {revokedModalVisible && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            animation: 'backdropIn 0.3s ease',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 420,
              background: '#0c0c0e',
              border: '1px solid #2a1a1a',
              borderRadius: 20,
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 0 0 1px rgba(239,68,68,0.08), 0 32px 80px rgba(0,0,0,0.7)',
              animation: 'fadeInScale 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Red gradient top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
              opacity: 0.7,
            }} />

            {/* Subtle red glow behind icon */}
            <div style={{
              position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
              width: 180, height: 180,
              background: 'radial-gradient(circle, rgba(239,68,68,0.09) 0%, transparent 70%)',
              filter: 'blur(30px)', pointerEvents: 'none',
            }} />

            {/* Icon */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: 22,
              background: 'linear-gradient(135deg, #2a0a0a, #1a0606)',
              border: '1px solid rgba(239,68,68,0.25)',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(239,68,68,0.15)',
            }}>
              <i className="fa-solid fa-ban" style={{ fontSize: 28, color: '#ef4444' }}></i>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: '#fff', letterSpacing: '-0.3px' }}>
              Access Revoked
            </h2>

            {/* Divider */}
            <div style={{ width: 32, height: 2, background: 'rgba(239,68,68,0.35)', borderRadius: 2, margin: '0 auto 1.25rem' }} />

            {/* Backend message */}
            <p style={{
              fontSize: 14, color: '#9ca3af', margin: '0 0 2rem',
              lineHeight: 1.7, padding: '0 0.5rem',
            }}>
              {backendError || 'The sender has revoked access to this file. This link is no longer valid.'}
            </p>

            {/* Info badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 10, padding: '8px 14px',
              marginBottom: '1.75rem',
            }}>
              <i className="fa-solid fa-circle-info" style={{ fontSize: 12, color: '#ef4444' }}></i>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                Contact the file owner if you need access
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={() => setRevokedModalVisible(false)}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 12,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.1px',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDE: Banner Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-black border-r border-[#1e1e20] relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '30%', height: '30%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>

        <div className="relative z-10">
          <div className="text-xl font-bold tracking-tight text-white mb-24 flex items-center gap-2">
            HiveDrive
          </div>
          
          <h1 className="text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-8">
            Securely <br />
            <span className="text-blue-400 font-bold italic">Shared Access.</span>
          </h1>
          
          <p className="text-[#a1a1aa] text-lg max-w-sm leading-relaxed font-light mb-12">
            Access your shared files with military-grade protection and instant delivery protocols.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272a] flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                <i className="fa-solid fa-shield-halved text-blue-500 text-sm"></i>
              </div>
              <div>
                <h3 className="text-white text-sm font-medium">Hive-Shield Protocol</h3>
                <p className="text-[#71717a] text-xs">End-to-end encrypted transit layer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272a] flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                <i className="fa-solid fa-bolt text-blue-500 text-sm"></i>
              </div>
              <div>
                <h3 className="text-white text-sm font-medium">Rapid-Sync Delivery</h3>
                <p className="text-[#71717a] text-xs">Low-latency global edge distribution</p>
              </div>
            </div>

             <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#121214] border border-[#27272a] flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                <i className="fa-solid fa-fingerprint text-blue-500 text-sm"></i>
              </div>
              <div>
                <h3 className="text-white text-sm font-medium">Zero-Trust Verification</h3>
                <p className="text-[#71717a] text-xs">Identity-first access management</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-[#71717a] text-[10px] tracking-[0.2em] uppercase pt-8 border-t border-[#1e1e20]">
            <i className="fa-solid fa-lock text-[8px]"></i>
            Verified Connection Secure
        </div>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#09090b] relative overflow-hidden">
        {/* Background Glow */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%,-50%)', 
          width: 500, 
          height: 500, 
          borderRadius: '50%', 
          background: `${accentColor}05`, 
          filter: 'blur(100px)', 
          pointerEvents: 'none', 
          transition: 'background 0.8s ease' 
        }}></div>

        <div className="w-full max-w-[440px] z-10">
          {/* Mobile Header (Visible only on mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-database text-white text-xs"></i>
            </div>
            <div className="text-xl font-bold tracking-tight text-white">HiveDrive<span className="text-blue-500">.</span></div>
          </div>

          {/* Main Card */}
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-lg p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: 1, 
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, 
                    opacity: 0.5, 
                    transition: 'background 1s' 
                }}
            ></div>
            {renderBody()}
          </div>

          <div className="text-center mt-12">
              <p className="text-[10px] text-[#4a4a4a] text-uppercase tracking-[0.25em] flex items-center justify-center gap-2 m-0 uppercase font-medium">
                <i className="fa-solid fa-shield-halved text-[9px]"></i>
                Secured by HiveDrive Protocol
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalShareView;