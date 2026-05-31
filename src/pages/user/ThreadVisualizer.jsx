import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  Panel,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { useParams, useNavigate } from "react-router-dom";
import TopToast from "../../components/TopToast";
import {
  getThreads,
  getThreadGraph,
  createNode,
  updateNode,
  deleteNode,
  updateNodePosition,
  createStage,
  updateStage,
  deleteStage,
  addDependency,
  removeDependency,
  updateDependency,
  getNodeFiles,
  uploadNodeFile,
  deleteNodeFile,
  getNodeActivity,
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../services/threadService";
import HelpModal from "../../components/HelpModal";
import { getFileMeta } from "../../utils/fileIcons";
import { formatDateTime } from "../../utils/dateFormatter";

// ── Design tokens ──────────────────────────────────────────────────────────────
const ff = "'Inter', 'DM Sans', system-ui, sans-serif";

const ThemeStyles = ({ isDark }) => (
  <style>{`
    /* ── Custom scrollbars (global) ── */
    * {
      scrollbar-width: thin;
      scrollbar-color: ${isDark ? "#2d2d2d transparent" : "#d1d9e6 transparent"};
    }
    *::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    *::-webkit-scrollbar-track {
      background: transparent;
    }
    *::-webkit-scrollbar-thumb {
      background: ${isDark ? "#2d2d2d" : "#d1d9e6"};
      border-radius: 999px;
      transition: background .2s;
    }
    *::-webkit-scrollbar-thumb:hover {
      background: ${isDark ? "#444" : "#94a3b8"};
    }
    *::-webkit-scrollbar-corner {
      background: transparent;
    }

    /* ── ReactFlow canvas: allow vertical scroll with scrollbar,
          disable wheel-zoom so the page scrolls naturally ── */
    .rf-canvas-wrap {
      overflow: auto !important;
    }
    .rf-canvas-wrap .react-flow__renderer {
      overflow: visible !important;
    }

    .theme-wrapper {
      --t-sidebarBg: ${isDark ? "#050505" : "#f8fafc"};
      --t-sidebarBorder: ${isDark ? "#1a1a1a" : "#e2e8f0"};
      --t-sidebarText: ${isDark ? "#e2e8f0" : "#475569"};
      --t-sidebarTextMuted: ${isDark ? "#64748b" : "#94a3b8"};
      --t-sidebarActiveBg: ${isDark ? "#1a1a1a" : "#eff6ff"};
      --t-sidebarActiveText: #3b82f6;
      --t-pageBg: ${isDark ? "#000000" : "#e8ecf1"};
      --t-cardBg: ${isDark ? "#0d0d0d" : "#ffffff"};
      --t-border: ${isDark ? "#262626" : "#e2e8f0"};
      --t-borderSoft: ${isDark ? "#1a1a1a" : "#f1f5f9"};
      --t-text: ${isDark ? "#ffffff" : "#0f172a"};
      --t-textMuted: ${isDark ? "#94a3b8" : "#64748b"};
      --t-textFaint: ${isDark ? "#4b5563" : "#94a3b8"};
      --t-accent: #3b82f6;
      --t-accentSoft: ${isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)"};
      --t-hoverRowBg: ${isDark ? "#1a1a1a" : "#f8fafc"};
      --t-modalOverlay: ${isDark ? "rgba(0,0,0,0.9)" : "rgba(15,23,42,0.45)"};
      --t-btnGhostBg: ${isDark ? "transparent" : "#ffffff"};
      --t-btnGhostHover: ${isDark ? "#1a1a1a" : "#f1f5f9"};
      --t-btnSoftBg: ${isDark ? "#1a1a1a" : "#f1f5f9"};
      --t-dangerBg: ${isDark ? "#1a0a0a" : "#fff1f2"};
      --t-dangerBorder: ${isDark ? "#331111" : "#ffe4e6"};
      --t-dangerText: ${isDark ? "#f87171" : "#e11d48"};
      --t-inputBg: ${isDark ? "#050505" : "#ffffff"};
      --t-dotsBg: ${isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.97)"};
      --t-iconBg: ${isDark ? "#1a1a1a" : "#f1f5f9"};
      --t-iconColor: ${isDark ? "#94a3b8" : "#64748b"};
      --t-stageBg: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.55)"};
      --t-stageHeaderBg: ${isDark ? "rgba(255,255,255,0.06)" : "#f8fafc"};
      --t-stageBorder: ${isDark ? "#262626" : "#d1d9e6"};
      --t-nodeBg: ${isDark ? "#0d0d0d" : "#ffffff"};
      --t-nodeBorder: ${isDark ? "#262626" : "#dde3ed"};
      --t-nodeShadow: ${isDark
        ? "0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.6)"
        : "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.08)"};
      --t-nodeSelectedShadow: ${isDark
        ? "0 0 0 2px #3b82f6, 0 4px 20px rgba(0,0,0,0.7)"
        : "0 0 0 2px #3b82f6, 0 4px 20px rgba(59,130,246,0.15)"};
      --t-edgeColor: ${isDark ? "#475569" : "#94a3b8"};
      --t-statusActiveBg: ${isDark ? "rgba(30,58,138,0.3)" : "#eff6ff"};
      --t-statusActiveColor: ${isDark ? "#93c5fd" : "#1d4ed8"};
      --t-statusInactiveBg: ${isDark ? "#111111" : "#f1f5f9"};
      --t-statusInactiveColor: ${isDark ? "#64748b" : "#475569"};
      --t-statusReviewBg: ${isDark ? "rgba(69,26,3,0.3)" : "#fefce8"};
      --t-statusReviewColor: ${isDark ? "#fde68a" : "#854d0e"};
      --t-statusBlockedBg: ${isDark ? "rgba(69,10,10,0.3)" : "#fef2f2"};
      --t-statusBlockedColor: ${isDark ? "#fca5a5" : "#991b1b"};
      --t-statusCompletedBg: ${isDark ? "rgba(6,78,59,0.3)" : "#f0fdf4"};
      --t-statusCompletedColor: ${isDark ? "#6ee7b7" : "#166534"};
      --t-shadowSoft: ${isDark ? "0 10px 30px rgba(0,0,0,0.9)" : "0 4px 20px rgba(15,23,42,0.1)"};
      --t-shadowCard: ${isDark
        ? "0 0 0 1px rgba(255,255,255,0.08), 0 10px 20px rgba(0,0,0,0.7)"
        : "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.08)"};
    }
  `}</style>
);

const T = {
  sidebarBg: "var(--t-sidebarBg)",
  sidebarBorder: "var(--t-sidebarBorder)",
  sidebarText: "var(--t-sidebarText)",
  sidebarTextMuted: "var(--t-sidebarTextMuted)",
  sidebarActiveBg: "var(--t-sidebarActiveBg)",
  sidebarActiveText: "var(--t-sidebarActiveText)",
  pageBg: "var(--t-pageBg)",
  cardBg: "var(--t-cardBg)",
  border: "var(--t-border)",
  borderSoft: "var(--t-borderSoft)",
  text: "var(--t-text)",
  textMuted: "var(--t-textMuted)",
  textFaint: "var(--t-textFaint)",
  accent: "var(--t-accent)",
  accentSoft: "var(--t-accentSoft)",
  statusCompleted: "#22c55e",
  statusInProgress: "#3b82f6",
  statusInReview: "#f59e0b",
  statusBlocked: "#ef4444",
  statusNotStarted: "#94a3b8",
};

const STATUS_CFG = {
  INACTIVE:     { label: "Inactive",      color: "var(--t-statusInactiveColor)",    dot: T.statusNotStarted, top: "#94a3b8" },
  ACTIVE:       { label: "Active",        color: "var(--t-statusActiveColor)",    dot: T.statusInProgress,  top: "#3b82f6" },
  NEEDS_REVIEW: { label: "Needs Review",  color: "var(--t-statusReviewColor)",    dot: T.statusInReview,    top: "#f59e0b" },
  OUTDATED:     { label: "Outdated",      color: "var(--t-statusBlockedColor)",   dot: T.statusBlocked,     top: "#ef4444" },
  BLOCKED:      { label: "Blocked",       color: "var(--t-statusBlockedColor)",   dot: T.statusBlocked,     top: "#ef4444" },
  COMPLETED:     { label: "Completed",     color: "var(--t-statusCompletedColor)", dot: T.statusCompleted,   top: "#22c55e" },
};

const SW = 240;
const SG = 80;
const NH = 96;
const NG = 58;
const PT = 54;

// ── Theme sync ─────────────────────────────────────────────────────────────────
function useThemeSync() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem("theme") || "light");
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem("theme") || "light";
      setTheme(prev => (prev !== current ? current : prev));
    }, 100);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  return theme === "dark";
}

// ── UI primitives ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.ACTIVE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.color, fontSize: 10, fontWeight: 700,
      padding: "3px 8px", borderRadius: 999, letterSpacing: "0.02em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, style: ex }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: small ? "6px 12px" : "9px 16px",
    fontSize: small ? 12 : 13, fontWeight: 600,
    border: "none", borderRadius: 8, cursor: disabled ? "default" : "pointer",
    fontFamily: ff, opacity: disabled ? 0.55 : 1, transition: "all .15s",
  };
  const v = {
    primary: { background: T.accent, color: "#fff", boxShadow: "0 1px 3px rgba(59,130,246,.4)" },
    ghost: { background: "var(--t-btnGhostBg)", border: `1px solid ${T.border}`, color: T.text },
    soft: { background: "var(--t-btnSoftBg)", color: T.text },
    danger: { background: "var(--t-dangerBg)", color: "var(--t-dangerText)", border: "1px solid var(--t-dangerBorder)" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], ...ex }}>{children}</button>;
}

function Inp({ value, onChange, placeholder, multiline, autoFocus, style: ex }) {
  const s = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    border: `1px solid ${T.border}`, borderRadius: 8, outline: "none",
    fontFamily: ff, color: T.text, boxSizing: "border-box", background: "var(--t-inputBg)", ...ex,
  };
  return multiline
    ? <textarea style={{ ...s, minHeight: 80, resize: "vertical" }} value={value} onChange={onChange} placeholder={placeholder} />
    : <input style={s} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} />;
}

function Fld({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      {children}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 440 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--t-modalOverlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: T.cardBg, borderRadius: 10, width, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--t-shadowSoft)", border: `1px solid ${T.border}`, fontFamily: ff }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${T.borderSoft}` }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "var(--t-btnSoftBg)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 16, color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Three-dot context menu ─────────────────────────────────────────────────────
function Dots({ onEdit, onFiles, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

const row = (label, fn, danger) => (
  <button
    onMouseDown={e => e.stopPropagation()}
    onClick={e => { e.stopPropagation(); fn(); setOpen(false); }}
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      padding: "8px 12px",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      color: danger ? "var(--t-dangerText)" : T.text,
      textAlign: "left",
      fontFamily: ff
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? "var(--t-dangerBg)" : "var(--t-hoverRowBg)"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}
  >
    {label}
  </button>
);
  return (
    <div ref={ref} style={{ position: "absolute", top: 8, right: 8, zIndex: 20 }}>
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: "var(--t-dotsBg)", border: `1px solid ${T.border}`, borderRadius: 6, width: 22, height: 22, cursor: "pointer", fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
        ⋯
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: T.cardBg, borderRadius: 6, border: `1px solid ${T.border}`, boxShadow: "var(--t-shadowSoft)", minWidth: 150, overflow: "hidden", fontFamily: ff }} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          {row("Edit Node", onEdit)}
          {row("View & Upload Files", onFiles)}
{onDelete && <><div style={{ borderTop: `1px solid ${T.borderSoft}`, margin: "3px 0" }} />{row("Delete", onDelete, true)}</>}        </div>
      )}
    </div>
  );
}

// ── Stage lane ─────────────────────────────────────────────────────────────────
function StageLane({ data }) {
  const { label, height } = data;
  return (
    <div style={{ width: SW, height, pointerEvents: "none", fontFamily: ff, position: "relative" }}>
      <div style={{
        width: "100%", height: "100%",
        border: "1.5px solid var(--t-stageBorder)",
        borderRadius: 14,
        background: "var(--t-stageBg)",
        boxSizing: "border-box",
        boxShadow: "inset 0 1px 3px rgba(15,23,42,0.04)",
      }}>
        <div style={{
          padding: "11px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted,
          borderBottom: "1.5px solid var(--t-stageBorder)",
          background: "var(--t-stageHeaderBg)",
          borderTopLeftRadius: 12, borderTopRightRadius: 12,
          textTransform: "uppercase", letterSpacing: "0.08em",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          pointerEvents: "auto",
        }}>
          <span>{label}</span>
<div style={{ display: "flex", gap: 4 }}>
  <button onClick={() => data.onRenameStage(data)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: "2px 4px", color: T.textFaint, borderRadius: 4 }}>
    Edit
  </button>
  <button onClick={() => data.onDeleteStage(data)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: "2px 4px", color: "var(--t-dangerText)", borderRadius: 4 }}>
    Delete
  </button>
</div>
        </div>
      </div>
    </div>
  );
}

// ── Thread node card ───────────────────────────────────────────────────────────
function ThreadNode({ data, selected }) {
  const { node, isRoot, onEdit, onFiles, onDelete, indexLabel } = data;
  const sc = STATUS_CFG[node.status] || STATUS_CFG.ACTIVE;

  return (
    <div style={{
      width: SW - 24,
      minHeight: NH,
      background: "var(--t-nodeBg)",
      borderLeft: `3px solid ${sc.top}`,
      border: selected ? `1.5px solid ${T.accent}` : "1.5px solid var(--t-nodeBorder)",
      borderRadius: 10,
      fontFamily: ff,
      position: "relative",
      boxSizing: "border-box",
      boxShadow: selected ? "var(--t-nodeSelectedShadow)" : "var(--t-nodeShadow)",
      overflow: "visible",
      cursor: "default",
      zIndex: 10,
    }}>
      <Handle type="target" position={Position.Left}
        style={{ width: 9, height: 9, background: T.textFaint, border: `2px solid var(--t-nodeBg)`, left: -7 }} />
      <Handle type="source" position={Position.Right}
        style={{ width: 9, height: 9, background: T.accent, border: `2px solid var(--t-nodeBg)`, right: -7, cursor: "crosshair" }} />

      <div style={{ padding: "10px 12px 11px 11px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textFaint, marginBottom: 5, letterSpacing: "0.02em" }}>
          #{indexLabel}
        </div>
        <div style={{
          fontWeight: 700, fontSize: 12.5, color: T.text,
          lineHeight: 1.35, marginBottom: 4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          paddingRight: 24,
        }}>
          {node.title}
        </div>
        <div style={{ fontSize: 10.5, color: T.textFaint, fontWeight: 500, marginBottom: 10 }}>
          {new Date(node.created_at || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 8, borderTop: "1px solid var(--t-borderSoft)",
        }}>
          <span style={{ fontSize: 10.5, color: T.textFaint, fontWeight: 500 }}>
            File(s): <span style={{ color: T.textMuted, fontWeight: 700 }}>{node.file_count}</span>
          </span>
          <StatusPill status={node.status} />
        </div>
      </div>

      <Dots
        onEdit={() => onEdit(node)}
        onFiles={() => onFiles(node)}
        onDelete={isRoot ? undefined : () => onDelete(node)}
      />
    </div>
  );
}

const RF_NODE_TYPES = { stageLane: StageLane, threadNode: ThreadNode };

function formatDependencyLabel(type) {
  if (!type || typeof type !== "string") return "Depends On";
  const normalized = type.trim().toUpperCase();
  if (!normalized) return "Depends On";
  return normalized.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

const DEPENDENCY_TYPES = [
  { value: "DEPENDS_ON",   label: "Depends On" },
  { value: "REQUIRED_FOR", label: "Required For" },
  { value: "WAITING_FOR",  label: "Waiting For" },
  { value: "RELATED",      label: "Related" },
  { value: "NOT_SURE",     label: "Not Sure" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
];

// ── File modal ─────────────────────────────────────────────────────────────────
function StagedFileThumb({ f }) {
  const meta = getFileMeta(f.type || "");
  const isImage = meta.category === "image";
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [f, isImage]);

  return (
    <div style={{
      width: 40, height: 40, borderRadius: 7, flexShrink: 0,
      overflow: "hidden", border: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--t-inputBg)",
    }}>
      {isImage && previewUrl ? (
        <img src={previewUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 18, color: meta.color }} />
      )}
    </div>
  );
}

function UploadedFileThumb({ f, size = 40 }) {
  const meta = getFileMeta(f.content_type || "");
  const isImage = meta.category === "image";

  return (
    <div style={{
      width: size, height: size, borderRadius: 7, flexShrink: 0,
      overflow: "hidden", border: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--t-inputBg)",
    }}>
      {isImage && f.file_url ? (
        <img src={f.file_url} alt={f.original_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <i className={`fa-solid ${meta.icon}`} style={{ fontSize: size * 0.45, color: meta.color }} />
      )}
    </div>
  );
}

function FileModal({ open, onClose, node, onChange, showToast }) {
  const [files, setFiles] = useState([]);
  const [staged, setStaged] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && node) getNodeFiles(node.id).then(setFiles).catch(() => setFiles([]));
    setStaged([]);
  }, [open, node?.id]);

  const addUniqueFiles = (newFiles) => {
    setStaged(prev => {
      const existing = new Set(prev.map(f => `${f.name}-${f.size}`));
      const unique = newFiles.filter(f => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  };

  const upload = async () => {
    setBusy(true);
    let changed = false;
    let lastMessage = null;
    for (const f of staged) {
      const fd = new FormData(); fd.append("file", f);
      try {
        const r = await uploadNodeFile(node.id, fd);
        setFiles((p) => [r, ...p]);
        changed = true;
        lastMessage = getApiSuccessMessage(r, null);
      } catch (e) {
        onClose();
        showToast?.(getApiErrorMessage(e, "Upload failed"), "error");
      }
    }
    setStaged([]);
    setBusy(false);
    if (changed) {
      showToast?.(lastMessage || "File(s) uploaded successfully", "success");
      if (onChange) onChange();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Files — ${node?.title || ""}`} width={480}>
      <div style={{ border: `2px dashed ${T.border}`, borderRadius: 12, padding: 20, textAlign: "center", background: T.pageBg, marginBottom: 14, cursor: "pointer" }}
        onClick={() => document.getElementById("_fi_").click()}
        onDrop={e => { e.preventDefault(); addUniqueFiles(Array.from(e.dataTransfer.files)); }}
        onDragOver={e => e.preventDefault()}>
        <div style={{ fontSize: 13, color: T.textMuted }}>Drop files or <span style={{ color: T.accent, fontWeight: 600 }}>browse</span></div>
        <input id="_fi_" type="file" multiple style={{ display: "none" }} onChange={e => { addUniqueFiles(Array.from(e.target.files)); e.target.value = ""; }} />
      </div>
{staged.length > 0 && (
        <div style={{ marginBottom: 14 }}>
{staged.map((f, i) => {
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", background: T.accentSoft,
                borderRadius: 9, marginBottom: 6, border: `1px solid ${T.border}`,
              }}>
                {/* Thumbnail */}
 <StagedFileThumb f={f} />

                {/* Name + size */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>
                    {(f.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>

                <button onClick={() => setStaged(p => p.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: "2px 4px" }}>
                  ×
                </button>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={upload} disabled={busy}>{busy ? "Uploading…" : `Upload ${staged.length} file(s)`}</Btn>
          </div>
        </div>
      )}
      {files.map(f => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${T.borderSoft}`, borderRadius: 9, marginBottom: 6 }}>
          <UploadedFileThumb f={f} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
            <div style={{ fontSize: 10, color: T.textFaint, marginTop: 2 }}>{f.uploaded_by}</div>
          </div>
          {f.file_url && <a href={f.file_url} download style={{ fontSize: 12, color: T.accent }}>⬇</a>}
          <button onClick={() => deleteNodeFile(f.id).then((res) => {
            setFiles((p) => p.filter((x) => x.id !== f.id));
            showToast?.(getApiSuccessMessage(res, "File removed"), "success");
            if (onChange) onChange();
          }).catch((e) => showToast?.(getApiErrorMessage(e, "Failed to remove file"), "error"))} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 15 }}>×</button>
        </div>
      ))}
      {!files.length && !staged.length && <div style={{ color: T.textFaint, fontSize: 12, textAlign: "center", paddingTop: 4 }}>No files yet</div>}
    </Modal>
  );
}

// ── Node form modal ────────────────────────────────────────────────────────────
function NodeFormModal({ open, onClose, onSubmit, initial, title }) {
  const [form, setForm] = useState({ title: "", description: "", status: "INACTIVE" });
  useEffect(() => { setForm({ title: "", description: "", status: "INACTIVE", ...(initial || {}) }); }, [open]);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <Fld label="Title"><Inp value={form.title} onChange={set("title")} placeholder="Node name" autoFocus /></Fld>
      <Fld label="Description"><Inp value={form.description} onChange={set("description")} placeholder="What happens here?" multiline /></Fld>
      <Fld label="Status">
        <select value={form.status} onChange={set("status")} style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: ff, color: T.text, background: "var(--t-inputBg)" }}>
          {Object.entries(STATUS_CFG)
            .filter(([k]) => !["INACTIVE", "BLOCKED"].includes(k))
            .map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
        </select>
      </Fld>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => form.title.trim() && onSubmit(form)} disabled={!form.title.trim()}>{initial ? "Save" : "Create node"}</Btn>
      </div>
    </Modal>
  );
}

// ── Feedback Modals ────────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "primary" }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={380}>
      <div style={{ fontSize: 13, color: T.text, marginBottom: 20, lineHeight: 1.5 }}>{message}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Btn>
      </div>
    </Modal>
  );
}

function PromptModal({ open, onClose, onSubmit, title, label, initialValue = "", confirmText = "Save" }) {
  const [val, setVal] = useState(initialValue);
  useEffect(() => { if (open) setVal(initialValue); }, [open, initialValue]);
  return (
    <Modal open={open} onClose={onClose} title={title} width={380}>
      <Fld label={label}>
        <Inp value={val} onChange={e => setVal(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && val.trim() && (onSubmit(val), onClose())} />
      </Fld>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { onSubmit(val); onClose(); }} disabled={!val.trim()}>{confirmText}</Btn>
      </div>
    </Modal>
  );
}

// ── Right Detail Panel ─────────────────────────────────────────────────────────
function NodePanel({ node, onClose, onEdit, onFiles, onDelete, onRefresh, showConfirm, showToast }) {
  const [activity, setActivity] = useState([]);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("activity");

  const loadData = useCallback(() => {
    if (!node) return;
    getNodeActivity(node.id).then(setActivity).catch(() => setActivity([]));
    getNodeFiles(node.id).then(setFiles).catch(() => setFiles([]));
  }, [node]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRemoveFile = (file) => {
    showConfirm({
      open: true,
      title: "Remove File",
      message: `Are you sure you want to remove "${file.original_name}" from this node?`,
      confirmText: "Remove",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await deleteNodeFile(file.id);
          loadData();
          if (onRefresh) onRefresh();
          showToast?.(getApiSuccessMessage(res, "File removed"), "success");
        } catch (e) {
          showToast?.(getApiErrorMessage(e, "Failed to remove file"), "error");
        }
      }
    });
  };

  if (!node) return null;

  return (
    <div style={{ width: 320, background: T.cardBg, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, fontFamily: ff }}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0, flex: 1 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}></div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.title}</div>
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                {new Date(node.created_at || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--t-btnSoftBg)", border: "none", borderRadius: 8, width: 26, height: 26, cursor: "pointer", fontSize: 14, color: T.textMuted, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
<StatusPill status={node.status} />
        {node.description && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 10, lineHeight: 1.6 }}>{node.description}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Btn small variant="ghost" onClick={() => onEdit(node)} style={{ flex: 1 }}> Edit</Btn>
          <Btn small variant="ghost" onClick={() => onFiles(node)} style={{ flex: 1 }}> Files</Btn>
        </div>
        {!node.is_root && (
          <div style={{ marginTop: 6 }}>
            <Btn small variant="ghost" onClick={() => onDelete(node)} style={{ width: "100%", color: "var(--t-dangerText)", borderColor: "var(--t-dangerBorder)" }}> Delete Node</Btn>
          </div>
        )}
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${T.borderSoft}`, padding: "0 12px" }}>
        {[["details", "Details"], ["files", `Files (${files.length})`], ["activity", "Activity"]].map(([k, l]) => (
          <button key={k} onClick={() => k === "details" ? onEdit(node) : setTab(k)}
            style={{
              padding: "10px 12px", fontSize: 12, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: tab === k ? T.accent : T.textMuted,
              borderBottom: tab === k ? `2px solid ${T.accent}` : "2px solid transparent",
              fontFamily: ff,
            }}>{l}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {tab === "activity" && (activity.length === 0
          ? <div style={{ color: T.textFaint, fontSize: 12, textAlign: "center", marginTop: 18 }}>No activity yet</div>
          : activity.map(a => (
            <div key={a.id} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%",  color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                {"•"}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontWeight: 500 }}>{a.message}</div>
                <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 3 }}>{a.actor} · {new Date(a.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
        {tab === "files" && (files.length === 0
          ? <div style={{ color: T.textFaint, fontSize: 12, textAlign: "center", marginTop: 18 }}>No files uploaded</div>
          : files.map(f => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.borderSoft}` }}>
              <UploadedFileThumb f={f} size={32} />
                <div onClick={() => f.file_url && window.open(f.file_url, "_blank")} style={{ flex: 1, minWidth: 0, cursor: f.file_url ? "pointer" : "default" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
                  <div style={{ fontSize: 10.5, color: T.textFaint }}>{formatDateTime(f.created_at)}</div>
                </div>
              <div style={{ display: "flex", gap: 4 }}>
                
                <button onClick={() => onRemoveFile(f)} title="Remove from node" style={{ width: 26, height: 26, borderRadius: 6, border: "none", color: "var(--t-dangerText)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>❌</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Build RF graph ─────────────────────────────────────────────────────────────
function buildGraph(apiNodes, apiEdges, stages, thread, handlers) {
  const stageMap = {};
  apiNodes.forEach(n => {
    const s = n.stage;
    if (!stageMap[s]) stageMap[s] = [];
    stageMap[s].push(n);
  });

  const laneHeights = {};
  stages.forEach((stage) => {
    const cnt = (stageMap[stage.id] || []).length;
    laneHeights[stage.id] = Math.max(cnt, 1) * NH + Math.max(cnt - 1, 0) * NG + PT + 28;
  });

  const rfNodes = [];

  stages.forEach((stage, i) => {
    rfNodes.push({
      id: `lane-${stage.id}`,
      type: "stageLane",
      position: { x: i * (SW + SG), y: 0 },
      data: {
        label: stage.name,
        isRoot: i === 0,
        nodeCount: (stageMap[stage.id] || []).length,
        height: laneHeights[stage.id],
        id: stage.id,
        onRenameStage: handlers.onRenameStage,
        onDeleteStage: handlers.onDeleteStage,
      },
      draggable: false,
      selectable: false,
      zIndex: 0,
    });
  });

  let counter = 0;
  apiNodes.forEach(n => {
    const stageId = n.stage;
    const stageIdx = stages.findIndex(s => s.id === stageId);
    if (stageIdx === -1) return;
    const sorted = (stageMap[stageId] || []).sort((a, b) => (a.row || 0) - (b.row || 0));
    const rowIdx = sorted.findIndex(x => x.id === n.id);
    counter++;
    rfNodes.push({
      id: String(n.id),
      type: "threadNode",
      position: {
        x: stageIdx * (SW + SG) + 12,
        y: PT + rowIdx * (NH + NG),
      },
      data: {
        node: n,
        isRoot: Boolean(n.is_root),
        indexLabel: counter,
        ...handlers,
      },
      draggable: false,
      zIndex: 2,
    });
  });

  const rfEdges = (apiEdges || []).map(e => ({
    id: `e-${e.id}`,
    source: String(e.source_node),
    target: String(e.target_node),
    type: "smoothstep",
    label: formatDependencyLabel(e.dependency_type),
    labelStyle: { fill: T.textMuted, fontSize: 10, fontWeight: 700 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
    labelBgStyle: { fill: "var(--t-cardBg)", fillOpacity: 0.95, stroke: "var(--t-border)", strokeWidth: 1 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--t-edgeColor)" },
    style: { stroke: "var(--t-edgeColor)", strokeWidth: 1.6 },
    data: { depId: e.id, type: e.dependency_type || "DEPENDS_ON", sourceTitle: e.source_node_title, targetTitle: e.target_node_title },
  }));

  return { rfNodes, rfEdges };
}

// ── Canvas inner ───────────────────────────────────────────────────────────────
function CanvasInner({ thread, onBack, showToast }) {
  const isDark = useThemeSync();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [stages, setStages] = useState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const [addNodeModal, setAddNodeModal] = useState({ open: false, stageId: null });
  const [editModal, setEditModal] = useState({ open: false, node: null });
  const [fileModal, setFileModal] = useState({ open: false, node: null });
  const [addStageModal, setAddStageModal] = useState(false);
  const [stageNameInput, setStageNameInput] = useState("");
  const [edgeEditModal, setEdgeEditModal] = useState({ open: false, edge: null });

  const [confirm, setConfirm] = useState({ open: false, title: "Confirm", message: "", onConfirm: () => {}, variant: "primary", confirmText: "Confirm" });
  const [prompt, setPrompt] = useState({ open: false, title: "Rename", label: "Name", initialValue: "", onSubmit: () => {} });

  const notifyError = (e) => showToast(getApiErrorMessage(e), "error");

  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  // ── Compute canvas content dimensions for scroll container ──────────────────
  const canvasContentWidth = useMemo(() => {
    if (!stages.length) return 1200;
    return stages.length * (SW + SG) + 80;
  }, [stages]);

  const canvasContentHeight = useMemo(() => {
    if (!rfNodes.length) return 800;
    const laneNodes = rfNodes.filter(n => n.type === "stageLane");
    const maxH = laneNodes.reduce((acc, n) => Math.max(acc, n.data?.height || 0), 0);
    return maxH + 120;
  }, [rfNodes]);

  async function handleDelete(node) {
    setConfirm({
      open: true,
      title: "Delete Node",
      message: `Are you sure you want to delete "${node.title}"?`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await deleteNode(node.id);
          setSelectedNode(null);
          loadGraph();
          showToast(getApiSuccessMessage(res, "Node deleted"), "success");
        } catch (e) {
          notifyError(e);
        }
      }
    });
  }

  async function handleRenameStage(stageData) {
    setPrompt({
      open: true,
      title: "Rename Stage",
      label: "Stage Name",
      initialValue: stageData.label,
      onSubmit: async (newName) => {
        try {
          const res = await updateStage(stageData.id, newName);
          loadGraph();
          showToast(getApiSuccessMessage(res, "Stage renamed"), "success");
        } catch (e) {
          notifyError(e);
        }
      }
    });
  }

  async function handleDeleteStage(stageData) {
    setConfirm({
      open: true,
      title: "Delete Stage",
      message: `Delete stage "${stageData.label}"? Stages with active nodes cannot be removed.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await deleteStage(stageData.id);
          loadGraph();
          showToast(getApiSuccessMessage(res, "Stage deleted"), "success");
        } catch (e) {
          notifyError(e);
        }
      }
    });
  }

  const handlers = {
    onEdit: (node) => setEditModal({ open: true, node }),
    onFiles: (node) => setFileModal({ open: true, node }),
    onDelete: (node) => handleDelete(node),
    onRenameStage: handleRenameStage,
    onDeleteStage: handleDeleteStage,
  };

  const applyGraph = useCallback((nodes, edges, stgs) => {
    const { rfNodes: rn, rfEdges: re } = buildGraph(nodes, edges, stgs, thread, handlers);
    setRfNodes(rn);
    setRfEdges(re);
    setTimeout(() => fitView({ padding: 0.18, duration: 350 }), 80);
  }, [thread, fitView]);

  const loadGraph = useCallback(() => {
    getThreadGraph(thread.id).then(data => {
      const nodes = data?.nodes || [];
      const edges = data?.edges || [];
      const stgs = data?.stages || [];
      setRawNodes(nodes);
      setRawEdges(edges);
      setStages(stgs);
      applyGraph(nodes, edges, stgs);
      setSelectedNode(prev => prev ? nodes.find(n => n.id === prev.id) || null : null);
    }).catch(console.error);
  }, [thread.id, applyGraph]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  const onConnect = useCallback(async (params) => {
    const src = parseInt(params.source);
    const tgt = parseInt(params.target);
    if (src === tgt || isNaN(src) || isNaN(tgt)) return;

    const existing = rfEdges.find(e =>
      (e.source === params.source && e.target === params.target) ||
      (e.source === params.target && e.target === params.source)
    );

    if (existing) {
      showToast(
        existing.source === params.source
          ? "This dependency already exists."
          : "An inverse dependency already exists between these nodes.",
        "error"
      );
      return;
    }

    try {
      const res = await addDependency(src, tgt, "DEPENDS_ON");
      loadGraph();
      showToast(getApiSuccessMessage(res, "Connection created"), "success");
    } catch (e) {
      notifyError(e);
    }
  }, [loadGraph, rfEdges, showToast]);

  const onEdgeClick = useCallback((evt, edge) => {
    evt.stopPropagation();
    setEdgeEditModal({ open: true, edge });
  }, []);

  const handleUpdateDependency = async (depId, type) => {
    try {
      const res = await updateDependency(depId, type);
      loadGraph();
      showToast(getApiSuccessMessage(res, "Connection updated"), "success");
    } catch (e) {
      notifyError(e);
    } finally {
      setEdgeEditModal({ open: false, edge: null });
    }
  };

  const handleRemoveDependency = async (depId) => {
    setConfirm({
      open: true,
      title: "Remove Connection",
      message: "Are you sure you want to remove this connection?",
      confirmText: "Remove",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await removeDependency(depId);
          loadGraph();
          showToast(getApiSuccessMessage(res, "Connection removed"), "success");
        } catch (e) {
          notifyError(e);
        } finally {
          setEdgeEditModal({ open: false, edge: null });
        }
      }
    });
  };

  const onNodeDragStop = useCallback(async (evt, rfNode) => {
    if (rfNode.type !== "threadNode") return;
    const nodeId = parseInt(rfNode.id);
    const stageIdx = Math.max(0, Math.round(rfNode.position.x / (SW + SG)));
    const targetStage = stages[stageIdx];
    if (!targetStage) return loadGraph();
    const row = Math.max(0, Math.round((rfNode.position.y - PT) / (NH + NG)));
    try { await updateNodePosition(nodeId, { stage: targetStage.id, row }); loadGraph(); }
    catch { loadGraph(); }
  }, [loadGraph, stages]);

  const onNodeClick = useCallback((evt, rfNode) => {
    if (rfNode.type !== "threadNode") return;
    const n = rawNodes.find(x => String(x.id) === rfNode.id);
    setSelectedNode(prev => prev?.id === n?.id ? null : n || null);
  }, [rawNodes]);

  const handleCreateNode = async (form) => {
    const { stageId } = addNodeModal;
    const inStage = rawNodes.filter(n => n.stage === stageId);
    const row = inStage.length ? Math.max(...inStage.map(n => n.row || 0)) + 1 : 0;
    try {
      const res = await createNode(thread.id, { ...form, stage: stageId, row });
      showToast(getApiSuccessMessage(res, "Node created"), "success");
    } catch (e) {
      notifyError(e);
    } finally {
      setAddNodeModal({ open: false, stageId: null });
      loadGraph();
    }
  };

  const handleEdit = async (form) => {
    try {
      const res = await updateNode(editModal.node.id, form);
      showToast(getApiSuccessMessage(res, "Node updated"), "success");
    } catch (e) {
      notifyError(e);
    } finally {
      setEditModal({ open: false, node: null });
      loadGraph();
    }
  };

  const handleAddStage = async () => {
    const label = stageNameInput.trim() || `Stage ${stages.length + 1}`;
    try {
      const res = await createStage(thread.id, label);
      setStageNameInput("");
      setAddStageModal(false);
      loadGraph();
      showToast(getApiSuccessMessage(res, "Stage created"), "success");
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.pageBg, fontFamily: ff }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ background: T.cardBg, padding: "16px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ marginBottom: 12 }}>
              <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: T.textMuted, fontWeight: 600, fontFamily: ff, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                ‹ Back to Threads
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text }}>{thread.title}</h1>
              <span style={{ background: T.accentSoft, color: T.accent, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>Active</span>
            </div>
            {thread.description ? (
              <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 4, maxWidth: 480, lineHeight: 1.5 }}>{thread.description}</div>
            ) : (
              <div style={{ fontSize: 12.5, color: T.textFaint, marginTop: 4 }}>No description provided.</div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
<button
  onClick={() => setHelpModalOpen(true)}
  className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center border text-sm font-semibold transition-all shadow-sm ${
    isDark 
      ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]' 
      : 'bg-white border-slate-200 text-slate-500 hover:text-blue-500 hover:border-blue-200'
  }`}
  title="How to use"
>
  <i className="fa-solid fa-circle-question text-sm"></i>
</button>
            <div style={{ width: 1, height: 20, background: T.border, margin: "0 2px" }} />
            {stages.map((stg, i) => (
              <button key={stg.id} onClick={() => setAddNodeModal({ open: true, stageId: stg.id })}
                style={{
                  background: "transparent", color: T.textMuted,
                  border: `1px solid ${T.border}`,
                  borderRadius: 7, padding: "5px 11px",
                  fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: ff,
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>
                {i === 0 ? thread.title : stg.name}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: T.border, margin: "0 2px" }} />
            <button onClick={() => setAddStageModal(true)}
              style={{
                background: "#ffffff",color:"#000000", border: "none",
                borderRadius: 7, padding: "5px 12px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: ff,
                display: "flex", alignItems: "center", gap: 5,
              }}>
              <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Add stage
            </button>
          </div>
        </div>

        {/* Canvas + detail panel row */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

          {/*
            ── Scrollable canvas wrapper ──────────────────────────────────────
            The key insight: ReactFlow's own wheel handler zooms the viewport.
            We wrap ReactFlow in an overflow:auto div. ReactFlow is given
            zoomOnScroll=false and panOnScroll=false so wheel events bubble up
            to this wrapper and scroll it normally. The user can still zoom
            with ctrl+wheel or pinch, and pan by dragging the canvas.
          */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              position: "relative",
              // The inner div below sets a minimum content size so the scrollbar appears
            }}
          >
            {/* Minimum-size inner shell so scrollbars appear when content overflows */}
            <div style={{ minWidth: canvasContentWidth, minHeight: canvasContentHeight, position: "relative", height: "100%" }}>
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeClick={onEdgeClick}
                onNodeDragStop={onNodeDragStop}
                onNodeClick={onNodeClick}
                nodeTypes={RF_NODE_TYPES}
                fitView
                // ── Disable zoom/pan on scroll so wheel events scroll the page ──
                zoomOnScroll={false}
                zoomOnPinch={true}
                panOnScroll={false}
                panOnDrag={true}
                // Ctrl+wheel still zooms
                zoomOnDoubleClick={false}
                defaultEdgeOptions={{
                  type: "smoothstep",
                  markerEnd: { type: MarkerType.ArrowClosed, color: "var(--t-edgeColor)" },
                  style: { stroke: "var(--t-edgeColor)", strokeWidth: 1.6 },
                }}
                connectionLineStyle={{ stroke: T.accent, strokeWidth: 2 }}
                connectionLineType="smoothstep"
                deleteKeyCode={null}
                proOptions={{ hideAttribution: true }}
                style={{ background: T.pageBg, width: "100%", height: "100%" }}
              >
                <Background color="var(--t-border)" gap={28} size={1} />

                <Panel position="top-left" style={{ marginTop: 16, marginLeft: 16 }}>
                  <div style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 4, boxShadow: "var(--t-shadowSoft)" }}>
                    <button title="Zoom in" style={iconBtn()} onClick={() => zoomIn({ duration: 200 })}>+</button>
                    <button title="Zoom out" style={iconBtn()} onClick={() => zoomOut({ duration: 200 })}>−</button>
                  </div>
                </Panel>

                <MiniMap
                  position="top-right"
                  pannable
                  zoomable
                  nodeColor={(n) => n.type === "threadNode" ? "var(--t-edgeColor)" : "transparent"}
                  maskColor="rgba(59,130,246,0.06)"
                  style={{
                    background: T.cardBg,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    width: 180, height: 110,
                    boxShadow: "var(--t-shadowSoft)",
                    margin: 16,
                  }}
                />
              </ReactFlow>
            </div>
          </div>

          {selectedNode && (
            <NodePanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onEdit={n => setEditModal({ open: true, node: n })}
              onFiles={n => setFileModal({ open: true, node: n })}
              onRefresh={loadGraph}
              onDelete={handlers.onDelete}
              showConfirm={setConfirm}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      <NodeFormModal
        open={addNodeModal.open}
        onClose={() => setAddNodeModal({ open: false, stageId: null })}
        onSubmit={handleCreateNode}
        initial={null}
        title={`+ Add node — ${stages.find(s => s.id === addNodeModal.stageId)?.name || "stage"}`}
      />
      <NodeFormModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, node: null })}
        onSubmit={handleEdit}
        initial={editModal.node}
        title="Node Detail"
      />
      <FileModal
        open={fileModal.open}
        onClose={() => setFileModal({ open: false, node: null })}
        node={fileModal.node}
        onChange={loadGraph}
        showToast={showToast}
      />

      <Modal open={addStageModal} onClose={() => setAddStageModal(false)} title="Add stage">
        <Fld label="Stage name">
          <Inp value={stageNameInput} onChange={e => setStageNameInput(e.target.value)} placeholder={`Stage ${stages.length + 1}`} autoFocus />
        </Fld>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="ghost" onClick={() => setAddStageModal(false)}>Cancel</Btn>
          <Btn onClick={handleAddStage}>Add stage</Btn>
        </div>
      </Modal>

      {edgeEditModal.open && edgeEditModal.edge && (() => {
        const edge = edgeEditModal.edge;
        const depId = edge.data?.depId;
        const initialType = edge.data?.type || "DEPENDS_ON";
        return (
          <Modal open={true} onClose={() => setEdgeEditModal({ open: false, edge: null })} title="Edit Connection" width={400}>
            <Fld label="Relationship Type">
              <select defaultValue={initialType} id="_edge_type_select"
                style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: ff, color: T.text, background: "var(--t-inputBg)" }}>
                {DEPENDENCY_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </Fld>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <Btn variant="danger" onClick={() => handleRemoveDependency(depId)} small>Remove connection</Btn>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost" onClick={() => setEdgeEditModal({ open: false, edge: null })}>Cancel</Btn>
                <Btn onClick={() => handleUpdateDependency(depId, document.getElementById("_edge_type_select").value)}>Save</Btn>
              </div>
            </div>
          </Modal>
        );
      })()}

      <ConfirmModal open={confirm.open} onClose={() => setConfirm(p => ({ ...p, open: false }))} onConfirm={confirm.onConfirm} title={confirm.title} message={confirm.message} confirmText={confirm.confirmText} variant={confirm.variant} />
      <PromptModal open={prompt.open} onClose={() => setPrompt(p => ({ ...p, open: false }))} onSubmit={prompt.onSubmit} title={prompt.title} label={prompt.label} initialValue={prompt.initialValue} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} isDark={isDark} />
    </div>
  );
}

function iconBtn(active = false) {
  return {
    width: 28, height: 28, borderRadius: 6,
    background: active ? T.accentSoft : "transparent",
    color: active ? T.accent : T.textMuted,
    border: "none", cursor: "pointer", fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: ff,
  };
}

// ── Thread Canvas wrapper ──────────────────────────────────────────────────────
function ThreadCanvas({ thread, onBack, showToast }) {
  return (
    <ReactFlowProvider>
      <CanvasInner thread={thread} onBack={onBack} showToast={showToast} />
    </ReactFlowProvider>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function ThreadVisualizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDark = useThemeSync();
  const [toast, setToast] = useState({ visible: false, message: "", type: "success", animateOut: false });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type, animateOut: false });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, animateOut: true }));
      setTimeout(() => {
        setToast({ visible: false, message: "", type: "success", animateOut: false });
      }, 350);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  useEffect(() => {
    setLoading(true);
    getThreads().then((data) => {
      const found = (data || []).find(t => String(t.id) === String(id));
      setActiveThread(found || null);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="theme-wrapper flex items-center justify-center" style={{ height: "100vh", background: "var(--t-pageBg)", color: "var(--t-text)" }}>
      <ThemeStyles isDark={isDark} />
      <div className="text-sm font-medium">Loading thread...</div>
    </div>
  );

  if (!activeThread) return (
    <div className="theme-wrapper flex flex-col items-center justify-center gap-4" style={{ height: "100vh", background: "var(--t-pageBg)", color: "var(--t-text)" }}>
      <ThemeStyles isDark={isDark} />
      <div className="text-lg font-bold">Thread not found</div>
      <button onClick={() => navigate("/threads")} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
        Go Back
      </button>
    </div>
  );

  return (
    <div className="theme-wrapper" style={{ height: "100%" }}>
      <ThemeStyles isDark={isDark} />
      <TopToast toast={toast} isDark={isDark} />
      <ThreadCanvas thread={activeThread} onBack={() => navigate("/threads")} showToast={showToast} />
    </div>
  );
}