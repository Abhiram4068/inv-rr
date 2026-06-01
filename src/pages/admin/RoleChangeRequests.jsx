import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/adminservice/userservice';

const RoleChangeRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State Mechanics
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'approve' or 'reject'
        targetRequest: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchRoleRequests();
    }, [searchTerm]);

    const fetchRoleRequests = async () => {
        try {
            setLoading(true);
            const data = await userService.getDesignationChangeRequests({ search: searchTerm });
            setRequests(data.results || data); // Handle both paginated and non-paginated
        } catch (error) {
            console.error("Failed to fetch role requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, request) => {
        setModalConfig({
            isOpen: true,
            type,
            targetRequest: request
        });
    };

    const closeModal = () => {
        if (!isActionLoading) {
            setModalConfig({ isOpen: false, type: null, targetRequest: null });
        }
    };

    const handleConfirmAction = async () => {
        setIsActionLoading(true);
        const { type, targetRequest } = modalConfig;

        try {
            const action = type === 'approve' ? 'approve' : 'reject';
            await userService.resolveDesignationChangeRequest(targetRequest.id, action);

            console.log(`${action}d role migration for request signature: ${targetRequest.id}`);

            // Splice tracking record locally out of stack queue
            setRequests(prev => prev.filter(req => req.id !== targetRequest.id));
            closeModal();
            window.dispatchEvent(new Event('admin:counts:refresh'));
        } catch (error) {
            console.error(`Failed to handle role migration clearance context:`, error);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Filtered already by backend search, but keeping local search for UI responsiveness if needed
    const filteredRequests = requests;

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

                {/* Header Block Description Contexts */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Designation Reassignments</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Review and approve designation change requests</p>
                    </div>

                    {/* Filter Entry Inputs */}
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input
                            type="text"
                            placeholder="Search name, email, or new role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Primary Data Card Grid Frame (Removed border lines layout wrapper) */}
                <div className="bg-white rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6">Identity Node</th>
                                    <th className="py-4 px-6">Previous Designation</th>
                                    <th className="py-4 px-6">Proposed Designation</th>
                                    <th className="py-4 px-6">Requested Stamps</th>
                                    <th className="py-4 px-6 text-right">Operations Pipeline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            {/* User Details Block */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800">{req.user_full_name}</span>
                                                    <span className="text-xs text-slate-400 mt-0.5">{req.user_email}</span>
                                                </div>
                                            </td>

                                            {/* Old Title Stack */}
                                            <td className="py-4 px-6">
                                                <span className="text-slate-500 line-through text-xs bg-slate-50 px-2 py-1 rounded-sm border border-slate-100">
                                                    {req.current_designation_display}
                                                </span>
                                            </td>

                                            {/* New Title Target Array */}
                                            <td className="py-4 px-6">
                                                <span className="text-indigo-600 font-bold text-xs bg-indigo-50/60 px-2 py-1 rounded-sm border border-indigo-100/50">
                                                    {req.requested_designation_display}
                                                </span>
                                            </td>

                                            {/* Creation Iso Stamps */}
                                            <td className="py-4 px-6 text-slate-500 font-normal">
                                                {new Date(req.created_at).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>

                                            {/* Practical Functional Controls */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/user-details/${req.user}`)}
                                                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-sm text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wider shadow-sm"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('reject', req)}
                                                        className="px-2.5 py-1.5 border border-slate-200 rounded-sm bg-white text-xs font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('approve', req)}
                                                        className="px-2.5 py-1.5 bg-indigo-500 border border-indigo-600 rounded-sm text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-sm uppercase tracking-wider"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                                            <i className="fa-solid fa-code-pull-request text-3xl mb-3 block text-slate-200"></i>
                                            All authorization structures verified. Role change queue is clean.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Trackers footer */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-400 font-semibold">
                        <span>Showing {filteredRequests.length} of {requests.length} evaluation structures</span>
                    </div>
                </div>
            </div>

            {/* INTEGRATED REASSIGNMENT CONFIRMATION MODAL OVERLAY */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    />

                    {/* Modal Base Box Layout (Removed external border lines) */}
                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${modalConfig.type === 'approve'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-500'
                                        : 'bg-rose-50 border-rose-100 text-rose-500'
                                    }`}>
                                    {modalConfig.type === 'approve' ? (
                                        <i className="fa-solid fa-circle-check text-base"></i>
                                    ) : (
                                        <i className="fa-solid fa-circle-xmark text-base"></i>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                        {modalConfig.type === 'approve' ? 'Authorize Designation Shift?' : 'Deny Designation Shift?'}
                                    </h3>
                                    <div className="text-xs text-slate-400 leading-relaxed mt-2 space-y-1">
                                        <p>
                                            Confirm role change request for <strong>{modalConfig.targetRequest?.user_full_name}</strong>.
                                        </p>
                                        <div className="bg-slate-50 p-2.5 rounded-sm mt-2 border border-slate-100 space-y-1 text-[11px]">
                                            <div>Old: <span className="line-through text-slate-400">{modalConfig.targetRequest?.current_designation_display}</span></div>
                                            <div>New: <span className="text-slate-700 font-semibold">{modalConfig.targetRequest?.requested_designation_display}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Triggers Actions Row */}
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
                                className={`px-4 py-2 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 ${modalConfig.type === 'approve'
                                        ? 'bg-emerald-500 border border-emerald-600 hover:bg-emerald-600'
                                        : 'bg-rose-500 border border-rose-600 hover:bg-rose-600'
                                    }`}
                            >
                                {isActionLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-top-color-transparent rounded-full animate-spin" />
                                        Updating Nodes...
                                    </>
                                ) : (
                                    modalConfig.type === 'approve' ? 'Confirm Promotion' : 'Confirm Dismissal'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleChangeRequests;