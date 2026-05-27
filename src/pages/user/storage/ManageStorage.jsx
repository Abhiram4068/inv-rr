import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getStorageFiles, permanentDeleteFiles } from "../../../services/storageService";
import { sizeFormatter } from '../../../utils/sizeFormatter';

const ManageStorage = () => {
  // --- THEME STATE SYNC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
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

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await getStorageFiles({
        filter_type: 'category',
        category: 'All',
        search: searchQuery,
        sort_by: '-size',
        page: page,
        page_size: 10
      });
      setFiles(response.data.results || []);
      const total = response.data.count || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / 10) || 1);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [searchQuery, page]);

  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFile) return;
    try {
      await permanentDeleteFiles([selectedFile.id]);
      setDeleteModalOpen(false);
      setSelectedFile(null);
      // refetch
      if (files.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchFiles();
      }
      // Assuming a toast event or similar is used elsewhere for success
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const getIconForContentType = (contentType) => {
    if (!contentType) return "fa-file";
    if (contentType.includes("image")) return "fa-file-image";
    if (contentType.includes("video")) return "fa-file-video";
    if (contentType.includes("pdf")) return "fa-file-pdf";
    if (contentType.includes("word")) return "fa-file-word";
    if (contentType.includes("zip") || contentType.includes("tar") || contentType.includes("rar")) return "fa-file-zipper";
    if (contentType.includes("excel") || contentType.includes("spreadsheet") || contentType.includes("csv")) return "fa-database";
    return "fa-file-lines";
  };

  return (
    <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()} 
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-[#111]' : 'hover:bg-white shadow-sm'}`}
        >
          <i className={`fa-solid fa-arrow-left text-sm ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
        </button>
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link to="/dashboard" className={`${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>Home</Link>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <Link to="/storage-management" className={`${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-blue-600'}`}>Storage Management</Link>
          <i className={`fa-solid fa-chevron-right text-[10px] ${isDark ? 'text-[#333]' : 'text-slate-300'}`}></i>
          <span className={isDark ? 'text-white' : 'text-slate-800'}>Cleanup Recommendations</span>
        </nav>
      </div>

      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cleanup Recommendations</h1>
          <p className={`text-sm mt-1 font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Reviewing {totalItems} files that are consuming significant space</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className={`flex-1 md:w-[300px] p-[10px_16px] rounded-xl flex items-center border transition-all ${
            isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none ml-3 w-full outline-none text-sm font-medium" 
            />
          </div>
        </div>
      </div>

      {/* Content Area - Data Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-[#808080] border-[#1a1a1a]' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                <th className="p-6 font-bold">File Name</th>
                <th className="p-6 font-bold">Size</th>
                <th className="p-6 font-bold">Added</th>
                <th className="p-6 font-bold text-center">View</th>
                <th className="p-6 font-bold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#111]' : 'divide-slate-100'}`}>
              {isLoading ? (
                <tr><td colSpan="5" className="p-10 text-center"><i className="fa-solid fa-spinner fa-spin text-blue-500 text-2xl"></i></td></tr>
              ) : files.map((file) => (
                <tr key={file.id} className={`group transition-all duration-200 ${isDark ? 'hover:bg-[#111]' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-[#111] group-hover:bg-[#1a1a1a]' : 'bg-slate-100'}`}>
                        <i className={`fa-solid ${getIconForContentType(file.content_type)} text-base text-blue-500`}></i>
                      </div>
                      <span className={`font-bold truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-700'}`}>{file.original_name}</span>
                    </div>
                  </td>
                  <td className={`p-4 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{sizeFormatter(file.file_size)}</td>
                  <td className={`p-4 text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>{new Date(file.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-center">
                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-[#111] text-[#808080] hover:text-white hover:bg-[#1a1a1a]' : 'bg-slate-100 text-slate-400 hover:text-blue-600 hover:bg-slate-200'}`}>
                      <i className="fa-solid fa-eye text-xs"></i>
                    </button>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button 
                      onClick={() => handleDeleteClick(file)}
                      className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!isLoading && files.length === 0 && (
            <div className="py-20 text-center">
              <i className={`fa-solid fa-broom text-4xl mb-4 ${isDark ? 'text-[#333]' : 'text-slate-100'}`}></i>
              <p className={`text-sm font-medium ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>No files found to clean up.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          Showing {files.length} of {totalItems} recommended actions
        </p>
        <div className="flex gap-6 items-center">
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={`px-5 py-2.5 text-[10px] uppercase tracking-widest rounded-lg border transition-all font-bold shadow-sm ${
              isDark ? 'text-white border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111] disabled:opacity-50' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 disabled:opacity-50'
            }`}>
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={`px-5 py-2.5 text-[10px] uppercase tracking-widest rounded-lg border transition-all font-bold shadow-sm ${
              isDark ? 'text-white border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111] disabled:opacity-50' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 disabled:opacity-50'
            }`}>
              Next Page
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className={`p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-trash-can text-xl"></i>
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Permanently Delete?</h3>
            <p className={`text-sm mb-8 leading-relaxed font-medium ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
              You are about to permanently delete <span className={isDark ? 'text-white' : 'text-slate-800'}>{selectedFile?.original_name}</span>. This will free up {sizeFormatter(selectedFile?.file_size)} of storage.
            </p>
            <div className="flex gap-3">
              <button 
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-colors ${isDark ? 'bg-[#1a1a1a] text-white hover:bg-[#222]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Informative message */}
      <div className={`p-4 rounded-xl text-xs font-bold ${isDark ? ' text-[#808080]' : 'text-blue-600'} flex items-center justify-center gap-2 mt-4`}>
        <i className="fa-solid fa-circle-info"></i> Files deleted from this page are permanently removed and will not go to the trash.
      </div>
    </main>
  );
};

export default ManageStorage;