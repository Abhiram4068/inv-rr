import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/adminservice/userservice';

const RECORDS_PER_PAGE = 12;

const BlockedUsers = () => {
    const navigate = useNavigate();
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Modal Architecture State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'unblock'
        targetUser: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBlockedUsers(currentPage, searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchBlockedUsers = async (page, search) => {
        try {
            setLoading(true);
            const data = await userService.getBlockedUsers({ page, search });
            setBlockedUsers(data.results || []);
            setTotalCount(data.count || 0);
        } catch (error) {
            console.error("Failed to fetch blocked users", error);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const openModal = (type, user) => {
        setModalConfig({
            isOpen: true,
            type,
            targetUser: user
        });
    };

    const closeModal = () => {
        if (!isActionLoading) {
            setModalConfig({ isOpen: false, type: null, targetUser: null });
        }
    };

    const handleConfirmAction = async () => {
        setIsActionLoading(true);
        const { type, targetUser } = modalConfig;

        try {
            if (type === 'unblock') {
                await userService.unblockUser(targetUser.id);
                setBlockedUsers(prev => prev.filter(user => user.id !== targetUser.id));
                setTotalCount(prev => prev - 1);
            }
            closeModal();
            window.dispatchEvent(new Event('admin:counts:refresh'));
        } catch (error) {
            console.error(`Operation failure:`, error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / RECORDS_PER_PAGE);

    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left = currentPage - delta;
        const right = currentPage + delta;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                pages.push(i);
            }
        }

        const withEllipsis = [];
        let prev = null;
        for (const page of pages) {
            if (prev && page - prev > 1) withEllipsis.push('...');
            withEllipsis.push(page);
            prev = page;
        }
        return withEllipsis;
    };

    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans relative">
            <div className="max-w-7xl mx-auto">

                {/* Header Context Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Restricted Accounts</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Manage restricted user accounts and restore access when needed.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search blocked name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Primary Data Table Box */}
                <div className="bg-white rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">Blocked Personnel</th>
                                    <th className="py-4 px-6">System Designation</th>
                                    <th className="py-4 px-6">Storage Metrics</th>
                                    <th className="py-4 px-6">Date Joined</th>
                                    <th className="py-4 px-6 text-right">Emergency Pipeline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : blockedUsers.length > 0 ? (
                                    blockedUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                                                        {user.first_name} {user.last_name}
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block" title="Frozen Account Status" />
                                                    </span>
                                                    <span className="text-xs text-slate-400 mt-0.5">{user.email}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-slate-600 font-medium capitalize">
                                                {user.designation?.replace('_', ' ')}
                                            </td>

                                            <td className="py-4 px-6 text-slate-500 font-normal">
                                                <div className="flex flex-col text-xs">
                                                    <span className="text-slate-700 font-semibold">{formatBytes(user.storage_used_bytes)} Space</span>
                                                    <span className="text-slate-400 mt-0.5">{user.total_files_uploaded} active objects</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-slate-500 font-normal">
                                                {new Date(user.date_joined).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/user/detail/${user.id}/`)}
                                                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-sm text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider shadow-sm"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('unblock', user)}
                                                        className="px-2.5 py-1.5 border border-emerald-200 rounded-sm bg-white text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Unblock
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                                            <i className="fa-solid fa-user-shield text-3xl mb-3 block text-slate-200"></i>
                                            No accounts are currently locked inside the system quarantine block.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-tight">
                            Quarantined: {totalCount} records identified
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2.5 py-1.5 rounded-sm border border-slate-200 text-xs font-bold text-slate-500 hover:bg-white hover:border-indigo-200 hover:text-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <i className="fa-solid fa-chevron-left text-[10px]"></i>
                                </button>

                                {getPageNumbers().map((page, idx) =>
                                    page === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 select-none">…</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-2.5 py-1.5 rounded-sm border text-xs font-bold transition-all ${
                                                currentPage === page
                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm'
                                                    : 'border-slate-200 text-slate-500 hover:bg-white hover:border-indigo-200 hover:text-indigo-500'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2.5 py-1.5 rounded-sm border border-slate-200 text-xs font-bold text-slate-500 hover:bg-white hover:border-indigo-200 hover:text-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTION MODAL OVERLAY */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    />

                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-emerald-50 border-emerald-100 text-emerald-500">
                                    <i className="fa-solid fa-lock-open text-base"></i>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                        Restore Active Access?
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                        Are you sure you want to unblock <strong>{modalConfig.targetUser?.first_name} {modalConfig.targetUser?.last_name}</strong>? This action restores standard system interaction paths and lets them authenticate immediate sessions again.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={closeModal}
                                className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={handleConfirmAction}
                                className="px-4 py-2 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 bg-emerald-500 border border-emerald-600 hover:bg-emerald-600"
                            >
                                {isActionLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-top-color-transparent rounded-full animate-spin" />
                                        Updating Cluster...
                                    </>
                                ) : (
                                    'Authorize Access'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockedUsers;