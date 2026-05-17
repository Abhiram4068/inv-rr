import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService'; // Adjust path based on your file tree
import userService from '../../services/adminservice/userservice';

const ReactivationRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Detail View Modal State
    const [detailModalUser, setDetailModalUser] = useState(null);

    // Confirmation Modal Architecture State Mechanics
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'allow' or 'deny'
        targetRequest: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const fetchReactivationRequests = async () => {
            try {
                setLoading(true);
                const data = await userService.getReactivationRequests({ 
                    page: currentPage, 
                    search: searchTerm 
                });
                // Note: Filter out resolved requests if they are returned but we only want pending
                // Though the backend might already filter for pending if it's an admin list
                setRequests(data.results || []);
                setTotalCount(data.count || 0);
            } catch (error) {
                console.error("Failed to fetch reactivation requests", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchReactivationRequests();
        }, 300);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const openConfirmationModal = (type, request) => {
        // Automatically dismiss the detail modal if it's open to overlay clean confirmation mechanics
        setDetailModalUser(null);
        setModalConfig({
            isOpen: true,
            type,
            targetRequest: request
        });
    };

    const closeConfirmationModal = () => {
        if (!isActionLoading) {
            setModalConfig({ isOpen: false, type: null, targetRequest: null });
        }
    };

    const handleConfirmAction = async () => {
        setIsActionLoading(true);
        const { type, targetRequest } = modalConfig;

        try {
            if (type === 'allow') {
                await userService.resolveReactivationRequest(targetRequest.id, 'approve', targetRequest.user_id);
                console.log(`Re-activated access permissions for target node: ${targetRequest.user_id}`);
            } else if (type === 'deny') {
                await userService.resolveReactivationRequest(targetRequest.id, 'reject', targetRequest.user_id);
                console.log(`Rejected structural reactivation appeal: ${targetRequest.id}`);
            }

            // Splice tracking record locally out of active buffer list
            setRequests(prev => prev.filter(req => req.id !== targetRequest.id));
            closeConfirmationModal();
        } catch (error) {
            console.error(`Failed to execute profile appeal decision:`, error);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Local filtering removed as backend handles it now.

    if (loading) {
        return (
            <div className="flex-1 bg-[#f0f2f7] min-h-screen flex items-center justify-center w-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-top-color-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans relative">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Reactivation Appeals</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Evaluate structural statements and clear execution queues for suspended directories requesting reactivation.</p>
                    </div>

                    {/* Filter Inputs Box */}
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search name, email, or appeal reasons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Primary Data Table Card Shell */}
                <div className="bg-white rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6 w-1/4">Flagged Personnel</th>
                                    <th className="py-4 px-6 w-1/6">Designation</th>
                                    <th className="py-4 px-6 w-1/3">Statement of Reason</th>
                                    <th className="py-4 px-6 w-1/6">Submitted</th>
                                    <th className="py-4 px-6 text-right">Decision Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {requests.length > 0 ? (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors items-start">
                                            {/* Identity Card Block */}
                                            <td className="py-4 px-6 vertical-align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{req.user_full_name}</span>
                                                    <span className="text-xs text-slate-400 mt-0.5">{req.user_email}</span>
                                                </div>
                                            </td>

                                            {/* User Designation */}
                                            <td className="py-4 px-6 text-slate-600 font-medium">
                                                {req.designation}
                                            </td>

                                            {/* Statement Explanations Context */}
                                            <td className="py-4 px-6">
                                                <div className="text-xs text-slate-500 bg-slate-50/80 p-3 rounded-sm border border-slate-100 leading-relaxed max-w-md italic font-normal line-clamp-2">
                                                    "{req.reason}"
                                                </div>
                                            </td>

                                            {/* Registered Timestamp */}
                                            <td className="py-4 px-6 text-slate-500 font-normal">
                                                {new Date(req.created_at).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>

                                            {/* Action Control Blocks */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/users/${req.user_id}`)}
                                                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-sm text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider shadow-sm"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => setDetailModalUser(req)}
                                                        className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-sm text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-wider shadow-sm"
                                                    >
                                                        View Request
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal('deny', req)}
                                                        className="px-2.5 py-1.5 border border-slate-200 rounded-sm bg-white text-xs font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Deny
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal('allow', req)}
                                                        className="px-2.5 py-1.5 bg-indigo-500 border border-indigo-600 rounded-sm text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Allow
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                                            <i className="fa-solid fa-envelope-open text-3xl mb-3 block text-slate-200"></i>
                                            Appeals directory is clear. No active accounts require restoration review.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Operational Footer Details Row */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-400 font-semibold">
                        <span>Awaiting clearance: {requests.length} record items</span>
                    </div>
                </div>
            </div>

            {/* DETAILED REQUEST VIEW OVERLAY MODAL */}
            {detailModalUser && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setDetailModalUser(null)}
                    />

                    {/* Modal Frame Structure */}
                    <div className="bg-white rounded-sm shadow-xl max-w-xl w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <h3 className="text-base font-bold text-slate-800 tracking-tight">Reactivation Request Details</h3>
                                <button 
                                    onClick={() => setDetailModalUser(null)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <i className="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>

                            {/* User Registry Parameters Row */}
                            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Full Name</span>
                                    <span className="text-slate-700 font-bold text-sm">{detailModalUser.user_full_name}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Email Directory</span>
                                    <span className="text-slate-700 font-medium">{detailModalUser.user_email}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Assigned Designation</span>
                                    <span className="text-slate-700 font-medium">{detailModalUser.designation}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-semibold mb-0.5">Submission Stamp</span>
                                    <span className="text-slate-700 font-medium">
                                        {new Date(detailModalUser.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Explanation Statement Box */}
                            <div className="mt-4">
                                <span className="text-xs text-slate-400 block font-semibold mb-1.5">Statement of Reason</span>
                                <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-sm border border-slate-100 leading-relaxed italic max-h-48 overflow-y-auto">
                                    "{detailModalUser.reason}"
                                </div>
                            </div>
                        </div>

                        {/* Interactive Modal Option Triggers */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const userId = detailModalUser.user_id;
                                    setDetailModalUser(null);
                                    navigate(`/admin/users/${userId}`);
                                }}
                                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-wider transition-colors"
                            >
                                Full Profile Details
                            </button>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDetailModalUser(null)}
                                    className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all"
                                >
                                    Close Window
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openConfirmationModal('deny', detailModalUser)}
                                    className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all uppercase tracking-wider"
                                >
                                    Deny Appeal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openConfirmationModal('allow', detailModalUser)}
                                    className="px-4 py-2 bg-indigo-500 border border-indigo-600 rounded-sm text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-sm uppercase tracking-wider"
                                >
                                    Allow Reactivation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DYNAMIC DOUBLE-CONFIRMATION MODAL OVERLAY */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeConfirmationModal}
                    />

                    {/* Modal Box */}
                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                    modalConfig.type === 'allow' 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                                        : 'bg-rose-50 border-rose-100 text-rose-500'
                                }`}>
                                    {modalConfig.type === 'allow' ? (
                                        <i className="fa-solid fa-unlock text-base"></i>
                                    ) : (
                                        <i className="fa-solid fa-ban text-base"></i>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                        {modalConfig.type === 'allow' ? 'Authorize Identity Restoration?' : 'Dismiss Reactivation Appeal?'}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                        {modalConfig.type === 'allow' ? (
                                            <>Are you sure you want to approve the reactivation request from <strong>{modalConfig.targetRequest?.user_full_name}</strong>? This immediately lifts the freeze flag, returning them to standard operational clearance.</>
                                        ) : (
                                            <>Are you sure you want to reject the reactivation request from <strong>{modalConfig.targetRequest?.user_full_name}</strong>? The user directory status will remain flagged inside isolation protocols.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Execution Triggers */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={closeConfirmationModal}
                                className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 ${
                                    modalConfig.type === 'allow'
                                        ? 'bg-emerald-500 border border-emerald-600 hover:bg-emerald-600'
                                        : 'bg-rose-500 border border-rose-600 hover:bg-rose-600'
                                }`}
                            >
                                {isActionLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-top-color-transparent rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    modalConfig.type === 'allow' ? 'Confirm Reactivation' : 'Confirm Dismissal'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReactivationRequests;