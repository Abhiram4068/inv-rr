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

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  INACTIVE: { label: "Inactive", color: "#4b5563", bg: "#f3f4f6", dot: "#9ca3af" },
  ACTIVE: { label: "Active", color: "#0f6e56", bg: "#e1f5ee", dot: "#1d9e75" },
  NEEDS_REVIEW: { label: "Needs review", color: "#854f0b", bg: "#faeeda", dot: "#ef9f27" },
  OUTDATED: { label: "Outdated", color: "#a32d2d", bg: "#fcebeb", dot: "#e24b4a" },
  BLOCKED: { label: "Blocked", color: "#3c3489", bg: "#eeedfe", dot: "#7f77dd" },
  ARCHIVED: { label: "Archived", color: "#5f5e5a", bg: "#f1efe8", dot: "#888780" },
};

const SW = 240;   // stage column width
const SG = 80;    // gap between stages
const NH = 88;    // node card height
const NG = 16;    // gap between nodes
const PT = 52;    // padding-top inside lane (below header)

// ── Shared UI primitives ───────────────────────────────────────────────────────
const ff = "'DM Sans', system-ui, sans-serif";

function useThemeSync() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem("theme") || "dark");
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem("theme") || "dark";
      setTheme(prev => (prev !== current ? current : prev));
    }, 100);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return theme === "dark";
}

function StatusPill({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.ACTIVE;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: c.bg, color: c.color, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.02em" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, style: ex, isDark = false }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 5, padding: small ? "5px 11px" : "8px 16px", fontSize: small ? 11 : 13, fontWeight: 600, border: "none", borderRadius: 7, cursor: disabled ? "default" : "pointer", fontFamily: ff, opacity: disabled ? 0.5 : 1 };
  const v = {
    primary: { background: "#185fa5", color: "#fff" },
    ghost: isDark
      ? { background: "transparent", border: "1.5px solid #374151", color: "#e5e7eb" }
      : { background: "transparent", border: "1.5px solid #d1d5db", color: "#4b5563" },
    danger: isDark
      ? { background: "#2b1111", color: "#fca5a5", border: "1.5px solid #7f1d1d" }
      : { background: "#fef2f2", color: "#b91c1c", border: "1.5px solid #fecaca" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], ...ex }}>{children}</button>;
}

function Inp({ value, onChange, placeholder, multiline, autoFocus, style: ex, isDark = false }) {
  const s = { width: "100%", padding: "8px 10px", fontSize: 13, border: `1.5px solid ${isDark ? "#374151" : "#d1d5db"}`, borderRadius: 7, outline: "none", fontFamily: ff, color: isDark ? "#f9fafb" : "#111827", boxSizing: "border-box", background: isDark ? "#111827" : "#fff", ...ex };
  return multiline
    ? <textarea style={{ ...s, minHeight: 70, resize: "vertical" }} value={value} onChange={onChange} placeholder={placeholder} />
    : <input style={s} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} />;
}

function Fld({ label, children, isDark = false }) {
  return <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, fontWeight: 600, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>{children}</div>;
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 420, isDark = false }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.48)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ background: isDark ? "#111827" : "#fff", borderRadius: 14, width, maxWidth: "94vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: `1px solid ${isDark ? "#1f2937" : "#f3f4f6"}`, fontFamily: ff }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${isDark ? "#1f2937" : "#f3f4f6"}` }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? "#f9fafb" : "#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background: isDark ? "#1f2937" : "#f3f4f6", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 15, color: isDark ? "#d1d5db" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "18px" }}>{children}</div>
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
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: danger ? "#b91c1c" : "#111827", textAlign: "left", fontFamily: ff }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "#fef2f2" : "#f9fafb"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}>
      <span>{icon}</span>{label}
    </button>
  );

  return (
    <div ref={ref} style={{ position: "absolute", top: 6, right: 6, zIndex: 20 }}>
      <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        style={{ background: "rgba(255,255,255,0.85)", border: "1px solid #e5e7eb", borderRadius: 5, width: 22, height: 22, cursor: "pointer", fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ⋯
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 3px)", background: "#fff", borderRadius: 9, border: "1px solid #e5e7eb", boxShadow: "0 6px 20px rgba(0,0,0,0.1)", minWidth: 146, overflow: "hidden", fontFamily: ff }} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          {row("✏️", "Edit", onEdit)}
          {row("📎", "Files", onFiles)}
          {onDelete && <><div style={{ borderTop: "1px solid #f3f4f6", margin: "3px 0" }} />{row("🗑", "Archive", onDelete, true)}</>}
        </div>
      )}
    </div>
  );
}

