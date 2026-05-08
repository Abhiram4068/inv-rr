import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

// --- DUMMY DATA ---
const MOCK_THREADS = [
  {
    id: "thread_01",
    title: "Website Rebranding 2026",
    objective: "Updating the visual identity across all digital touchpoints including the main landing page and dashboard.",
    status: "Active",
    node_count: 5,
    file_count: 12,
    updated_at: "2026-05-01T10:00:00Z"
  },
  {
    id: "thread_02",
    title: "Mobile App API Integration",
    objective: "Establishing secure handshakes between the new Rust backend and the React Native frontend nodes.",
    status: "In Progress",
    node_count: 8,
    file_count: 4,
    updated_at: "2026-05-04T15:30:00Z"
  },
  {
    id: "thread_03",
    title: "Q2 Marketing Campaign",
    objective: "Sequential rollout of social media assets, email sequences, and dependency tracking for influencer outreach.",
    status: "Completed",
    node_count: 3,
    file_count: 24,
    updated_at: "2026-04-20T08:15:00Z"
  }
];

const Threads = () => {
  // Theme & UI Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'grid');
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Thread Form State
  const [threadTitle, setThreadTitle] = useState('');
  const [threadObjective, setThreadObjective] = useState('');

  // Local Data State
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const isDark = theme === 'dark';

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Sync Theme logic
  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- LOCAL DATA HANDLING (Simulating API) ---
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = MOCK_THREADS.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.objective.toLowerCase().includes(search.toLowerCase())
      );

      filtered.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      setThreads(filtered);
      setLoading(false);
    }, 500); // Small delay to feel realistic
    return () => clearTimeout(timer);
  }, [search, sortBy, sortOrder]);

  const handleCreateThread = () => {
    if (!threadTitle.trim()) {
      alert("Please provide a title.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newThread = {
        id: `thread_${Math.random().toString(36).substr(2, 5)}`,
        title: threadTitle,
        objective: threadObjective,
        status: "Active",
        node_count: 0,
        file_count: 0,
        updated_at: new Date().toISOString()
      };
      setThreads([newThread, ...threads]);
      setModalOpen(false);
      setThreadTitle('');
      setThreadObjective('');
      setLoading(false);
      showToast("Workflow thread initialized successfully");
    }, 800);
  };

  return (
    <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
            <i className="fa-solid fa-diagram-project text-blue-500 text-lg"></i>
            {toast.message}
          </div>
        </div>
      )}

      <div className="p-6 lg:p-[24px_40px]">

        {/* HEADER ACTION ROW */}
        <div className="flex justify-between items-center mb-[30px] gap-4">
          <div className={`flex-1 max-w-[450px] border px-4 py-[10px] rounded-[12px] flex items-center shadow-sm transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input
              type="text"
              placeholder="Search workflow threads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              className={`p-[10px] rounded-[10px] transition-all ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-500 hover:text-blue-500'}`}
            >
              <i className={`fa-solid ${viewMode === 'grid' ? 'fa-list' : 'fa-grip'}`}></i>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-[#3b82f6] text-white px-5 py-[10px] rounded-[10px] font-semibold text-sm flex items-center gap-[10px] whitespace-nowrap hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
              <i className="fa-solid fa-plus"></i> New Thread
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className={`text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Project Threads</div>
            <p className={`text-xs ${isDark ? 'text-[#808080]' : 'text-slate-500'} mt-1`}>Manage sequential task nodes and resource dependencies</p>
          </div>
          <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm`}>{threads.length} thread(s)</div>
        </div>

        {/* SORTING TABS */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {[
            { label: "Recently Updated", value: "updated_at" },
            { label: "Thread Name", value: "title" },
            { label: "Nodes Count", value: "node_count" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (sortBy === opt.value) setSortOrder(o => o === "asc" ? "desc" : "asc");
                else { setSortBy(opt.value); setSortOrder("desc"); }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${sortBy === opt.value
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                  : isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white' : 'bg-white border-slate-200 text-slate-500'
                }`}
            >
              {opt.label}
              {sortBy === opt.value && <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"} text-[10px]`}></i>}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="py-20 text-center">
             <i className="fa-solid fa-route text-4xl mb-4 text-[#333]"></i>
             <div className={`text-sm ${isDark ? "text-[#808080]" : "text-slate-500"}`}>No matches found.</div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                to={`/thread/${thread.id}`}
                className={`border p-5 rounded-[16px] flex flex-col gap-4 transition-all group ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'}`}
              >
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <i className="fa-solid fa-code-branch text-blue-500 rotate-90"></i>
                    </div>
                    <div className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold ${isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {thread.status}
                    </div>
                </div>
                <div>
                  <span className={`text-base font-bold truncate block mb-1 ${isDark ? 'text-white' : 'text-slate-700'}`}>{thread.title}</span>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>{thread.objective}</p>
                </div>
                <div className={`flex items-center gap-4 pt-4 border-t ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`}>
                    <span className="text-[11px] font-medium text-[#808080]"><i className="fa-solid fa-circle-nodes mr-1"></i>{thread.node_count} Nodes</span>
                    <span className="text-[11px] font-medium text-[#808080]"><i className="fa-solid fa-paperclip mr-1"></i>{thread.file_count} Files</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`overflow-x-auto mb-10 rounded-xl border ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-[#1a1a1a] bg-[#050505] text-[#666]' : 'border-slate-200 bg-slate-50 text-slate-500'} text-[11px] uppercase font-bold`}>
                  <th className="px-6 py-4">Workflow Thread</th>
                  <th className="px-6 py-4">Nodes</th>
                  <th className="px-6 py-4">Resources</th>
                  <th className="px-6 py-4 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
                {threads.map((thread) => (
                  <tr key={thread.id} className={`group border-b last:border-0 transition-colors ${isDark ? 'hover:bg-[#ffffff05]' : 'hover:bg-white/50'}`}>
                    <td className="px-6 py-4">
                      <Link to={`/thread/${thread.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><i className="fa-solid fa-diagram-project"></i></div>
                        <span className="font-semibold">{thread.title}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(thread.node_count || 1, 3))].map((_, i) => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 ${isDark ? 'border-black bg-[#222]' : 'border-white bg-slate-200'} text-[8px] flex items-center justify-center`}>{i+1}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#808080]">{thread.file_count} Assets</td>
                    <td className="px-6 py-4 text-right text-xs font-mono text-[#666]">{new Date(thread.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* NEW THREAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-[6px] flex justify-center items-center z-[2000] p-4">
          <div className={`border w-full max-w-[460px] p-8 rounded-[24px] shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Initialize Thread</h2>
              <i className="fa-solid fa-xmark text-[#808080] cursor-pointer hover:text-white" onClick={() => setModalOpen(false)}></i>
            </div>
            <div className="mb-6">
              <label className="block text-[11px] mb-2 uppercase font-bold text-[#666]">Thread Title</label>
              <input type="text" value={threadTitle} onChange={(e) => setThreadTitle(e.target.value)} placeholder="e.g. Q4 Website Redesign" className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
            </div>
            <div className="mb-8">
              <label className="block text-[11px] mb-2 uppercase font-bold text-[#666]">Main Objective</label>
              <textarea rows="4" value={threadObjective} onChange={(e) => setThreadObjective(e.target.value)} placeholder="High-level sequence..." className={`w-full border rounded-xl p-4 outline-none resize-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' : 'bg-slate-50 border-slate-200 text-slate-800'}`}></textarea>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-4 rounded-xl font-bold border border-[#1a1a1a]" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="flex-[2] bg-[#3b82f6] text-white py-4 rounded-xl font-bold hover:bg-blue-600 shadow-lg" onClick={handleCreateThread}>Start Workflow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Threads;