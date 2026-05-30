import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import {
  getThreads,
  createThread,
  updateThread,
  deleteThread,
  getApiErrorMessage,
} from '../../services/threadService';
import HelpModal from '../../components/HelpModal';
import { useViewMode } from '../../hooks/useViewMode';
import ViewModeToggle from '../../components/ViewModeToggle';

const Threads = () => {
  const navigate = useNavigate();
  // Theme & UI Logic
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  // Set viewMode using standardized keys
  const [viewMode, handleViewModeChange] = useViewMode('thread');
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  // Thread Form State
  const [threadTitle, setThreadTitle] = useState('');
  const [threadObjective, setThreadObjective] = useState('');
const [titleError, setTitleError] = useState(false);
  // Local Data State
  const [allThreads, setAllThreads] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Edit/Delete State
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingThread, setEditingThread] = useState(null);
  const [deletingThread, setDeletingThread] = useState(null);

  const isDark = theme === 'dark';

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type: type, animateOut: false });
  };

  // Toast auto-dismiss with clean slide-up exit animation
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, animateOut: true }));
        setTimeout(() => {
          setToast({ visible: false, message: '', type: 'success', animateOut: false });
        }, 350);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Sync Theme logic via MutationObserver to catch layout theme toggles instantly
  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setTheme(isCurrentlyDark ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      setTheme(isDarkNow ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const loadThreads = () => {
    setLoading(true);
    getThreads().then((data) => {
      setAllThreads(data || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    let filtered = allThreads.filter(t => 
      t.title?.toLowerCase().includes(search.toLowerCase()) || 
      t.description?.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (sortBy === 'updated_at') {
          valA = a.updated_at || a.created_at || '';
          valB = b.updated_at || b.created_at || '';
      }
      if (sortOrder === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    setThreads(filtered);
  }, [search, sortBy, sortOrder, allThreads]);

  const handleCreateThread = async () => {
    if (!threadTitle.trim()) {
 setTitleError(true);
      return;
    }
    setTitleError(false);
    setLoading(true);
    try {
      const newThread = await createThread({ title: threadTitle, description: threadObjective });
      setAllThreads([newThread, ...allThreads]);
      setModalOpen(false);
      setThreadTitle('');
      setThreadObjective('');
      showToast("Workflow thread initialized successfully");
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Failed to create thread'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThread = async (id, data) => {
    setLoading(true);
    try {
      const updated = await updateThread(id, data);
      setAllThreads(prev => prev.map(t => t.id === id ? updated.data : t));
      setEditingThread(null);
      showToast(updated.message);
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Failed to update thread'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThread = async (id) => {
    setLoading(true);
    try {
      await deleteThread(id);
      setAllThreads(prev => prev.filter(t => t.id !== id));
      setDeletingThread(null);
      showToast("Thread deleted successfully");
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Failed to delete thread'), 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'}`}>
      
      {/* Professional Top-Sliding Toast */}
      {toast.visible && (
        <div 
          className={`fixed top-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none
            transition-all duration-[350ms]
            ${toast.animateOut 
              ? 'opacity-0 -translate-y-6 scale-95' 
              : 'opacity-100 translate-y-0 scale-100'
            }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animation: !toast.animateOut ? 'slideDownProfessional 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
          }}
        >
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.12)] border pointer-events-auto min-w-[300px] max-w-[450px]
            ${isDark 
              ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' 
              : 'bg-white border-slate-100 text-slate-800'}`}>
            
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error' 
                ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500') 
                : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')
              }`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
            </div>
            
            <span className="flex-1 leading-normal tracking-wide text-[13px]">
              {toast.message}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDownProfessional {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

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
  <ViewModeToggle viewMode={viewMode} onChange={handleViewModeChange} isDark={isDark} />

  {/* ADD THIS BUTTON HERE */}
<button
  onClick={() => setHelpModalOpen(true)}
  className={`w-9 h-9 rounded-[10px] flex items-center justify-center border text-sm font-semibold transition-all shadow-sm ${
    isDark 
      ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]' 
      : 'bg-white border-slate-200 text-slate-500 hover:text-blue-500 hover:border-blue-200'
  }`}
  title="How to use Threads"
>
  <i className="fa-solid fa-circle-question text-base"></i>
</button>

  <button
    onClick={() => setModalOpen(true)}
    className="bg-[#3b82f6] text-white px-5 py-[10px] rounded-[10px] font-semibold text-sm flex items-center gap-[10px] whitespace-nowrap hover:bg-blue-600 transition-all shadow-lg"
  >
    <i className="fa-solid fa-plus"></i> Create Thread
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
             <div className={`text-sm ${isDark ? "text-[#808080]" : "text-slate-500"}`}>No threads found.</div>
          </div>
        ) : viewMode === 'thread_grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate(`/thread/${thread.id}`)}
                className={`border p-5 rounded-[10px] flex flex-col gap-4 transition-all group cursor-pointer ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111] hover:border-[#333]' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'}`}
              >
                <div className="flex items-center justify-between relative" onClick={e => e.stopPropagation()}>
                    <div className="w-10 h-10 rounded-full  flex items-center justify-center">
                        <i className="fa-solid fa-code-branch text-blue-500 rotate-90"></i>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === thread.id ? null : thread.id);
                      }}
                      className={`p-2 rounded-lg hover:bg-white/5 transition-all ${isDark ? 'text-[#666]' : 'text-slate-400'}`}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    {menuOpenId === thread.id && (
                      <div className={`absolute top-10 right-0 z-10 w-40 border rounded-xl shadow-xl p-1.5 ${isDark ? 'bg-[#111] border-[#222]' : 'bg-white border-slate-200'}`}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingThread(thread); setMenuOpenId(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'hover:bg-[#222] text-[#ccc]' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit thread
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingThread(thread); setMenuOpenId(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 transition-colors ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}`}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    )}
                </div>
                <div>
                  <span className={`text-base font-bold truncate block mb-1 ${isDark ? 'text-white' : 'text-slate-700'}`}>{thread.title}</span>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>{new Date(thread.created_at).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-30 pt-4 border-t ${isDark ? 'border-[#1a1a1a]' : 'border-slate-100'}`} style={{ gap: '30px' }}>
                  <span className="text-[11px] font-medium text-[#808080]"><i className="fa-solid fa-paperclip mr-1"></i>{thread.file_count} File(s)</span>
                  <span className="text-[11px] font-medium text-[#808080]"><i className="fa-solid fa-circle-nodes mr-1"></i>{thread.node_count} Node(s)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-lg overflow-hidden shadow-2xl mb-10 border ${isDark ? 'border-neutral-900 bg-[#050505]' : 'border-slate-200 bg-white'}`}
            style={{
              contain: 'paint',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
          >
            {/* Table top bar */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Project Threads</h3>
                <p className={`text-[10px] font-bold mt-0.5 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                  {threads.length} thread(s) on this page
                </p>
              </div>
            </div>

           <div className="overflow-x-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#1a1a1a transparent' : '#e2e8f0 transparent',
          }}>
              <table className={`w-full text-left border-collapse ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-neutral-900 bg-[#080808]/70 text-neutral-500' : 'border-slate-100 bg-slate-50/50 text-slate-400'} text-[10px] uppercase tracking-[0.15em]`}>
                    <th className="px-6 py-4 font-bold">Workflow Thread</th>
                    <th className="px-6 py-4 font-bold">Nodes</th>
                    <th className="px-6 py-4 font-bold">Files</th>
                    <th className="px-6 py-4 font-bold">Created</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${isDark ? 'divide-neutral-900 text-white' : 'divide-slate-100 text-slate-700'}`}>
                  {threads.map((thread) => (
                    <tr key={thread.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-5">
                        <Link to={`/thread/${thread.id}`} className="flex items-center gap-3 no-underline">
                          <div className={`w-9 h-9  flex items-center justify-center flex-shrink-0`}>
<i className="fa-solid fa-code-branch text-blue-500 rotate-90"></i>                          </div>
                          <span className={`font-bold truncate max-w-[220px] ${isDark ? 'text-white hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>
                            {thread.title}
                          </span>
                        </Link>
                      </td>
                      <td className={`px-6 py-5 text-sm font-medium whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{thread.node_count} Nodes</td>
                      <td className={`px-6 py-5 text-sm whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{thread.file_count} Assets</td>
                      <td className={`px-6 py-5 text-sm font-mono whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>{new Date(thread.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === thread.id ? null : thread.id);
                            }}
                            className={`p-1.5 rounded-lg hover:bg-white/5 transition-all ${isDark ? 'text-[#666]' : 'text-slate-400'}`}
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>
                          {menuOpenId === thread.id && (
                            <div className={`absolute top-0 right-10 z-[100] w-40 border rounded-xl shadow-xl p-1.5 ${isDark ? 'bg-[#111] border-[#222]' : 'bg-white border-slate-200'}`}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingThread(thread); setMenuOpenId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'hover:bg-[#222] text-[#ccc]' : 'hover:bg-slate-100 text-slate-600'}`}
                              >
                                <i className="fa-solid fa-pen-to-square"></i> Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingThread(thread); setMenuOpenId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 transition-colors ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}`}
                              >
                                <i className="fa-solid fa-trash"></i> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* NEW THREAD MODAL */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-[6px] flex justify-center items-center z-[2000] p-4" onClick={() => setModalOpen(false)}>
    <div className={`border w-full max-w-[460px] p-8 rounded-[10px] shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">Initialize Thread</h2>
        <i className="fa-solid fa-xmark text-[#808080] cursor-pointer hover:text-white" onClick={() => setModalOpen(false)}></i>
      </div>

      <div className="mb-6">
        <label className="block text-[11px] mb-2 uppercase font-bold text-[#666]">
          Thread Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={threadTitle}
          onChange={(e) => { setThreadTitle(e.target.value); setTitleError(false); }}
          placeholder="e.g. Q4 Website Redesign"
          className={`w-full border rounded-xl p-4 outline-none ${
            titleError
              ? 'border-red-500 bg-red-500/5'
              : isDark
                ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]'
                : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        />
        {titleError && (
          <p className="text-red-500 text-[11px] mt-1.5 font-medium">Title is required</p>
        )}
      </div>

      <div className="mb-8">
        <label className="block text-[11px] mb-2 uppercase font-bold text-[#666]">Main Objective</label>
        <textarea
          rows="4"
          value={threadObjective}
          onChange={(e) => setThreadObjective(e.target.value)}
          placeholder="High-level sequence..."
          className={`w-full border rounded-xl p-4 outline-none resize-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
        />
      </div>

      {/* Smaller buttons: py-2.5 instead of py-4, text-sm */}
      <div className="flex gap-3">
        <button
          className="flex-1 py-2.5 text-sm rounded-xl font-bold border border-[#1a1a1a]"
          onClick={() => setModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="flex-[2] bg-[#3b82f6] text-white py-2.5 text-sm rounded-xl font-bold hover:bg-blue-600 shadow-lg"
          onClick={handleCreateThread}
        >
          Start Workflow
        </button>
      </div>
    </div>
  </div>
)}

      {/* EDIT THREAD MODAL */}
      {editingThread && (
        <EditModal 
          thread={editingThread} 
          isDark={isDark} 
          onClose={() => setEditingThread(null)} 
          onSubmit={(data) => handleUpdateThread(editingThread.id, data)} 
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingThread && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-[6px] flex justify-center items-center z-[2000] p-4" onClick={() => setDeletingThread(null)}>
          <div className={`border w-full max-w-[400px] p-8 rounded-[24px] shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fa-solid fa-trash"></i>
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Thread?</h2>
              <p className={`text-sm ${isDark ? 'text-[#666]' : 'text-slate-500'}`}>
                Are you sure you want to delete <span className="font-bold text-rose-500">"{deletingThread.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button className={`flex-1 py-4 rounded-xl font-bold border ${isDark ? 'border-[#1a1a1a] text-white' : 'border-slate-200 text-slate-700'}`} onClick={() => setDeletingThread(null)}>Cancel</button>
              <button className="flex-1 bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 shadow-lg" onClick={() => handleDeleteThread(deletingThread.id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* HELP / INSTRUCTIONS MODAL */}
      <HelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
        isDark={isDark} 
      />
    </div>
  );
};

const EditModal = ({ thread, isDark, onClose, onSubmit }) => {
  const [title, setTitle] = useState(thread.title);
  const [desc, setDesc] = useState(thread.description || '');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-[6px] flex justify-center items-center z-[2000] p-4" onClick={onClose}>
      <div className={`border w-full max-w-[460px] p-8 rounded-[24px] shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Edit Thread</h2>
          <i className="fa-solid fa-xmark text-[#808080] cursor-pointer hover:text-white" onClick={onClose}></i>
        </div>
        <div className="mb-6">
          <label className="block text-[11px] mb-2 uppercase font-bold text-[#666]">Thread Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full border rounded-xl p-4 outline-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
        </div>
        <div className="mb-8">
          <label className="block text-[11px] mb-2 uppercase font-bold text-[#666]">Main Objective</label>
          <textarea rows="4" value={desc} onChange={(e) => setDesc(e.target.value)} className={`w-full border rounded-xl p-4 outline-none resize-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-[#3b82f6]' : 'bg-slate-50 border-slate-200 text-slate-800'}`}></textarea>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-4 rounded-xl font-bold border border-[#1a1a1a]" onClick={onClose}>Cancel</button>
          <button className="flex-[2] bg-[#3b82f6] text-white py-4 rounded-xl font-bold hover:bg-blue-600 shadow-lg" onClick={() => onSubmit({ title, description: desc })}>Update Thread</button>
        </div>
      </div>
    </div>
  );
};

export default Threads;