// ── React Flow node type: stage lane (background) ──────────────────────────────
function StageLane({ data }) {
  const { label, isRoot, height, nodeCount } = data;
  return (
    <div style={{ width: SW, height,   pointerEvents: "none", fontFamily: ff, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", background: isRoot ? "#185fa5" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: isRoot ? "#fff" : "#475569", textTransform: "uppercase", letterSpacing: "0.08em", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "80%" }}>
          {label}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: isRoot ? "#bfdbfe" : "#94a3b8", background: isRoot ? "rgba(255,255,255,0.18)" : "#e2e8f0", padding: "1px 6px", borderRadius: 8, flexShrink: 0 }}>
          {nodeCount}
        </span>
      </div>
    </div>
  );
}

// ── React Flow node type: thread node card ────────────────────────────────────
function ThreadNode({ data, selected }) {
  const { node, isRoot, onEdit, onFiles, onDelete } = data;
  const sc = STATUS_CFG[node.status] || STATUS_CFG.ACTIVE;

  return (
    <div style={{
      width: SW - 24,
      minHeight: NH,
      background: isRoot ? "#dbeafe" : selected ? "#eff6ff" : "#fff",
      border: isRoot ? "2px solid #185fa5" : selected ? "1.5px solid #3b82f6" : `1.5px solid ${sc.dot}55`,
      borderLeft: `3px solid ${sc.dot}`,
      borderRadius: 9,
      padding: "10px 12px",
      fontFamily: ff,
      position: "relative",
      boxSizing: "border-box",
      boxShadow: selected ? "0 0 0 3px #3b82f622" : "0 1px 3px rgba(0,0,0,0.07)",
      cursor: "default",
    }}>
      {/* Handles — source RIGHT, target LEFT */}
      <Handle type="target" position={Position.Left}
        style={{ width: 10, height: 10, background: "#6b7280", border: "2px solid #fff", left: -6, cursor: "default" }} />
      <Handle type="source" position={Position.Right}
        style={{ width: 10, height: 10, background: "#2563eb", border: "2px solid #fff", right: -6, cursor: "crosshair" }} />

      <Dots
        onEdit={() => onEdit(node)}
        onFiles={() => onFiles(node)}
        onDelete={isRoot ? undefined : () => onDelete(node)}
      />

      <div style={{ paddingRight: 22 }}>
        <div style={{ fontWeight: 700, fontSize: isRoot ? 12 : 11, color: "#111827", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
          {node.title}
        </div>
        {node.description && (
          <div style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 5 }}>
            {node.description}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
          <StatusPill status={node.status} />
          {node.file_count > 0 && <span style={{ fontSize: 10, color: "#6b7280" }}>📎 {node.file_count}</span>}
        </div>
      </div>
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
function FileModal({ open, onClose, node, isDark = false }) {
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
    <Modal open={open} onClose={onClose} title={`Files — ${node?.title || ""}`} width={460} isDark={isDark}>
      <div style={{ border: "2px dashed #d1d5db", borderRadius: 9, padding: "16px", textAlign: "center", background: "#f9fafb", marginBottom: 12, cursor: "pointer" }}
        onClick={() => document.getElementById("_fi_").click()}
        onDrop={e => { e.preventDefault(); setStaged(Array.from(e.dataTransfer.files)); }}
        onDragOver={e => e.preventDefault()}>
        <div style={{ fontSize: 13, color: "#4b5563" }}>Drop files or <span style={{ color: "#185fa5", fontWeight: 600 }}>browse</span></div>
        <input id="_fi_" type="file" multiple style={{ display: "none" }} onChange={e => setStaged(Array.from(e.target.files))} />
      </div>
      {staged.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {staged.map((f, i) => <div key={i} style={{ fontSize: 12, padding: "4px 8px", background: "#eff6ff", borderRadius: 5, marginBottom: 4, color: "#1d4ed8" }}>📄 {f.name}</div>)}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <Btn onClick={upload} disabled={busy}>{busy ? "Uploading…" : `Upload ${staged.length} file(s)`}</Btn>
          </div>
        </div>
      )}
      {files.map(f => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", border: "1px solid #f3f4f6", borderRadius: 7, marginBottom: 5 }}>
          <span>📎</span>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
          {f.file_url && <a href={f.file_url} download style={{ fontSize: 12, color: "#185fa5" }}>⬇</a>}
          <button onClick={() => api.deleteFile(f.id).then(() => setFiles(p => p.filter(x => x.id !== f.id)))} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 15 }}>×</button>
        </div>
      ))}
      {!files.length && !staged.length && <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", paddingTop: 4 }}>No files yet</div>}
    </Modal>
  );
}

// ── Node form modal ────────────────────────────────────────────────────────────
function NodeFormModal({ open, onClose, onSubmit, initial, title, isDark = false }) {
  const [form, setForm] = useState({ title: "", description: "", status: "INACTIVE" });
  useEffect(() => { setForm({ title: "", description: "", status: "INACTIVE", ...(initial || {}) }); }, [open]);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal open={open} onClose={onClose} title={title} isDark={isDark}>
      <Fld label="Title" isDark={isDark}><Inp value={form.title} onChange={set("title")} placeholder="Node name" autoFocus isDark={isDark} /></Fld>
      <Fld label="Description" isDark={isDark}><Inp value={form.description} onChange={set("description")} placeholder="What happens here?" multiline isDark={isDark} /></Fld>
      <Fld label="Status" isDark={isDark}>
        <select value={form.status} onChange={set("status")} style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1.5px solid ${isDark ? "#374151" : "#d1d5db"}`, borderRadius: 7, fontFamily: ff, color: isDark ? "#f9fafb" : "#111827", background: isDark ? "#111827" : "#fff" }}>
          {Object.entries(STATUS_CFG)
            .filter(([k]) => !["INACTIVE", "BLOCKED"].includes(k))
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
        </select>
      </Fld>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn variant="ghost" onClick={onClose} isDark={isDark}>Cancel</Btn>
        <Btn onClick={() => form.title.trim() && onSubmit(form)} disabled={!form.title.trim()} isDark={isDark}>{initial ? "Save" : "Create node"}</Btn>
      </div>
    </Modal>
  );
}

// ── Node detail panel ──────────────────────────────────────────────────────────
function NodePanel({ node, onClose, onEdit, onFiles, isDark = false }) {
  const [activity, setActivity] = useState([]);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("activity");

  useEffect(() => {
    if (!node) return;
    api.getActivity(node.id).then(setActivity).catch(() => setActivity([]));
    api.getFiles(node.id).then(setFiles).catch(() => setFiles([]));
  }, [node?.id]);

  if (!node) return null;
  const EVT = { CREATED: "🌱", UPDATED: "✏️", FILE_UPLOADED: "📎", FILE_DELETED: "🗑", STATUS_CHANGED: "🔄", DEPENDENCY_ADDED: "🔗" };

  return (
    <div style={{ width: 276, background: "#fff", borderLeft: "1px solid #f3f4f6", display: "flex", flexDirection: "column", flexShrink: 0, fontFamily: ff }}>
      <div style={{ padding: "14px 15px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.title}</div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontSize: 14, color: "#6b7280", flexShrink: 0, marginLeft: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <StatusPill status={node.status} />
        {node.description && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{node.description}</div>}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <Btn small variant="ghost" onClick={() => onEdit(node)}>✏️ Edit</Btn>
          <Btn small variant="ghost" onClick={() => onFiles(node)}>📎 Files</Btn>
        </div>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6" }}>
        {[["activity", "Activity"], ["files", `Files (${files.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 600, border: "none", background: "none", cursor: "pointer", color: tab === k ? "#185fa5" : "#9ca3af", borderBottom: tab === k ? "2px solid #185fa5" : "2px solid transparent", fontFamily: ff }}>{l}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "11px 13px" }}>
        {tab === "activity" && (activity.length === 0
          ? <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 18 }}>No activity yet</div>
          : activity.map(a => (
            <div key={a.id} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, flexShrink: 0 }}>{EVT[a.event_type] || "•"}</span>
              <div>
                <div style={{ fontSize: 11, color: "#111827", lineHeight: 1.5 }}>{a.message}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{a.actor} · {new Date(a.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
        {tab === "files" && (files.length === 0
          ? <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 18 }}>No files uploaded</div>
          : files.map(f => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: "1px solid #f9fafb" }}>
              <span>📎</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>by {f.uploaded_by}</div>
              </div>
              {f.file_url && <a href={f.file_url} download style={{ fontSize: 11, color: "#185fa5" }}>⬇</a>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Build RF graph from API data ───────────────────────────────────────────────
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

  // Lane backgrounds (non-interactive)
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
        isDark: handlers.isDark,
      },
      draggable: false,
      selectable: false,
      zIndex: 0,
    });
  }

  // Thread nodes
  apiNodes.forEach(n => {
    const stage = n.stage || 0;
    const sorted = (stageMap[stage] || []).sort((a, b) => (a.row || 0) - (b.row || 0));
    const rowIdx = sorted.findIndex(x => x.id === n.id);
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
    labelStyle: { fill: "#475569", fontSize: 10, fontWeight: 700 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
    labelBgStyle: { fill: "#f8fafc", fillOpacity: 0.95, stroke: "#cbd5e1", strokeWidth: 1 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
    style: { stroke: "#94a3b8", strokeWidth: 2 },
    data: { depId: e.id, type: e.dependency_type || "DEPENDS_ON", sourceTitle: e.source_node_title, targetTitle: e.target_node_title },
  }));

  return { rfNodes, rfEdges };
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
    isDark,
  };

  const applyGraph = useCallback((nodes, edges, labels) => {
    const { rfNodes: rn, rfEdges: re } = buildGraph(nodes, edges, labels, thread, handlers);
    setRfNodes(rn);
    setRfEdges(re);
    setTimeout(() => fitView({ padding: 0.12, duration: 350 }), 80);
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

  // Drag-connect: create dependency
  const onConnect = useCallback(async (params) => {
    const src = parseInt(params.source);
    const tgt = parseInt(params.target);
    if (src === tgt || isNaN(src) || isNaN(tgt)) return;
    try {
      await api.addDependency(src, tgt, "DEPENDS_ON");
      loadGraph();
    } catch (e) { alert(e.message); }
  }, [loadGraph]);

  // Click edge to configure dependency
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

  // Drag node to reposition
  const onNodeDragStop = useCallback(async (evt, rfNode) => {
    if (rfNode.type !== "threadNode") return;
    const nodeId = parseInt(rfNode.id);
    const stage = Math.max(0, Math.round(rfNode.position.x / (SW + SG)));
    const row = Math.max(0, Math.round((rfNode.position.y - PT) / (NH + NG)));
    try { await api.updatePosition(nodeId, { stage, row }); loadGraph(); }
    catch { loadGraph(); }
  }, [loadGraph]);

  // Node click → detail panel
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: isDark ? "#030712" : "#f1f5f9", fontFamily: ff }}>
      {/* Topbar */}
      <div style={{ height: 50, background: isDark ? "#111827" : "#fff", borderBottom: `1px solid ${isDark ? "#1f2937" : "#f3f4f6"}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button onClick={onBack} style={{ background: isDark ? "#1f2937" : "#f3f4f6", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: isDark ? "#e5e7eb" : "#374151", fontWeight: 600, fontFamily: ff }}>← Back</button>
          <span style={{ color: isDark ? "#4b5563" : "#d1d5db" }}>/</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? "#f9fafb" : "#111827" }}>{thread.title}</span>
        </div>
        <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>
          {stageLabels.length} stage(s) · {rawNodes.length} nodes · {rawEdges.length} connections
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* React Flow */}
        <div style={{ flex: 1, position: "relative" }}>
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
            defaultEdgeOptions={{ type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" }, style: { stroke: "#94a3b8", strokeWidth: 2 } }}
            connectionLineStyle={{ stroke: "#2563eb", strokeWidth: 2 }}
            connectionLineType="smoothstep"
            deleteKeyCode={null}
            proOptions={{ hideAttribution: true }}
            style={{ background: isDark ? "#0b1220" : "#f8fafc" }}
          >
            <Background color={isDark ? "#1f2937" : "#e2e8f0"} gap={24} size={1} />
            <Controls style={{ border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`, borderRadius: 8, overflow: "hidden", boxShadow: "none", background: isDark ? "#111827" : "#fff" }} />

            {/* Stage quick-add buttons */}
            <Panel position="top-left" style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10, marginLeft: 10 }}>
              {stageLabels.map((label, i) => (
                <button key={i} onClick={() => setAddNodeModal({ open: true, stageIndex: i })}
                  style={{ background: i === 0 ? "#185fa5" : "#fff", color: i === 0 ? "#fff" : "#374151", border: `1.5px solid ${i === 0 ? "#185fa5" : "#d1d5db"}`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>
                  + {i === 0 ? thread.title : label}
                </button>
              ))}
              <button onClick={() => setAddStageModal(true)}
                style={{ background: "transparent", color: "#6b7280", border: "1.5px dashed #d1d5db", borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: ff }}>
                + Add stage
              </button>
            </Panel>

            {/* Legend */}
            <Panel position="bottom-center" style={{ marginBottom: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.94)", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 16px", fontSize: 11, color: "#4b5563", fontFamily: ff, display: "flex", gap: 18, alignItems: "center" }}>
                <span><span style={{ color: "#2563eb", fontWeight: 700 }}>●</span> Drag blue dot to connect</span>
                <span>Click edge to remove</span>
                <span>Drag node to reposition</span>
                <span>Click node for details</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onEdit={n => setEditModal({ open: true, node: n })}
            onFiles={n => setFileModal({ open: true, node: n })}
            isDark={isDark}
          />
        )}
      </div>

      {/* Add node modal */}
      <NodeFormModal
        open={addNodeModal.open}
        onClose={() => setAddNodeModal({ open: false, stageIndex: null })}
        onSubmit={handleCreateNode}
        initial={null}
        title={`+ Add node — ${stageLabels[addNodeModal.stageIndex] || "stage"}`}
        isDark={isDark}
      />

      {/* Edit modal */}
      <NodeFormModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, node: null })}
        onSubmit={handleEdit}
        initial={editModal.node}
        title="Edit node"
        isDark={isDark}
      />

      {/* File modal */}
      <FileModal open={fileModal.open} onClose={() => setFileModal({ open: false, node: null })} node={fileModal.node} isDark={isDark} />

      {/* Add stage modal */}
      <Modal open={addStageModal} onClose={() => setAddStageModal(false)} title="Add stage" isDark={isDark}>
        <Fld label="Stage name" isDark={isDark}>
          <Inp value={stageNameInput} onChange={e => setStageNameInput(e.target.value)} placeholder={`Stage ${stageLabels.length}`} autoFocus isDark={isDark} />
        </Fld>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="ghost" onClick={() => setAddStageModal(false)} isDark={isDark}>Cancel</Btn>
          <Btn onClick={handleAddStage} isDark={isDark}>Add stage</Btn>
        </div>
      </Modal>

      {/* Edge Edit Modal */}
      {edgeEditModal.open && edgeEditModal.edge && (() => {
        const edge = edgeEditModal.edge;
        const depId = edge.data?.depId;
        const initialType = edge.data?.type || "DEPENDS_ON";
        return (
          <Modal open={true} onClose={() => setEdgeEditModal({ open: false, edge: null })} title="Edit Connection" isDark={isDark} width={380}>
            <Fld label="Relationship Type" isDark={isDark}>
              <select
                defaultValue={initialType}
                id="_edge_type_select"
                style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1.5px solid ${isDark ? "#374151" : "#d1d5db"}`, borderRadius: 7, fontFamily: ff, color: isDark ? "#f9fafb" : "#111827", background: isDark ? "#111827" : "#fff" }}
              >
                {DEPENDENCY_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </Fld>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <Btn variant="danger" onClick={() => handleRemoveDependency(depId)} isDark={isDark} small>Remove connection</Btn>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost" onClick={() => setEdgeEditModal({ open: false, edge: null })} isDark={isDark}>Cancel</Btn>
                <Btn onClick={() => handleUpdateDependency(depId, document.getElementById("_edge_type_select").value)} isDark={isDark}>Save</Btn>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ── Thread Canvas wrapper ──────────────────────────────────────────────────────
function ThreadCanvas({ thread, onBack }) {
  return (
    <ReactFlowProvider>
      <CanvasInner thread={thread} onBack={onBack} />
    </ReactFlowProvider>
  );
}

// ── Thread tiles ───────────────────────────────────────────────────────────────
function ThreadsView({ onOpen }) {
  const isDark = useThemeSync();
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

  const COLORS = ["#185fa5", "#0f6e56", "#854f0b", "#3c3489", "#993c1d"];

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#030712" : "#f8fafc", fontFamily: ff }}>
      <div style={{ background: isDark ? "#111827" : "#fff", borderBottom: `1px solid ${isDark ? "#1f2937" : "#f3f4f6"}`, padding: "0 26px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: isDark ? "#f9fafb" : "#111827" }}>Threads</span>
          {!loading && <span style={{ fontSize: 11, color: isDark ? "#cbd5e1" : "#6b7280", background: isDark ? "#1f2937" : "#f3f4f6", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{threads.length}</span>}
        </div>
        <Btn onClick={() => setCreating(true)} isDark={isDark}>+ New thread</Btn>
      </div>

      <div style={{ padding: "26px" }}>
        {loading && <div style={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 13 }}>Loading…</div>}
        {err && <div style={{ color: "#dc2626", fontSize: 13 }}>Error: {err}</div>}
        {!loading && threads.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🕸</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#e5e7eb" : "#374151", marginBottom: 5 }}>No threads yet</div>
            <div style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 18 }}>Create your first project thread to get started</div>
            <Btn onClick={() => setCreating(true)} isDark={isDark}>+ New thread</Btn>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {threads.map((t, i) => {
            const acc = COLORS[i % COLORS.length];
            return (
              <div key={t.id} onClick={() => onOpen(t)}
                style={{ background: isDark ? "#111827" : "#fff", borderRadius: 10, border: `1.5px solid ${isDark ? "#374151" : "#e5e7eb"}`, padding: "16px", cursor: "pointer", borderTop: `3px solid ${acc}`, transition: "transform 0.12s, border-color 0.12s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = acc; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = isDark ? "#374151" : "#e5e7eb"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: acc + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🕸</div>
                  <button onClick={e => handleDel(e, t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: isDark ? "#6b7280" : "#d1d5db", padding: 2 }}>🗑</button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: isDark ? "#f9fafb" : "#111827", marginTop: 9, marginBottom: 4 }}>{t.title}</div>
                {t.description && <div style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.description}</div>}
                <div style={{ marginTop: 11, fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New thread" isDark={isDark}>
        <Fld label="Project name" isDark={isDark}><Inp value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mobile Redesign" autoFocus isDark={isDark} /></Fld>
        <Fld label="Description" isDark={isDark}><Inp value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" multiline isDark={isDark} /></Fld>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="ghost" onClick={() => setCreating(false)} isDark={isDark}>Cancel</Btn>
          <Btn onClick={handleCreate} disabled={!form.title.trim()} isDark={isDark}>Create thread</Btn>
        </div>
      </Modal>
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