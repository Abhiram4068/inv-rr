import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";

// ─── API helpers ──────────────────────────────────────────────────────────────
const BASE = "/api";
const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

const api = {
  getGraph: (threadId) => fetch(`${BASE}/threads/${threadId}/graph/`).then((r) => r.json()),
  createNode: (threadId, body) =>
    fetch(`${BASE}/threads/${threadId}/nodes/`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then((r) => r.json()),
  createBranch: (nodeId, body) =>
    fetch(`${BASE}/nodes/${nodeId}/branch/`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then((r) => r.json()),
  updateNode: (nodeId, body) =>
    fetch(`${BASE}/nodes/${nodeId}/`, { method: "PUT", headers: headers(), body: JSON.stringify(body) }).then((r) => r.json()),
  deleteNode: (nodeId) =>
    fetch(`${BASE}/nodes/${nodeId}/`, { method: "DELETE" }),
  updatePosition: (nodeId, x, y) =>
    fetch(`${BASE}/nodes/${nodeId}/position/`, {
      method: "PATCH", headers: headers(),
      body: JSON.stringify({ position_x: x, position_y: y }),
    }),
  addDependency: (nodeId, targetId, type) =>
    fetch(`${BASE}/nodes/${nodeId}/dependencies/`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ source_node: nodeId, target_node: targetId, dependency_type: type }),
    }).then((r) => r.json()),
  getFiles: (nodeId) => fetch(`${BASE}/nodes/${nodeId}/files/`).then((r) => r.json()),
  uploadFile: (nodeId, formData) =>
    fetch(`${BASE}/nodes/${nodeId}/files/`, { method: "POST", body: formData }).then((r) => r.json()),
  deleteFile: (fileId) => fetch(`${BASE}/files/${fileId}/`, { method: "DELETE" }),
  getActivity: (nodeId) => fetch(`${BASE}/nodes/${nodeId}/activity/`).then((r) => r.json()),
};

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_META = {
  ACTIVE:            { label: "Active",        color: "#16a34a", bg: "#dcfce7" },
  NEEDS_REVIEW:      { label: "Needs Review",  color: "#d97706", bg: "#fef3c7" },
  OUTDATED:          { label: "Outdated",      color: "#dc2626", bg: "#fee2e2" },
  BLOCKED:           { label: "Blocked",       color: "#7c3aed", bg: "#ede9fe" },
  ARCHIVED:          { label: "Archived",      color: "#6b7280", bg: "#f3f4f6" },
  POTENTIALLY_OUTDATED: { label: "Potentially Outdated", color: "#ea580c", bg: "#ffedd5" },
};

const NODE_ICONS = {
  "Requirements":    "📋",
  "UI Design":       "🎨",
  "Frontend":        "💻",
  "Testing":         "🧪",
  "Deployment":      "🚀",
  default:           "📦",
};

function getIcon(title) {
  for (const [k, v] of Object.entries(NODE_ICONS)) {
    if (title.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return NODE_ICONS.default;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, small }) {
  const m = STATUS_META[status] || STATUS_META.ACTIVE;
  return (
    <span style={{
      background: m.bg, color: m.color,
      fontSize: small ? 9 : 10, fontWeight: 600,
      padding: small ? "2px 6px" : "3px 8px",
      borderRadius: 20, letterSpacing: "0.02em",
      display: "inline-block", lineHeight: 1.4,
    }}>
      {m.label}
    </span>
  );
}

// ─── Custom Node Card ─────────────────────────────────────────────────────────
function ProjectNode({ id, data }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isBranch = data.is_branch;
  const statusMeta = STATUS_META[data.status] || STATUS_META.ACTIVE;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMenuOpen(false); }}
      onClick={() => data.onSelect(data)}
      style={{
        width: 220,
        background: "#fff",
        border: isBranch ? "1.5px dashed #d1d5db" : `1.5px solid ${statusMeta.color}33`,
        borderTop: `3px solid ${statusMeta.color}`,
        borderRadius: 12,
        boxShadow: hover ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        position: "relative",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: statusMeta.color, width: 8, height: 8 }} />

      {/* Context Menu Trigger */}
      {hover && (
        <div ref={menuRef} style={{ position: "absolute", top: 8, right: 8, zIndex: 20 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            style={{
              background: "#f3f4f6", border: "1px solid #e5e7eb",
              borderRadius: 6, padding: "3px 7px", cursor: "pointer",
              fontSize: 14, lineHeight: 1,
            }}
          >
            ⋯
          </button>
          {menuOpen && (
            <div style={{
              position: "absolute", top: 28, right: 0,
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: 160, overflow: "hidden", zIndex: 100,
            }}>
              {[
                { label: "➕  Add child node",  action: "ADD_NODE" },
                { label: "⑂  Add branch",       action: "ADD_BRANCH" },
                { label: "📎  Upload file",      action: "UPLOAD" },
                { label: "✏️  Edit node",        action: "EDIT" },
                { label: "🗑  Archive node",     action: "DELETE", red: true },
              ].map((item) => (
                <div
                  key={item.action}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); data.onAction(item.action, data); }}
                  style={{
                    padding: "9px 14px", fontSize: 12, cursor: "pointer",
                    color: item.red ? "#dc2626" : "#374151",
                    background: "transparent",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: statusMeta.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>
          {getIcon(data.title)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#111827", letterSpacing: "0.03em", textTransform: "uppercase", truncate: true, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {data.title}
          </div>
          {isBranch && <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>branch</div>}
        </div>
      </div>

      {/* Status + files */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StatusBadge status={data.status} small />
        {data.file_count > 0 && (
          <span style={{ fontSize: 10, color: "#6b7280" }}>📎 {data.file_count} file{data.file_count > 1 ? "s" : ""}</span>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: statusMeta.color, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { projectNode: ProjectNode };

// ─── Modal Base ───────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, width, maxWidth: "96vw",
        maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f0f0f0" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", fontSize: 13,
  border: "1.5px solid #e5e7eb", borderRadius: 8, outline: "none",
  fontFamily: "inherit", color: "#111827", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const btnStyle = (primary) => ({
  padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: "pointer", border: primary ? "none" : "1.5px solid #e5e7eb",
  background: primary ? "#2563eb" : "#fff",
  color: primary ? "#fff" : "#374151",
  transition: "opacity 0.15s",
});

// ─── Add / Edit Node Modal ────────────────────────────────────────────────────
function NodeModal({ open, onClose, onSubmit, initial, title }) {
  const [form, setForm] = useState({ title: "", description: "", ...initial });
  useEffect(() => { setForm({ title: "", description: "", ...initial }); }, [initial, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <Field label="Title">
        <input style={inputStyle} value={form.title} onChange={set("title")} placeholder="e.g. UI Design" />
      </Field>
      <Field label="Description">
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={form.description} onChange={set("description")}
          placeholder="What happens in this stage?"
        />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <button style={btnStyle(false)} onClick={onClose}>Cancel</button>
        <button style={btnStyle(true)} onClick={() => { if (form.title.trim()) onSubmit(form); }}>
          {initial ? "Save changes" : "Create node"}
        </button>
      </div>
    </Modal>
  );
}

// ─── File Upload Modal ────────────────────────────────────────────────────────
function FileModal({ open, onClose, nodeData, threadId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState("");
  const dropRef = useRef(null);

  useEffect(() => {
    if (open && nodeData) {
      api.getFiles(nodeData.id).then(setUploaded);
    }
  }, [open, nodeData]);

  const handleFiles = (fl) => {
    setFiles(Array.from(fl));
    setError("");
  };

  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e) => e.preventDefault();

  const upload = async () => {
    if (!files.length || !nodeData) return;
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const result = await api.uploadFile(nodeData.id, fd);
        setUploaded((prev) => [result, ...prev]);
      }
      setFiles([]);
    } catch {
      setError("Upload failed. Check file size (max 50 MB).");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileId) => {
    await api.deleteFile(fileId);
    setUploaded((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <Modal open={open} onClose={onClose} title={`Files — ${nodeData?.title || ""}`} width={520}>
      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          border: "2px dashed #d1d5db", borderRadius: 10, padding: "28px 20px",
          textAlign: "center", background: "#fafafa", marginBottom: 16,
          cursor: "pointer",
        }}
        onClick={() => document.getElementById("file-input").click()}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>📂</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Drag & drop files here, or <span style={{ color: "#2563eb", fontWeight: 600 }}>browse</span>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Max 50 MB per file</div>
        <input id="file-input" type="file" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* Selected files preview */}
      {files.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f0f9ff", borderRadius: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{(f.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {files.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button style={btnStyle(true)} onClick={upload} disabled={uploading}>
            {uploading ? "Uploading…" : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Uploaded files */}
      {uploaded.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Uploaded files
          </div>
          {uploaded.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid #f0f0f0", borderRadius: 8, marginBottom: 6 }}>
              <span>📎</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>by {f.uploaded_by}</div>
              </div>
              {f.file_url && (
                <a href={f.file_url} download style={{ fontSize: 11, color: "#2563eb", textDecoration: "none" }}>⬇</a>
              )}
              <button onClick={() => removeFile(f.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}

// ─── Node Detail Side Panel ───────────────────────────────────────────────────
function NodePanel({ node, onClose, onAction }) {
  const [activity, setActivity] = useState([]);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState("activity");

  useEffect(() => {
    if (!node) return;
    api.getActivity(node.id).then(setActivity);
    api.getFiles(node.id).then(setFiles);
  }, [node]);

  if (!node) return null;

  const EVENT_ICONS = {
    CREATED: "🌱", UPDATED: "✏️", FILE_UPLOADED: "📎",
    FILE_DELETED: "🗑", STATUS_CHANGED: "🔄", DEPENDENCY_ADDED: "🔗", COMMENTED: "💬",
  };

  return (
    <div style={{
      width: 320, borderLeft: "1px solid #f0f0f0",
      display: "flex", flexDirection: "column",
      fontFamily: "'IBM Plex Sans', sans-serif",
      background: "#fff",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{node.title}</div>
            <StatusBadge status={node.status} />
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>
        {node.description && (
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 10, lineHeight: 1.6 }}>{node.description}</div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ ...btnStyle(false), fontSize: 11, padding: "6px 12px" }} onClick={() => onAction("UPLOAD", node)}>📎 Upload</button>
          <button style={{ ...btnStyle(false), fontSize: 11, padding: "6px 12px" }} onClick={() => onAction("EDIT", node)}>✏️ Edit</button>
          <button style={{ ...btnStyle(false), fontSize: 11, padding: "6px 12px" }} onClick={() => onAction("ADD_BRANCH", node)}>⑂ Branch</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
        {[["activity", "Activity"], ["files", `Files (${files.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: "10px", fontSize: 12, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: tab === key ? "#2563eb" : "#9ca3af",
              borderBottom: tab === key ? "2px solid #2563eb" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
        {tab === "activity" && (
          activity.length === 0
            ? <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 24 }}>No activity yet</div>
            : activity.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>{EVENT_ICONS[a.event_type] || "•"}</div>
                <div>
                  <div style={{ fontSize: 12, color: "#111827", lineHeight: 1.5 }}>{a.message}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                    {a.actor} · {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
        )}
        {tab === "files" && (
          files.length === 0
            ? <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 24 }}>No files uploaded</div>
            : files.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                <span>📎</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.original_name}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>by {f.uploaded_by}</div>
                </div>
                {f.file_url && (
                  <a href={f.file_url} download style={{ fontSize: 12, color: "#2563eb" }}>⬇</a>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const THREAD_ID = 1; // Replace with route param in real app

export default function ThreadVisualizer() {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modals
  const [addNodeModal, setAddNodeModal] = useState({ open: false, parentId: null, isBranch: false });
  const [editNodeModal, setEditNodeModal] = useState({ open: false, nodeData: null });
  const [fileModal, setFileModal] = useState({ open: false, nodeData: null });

  const [loading, setLoading] = useState(true);

  // ── Load graph ──────────────────────────────────────────────────────────────
  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const { nodes, edges } = await api.getGraph(THREAD_ID);
      const rfN = nodes.map((n) => ({
        id: String(n.id),
        type: "projectNode",
        position: { x: n.position_x, y: n.position_y },
        data: {
          ...n,
          onSelect: setSelectedNode,
          onAction: handleAction,
        },
      }));
      const rfE = edges.map((e) => ({
        id: `e${e.id}`,
        source: String(e.source_node),
        target: String(e.target_node),
        type: "smoothstep",
        animated: false,
        style: { stroke: e.dependency_type === "BLOCKS" ? "#2563eb" : "#9ca3af", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: e.dependency_type === "BLOCKS" ? "#2563eb" : "#9ca3af" },
        label: e.dependency_type,
        labelStyle: { fontSize: 10, fill: "#9ca3af" },
        labelBgStyle: { fill: "#fff", fillOpacity: 0.9 },
      }));
      setRfNodes(rfN);
      setRfEdges(rfE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  // ── Context menu actions ────────────────────────────────────────────────────
  const handleAction = useCallback((action, nodeData) => {
    if (action === "ADD_NODE")    setAddNodeModal({ open: true, parentId: nodeData.id, isBranch: false });
    if (action === "ADD_BRANCH")  setAddNodeModal({ open: true, parentId: nodeData.id, isBranch: true });
    if (action === "UPLOAD")      setFileModal({ open: true, nodeData });
    if (action === "EDIT")        setEditNodeModal({ open: true, nodeData });
    if (action === "DELETE")      handleDeleteNode(nodeData.id);
  }, []);

  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm("Archive this node? Downstream nodes will be marked as Blocked.")) return;
    await api.deleteNode(nodeId);
    setSelectedNode(null);
    loadGraph();
  };

  // ── Submit handlers ────────────────────────────────────────────────────────
  const submitAddNode = async (form) => {
    const { parentId, isBranch } = addNodeModal;
    if (isBranch) {
      await api.createBranch(parentId, { title: form.title, description: form.description });
    } else {
      await api.createNode(THREAD_ID, { title: form.title, description: form.description, parent_node_id: parentId });
    }
    setAddNodeModal({ open: false, parentId: null, isBranch: false });
    loadGraph();
  };

  const submitEditNode = async (form) => {
    await api.updateNode(editNodeModal.nodeData.id, form);
    setEditNodeModal({ open: false, nodeData: null });
    loadGraph();
  };

  // ── Dependency on connect ──────────────────────────────────────────────────
  const onConnect = useCallback(async (params) => {
    await api.addDependency(Number(params.source), Number(params.target), "BLOCKS");
    loadGraph();
  }, [loadGraph]);

  // ── Position sync on drag stop ─────────────────────────────────────────────
  const onNodeDragStop = useCallback((_, node) => {
    api.updatePosition(Number(node.id), node.position.x, node.position.y);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ display: "flex", height: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", background: "#f9fafb" }}>

        {/* ─ Header ─ */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: selectedNode ? 320 : 0,
          height: 56, background: "#fff", borderBottom: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🕸</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Thread Graph</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>/ Mobile App Launch</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ ...btnStyle(false), fontSize: 12, padding: "7px 14px" }}
              onClick={() => setAddNodeModal({ open: true, parentId: null, isBranch: false })}
            >
              ➕ Add node
            </button>
          </div>
        </div>

        {/* ─ Canvas ─ */}
        <div style={{ flex: 1, paddingTop: 56 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 14 }}>
              Loading graph…
            </div>
          ) : (
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              connectionLineStyle={{ stroke: "#2563eb", strokeWidth: 1.5 }}
            >
              <Background color="#e5e7eb" variant="dots" gap={20} size={1} />
              <Controls style={{ bottom: 20, left: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
            </ReactFlow>
          )}
        </div>

        {/* ─ Side panel ─ */}
        {selectedNode && (
          <NodePanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onAction={handleAction}
          />
        )}
      </div>

      {/* ─ Modals ─ */}
      <NodeModal
        open={addNodeModal.open}
        onClose={() => setAddNodeModal({ open: false, parentId: null, isBranch: false })}
        onSubmit={submitAddNode}
        initial={null}
        title={addNodeModal.isBranch ? "⑂ Create branch" : "➕ Add child node"}
      />

      <NodeModal
        open={editNodeModal.open}
        onClose={() => setEditNodeModal({ open: false, nodeData: null })}
        onSubmit={submitEditNode}
        initial={editNodeModal.nodeData}
        title="✏️ Edit node"
      />

      <FileModal
        open={fileModal.open}
        onClose={() => { setFileModal({ open: false, nodeData: null }); loadGraph(); }}
        nodeData={fileModal.nodeData}
        threadId={THREAD_ID}
      />
    </>
  );
}