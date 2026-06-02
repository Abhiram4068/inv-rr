import React, { useEffect, useMemo, useRef, useState } from 'react';
import FileCard from '../../components/FileCard';
import { Link } from "react-router-dom";
import { getStarredFiles } from '../../services/fileService';

const StarredFiles = () => {
  // 1. Theme State Sync
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'light');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';

  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Toast State ──────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', animateOut: false });

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type, animateOut: false });
  };

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => {
      setToast(prev => ({ ...prev, animateOut: true }));
      setTimeout(() => setToast({ visible: false, message: '', type: 'success', animateOut: false }), 350);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  const sizeFormatter = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "-";
      if (trimmed.includes("MB") || trimmed.includes("KB") || trimmed.includes("GB")) return trimmed;
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return sizeFormatter(parsed);
      return trimmed;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) return "-";

    const mb = value / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = value / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const timeFormatter = (isoOrDate) => {
    if (!isoOrDate) return "-";
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);

    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const iconClassForFile = (file) => {
    const name = file?.original_name || "";
    const ct = file?.content_type || "";
    const lower = String(name).toLowerCase();

    if (lower.endsWith(".pdf") || String(ct).includes("pdf")) return "fa-file-pdf";
    if ((lower.endsWith(".doc") || lower.endsWith(".docx")) || String(ct).includes("word")) return "fa-file-word";
    if ((lower.endsWith(".xls") || lower.endsWith(".xlsx")) || String(ct).includes("excel")) return "fa-file-excel";
    if ((lower.endsWith(".ppt") || lower.endsWith(".pptx")) || String(ct).includes("powerpoint")) return "fa-file-powerpoint";
    if ((lower.endsWith(".zip") || lower.endsWith(".rar")) || String(ct).includes("zip")) return "fa-file-zipper";
    if (/\.(png|jpe?g|gif|webp)$/.test(lower) || String(ct).includes("image")) return "fa-file-image";
    if (/\.(mp4|mov|mkv|webm)$/.test(lower) || String(ct).includes("video")) return "fa-file-video";
    if (lower.endsWith(".txt") || String(ct).includes("text")) return "fa-file-lines";
    return "fa-file";
  };

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getStarredFiles();
        const data = res.data;

        const results = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.items)
              ? data.items
              : [];

        if (isCancelled) return;
        setAllFiles(results);
      } catch (err) {
        if (isCancelled) return;
        setError(err?.response?.data?.detail || "Failed to load files.");
        setAllFiles([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, []);

  // ── Client-side Filter & Pagination ──
  const filteredFiles = useMemo(() => {
    if (!search.trim()) return allFiles;
    const query = search.toLowerCase().trim();
    return allFiles.filter(file => {
      const originalName = String(file?.original_name || "").toLowerCase();
      const displayName = String(file?.display_name || "").toLowerCase();
      const description = String(file?.description || "").toLowerCase();
      return originalName.includes(query) || displayName.includes(query) || description.includes(query);
    });
  }, [allFiles, search]);

  const count = filteredFiles.length;
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const hasNext = page < totalPages;

  const filesToDisplay = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    return filteredFiles.slice(startIdx, endIdx);
  }, [filteredFiles, page]);

  const pageNumbers = useMemo(() => {
    const total = totalPages || 1;
    const start = Math.max(1, page - 1);
    const end = Math.min(total, page + 1);
    const arr = [];
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);

  // Adjust page number if items are deleted and page becomes out-of-bounds
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#EFEFEF]'}`}>
      {/* Professional Top-Sliding Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 left-0 right-0 flex justify-center z-[10000] pointer-events-none transition-all duration-[350ms]
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

      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className={`w-full max-w-[450px] border p-[10px_16px] rounded-xl flex items-center transition-colors shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
          <input
            type="text"
            placeholder="Search Your Files..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
          />
        </div>
        <Link to="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl no-underline font-semibold text-sm transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg  ">
          <i className="fa-solid fa-plus"></i> New Document
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className={`text-[18px] md:text-[20px] font-semibold transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>All Starred Files</div>
        <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm font-medium`}>
          {count > 0 ? `${count} item(s)` : "0 items"}
        </div>
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <div className={`text-sm font-bold ${isDark ? "text-[#ff6b6b]" : "text-red-600"}`}>{error}</div>
        </div>
      ) : filesToDisplay.length === 0 ? (
        <div className="py-16 text-center">
          <div className={`text-sm font-bold ${isDark ? "text-[#808080]" : "text-slate-500"}`}>No starred files found.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          {filesToDisplay.map((file) => (
            <FileCard
              key={file.id}
              id={file.id}
              title={file.original_name || file.description || "Untitled"}
              display_name={file.display_name || file.description || "Untitled"}
              originalName={file.original_name}
              size={sizeFormatter(file.file_size)}
              time={timeFormatter(file.created_at)}
              iconClass={iconClassForFile(file)}
              fileUrl={file.file_url}
              isLink={true}
              contentType={file.content_type}
              isStarred={true}
              onToggleStar={(fileId, newState) => {
                if (!newState) {
                  setAllFiles(prev => prev.filter(f => f.id !== fileId));
                  showToast("Removed from Starred");
                }
              }}
              onDeleted={(fileId) => {
                setAllFiles(prev => prev.filter(f => f.id !== fileId));
                showToast("File moved to trash");
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 py-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={`border w-10 h-10 rounded-lg flex items-center justify-center transition-all ${page === 1 || loading
                ? isDark
                  ? "bg-[#0a0a0a] border-[#1a1a1a] text-[#444] cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-300 cursor-not-allowed"
                : isDark
                  ? "bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            <i className="fa fa-chevron-left text-xs" />
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              disabled={loading}
              className={`w-10 h-10 rounded-lg font-semibold border transition-all ${p === page
                  ? isDark
                    ? "bg-[#0a0a0a] border-[#3b82f6] text-[#3b82f6]"
                    : "bg-blue-600 border-blue-600 text-white"
                  : isDark
                    ? "bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className={`border w-10 h-10 rounded-lg flex items-center justify-center transition-all ${!hasNext || loading
                ? isDark
                  ? "bg-[#0a0a0a] border-[#1a1a1a] text-[#444] cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-300 cursor-not-allowed"
                : isDark
                  ? "bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            <i className="fa fa-chevron-right text-xs" />
          </button>
        </div>
      )}

      {/* Mobile Storage Warning */}
      <div className="lg:hidden mt-8 space-y-4">
        <div className={`border rounded-xl p-5 transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Storage Status</div>
          <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-[#222]' : 'bg-slate-100'}`}>
            <div className="w-[93%] h-full bg-[#ff4444]"></div>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>14.08 GB of 15 GB used (93%)</p>
        </div>
      </div>
    </main>
  );
};

export default StarredFiles;