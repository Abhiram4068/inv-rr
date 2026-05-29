import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from "react-router-dom";
import FileCard from '../../components/FileCard';
import ShareModal from '../../components/ShareModal';
import { getFiles, updateFile } from '../../services/fileService';
import { useViewMode } from '../../hooks/useViewMode';
import ViewModeToggle from '../../components/ViewModeToggle';

const PaginatedFiles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, handleViewModeChange] = useViewMode('file');
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



  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(null);
  const [hasNext, setHasNext] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounceRef = useRef(null);

  // ── Selection State ──────────────────────────────────────────
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [confirmAction, setConfirmAction] = useState({ visible: false, type: '', count: 0 });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  // Reset selections when turning off select mode or changing pages/searching
  useEffect(() => {
    setSelectedFileIds([]);
  }, [isSelectMode, page, search]);

  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast.message, location.state.toast.type);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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


  const getReadableFileType = (file) => {
    const ct = String(file?.content_type || "").toLowerCase();
    const name = String(file?.original_name || "").toLowerCase();

    if (ct.includes("pdf") || name.endsWith(".pdf")) return "PDF";

    if (
      ct.includes("presentation") ||
      ct.includes("powerpoint") ||
      name.endsWith(".ppt") ||
      name.endsWith(".pptx")
    ) return "PowerPoint";

    if (
      ct.includes("word") ||
      ct.includes("wordprocessingml") ||
      name.endsWith(".doc") ||
      name.endsWith(".docx")
    ) return "Word";

    if (
      ct.includes("excel") ||
      ct.includes("spreadsheet") ||
      name.endsWith(".xls") ||
      name.endsWith(".xlsx")
    ) return "Excel";

    if (ct.includes("image")) return "Image";
    if (ct.includes("video")) return "Video";
    if (ct.includes("zip")) return "Archive";

    return "File";
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

  const pageNumbers = useMemo(() => {
    if (count === null) return [page - 1, page, page + 1].filter((p) => p >= 1);
    const pageSizeFallback = 12;
    const totalPages = Math.max(1, Math.ceil(count / pageSizeFallback));
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);
    const arr = [];
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [count, page]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getFiles(page, search);
        const data = res.data;
        const results = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.items)
              ? data.items
              : [];

        if (isCancelled) return;
        setFiles(results);
        setCount(data?.count ?? null);
        setHasNext(Boolean(data?.next));
      } catch (err) {
        if (isCancelled) return;
        setError(err?.response?.data?.detail || "Failed to load files.");
        setFiles([]);
        setCount(null);
        setHasNext(false);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();
    return () => {
      isCancelled = true;
    };
  }, [page, search]);

  const handleToggleStar = async (fileId, newState) => {
    // Optimistic update
    setFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, is_starred: newState } : f)
    );
    try {
      await updateFile(fileId, { is_starred: newState });
      showToast(newState ? 'Added to starred' : 'Removed from starred');
    } catch (err) {
      // Revert on failure
      setFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, is_starred: !newState } : f)
      );
      showToast('Failed to update starred status', 'error');
    }
  };
  const handleFileDeleted = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    showToast("File moved to trash");
  };

  // ── Handlers for Selection Changes ───────────────────────────
  const handleSelectCardChange = (fileId, isChecked) => {
    if (isChecked) {
      setSelectedFileIds(prev => [...prev, fileId]);
      setIsSelectMode(true);
    } else {
      const newSelection = selectedFileIds.filter(id => id !== fileId);
      setSelectedFileIds(newSelection);
      if (newSelection.length === 0) {
        setIsSelectMode(false);
      }
    }
  };

  const handleSelectAllToggle = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(f => f.id));
    }
  };

  // ── Batch Action Handlers ───────────────────────────
  const handleDeleteSelected = () => {
    if (selectedFileIds.length === 0) return;
    setConfirmAction({ visible: true, type: 'delete', count: selectedFileIds.length });
  };

  const handleArchiveSelected = () => {
    if (selectedFileIds.length === 0) return;
    setConfirmAction({ visible: true, type: 'archive', count: selectedFileIds.length });
  };

  const handleShareSelected = () => {
    if (selectedFileIds.length === 0) return;
    setIsShareModalOpen(true);
  };

  const executeBulkAction = async () => {
    const { type, count, singleFileId } = confirmAction;
    setConfirmAction({ ...confirmAction, visible: false });

    const idsToAction = singleFileId ? [singleFileId] : selectedFileIds;

    try {
      const { bulkDeleteFiles, bulkArchiveFiles } = await import('../../services/fileService');
      if (type === 'delete') {
        await bulkDeleteFiles(idsToAction);
        showToast(`${count} item(s) moved to trash`);
      } else {
        await bulkArchiveFiles(idsToAction);
        showToast(`${count} item(s) archived successfully`);
      }

      setFiles(prev => prev.filter(f => !idsToAction.includes(f.id)));
      if (!singleFileId) {
        setSelectedFileIds([]);
        setIsSelectMode(false);
      }
    } catch (err) {
      showToast(err?.response?.data?.error || `Failed to ${type} files`, "error");
    }
  };

  // ── Icon color per file type ──────────────────────────────────
  const iconColorForClass = (iconClass) => {
    if (iconClass === 'fa-file-pdf') return 'text-red-400';
    if (iconClass === 'fa-file-word') return 'text-blue-400';
    if (iconClass === 'fa-file-excel') return 'text-emerald-400';
    if (iconClass === 'fa-file-powerpoint') return 'text-orange-400';
    if (iconClass === 'fa-file-image') return 'text-purple-400';
    if (iconClass === 'fa-file-video') return 'text-pink-400';
    if (iconClass === 'fa-file-zipper') return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#EFEFEF]'}`}>

      {/* Professional Top-Sliding Toast */}
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

      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
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
        <div className="flex items-center gap-3 w-full md:w-auto">

          {/* View Mode Toggle */}
          <div className={`flex items-center rounded-xl border overflow-hidden flex-shrink-0 ${isDark ? 'border-[#1a1a1a] bg-[#0a0a0a]' : 'border-slate-200 bg-white'}`}>
        <ViewModeToggle viewMode={viewMode} onChange={handleViewModeChange} isDark={isDark} />
          </div>

          {/* Select Button */}
          <button
            type="button"
            disabled={files.length === 0}
            onClick={() => setIsSelectMode(!isSelectMode)}
            className={`w-full md:w-auto p-[10px_20px] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border disabled:opacity-40 disabled:cursor-not-allowed
              ${isSelectMode
                ? 'bg-blue-600/10 border-blue-500 text-blue-500'
                : isDark
                  ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <i className={`fa-regular ${isSelectMode ? 'fa-square-minus' : 'fa-square-check'}`}></i>
            {isSelectMode ? 'Cancel Selection' : 'Select Files'}
          </button>

          <Link to="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl no-underline font-semibold text-sm transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg   whitespace-nowrap">
            <i className="fa-solid fa-plus"></i> New Document
          </Link>
        </div>
      </div>

      {/* ── Selection Action Sub-Bar ── */}
      {(isSelectMode || selectedFileIds.length > 0) && files.length > 0 && (
        <div className={`p-4 mb-6 rounded-xl flex flex-wrap justify-between items-center gap-4 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium select-none">
              <input
                type="checkbox"
                checked={files.length > 0 && selectedFileIds.length === files.length}
                onChange={handleSelectAllToggle}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Select All on Page</span>
            </label>
            <div className={`h-4 w-px ${isDark ? 'bg-[#222]' : 'bg-slate-200'}`} />
            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              {selectedFileIds.length} selected
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleArchiveSelected}
              disabled={selectedFileIds.length === 0}
              className={`p-[8px_16px] rounded-lg font-bold text-xs border transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-[#111] border-[#222] text-slate-300 hover:bg-[#161616]'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-solid fa-box-archive mr-1.5" /> Archive Selected
            </button>
            <button
              onClick={handleShareSelected}
              disabled={selectedFileIds.length === 0}
              className={`p-[8px_16px] rounded-lg font-bold text-xs border transition-all disabled:opacity-40 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-[#111] border-[#222] text-slate-300 hover:bg-[#161616]'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-solid fa-share-nodes mr-1.5" /> Share Selected
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedFileIds.length === 0}
              className="p-[8px_16px] bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <i className="fa-regular fa-trash-can" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className={`text-[18px] md:text-[20px] font-semibold transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>My Files</div>
        <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm`}>{files.length} item(s)</div>
      </div>

      {/* File Grid / List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <div className={`text-sm font-bold ${isDark ? "text-[#ff6b6b]" : "text-red-600"}`}>{error}</div>
        </div>
) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[#111]' : 'bg-white shadow-sm'}`}>
            <i className={`fa-solid text-3xl opacity-50 ${search ? 'fa-magnifying-glass text-blue-400' : 'fa-folder-open text-gray-400'}`}></i>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {search ? 'No results found' : 'No Files Added Yet'}
          </h3>
          <p className={`text-sm max-w-xs mb-8 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
            {search
              ? <>No files match <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>"{search}"</span>. Try a different keyword.</>
              : 'Your workspace is empty.'
            }
          </p>
          {search ? (
            <button
              onClick={() => setSearchInput('')}
              className="text-[#3b82f6] border border-[#3b82f6]/30 px-6 py-2 rounded-lg font-medium hover:bg-[#3b82f6] hover:text-white transition-all text-sm"
            >
              <i className="fa-solid fa-xmark mr-2"></i> Clear Search
            </button>
          ) : (
            <Link
              to="/upload-file"
              className="text-[#3b82f6] border border-[#3b82f6]/30 px-6 py-2 rounded-lg font-medium hover:bg-[#3b82f6] hover:text-white transition-all text-sm no-underline"
            >
              <i className="fa-solid fa-plus mr-2"></i> Upload Files
            </Link>
          )}
        </div>
      ) : viewMode === 'file_grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          {files.map((file) => (
            <FileCard
              key={file.id}
              id={file.id}
              title={file.original_name}
              display_name={file.display_name || file.description || "Untitled"}
              originalName={file.original_name}
              size={sizeFormatter(file.file_size)}
              time={timeFormatter(file.created_at)}
              iconClass={iconClassForFile(file)}
              isLink={!isSelectMode && selectedFileIds.length === 0}
              fileUrl={file.file_url}
              contentType={file.content_type}
              isStarred={file.is_starred}
              onToggleStar={handleToggleStar}
              onDeleted={handleFileDeleted}
              showSelection={isSelectMode || selectedFileIds.length > 0}
              isSelected={selectedFileIds.includes(file.id)}
              onSelectChange={handleSelectCardChange}
            />
          ))}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div
          className={`rounded-lg overflow-hidden shadow-2xl mb-10 border
    ${isDark
              ? 'border-neutral-900 bg-[#050505]'
              : 'border-slate-200 bg-white'}
  `}
          style={{
            contain: 'paint',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        >

          {/* Table top bar */}
          <div className={`px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>My Files</h3>
              <p className={`text-[10px] font-bold mt-0.5 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                {files.length} item(s) on this page
              </p>
            </div>
            {(isSelectMode || selectedFileIds.length > 0) && (
              <div className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                {selectedFileIds.length} selected
              </div>
            )}
          </div>

         <div className="overflow-x-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#1a1a1a transparent' : '#e2e8f0 transparent',
          }}>
            <table
              className={`w-full text-left border-collapse ${isDark ? 'bg-[#050505]' : 'bg-white'
                }`}
            >
              <thead>
                <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]/70' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                  {(isSelectMode || selectedFileIds.length > 0) && (
                    <th className="py-4 pl-6 w-10">
                      <input
                        type="checkbox"
                        checked={files.length > 0 && selectedFileIds.length === files.length}
                        onChange={handleSelectAllToggle}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className={`py-4 font-bold ${(isSelectMode || selectedFileIds.length > 0) ? '' : 'pl-6'}`}>File Name</th>
                  <th className="py-4 font-bold">Type</th>
                  <th className="py-4 font-bold">Size</th>
                  <th className="py-4 font-bold">Uploaded</th>
                  <th className="py-4 pr-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
                {files.map((file) => {
                  const iconClass = iconClassForFile(file);
                  const isSelected = selectedFileIds.includes(file.id);
                  const showSel = isSelectMode || selectedFileIds.length > 0;
                  return (
                    <tr
                      key={file.id}
                      onClick={() => {
                        if (showSel) {
                          handleSelectCardChange(file.id, !isSelected);
                        } else {
                          navigate(`/file/${file.id}`);
                        }
                      }}
                      className={`group transition-colors ${showSel ? 'cursor-pointer' : 'cursor-default'}
                        ${isDark
                          ? isSelected ? 'bg-blue-500/5' : 'hover:bg-neutral-900/40'
                          : isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      {/* Checkbox col */}
                      {showSel && (
                        <td className="py-5 pl-6  pr-3 w-16" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => handleSelectCardChange(file.id, e.target.checked)}
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Name col */}
                      <td className={`py-5 text-sm ${showSel ? '' : 'pl-6'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-neutral-900' : 'bg-slate-100'}`}>
                            <i className={`fa-solid ${iconClass} text-base ${iconColorForClass(iconClass)}`} />
                          </div>
                          <div className="min-w-0">
                            {!showSel && file.file_url ? (
                              <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="no-underline"
                                onClick={e => e.stopPropagation()}
                              >
                                <span className={`font-bold block truncate w-[180px] leading-tight ${isDark ? 'text-white hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'} transition-colors`} title={file.display_name || file.original_name}>
                                  {file.original_name || file.description || "Untitled"}
                                </span>
                              </a>
                            ) : (
                              <span className={`font-bold block truncate w-[180px] leading-tight ${isDark ? 'text-white' : 'text-slate-700'}`} title={file.display_name || file.original_name}>
                                {file.original_name || file.description || "Untitled"}
                              </span>
                            )}
                            <span className={`text-[11px] truncate block mt-0.5 w-[180px] ${isDark ? 'text-neutral-600' : 'text-slate-400'}`} title={file.original_name}>
                              {file.display_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type col */}
                      <td className="py-5 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5  text-[10px] font-bold ${isDark ? 'text-neutral-400' : ' text-slate-500'}`}>
                          {getReadableFileType(file)}
                        </span>
                      </td>

                      {/* Size col */}
                      <td className={`py-5 text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {sizeFormatter(file.file_size)}
                      </td>

                      {/* Time col */}
                      <td className={`py-5 text-sm ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {timeFormatter(file.created_at)}
                      </td>

                      {/* Actions col */}
                      <td className="py-5 pr-6 text-sm text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleStar(file.id, !file.is_starred)}
                            title={file.is_starred ? 'Unstar' : 'Star'}
                            className={`p-2 rounded-lg transition-colors
                            ${file.is_starred
                                ? 'text-yellow-400'
                                : isDark ? 'text-neutral-600 hover:text-yellow-400 hover:bg-neutral-800' : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-100'}`}
                          >
                            <i className={`fa-${file.is_starred ? 'solid' : 'regular'} fa-star text-sm`} />
                          </button>
                          {!showSel && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFileIds([file.id]);
                                setIsShareModalOpen(true);
                              }}
                              title="Share"
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-600 hover:text-blue-400 hover:bg-neutral-800' : 'text-slate-300 hover:text-blue-500 hover:bg-slate-100'}`}
                            >
                              <i className="fa-solid fa-share-nodes text-sm" />
                            </button>
                          )}
                          {!showSel && (
                            <button
                              type="button"
                              onClick={() => setConfirmAction({ visible: true, type: 'delete', count: 1, singleFileId: file.id })}
                              title="Delete"
                              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-600 hover:text-red-400 hover:bg-neutral-800' : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'}`}
                            >
                              <i className="fa-regular fa-trash-can text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination component */}
      {files.length > 0 && (
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

      {/* ── Confirmation Modal ── */}
      {confirmAction.visible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-[400px] rounded-2xl p-6 shadow-2xl scale-in-center ${isDark ? 'bg-[#0d0d0d] border border-[#1e1e1e]' : 'bg-white border border-slate-100'}`}
            style={{ animation: 'modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 
              ${confirmAction.type === 'delete'
                ? (isDark ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600')
                : (isDark ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-50 text-blue-600')}`}>
              <i className={`fa-solid text-xl ${confirmAction.type === 'delete' ? 'fa-trash-can' : 'fa-box-archive'}`} />
            </div>

            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {confirmAction.type === 'delete' ? 'Move to Trash?' : 'Archive Files?'}
            </h3>
            <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Are you sure you want to {confirmAction.type} {confirmAction.count} selected item(s)?
              {confirmAction.type === 'delete' && " These files will be moved to your recently deleted folder."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction({ ...confirmAction, visible: false })}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${isDark ? 'bg-[#1a1a1a] text-slate-300 hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={executeBulkAction}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg
                  ${confirmAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    : 'bg-blue-600 hover:bg-blue-700  '}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes modalScale {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileIds={selectedFileIds}
        isBulk={true}
        isDark={isDark}
        onShareSuccess={(message) => {
          setSelectedFileIds([]);
          setIsSelectMode(false);

          setTimeout(() => {
            showToast(message, "success");
          }, 150);
        }}
      />

    </main>
  );
};

export default PaginatedFiles;