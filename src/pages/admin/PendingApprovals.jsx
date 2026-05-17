import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService'; // Adjust path based on your file tree
import userService from '../../services/adminservice/userservice';

const PendingApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal & Action State Management
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'accept' or 'reject'
        targetUser: null,
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Fetch data with debounce
    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                setLoading(true);
                const data = await userService.getPendingApprovals({ 
                    page: currentPage, 
                    search: searchTerm 
                });
                setRequests(data.results || []);
                setTotalCount(data.count || 0);
            } catch (error) {
                console.error("Failed to fetch pending requests", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchPendingRequests();
        }, 300);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const openConfirmationModal = (type, user) => {
        setModalConfig({
            isOpen: true,
            type,
            targetUser: user
        });
    };

    const closeConfirmationModal = () => {
        if (!isActionLoading) {
            setModalConfig({ isOpen: false, type: null, targetUser: null });
        }
    };

    const handleConfirmAction = async () => {
        setIsActionLoading(true);
        const { type, targetUser } = modalConfig;
        
        try {
            if (type === 'accept') {
                await userService.resolvePendingApproval(targetUser.id, 'accept');
                console.log(`Approved user node access: ${targetUser.id}`);
            } else if (type === 'reject') {
                await userService.resolvePendingApproval(targetUser.id, 'reject');
                console.log(`Purged user node registration request: ${targetUser.id}`);
            }
            
            // Filter local state layout on success status
            setRequests(prev => prev.filter(req => req.id !== targetUser.id));
            closeConfirmationModal();
        } catch (error) {
            console.error(`Operation runtime failure during request evaluation:`, error);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Local filtering is removed since the backend handles it.

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
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pending Registrations</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Review, validate, and authorize inbound access tokens for incoming personnel directories.</p>
                    </div>
                    
                    {/* Search Field Wrapper */}
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search pending name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Primary Data Card Shell (Removed external border lines) */}
                <div className="bg-white rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">Candidate Details</th>
                                    <th className="py-4 px-6">Operational Designation</th>
                                    <th className="py-4 px-6">Registered At</th>
                                    <th className="py-4 px-6">Email</th>
                                    <th className="py-4 px-6 text-right">Verification Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {requests.length > 0 ? (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            {/* Candidate Details */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{req.first_name} {req.last_name}</span>
                                                    <span className="text-xs text-slate-400 mt-0.5">{req.email}</span>
                                                </div>
                                            </td>
                                            
                                            {/* Designation */}
                                            <td className="py-4 px-6 text-slate-600 font-medium">
                                                {req.designation}
                                            </td>
                                            
                                            {/* Registered At Timestamp */}
                                            <td className="py-4 px-6 text-slate-500 font-normal">
                                                {new Date(req.date_joined).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 font-medium">
                                                {req.email}
                                            </td>
                                            
                                            {/* Interactive Decision Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        onClick={() => openConfirmationModal('reject', req)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-sm bg-white text-xs font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => openConfirmationModal('accept', req)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-indigo-500 border border-indigo-600 rounded-sm text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12 text-slate-400 font-medium">
                                            <i className="fa-solid fa-list-check text-3xl mb-3 block text-slate-200"></i>
                                            Clear queue! No registration requests require current manual intervention.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Minimal Data Tracking Footer Row */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-400 font-semibold">
                        <span>Showing {requests.length} processing buffers</span>
                    </div>
                </div>
            </div>

            {/* DYNAMIC CONFIRMATION MODAL OVERLAY */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop Blur */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeConfirmationModal}
                    />
                    
                    {/* Modal Architecture Frame */}
                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                {/* Color Variant Structural Toggle */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                    modalConfig.type === 'accept' 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
                                        : 'bg-rose-50 border-rose-100 text-rose-500'
                                }`}>
                                    {modalConfig.type === 'accept' ? (
                                        <i className="fa-solid fa-user-check text-base"></i>
                                    ) : (
                                        <i className="fa-solid fa-user-xmark text-base"></i>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                        {modalConfig.type === 'accept' ? 'Authorize Identity Node?' : 'Deny Directory Access?'}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                        {modalConfig.type === 'accept' ? (
                                            <>Are you sure you want to approve <strong>{modalConfig.targetUser?.first_name} {modalConfig.targetUser?.last_name}</strong> as an active system component? They will instantly receive operational authorization profiles.</>
                                        ) : (
                                            <>Are you sure you want to reject and drop <strong>{modalConfig.targetUser?.first_name} {modalConfig.targetUser?.last_name}</strong>'s request? This clear-out operation is irreversible, discarding database stage entry logs.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Trigger Row */}
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
                                    modalConfig.type === 'accept'
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
                                    modalConfig.type === 'accept' ? 'Confirm Approval' : 'Confirm Rejection'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;