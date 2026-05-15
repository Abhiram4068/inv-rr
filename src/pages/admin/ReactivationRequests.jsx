import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is used, otherwise I'll use simple alert

const ReactivationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await adminService.getReactivationRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            await adminService.resolveReactivationRequest(id, action);
            // Update local state instead of refetching all
            setRequests(prev => prev.map(req => 
                req.id === id ? { ...req, is_resolved: true } : req
            ));
            // toast.success(`Request ${action}d successfully`);
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Node Reactivations</h1>
                    <p className="text-[#666] text-sm">Review and resolve manual account access requests.</p>
                </div>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-2 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-white text-xs font-bold tracking-widest uppercase">
                        {requests.filter(r => !r.is_resolved).length} Pending
                    </span>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#111]">
                            <th className="px-8 py-5 text-[#444] text-[10px] font-bold uppercase tracking-[0.2em]">Subject Node</th>
                            <th className="px-8 py-5 text-[#444] text-[10px] font-bold uppercase tracking-[0.2em]">Transmission Date</th>
                            <th className="px-8 py-5 text-[#444] text-[10px] font-bold uppercase tracking-[0.2em]">Reason / Payload</th>
                            <th className="px-8 py-5 text-[#444] text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-5 text-[#444] text-[10px] font-bold uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0a0a0a]">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-[#333] italic text-sm">No requests detected in the current buffer.</td>
                            </tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className="group hover:bg-[#ffffff02] transition-colors">
                                <td className="px-8 py-6">
                                    <div>
                                        <p className="text-white font-semibold text-sm mb-0.5">{req.user.full_name}</p>
                                        <p className="text-[#444] text-[10px] font-mono">{req.user.email}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[#808080] text-xs">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-8 py-6 max-w-md">
                                    <p className="text-[#808080] text-sm line-clamp-2 italic leading-relaxed group-hover:line-clamp-none transition-all">
                                        "{req.reason}"
                                    </p>
                                </td>
                                <td className="px-8 py-6">
                                    {req.is_resolved ? (
                                        <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                                            Resolved
                                        </span>
                                    ) : (
                                        <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider bg-amber-500/5 px-2 py-1 rounded-md border border-amber-500/10">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {!req.is_resolved && (
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleAction(req.id, 'approve')}
                                                disabled={actionLoading === req.id}
                                                className="bg-[#3b82f6] text-black h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#3b82f6ee] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, 'reject')}
                                                disabled={actionLoading === req.id}
                                                className="border border-[#222] text-[#666] h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider hover:text-white hover:border-[#444] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReactivationRequests;
