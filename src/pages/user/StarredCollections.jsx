import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { getStarredCollection, updateCollection } from '../../services/collectionService';
import { useViewMode } from '../../hooks/useViewMode';
import ViewModeToggle from '../../components/ViewModeToggle';

const StarredCollections = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [viewMode, handleViewModeChange] = useViewMode('collection');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'light');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => { window.removeEventListener('storage', handleStorageChange); clearInterval(interval); };
  }, [theme]);

  const isDark = theme === 'dark';

  const showToast = (msg, type = 'success') =>
    setToast({ visible: true, message: msg, type, animateOut: false });

  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(() => {
      setToast(p => ({ ...p, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, 3500);
    return () => clearTimeout(t);
  }, [toast.visible]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getStarredCollection();
      let data = Array.isArray(res.data) ? res.data : (res.data?.collections ?? []);

      // client-side search
      if (search.trim()) {
        data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
      }

      // client-side sort
      data = [...data].sort((a, b) => {
        let av = a[sortBy] ?? 0;
        let bv = b[sortBy] ?? 0;
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return sortOrder === 'asc' ? -1 : 1;
        if (av > bv) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setCollections(data);
    } catch (err) {
      setError("Failed to fetch starred collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, [search, sortBy, sortOrder]);

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  };

  const handleUnstar = async (e, collection) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateCollection(collection.id, { is_starred: false });
      setCollections(prev => prev.filter(c => c.id !== collection.id));
      showToast(`"${collection.name}" removed from starred`);
    } catch {
      showToast("Failed to unstar collection", "error");
    }
  };

  return (
    <div className={`flex-1 min-w-0 overflow-y-auto no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'}`}>

      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none transition-all duration-[350ms]
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

      <div className="p-6 lg:p-[24px_40px]">

        {/* Header row */}
        <div className="flex justify-between items-center mb-[30px] gap-4">
          <div className={`flex-1 max-w-[450px] border px-4 py-[10px] rounded-[12px] flex items-center shadow-sm transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search Starred Collections"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
            />
          </div>
          <div className="flex items-center gap-3">
            <ViewModeToggle viewMode={viewMode} onChange={handleViewModeChange} isDark={isDark} />
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-[10px] rounded-[10px] border text-sm font-semibold transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <i className="fa-solid fa-arrow-left text-xs" /> Back
            </button>
          </div>
        </div>

        {/* Page title */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className={`text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Starred Collections</div>
            <div className={`text-xs mt-0.5 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Collections you've starred for quick access</div>
          </div>
          <div className={`text-sm ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>{collections.length} collection(s)</div>
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {[
            { label: "Date Created", value: "created_at" },
            { label: "Name", value: "name" },
            { label: "Size", value: "total_size" },
            { label: "Files", value: "total_files" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                if (sortBy === opt.value) setSortOrder(o => o === "asc" ? "desc" : "asc");
                else { setSortBy(opt.value); setSortOrder("desc"); }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${sortBy === opt.value
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                : isDark
                  ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:text-white hover:border-[#333]'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'}`}
            >
              {opt.label}
              {sortBy === opt.value && (
                <i className={`fa-solid fa-arrow-${sortOrder === "asc" ? "up" : "down"} text-[10px]`} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <div className={`text-sm font-bold ${isDark ? "text-[#ff6b6b]" : "text-red-600"}`}>{error}</div>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[#111]' : 'bg-white shadow-sm'}`}>
              <i className={`fa-solid text-3xl opacity-50 ${search ? 'fa-magnifying-glass text-blue-400' : 'fa-star text-yellow-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {search ? 'No results found' : 'No starred collections'}
            </h3>
            <p className={`text-sm max-w-xs mb-8 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
              {search
                ? `No collections matched "${search}".`
                : 'Star collections to find them here quickly.'}
            </p>
            {!search && (
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 text-blue-400 px-5 py-2.5 text-sm font-semibold hover:underline"
              >
                <i className="fa-solid fa-layer-group" /> Browse Collections
              </Link>
            )}
          </div>
        ) : viewMode === 'collection_grid' ? (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {collections.map(folder => (
              <Link
                key={folder.id}
                to={`/viewcollection/${folder.id}`}
                className={`border p-4 rounded-[11px] flex items-center gap-4 transition-all group relative ${isDark
                  ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:bg-[#111] hover:border-[#333]'
                  : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'}`}
              >
                <i className="fa-solid fa-folder text-2xl text-[#3b82f6]" />
                <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                  <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {folder.name}
                  </span>
                  <span className={`text-[11px] mt-[2px] ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
                    {folder.total_files} files • {folder.total_size ? formatSize(folder.total_size) : "0 B"}
                  </span>
                </div>
                {/* Unstar button */}
                <button
                  onClick={e => handleUnstar(e, folder)}
                  title="Remove from starred"
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isDark
                    ? 'hover:bg-yellow-500/10 text-yellow-400'
                    : 'hover:bg-yellow-50 text-yellow-500'}`}
                >
                  <i className="fa-solid fa-star text-sm" />
                </button>
              </Link>
            ))}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div
            className={`rounded-lg overflow-hidden shadow-2xl mb-10 border ${isDark ? 'border-neutral-900 bg-[#050505]' : 'border-slate-200 bg-white'}`}
            style={{ contain: 'paint', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
          >
            {/* Table top bar */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Starred Collections</h3>
                <p className={`text-[10px] font-bold mt-0.5 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                  {collections.length} collection(s)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse ${isDark ? 'bg-[#050505]' : 'bg-white'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-neutral-900 bg-[#080808]/70 text-neutral-500' : 'border-slate-100 bg-slate-50/50 text-slate-400'} text-[10px] uppercase tracking-[0.15em]`}>
                    <th className="px-6 py-4 font-bold">Name</th>
                    <th className="px-6 py-4 font-bold">Size</th>
                    <th className="px-6 py-4 font-bold">Total Files</th>
                    <th className="px-6 py-4 font-bold">Created At</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${isDark ? 'divide-neutral-900 text-white' : 'divide-slate-100 text-slate-700'}`}>
                  {collections.map(folder => (
                    <tr key={folder.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-5">
                        <Link to={`/viewcollection/${folder.id}`} className="flex items-center gap-3 no-underline">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-neutral-900' : 'bg-slate-100'}`}>
                            <i className="fa-solid fa-folder text-base text-[#3b82f6]" />
                          </div>
                          <span className={`font-bold truncate max-w-[200px] ${isDark ? 'text-white hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>
                            {folder.name}
                          </span>
                        </Link>
                      </td>
                      <td className={`px-6 py-5 text-sm font-medium whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {folder.total_size ? formatSize(folder.total_size) : "0 B"}
                      </td>
                      <td className={`px-6 py-5 text-sm whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {folder.total_files}
                      </td>
                      <td className={`px-6 py-5 text-sm whitespace-nowrap ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={e => handleUnstar(e, folder)}
                          title="Remove from starred"
                          className={`p-2 rounded-lg transition-colors text-yellow-400 ${isDark ? 'hover:bg-yellow-500/10' : 'hover:bg-yellow-50'}`}
                        >
                          <i className="fa-solid fa-star text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StarredCollections;