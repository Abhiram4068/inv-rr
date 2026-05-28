import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminservice/userservice'; // Adjust path based on your folder structure
import { useNavigate } from 'react-router-dom';

const AdminActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchLogsData();
    }, [searchQuery]);

    const fetchLogsData = async () => {
        try {
            setLoading(true);
            const params = { search: searchQuery };
            const data = await adminService.getActivityLogs(params);

            const results = data.results || data;
            setLogs(results);
            setStats({
                total_logs: data.count || results.length,
                user_ops: results.filter(a => a.activity_type.startsWith('USER_')).length,
                resolved_ops: results.filter(a => a.activity_type.endsWith('_RESOLVED')).length,
                requests: results.filter(a => a.activity_type.endsWith('_REQUEST')).length
            });
        } catch (error) {
            console.error("Failed to fetch admin activity logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    if (loading && logs.length === 0) {
        return (
            <div className="flex-1 bg-[#f0f2f7] flex items-center justify-center w-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-top-color-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full bg-[#f0f2f7] p-8 pb-16 font-sans">          
          <div className="max-w-7xl mx-auto">

                {/* Top Headers matching dashboard layout structure */}
                <div className="bg-white border border-slate-200 p-6 rounded-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Activity Log</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Monitor admin activities, critical updates and access changes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-xs bg-white text-slate-600 font-bold px-4 py-2.5 rounded-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <i className="fa-solid fa-arrow-left text-[10px]"></i> Dashboard Overview
                        </button>
                    </div>
                </div>

                {/* Analytical Mini Grid Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Activities</span>
                            <span className="text-2xl font-bold text-slate-800">{(stats?.total_logs || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/50"><i className="fa-solid fa-database text-sm"></i></div>
                    </div>
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">User Operations</span>
                            <span className="text-2xl font-bold text-indigo-600">{stats?.user_ops || 0}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/50"><i className="fa-solid fa-users text-sm"></i></div>
                    </div>
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Resolved Requests</span>
                            <span className="text-2xl font-bold text-emerald-600">{stats?.resolved_ops || 0}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100/50"><i className="fa-solid fa-check-double text-sm"></i></div>
                    </div>
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Pending Requests</span>
                            <span className="text-2xl font-bold text-amber-600">{stats?.requests || 0}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100/50"><i className="fa-solid fa-clock-rotate-left text-sm"></i></div>
                    </div>
                </div>

                {/* Sub-Header Management Panel */}
                <div className="bg-white border border-slate-200 rounded-sm mb-10 overflow-hidden">

                    {/* Control Panel: Filters and Searching */}
                    <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">

                        {/* Search Wireframe */}
                        <div className="relative flex-1">
                            <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by administrator email, activity type, or target user email..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400 text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Operational Table Element */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-6 w-[180px]">Timestamp</th>
                                    <th className="py-3 px-6">Action / Event</th>
                                    <th className="py-3 px-6 w-[220px]">Target User</th>
                                    <th className="py-3 px-6 text-right w-[150px]">Activity Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {logs.length > 0 ? (
                                    logs.map((log) => {
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                {/* Timestamp Column */}
                                                <td className="py-4 px-6 text-slate-900 whitespace-nowrap font-mono text-[11px]">
                                                    {new Date(log.timestamp).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>

                                                {/* Action Details Column */}
                                                <td className="py-4 px-6 text-slate-600 font-medium">
                                                    {log.action_details}
                                                </td>

                                                {/* Target User */}
                                                <td className="py-4 px-6 font-mono text-[11px] text-slate-900 whitespace-nowrap">
                                                    <span className="px-2 py-0.5">
                                                        {log.target_user_email || "N/A"}
                                                    </span>
                                                </td>

                                                {/* Operational Activity Type Tag */}
                                                <td className="py-4 px-6 text-right whitespace-nowrap">
<span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                                                        {log.activity_type_display}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                                            <div className="flex items-center justify-center gap-2">
                                                <i className="fa-solid fa-folder-open text-base text-slate-300"></i>
                                                <span>No active logs found.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Stream Status Bar */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between text-[11px] font-medium text-slate-500">
                        <span>Showing {logs.length} of {logs.length} live activity logs</span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdminActivityLog;