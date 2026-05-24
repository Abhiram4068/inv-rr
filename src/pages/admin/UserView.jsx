import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/adminservice/userservice';

const RECORDS_PER_PAGE = 12;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
    }, [currentPage]);

    // Reset to page 1 when search changes, then fetch
    useEffect(() => {
        setCurrentPage(1);
        fetchUsers(1, searchTerm);
    }, [searchTerm]);

    const fetchUsers = async (page, search) => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers({ page, search });
            setUsers(data.results);       // DRF paginated response
            setTotalCount(data.count);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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

        // Inject ellipsis markers
        const withEllipsis = [];
        let prev = null;
        for (const page of pages) {
            if (prev && page - prev > 1) withEllipsis.push('...');
            withEllipsis.push(page);
            prev = page;
        }
        return withEllipsis;
    };

    // Removed full page loading to prevent search input from losing focus

    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">User Profiles</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Manage credentials, operational titles, and access levels across system nodes.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Primary Data Card */}
                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">User Details</th>
                                    <th className="py-4 px-6">Designation</th>
                                    <th className="py-4 px-6">Date Joined</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
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
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">
                                                        {user.first_name || ""} {user.last_name || ""}
                                                    </span>
                                                    <span className="text-xs text-slate-500 mt-0.5">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 font-medium">
                                                {user.designation_display}
                                            </td>
                                            <td className="py-4 px-6 text-slate-500 font-normal">
                                                {new Date(user.date_joined).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wide ${
                                                    user.account_status === 'active' ||'ACTIVE' ? ' text-emerald-600' :
                                                    user.account_status === 'blocked' ||'BLOCKED' ? ' text-rose-600' :
                                                    'text-amber-600'
                                                }`}>
                                                    {user.account_status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/admin/user/detail/${user.id}/`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-sm bg-white text-xs font-bold text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm uppercase tracking-wider"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                                            <i className="fa-solid fa-user-slash text-3xl mb-3 block text-slate-200"></i>
                                            No system components found matching your current parameters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer: count + pagination */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-xs text-slate-400 font-semibold">
                            Showing {users.length === 0 ? 0 : (currentPage - 1) * RECORDS_PER_PAGE + 1}–{Math.min(currentPage * RECORDS_PER_PAGE, totalCount)} of {totalCount} records
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                {/* Prev */}
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

                                {/* Next */}
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
        </div>
    );
};

export default UserManagement;