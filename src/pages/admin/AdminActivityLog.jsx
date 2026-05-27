import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService'; // Adjust path based on your folder structure
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
    }, []);

    const fetchLogsData = async () => {
        try {
            // Assuming your admin service returns both the historical array and quick summaries
            // const data = await adminService.getActivityLogs();
            
            // Mocking the structural data pool matching your custom UI design schema:
            const mockData = {
                summary: {
                    total_logs: 14240,
                    critical_alerts: 3,
                    security_events: 42,
                    config_changes: 128
                },
                activities: [
                    { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), admin_name: "Alex Mercer", action: "Blocked User Account", target: "user_ID_8842", severity: "CRITICAL", icon: "fa-user-slash", color: "rose" },
                    { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(), admin_name: "Sarah Connors", action: "Approved Registration Request", target: "j.doe@company.com", severity: "INFO", icon: "fa-user-check", color: "emerald" },
                    { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), admin_name: "Alex Mercer", action: "Modified System Security Config", target: "IP Whitelist Rules", severity: "WARNING", icon: "fa-shield-halved", color: "amber" },
                    { id: 4, timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), admin_name: "System Node Automation", action: "Purged Dormant File Cache", target: "Temporary Batch Pool B", severity: "INFO", icon: "fa-hard-drive", color: "slate" },
                    { id: 5, timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), admin_name: "Sarah Connors", action: "Rejected Reactivation Request", target: "user_ID_1094", severity: "WARNING", icon: "fa-user-xmark", color: "amber" }
                ]
            };

            setLogs(mockData.activities);
            setStats(mockData.summary);
        } catch (error) {
            console.error("Failed to fetch admin system activity streams:", error);
        } finally {
            setLoading(false);
        }
    };

    // Severity mapping styling matrix
    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'CRITICAL': return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
            case 'WARNING': return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
            case 'INFO': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
            default: return { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
        }
    };

    // Filter Logic
    const filteredLogs = logs.filter(log => {
        const matchesType = filterType === 'ALL' || log.severity === filterType;
        const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             log.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             log.target.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    if (loading) {
        return (
            <div className="flex-1 bg-[#f0f2f7] min-h-screen flex items-center justify-center w-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-top-color-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Top Headers matching dashboard layout structure */}
                <div className="bg-white border border-slate-200 p-6 rounded-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Activity Log</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Review immutable administrative operations, modifications, and protocol validations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/admin/dashboard')} 
                            className="text-xs bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <i className="fa-solid fa-arrow-left text-[10px]"></i> Dashboard Overview
                        </button>
                        <div className="hidden sm:flex items-center gap-4 text-xs bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-sm">
                            <span className="text-slate-400 font-medium">Log Frame:</span>
                            <span className="text-slate-700 font-bold flex items-center gap-1.5">
                                <i className="fa-regular fa-calendar text-[11px] text-slate-400"></i> {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Analytical Mini Grid Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total System Traces</span>
                            <span className="text-2xl font-bold text-slate-800">{(stats?.total_logs || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/50"><i className="fa-solid fa-database text-sm"></i></div>
                    </div>
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Critical Exceptions</span>
                            <span className="text-2xl font-bold text-rose-600">{stats?.critical_alerts || 0}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100/50"><i className="fa-solid fa-triangle-exclamation text-sm"></i></div>
                    </div>
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Security Changes</span>
                            <span className="text-2xl font-bold text-slate-800">{stats?.security_events || 0}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100"><i className="fa-solid fa-shield-halved text-sm"></i></div>
                    </div>
                    <div className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Config Operations</span>
                            <span className="text-2xl font-bold text-slate-800">{stats?.config_changes || 0}</span>
                        </div>
                        <div className="w-9 h-9 rounded-sm bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100"><i className="fa-solid fa-sliders text-sm"></i></div>
                    </div>
                </div>

                {/* Sub-Header Management Panel */}
                <div className="bg-white border border-slate-200 rounded-sm mb-6 overflow-hidden">
                    
                    {/* Control Panel: Filters and Searching */}
                    <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        
                        {/* Search Wireframe */}
                        <div className="relative flex-1 max-w-md">
                            <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by administrator name, action, or target trace..."
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400 text-slate-700"
                            />
                        </div>

                        {/* Filter Status Switchers */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-sm text-[11px] font-bold tracking-wide uppercase">
                            {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1.5 rounded-sm transition-all ${
                                        filterType === type 
                                            ? 'bg-white text-slate-800 shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Operational Table Element */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-6 w-[180px]">Timestamp</th>
                                    <th className="py-3 px-6 w-[180px]">Administrator</th>
                                    <th className="py-3 px-6">Action / Event</th>
                                    <th className="py-3 px-6 w-[220px]">Target Resource</th>
                                    <th className="py-3 px-6 text-right w-[130px]">Severity Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => {
                                        const severity = getSeverityStyles(log.severity);
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                {/* Timestamp Column */}
                                                <td className="py-4 px-6 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                                                    {new Date(log.timestamp).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                    })}
                                                </td>

                                                {/* Actor Column */}
                                                <td className="py-4 px-6 font-bold text-slate-700 whitespace-nowrap">
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-[9px] flex items-center justify-center font-extrabold text-slate-500">
                                                            {log.admin_name.charAt(0)}
                                                        </div>
                                                        {log.admin_name}
                                                    </span>
                                                </td>

                                                {/* Action Details Column */}
                                                <td className="py-4 px-6 text-slate-600 font-medium">
                                                    <span className="flex items-center gap-2.5">
                                                        <i className={`fa-solid ${log.icon} text-slate-400 text-[13px] w-4 text-center`}></i>
                                                        {log.action}
                                                    </span>
                                                </td>

                                                {/* Target Asset Identity */}
                                                <td className="py-4 px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                    <span className="bg-slate-100/70 border border-slate-200/40 px-2 py-0.5 rounded-xs">
                                                        {log.target}
                                                    </span>
                                                </td>

                                                {/* Operational Severity Tag */}
                                                <td className="py-4 px-6 text-right whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${severity.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${severity.dot}`}></span>
                                                        {log.severity}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                                            <i className="fa-solid fa-folder-open block text-xl mb-2 text-slate-300"></i>
                                            No tracking footprints found matching selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Stream Status Bar */}
                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <span>Showing {filteredLogs.length} of {filteredLogs.length} live telemetry streams</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Streaming Real-time</span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdminActivityLog;