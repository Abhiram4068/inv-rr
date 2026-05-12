import { useState, useEffect, useCallback, useRef } from "react";
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

// ── API layer ──────────────────────────────────────────────────────────────────
const BASE = "/api";

function authHeaders() {
  const t = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { headers: authHeaders(), ...opts });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.detail || "API error");
  return data;
}

const api = {
  getThreads: () => apiFetch(`${BASE}/threads/`),
  createThread: (body) => apiFetch(`${BASE}/threads/`, { method: "POST", body: JSON.stringify(body) }),
  deleteThread: (id) => apiFetch(`${BASE}/threads/${id}/`, { method: "DELETE" }),
  getGraph: (id) => apiFetch(`${BASE}/threads/${id}/graph/`),
  createNode: (threadId, body) => apiFetch(`${BASE}/threads/${threadId}/nodes/`, { method: "POST", body: JSON.stringify(body) }),
  updateNode: (id, body) => apiFetch(`${BASE}/nodes/${id}/`, { method: "PUT", body: JSON.stringify(body) }),
  deleteNode: (id) => apiFetch(`${BASE}/nodes/${id}/`, { method: "DELETE" }),
  updatePosition: (id, body) => apiFetch(`${BASE}/nodes/${id}/position/`, { method: "PATCH", body: JSON.stringify(body) }),
  addDependency: (src, tgt, type = "DEPENDS_ON") =>
    apiFetch(`${BASE}/nodes/${src}/dependencies/`, {
      method: "POST",
      body: JSON.stringify({ source_node: src, target_node: tgt, dependency_type: type }),
    }),
  removeDependency: (depId) => apiFetch(`${BASE}/dependencies/${depId}/`, { method: "DELETE" }),
  updateDependency: (depId, type) =>
    apiFetch(`${BASE}/dependencies/${depId}/`, {
      method: "PATCH",
      body: JSON.stringify({ dependency_type: type }),
    }),
  getFiles: (id) => apiFetch(`${BASE}/nodes/${id}/files/`),
  uploadFile: (id, fd) => {
    const t = localStorage.getItem("access") || localStorage.getItem("access_token") || localStorage.getItem("token");
    return fetch(`${BASE}/nodes/${id}/files/`, { method: "POST", headers: t ? { Authorization: `Bearer ${t}` } : {}, body: fd })
      .then(async r => { if (!r.ok) throw new Error("Upload failed"); return r.json(); });
  },
  deleteFile: (id) => apiFetch(`${BASE}/files/${id}/`, { method: "DELETE" }),
  getActivity: (id) => apiFetch(`${BASE}/nodes/${id}/activity/`),
};

// ── Design tokens (image-matching) ─────────────────────────────────────────────
const ff = "'Inter', 'DM Sans', system-ui, sans-serif";

const T = {
  // Surfaces
  sidebarBg: "#0B1020",
  sidebarBorder: "#1a2138",
  sidebarText: "#cbd5e1",
  sidebarTextMuted: "#7a8398",
  sidebarActiveBg: "#1a2240",
  sidebarActiveText: "#a78bfa",
  pageBg: "#f6f7fb",
  cardBg: "#ffffff",
  border: "#e6e8ee",
  borderSoft: "#eef0f5",
  text: "#0f172a",
  textMuted: "#64748b",
  textFaint: "#94a3b8",
  accent: "#7c5cff",
  accentSoft: "#efeaff",
  // Status colors per image legend
  statusCompleted: "#22c55e",
  statusInProgress: "#3b82f6",
  statusInReview: "#f59e0b",
  statusBlocked: "#ef4444",
  statusNotStarted: "#94a3b8",
};

// Map existing status keys to image legend
const STATUS_CFG = {
  INACTIVE:    { label: "Not Started", color: "#475569", bg: "#eef1f6", dot: T.statusNotStarted, top: T.statusNotStarted },
  ACTIVE:      { label: "Active", color: "#1d4ed8", bg: "#e7f0ff", dot: T.statusInProgress, top: T.statusInProgress },
  NEEDS_REVIEW:{ label: "In Review",   color: "#92400e", bg: "#fef4e2", dot: T.statusInReview,   top: T.statusInReview },
  OUTDATED:    { label: "Blocked",     color: "#b91c1c", bg: "#fde8e8", dot: T.statusBlocked,    top: T.statusBlocked },
  BLOCKED:     { label: "Blocked",     color: "#b91c1c", bg: "#fde8e8", dot: T.statusBlocked,    top: T.statusBlocked },
  ARCHIVED:    { label: "Completed",   color: "#15803d", bg: "#e6f7ec", dot: T.statusCompleted,  top: T.statusCompleted },
};

const SW = 240;
const SG = 80;
const NH = 96;
const NG = 18;
const PT = 24;

// ── Theme sync (preserved) ─────────────────────────────────────────────────────
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
      display: "inline-flex", alignItems: "center", gap: 6,
      background: c.bg, color: c.color, fontSize: 10.5, fontWeight: 600,
      padding: "3px 9px", borderRadius: 999, letterSpacing: "0.01em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
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
    primary: { background: T.accent, color: "#fff", boxShadow: "0 1px 2px rgba(124,92,255,.35)" },
    ghost:   { background: "#fff", border: `1px solid ${T.border}`, color: T.text },
    soft:    { background: "#f1f3f9", color: T.text },
    danger:  { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], ...ex }}>{children}</button>;
}

function Inp({ value, onChange, placeholder, multiline, autoFocus, style: ex }) {
  const s = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    border: `1px solid ${T.border}`, borderRadius: 8, outline: "none",
    fontFamily: ff, color: T.text, boxSizing: "border-box", background: "#fff", ...ex,
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 70px rgba(2,6,23,0.25)", border: `1px solid ${T.border}`, fontFamily: ff }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${T.borderSoft}` }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "#f1f3f9", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 16, color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
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

  const row = (icon, label, fn, danger) => (
    <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); fn(); setOpen(false); }}
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: danger ? "#b91c1c" : T.text, textAlign: "left", fontFamily: ff }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "#fef2f2" : "#f6f7fb"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}>
      <span>{icon}</span>{label}
    </button>
  );

  return (
    <div ref={ref} style={{ position: "absolute", top: 8, right: 8, zIndex: 20 }}>
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${T.border}`, borderRadius: 6, width: 22, height: 22, cursor: "pointer", fontSize: 13, color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
        ⋯
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: "0 8px 24px rgba(2,6,23,0.12)", minWidth: 150, overflow: "hidden", fontFamily: ff }} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          {row("✏️", "Edit", onEdit)}
          {row("📎", "Files", onFiles)}
          {onDelete && <><div style={{ borderTop: `1px solid ${T.borderSoft}`, margin: "3px 0" }} />{row("🗑", "Archive", onDelete, true)}</>}
        </div>
      )}
    </div>
  );
}

// ── Stage lane (background column header) ──────────────────────────────────────
function StageLane({ data }) {
  const { label, height, nodeCount } = data;
  return (
    <div style={{ width: SW, height, pointerEvents: "none", fontFamily: ff }}>
      {/* Subtle column stripe */}
      <div style={{ height: "100%", borderRadius: 14, background: "transparent" }} />
    </div>
  );
}

// ── Thread node card (image-style) ─────────────────────────────────────────────
function nodeIcon(node, isRoot) {
  const t = (node.title || "").toLowerCase();
  if (isRoot) return { emoji: "📋", bg: "#e6f7ec", color: "#15803d" };
  if (t.includes("design") && t.includes("system")) return { emoji: "🎨", bg: "#efeaff", color: T.accent };
  if (t.includes("design") || t.includes("ui") || t.includes("ux")) return { emoji: "🖼️", bg: "#efeaff", color: T.accent };
  if (t.includes("requirement") || t.includes("doc") || t.includes("analysis")) return { emoji: "📄", bg: "#e7f0ff", color: "#1d4ed8" };
  if (t.includes("frontend") || t.includes("backend") || t.includes("dev") || t.includes("code")) return { emoji: "💻", bg: "#e7f0ff", color: "#1d4ed8" };
  if (t.includes("test") || t.includes("qa")) return { emoji: "🧪", bg: "#fde8e8", color: "#b91c1c" };
  if (t.includes("deploy") || t.includes("launch")) return { emoji: "🚀", bg: "#e6f7ec", color: "#15803d" };
  if (t.includes("alt") || t.includes("concept")) return { emoji: "🧪", bg: "#fef4e2", color: "#92400e" };
  return { emoji: "🗂️", bg: "#eef1f6", color: T.textMuted };
}

function ThreadNode({ data, selected }) {
  const { node, isRoot, onEdit, onFiles, onDelete, indexLabel } = data;
  const sc = STATUS_CFG[node.status] || STATUS_CFG.ACTIVE;
  const ic = nodeIcon(node, isRoot);

  return (
    <div style={{
      width: SW - 24,
      minHeight: NH,
      background: "#fff",
      border: `1px solid ${selected ? T.accent : T.border}`,
      borderRadius: 14,
      paddingTop: 0,
      fontFamily: ff,
      position: "relative",
      boxSizing: "border-box",
      boxShadow: selected
        ? `0 0 0 3px ${T.accent}33, 0 8px 24px rgba(2,6,23,0.06)`
        : "0 1px 2px rgba(2,6,23,0.04), 0 6px 16px rgba(2,6,23,0.04)",
      overflow: "hidden",
      cursor: "default",
    }}>
      {/* Top color bar */}
      <div style={{ height: 4, background: sc.top, width: "100%" }} />

      {/* Status check pill (top-right corner circle like image) */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff", border: `1.5px solid ${sc.dot}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: sc.dot, fontWeight: 800, zIndex: 5,
      }}>
        ✓
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left}
        style={{ width: 10, height: 10, background: T.textFaint, border: "2px solid #fff", left: -6 }} />
      <Handle type="source" position={Position.Right}
        style={{ width: 10, height: 10, background: T.accent, border: "2px solid #fff", right: -6, cursor: "crosshair" }} />

      <div style={{ padding: "10px 12px 12px" }}>
        {/* Index number top-left */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textFaint, marginBottom: 6 }}>
          {indexLabel}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: ic.bg, color: ic.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>{ic.emoji}</div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: 12.5, color: T.text,
              lineHeight: 1.3, marginBottom: 3,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {node.title}
            </div>
            <div style={{ fontSize: 10.5, color: T.textFaint, fontWeight: 500 }}>
              {new Date(node.created_at || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Footer: avatars stub + status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div style={{ display: "flex" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: "50%",
                background: ["#fca5a5","#93c5fd","#fcd34d"][i],
                border: "2px solid #fff", marginLeft: i === 0 ? 0 : -6,
                fontSize: 9, fontWeight: 700, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{["A","S","R"][i]}</div>
            ))}
            {node.file_count > 0 && (
              <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 6, fontWeight: 600 }}>+{node.file_count}</span>
            )}
          </div>
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
  { value: "DEPENDS_ON", label: "Depends On" },
  { value: "REQUIRED_FOR", label: "Required For" },
  { value: "WAITING_FOR", label: "Waiting For" },
  { value: "RELATED", label: "Related" },
  { value: "NOT_SURE", label: "Not Sure" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
];

// ── File modal ─────────────────────────────────────────────────────────────────
function FileModal({ open, onClose, node }) {
  const [files, setFiles] = useState([]);
  const [staged, setStaged] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && node) api.getFiles(node.id).then(setFiles).catch(() => setFiles([]));
    setStaged([]);
  }, [open, node?.id]);

  const upload = async () => {
    setBusy(true);
    for (const f of staged) {
      const fd = new FormData(); fd.append("file", f);
      try { const r = await api.uploadFile(node.id, fd); setFiles(p => [r, ...p]); } catch { }
    }
    setStaged([]); setBusy(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Files — ${node?.title || ""}`} width={480}>
      <div style={{ border: `2px dashed ${T.border}`, borderRadius: 12, padding: 20, textAlign: "center", background: T.pageBg, marginBottom: 14, cursor: "pointer" }}
        onClick={() => document.getElementById("_fi_").click()}
        onDrop={e => { e.preventDefault(); setStaged(Array.from(e.dataTransfer.files)); }}
        onDragOver={e => e.preventDefault()}>
        <div style={{ fontSize: 13, color: T.textMuted }}>Drop files or <span style={{ color: T.accent, fontWeight: 600 }}>browse</span></div>
        <input id="_fi_" type="file" multiple style={{ display: "none" }} onChange={e => setStaged(Array.from(e.target.files))} />
      </div>
      {staged.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {staged.map((f, i) => <div key={i} style={{ fontSize: 12, padding: "6px 10px", background: T.accentSoft, borderRadius: 7, marginBottom: 4, color: T.accent }}>📄 {f.name}</div>)}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={upload} disabled={busy}>{busy ? "Uploading…" : `Upload ${staged.length} file(s)`}</Btn>
          </div>
        </div>
      )}
      {files.map(f => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: `1px solid ${T.borderSoft}`, borderRadius: 9, marginBottom: 6 }}>
          <span>📎</span>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
          {f.file_url && <a href={f.file_url} download style={{ fontSize: 12, color: T.accent }}>⬇</a>}
          <button onClick={() => api.deleteFile(f.id).then(() => setFiles(p => p.filter(x => x.id !== f.id)))} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 15 }}>×</button>
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
        <select value={form.status} onChange={set("status")} style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: ff, color: T.text, background: "#fff" }}>
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

// ── Right Detail Panel (image-style) ───────────────────────────────────────────
function NodePanel({ node, onClose, onEdit, onFiles }) {
  const [activity, setActivity] = useState([]);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("activity");

  useEffect(() => {
    if (!node) return;
    api.getActivity(node.id).then(setActivity).catch(() => setActivity([]));
    api.getFiles(node.id).then(setFiles).catch(() => setFiles([]));
  }, [node?.id]);

  if (!node) return null;
  const sc = STATUS_CFG[node.status] || STATUS_CFG.ACTIVE;
  const ic = nodeIcon(node, false);
  const EVT = { CREATED: "🌱", UPDATED: "✏️", FILE_UPLOADED: "📎", FILE_DELETED: "🗑", STATUS_CHANGED: "🔄", DEPENDENCY_ADDED: "🔗" };

  return (
    <div style={{ width: 320, background: "#fff", borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, fontFamily: ff }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0, flex: 1 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: ic.bg, color: ic.color,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
            }}>{ic.emoji}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.title}</div>
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
                {new Date(node.created_at || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f3f9", border: "none", borderRadius: 8, width: 26, height: 26, cursor: "pointer", fontSize: 14, color: T.textMuted, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <StatusPill status={node.status} />
        {node.description && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 10, lineHeight: 1.6 }}>{node.description}</div>}
      </div>

      {/* Tabs */}
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
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentSoft, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                {EVT[a.event_type] || "•"}
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
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${T.borderSoft}` }}>
              <span>📎</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
                <div style={{ fontSize: 10.5, color: T.textFaint }}>by {f.uploaded_by}</div>
              </div>
              {f.file_url && <a href={f.file_url} download style={{ fontSize: 11, color: T.accent }}>⬇</a>}
            </div>
          ))
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.borderSoft}`, display: "flex", gap: 8 }}>
        <Btn small variant="ghost" onClick={() => onEdit(node)} style={{ flex: 1 }}>✏️ Edit</Btn>
        <Btn small variant="ghost" onClick={() => onFiles(node)} style={{ flex: 1 }}>📎 Files</Btn>
      </div>
    </div>
  );
}

// ── Build RF graph ─────────────────────────────────────────────────────────────
function buildGraph(apiNodes, apiEdges, stageLabels, thread, handlers) {
  const stageMap = {};
  apiNodes.forEach(n => {
    const s = n.stage || 0;
    if (!stageMap[s]) stageMap[s] = [];
    stageMap[s].push(n);
  });

  const numStages = stageLabels.length;
  const laneHeights = {};
  for (let i = 0; i < numStages; i++) {
    const cnt = (stageMap[i] || []).length;
    laneHeights[i] = Math.max(cnt, 1) * (NH + NG) + PT + 28;
  }

  const rfNodes = [];

  for (let i = 0; i < numStages; i++) {
    rfNodes.push({
      id: `lane-${i}`,
      type: "stageLane",
      position: { x: i * (SW + SG), y: 0 },
      data: {
        label: stageLabels[i] || (i === 0 ? thread.title : `Stage ${i}`),
        isRoot: i === 0,
        nodeCount: (stageMap[i] || []).length,
        height: laneHeights[i],
      },
      draggable: false,
      selectable: false,
      zIndex: 0,
    });
  }

  let counter = 0;
  apiNodes.forEach(n => {
    const stage = n.stage || 0;
    const sorted = (stageMap[stage] || []).sort((a, b) => (a.row || 0) - (b.row || 0));
    const rowIdx = sorted.findIndex(x => x.id === n.id);
    counter++;
    rfNodes.push({
      id: String(n.id),
      type: "threadNode",
      position: {
        x: stage * (SW + SG) + 12,
        y: PT + rowIdx * (NH + NG),
      },
      data: {
        node: n,
        isRoot: stage === 0 && rowIdx === 0,
        indexLabel: counter,
        ...handlers,
      },
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
    labelBgStyle: { fill: "#fff", fillOpacity: 0.95, stroke: T.border, strokeWidth: 1 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" },
    style: { stroke: "#cbd5e1", strokeWidth: 1.6 },
    data: { depId: e.id, type: e.dependency_type || "DEPENDS_ON", sourceTitle: e.source_node_title, targetTitle: e.target_node_title },
  }));

  return { rfNodes, rfEdges };
}



// ── Top bar (image-style) ──────────────────────────────────────────────────────
function TopBar({ thread, onBack, view, setView }) {
  return (
    <div style={{
      height: 60, background: "#fff",
      borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 22px", flexShrink: 0, zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: T.textMuted, fontWeight: 600, fontFamily: ff, display: "flex", alignItems: "center", gap: 4 }}>
          ‹ Threads
        </button>
        <span style={{ color: T.textFaint }}>›</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{thread.title}</span>
        <span style={{ color: T.textFaint, marginLeft: 4, cursor: "pointer" }}>☆</span>
      </div>

      {/* View tabs centered */}
      <div style={{ display: "flex", background: "#f1f3f9", borderRadius: 10, padding: 3 }}>
        {["Graph View", "Timeline View", "List View"].map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{
              padding: "7px 14px", fontSize: 12.5, fontWeight: 600,
              background: view === v ? "#fff" : "transparent",
              color: view === v ? T.accent : T.textMuted,
              border: "none", borderRadius: 8, cursor: "pointer", fontFamily: ff,
              boxShadow: view === v ? "0 1px 3px rgba(2,6,23,0.08)" : "none",
            }}>{v}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        <Btn>+ Invite</Btn>
        <button style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, color: T.textMuted }}>🔔</button>
        <button style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, color: T.textMuted }}>⋮</button>
      </div>
    </div>
  );
}

// ── Status legend bar ──────────────────────────────────────────────────────────
function LegendBar() {
  const items = [
    { c: T.statusCompleted, l: "Completed" },
    { c: T.statusInProgress, l: "In Progress" },
    { c: T.statusInReview, l: "In Review" },
    { c: T.statusBlocked, l: "Blocked" },
    { c: T.statusNotStarted, l: "Not Started" },
  ];
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center", background: "#fff", border: `1px solid ${T.border}`, padding: "8px 14px", borderRadius: 999, boxShadow: "0 1px 3px rgba(2,6,23,0.04)" }}>
      {items.map(it => (
        <div key={it.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.text, fontWeight: 600, fontFamily: ff }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: it.c }} />
          {it.l}
        </div>
      ))}
    </div>
  );
}

// ── Canvas inner ───────────────────────────────────────────────────────────────
function CanvasInner({ thread, onBack }) {
  const isDark = useThemeSync();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [stageLabels, setStageLabels] = useState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [view, setView] = useState("Graph View");

  const [addNodeModal, setAddNodeModal] = useState({ open: false, stageIndex: null });
  const [editModal, setEditModal] = useState({ open: false, node: null });
  const [fileModal, setFileModal] = useState({ open: false, node: null });
  const [addStageModal, setAddStageModal] = useState(false);
  const [stageNameInput, setStageNameInput] = useState("");
  const [edgeEditModal, setEdgeEditModal] = useState({ open: false, edge: null });

  const { fitView } = useReactFlow();

  const handlers = {
    onEdit: (node) => setEditModal({ open: true, node }),
    onFiles: (node) => setFileModal({ open: true, node }),
    onDelete: (node) => handleDelete(node),
  };

  const applyGraph = useCallback((nodes, edges, labels) => {
    const { rfNodes: rn, rfEdges: re } = buildGraph(nodes, edges, labels, thread, handlers);
    setRfNodes(rn);
    setRfEdges(re);
    setTimeout(() => fitView({ padding: 0.18, duration: 350 }), 80);
  }, [thread, fitView]);

  const loadGraph = useCallback(() => {
    api.getGraph(thread.id).then(data => {
      const nodes = data?.nodes || [];
      const edges = data?.edges || [];
      setRawNodes(nodes);
      setRawEdges(edges);
      const maxS = nodes.length ? Math.max(...nodes.map(n => n.stage || 0)) : 0;
      const labels = Array.from({ length: maxS + 1 }, (_, i) => i === 0 ? thread.title : `Stage ${i}`);
      setStageLabels(labels);
      applyGraph(nodes, edges, labels);
      setSelectedNode(prev => prev ? nodes.find(n => n.id === prev.id) || null : null);
    }).catch(console.error);
  }, [thread.id, thread.title, applyGraph]);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  const onConnect = useCallback(async (params) => {
    const src = parseInt(params.source);
    const tgt = parseInt(params.target);
    if (src === tgt || isNaN(src) || isNaN(tgt)) return;
    try {
      await api.addDependency(src, tgt, "DEPENDS_ON");
      loadGraph();
    } catch (e) { alert(e.message); }
  }, [loadGraph]);

  const onEdgeClick = useCallback((evt, edge) => {
    evt.stopPropagation();
    setEdgeEditModal({ open: true, edge });
  }, []);

  const handleUpdateDependency = async (depId, type) => {
    try { await api.updateDependency(depId, type); loadGraph(); }
    catch (e) { alert(e.message); }
    finally { setEdgeEditModal({ open: false, edge: null }); }
  };

  const handleRemoveDependency = async (depId) => {
    if (!window.confirm("Remove this connection?")) return;
    try { await api.removeDependency(depId); loadGraph(); }
    catch (e) { alert(e.message); }
    finally { setEdgeEditModal({ open: false, edge: null }); }
  };

  const onNodeDragStop = useCallback(async (evt, rfNode) => {
    if (rfNode.type !== "threadNode") return;
    const nodeId = parseInt(rfNode.id);
    const stage = Math.max(0, Math.round(rfNode.position.x / (SW + SG)));
    const row = Math.max(0, Math.round((rfNode.position.y - PT) / (NH + NG)));
    try { await api.updatePosition(nodeId, { stage, row }); loadGraph(); }
    catch { loadGraph(); }
  }, [loadGraph]);

  const onNodeClick = useCallback((evt, rfNode) => {
    if (rfNode.type !== "threadNode") return;
    const n = rawNodes.find(x => String(x.id) === rfNode.id);
    setSelectedNode(prev => prev?.id === n?.id ? null : n || null);
  }, [rawNodes]);

  const handleCreateNode = async (form) => {
    const { stageIndex } = addNodeModal;
    const inStage = rawNodes.filter(n => (n.stage || 0) === stageIndex);
    const row = inStage.length ? Math.max(...inStage.map(n => n.row || 0)) + 1 : 0;
    try { await api.createNode(thread.id, { ...form, stage: stageIndex, row }); }
    catch (e) { alert(e.message); }
    finally { setAddNodeModal({ open: false, stageIndex: null }); loadGraph(); }
  };

  const handleEdit = async (form) => {
    try { await api.updateNode(editModal.node.id, form); }
    catch (e) { alert(e.message); }
    finally { setEditModal({ open: false, node: null }); loadGraph(); }
  };

  const handleDelete = async (node) => {
    if (!window.confirm("Archive this node?")) return;
    try { await api.deleteNode(node.id); }
    catch (e) { alert(e.message); }
    finally { setSelectedNode(null); loadGraph(); }
  };

  const handleAddStage = () => {
    const label = stageNameInput.trim() || `Stage ${stageLabels.length}`;
    const newLabels = [...stageLabels, label];
    setStageLabels(newLabels);
    applyGraph(rawNodes, rawEdges, newLabels);
    setStageNameInput("");
    setAddStageModal(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.pageBg, fontFamily: ff }}>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar thread={thread} onBack={onBack} view={view} setView={setView} />

        {/* Sub-header: title + active pill */}
        <div style={{ background: "#fff", padding: "16px 24px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text }}>{thread.title}</h1>
            <span style={{ background: T.accentSoft, color: T.accent, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>Active</span>
          </div>
          <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 4 }}>Main thread for the {thread.title.toLowerCase()} project</div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
          {/* Canvas */}
          <div style={{ flex: 1, position: "relative" }}>
            {/* Floating legend */}
            <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 5 }}>
              <LegendBar />
            </div>

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
              defaultEdgeOptions={{ type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" }, style: { stroke: "#cbd5e1", strokeWidth: 1.6 } }}
              connectionLineStyle={{ stroke: T.accent, strokeWidth: 2 }}
              connectionLineType="smoothstep"
              deleteKeyCode={null}
              proOptions={{ hideAttribution: true }}
              style={{ background: T.pageBg }}
            >
              <Background color="#dde1ea" gap={28} size={1.2} />

              {/* Custom controls (top-left) */}
              <Panel position="top-left" style={{ marginTop: 70, marginLeft: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 1px 3px rgba(2,6,23,0.05)" }}>
                    <button title="Select" style={iconBtn(true)}>↖</button>
                  </div>
                  <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 1px 3px rgba(2,6,23,0.05)" }}>
                    <button title="Layout" style={iconBtn()}>▦</button>
                  </div>
                  <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 1px 3px rgba(2,6,23,0.05)" }}>
                    <button title="Zoom in" style={iconBtn()}>+</button>
                    <button title="Zoom out" style={iconBtn()}>−</button>
                    <button title="Fit" style={iconBtn()}>⛶</button>
                    <button title="Lock" style={iconBtn()}>🔒</button>
                  </div>
                </div>
              </Panel>

              {/* Stage / add buttons */}
              <Panel position="top-right" style={{ marginTop: 70, marginRight: 16, display: "flex", flexWrap: "wrap", gap: 7, maxWidth: 360, justifyContent: "flex-end" }}>
                {stageLabels.map((label, i) => (
                  <button key={i} onClick={() => setAddNodeModal({ open: true, stageIndex: i })}
                    style={{
                      background: i === 0 ? T.accent : "#fff",
                      color: i === 0 ? "#fff" : T.text,
                      border: `1px solid ${i === 0 ? T.accent : T.border}`,
                      borderRadius: 8, padding: "6px 12px",
                      fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: ff,
                      boxShadow: "0 1px 2px rgba(2,6,23,0.04)",
                    }}>
                    + {i === 0 ? thread.title : label}
                  </button>
                ))}
                <button onClick={() => setAddStageModal(true)}
                  style={{ background: "transparent", color: T.textMuted, border: `1px dashed ${T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>
                  + Add stage
                </button>
              </Panel>

              {/* Mini map (bottom-left like image) */}
              <MiniMap
                pannable
                zoomable
                nodeColor={(n) => n.type === "threadNode" ? "#cbd5e1" : "transparent"}
                maskColor="rgba(124,92,255,0.06)"
                style={{
                  background: "#fff",
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  bottom: 16, left: 16,
                  width: 180, height: 110,
                  boxShadow: "0 4px 12px rgba(2,6,23,0.06)",
                }}
              />
            </ReactFlow>
          </div>

          {/* Detail panel */}
          {selectedNode && (
            <NodePanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onEdit={n => setEditModal({ open: true, node: n })}
              onFiles={n => setFileModal({ open: true, node: n })}
            />
          )}
        </div>
      </div>

      <NodeFormModal
        open={addNodeModal.open}
        onClose={() => setAddNodeModal({ open: false, stageIndex: null })}
        onSubmit={handleCreateNode}
        initial={null}
        title={`+ Add node — ${stageLabels[addNodeModal.stageIndex] || "stage"}`}
      />

      <NodeFormModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, node: null })}
        onSubmit={handleEdit}
        initial={editModal.node}
        title="Edit node"
      />

      <FileModal open={fileModal.open} onClose={() => setFileModal({ open: false, node: null })} node={fileModal.node} />

      <Modal open={addStageModal} onClose={() => setAddStageModal(false)} title="Add stage">
        <Fld label="Stage name">
          <Inp value={stageNameInput} onChange={e => setStageNameInput(e.target.value)} placeholder={`Stage ${stageLabels.length}`} autoFocus />
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
              <select
                defaultValue={initialType}
                id="_edge_type_select"
                style={{ width: "100%", padding: "10px 12px", fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: ff, color: T.text, background: "#fff" }}
              >
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
function ThreadCanvas({ thread, onBack }) {
  return (
    <ReactFlowProvider>
      <CanvasInner thread={thread} onBack={onBack} />
    </ReactFlowProvider>
  );
}

// ── Threads list view ──────────────────────────────────────────────────────────
function ThreadsView({ onOpen }) {
  const [threads, setThreads] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = () => { setLoading(true); api.getThreads().then(setThreads).catch(e => setErr(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try { await api.createThread(form); load(); setCreating(false); setForm({ title: "", description: "" }); }
    catch (e) { alert(e.message); }
  };

  const handleDel = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this thread?")) return;
    await api.deleteThread(id).catch(() => { }); load();
  };

  const ACCENTS = [T.statusInProgress, T.statusCompleted, T.statusInReview, T.accent, T.statusBlocked];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.pageBg, fontFamily: ff }}>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 60, background: "#fff", borderBottom: `1px solid ${T.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Threads</span>
            {!loading && <span style={{ fontSize: 11, color: T.textMuted, background: "#f1f3f9", padding: "3px 9px", borderRadius: 999, fontWeight: 700 }}>{threads.length}</span>}
          </div>
          <Btn onClick={() => setCreating(true)}>+ New thread</Btn>
        </div>

        <div style={{ padding: 26, flex: 1 }}>
          {loading && <div style={{ color: T.textMuted, fontSize: 13 }}>Loading…</div>}
          {err && <div style={{ color: "#dc2626", fontSize: 13 }}>Error: {err}</div>}
          {!loading && threads.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 100 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🕸</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No threads yet</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Create your first project thread to get started</div>
              <Btn onClick={() => setCreating(true)}>+ New thread</Btn>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {threads.map((t, i) => {
              const acc = ACCENTS[i % ACCENTS.length];
              return (
                <div key={t.id} onClick={() => onOpen(t)}
                  style={{
                    background: "#fff", borderRadius: 14, border: `1px solid ${T.border}`,
                    padding: 18, cursor: "pointer", borderTop: `3px solid ${acc}`,
                    transition: "all 0.15s",
                    boxShadow: "0 1px 3px rgba(2,6,23,0.04)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(2,6,23,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(2,6,23,0.04)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: acc + "22", color: acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧵</div>
                    <button onClick={e => handleDel(e, t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.textFaint, padding: 2 }}>🗑</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginTop: 12, marginBottom: 4 }}>{t.title}</div>
                  {t.description && <div style={{ fontSize: 12.5, color: T.textMuted, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.description}</div>}
                  <div style={{ marginTop: 12, fontSize: 10.5, color: T.textFaint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Modal open={creating} onClose={() => setCreating(false)} title="New thread">
          <Fld label="Project name"><Inp value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mobile App Launch" autoFocus /></Fld>
          <Fld label="Description"><Inp value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" multiline /></Fld>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.title.trim()}>Create thread</Btn>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeThread, setActiveThread] = useState(null);
  return activeThread
    ? <ThreadCanvas thread={activeThread} onBack={() => setActiveThread(null)} />
    : <ThreadsView onOpen={setActiveThread} />;
}
