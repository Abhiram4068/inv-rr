import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const StatCard = ({ title, value, icon, color, trend }) => (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 transition-all hover:border-[#333] hover:translate-y-[-2px] group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-500`}>
                    <i className={`fa-solid ${icon} text-xl`}></i>
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-[#666] text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{value?.toLocaleString() || 0}</h3>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Systems Overview</h1>
                <p className="text-[#666] text-sm">Real-time infrastructure and user engagement metrics.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Infrastructure Users" 
                    value={stats?.total_users} 
                    icon="fa-users" 
                    color="blue"
                    trend={12}
                />
                <StatCard 
                    title="Propagated Files" 
                    value={stats?.total_files} 
                    icon="fa-file-shield" 
                    color="purple"
                    trend={5}
                />
                <StatCard 
                    title="Pending Reactivations" 
                    value={stats?.pending_reactivation_requests} 
                    icon="fa-user-clock" 
                    color="amber"
                    trend={stats?.pending_reactivation_requests > 0 ? stats?.pending_reactivation_requests : 0}
                />
                <StatCard 
                    title="Active Sessions" 
                    value={stats?.active_users} 
                    icon="fa-bolt" 
                    color="emerald"
                    trend={8}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities/Requests Summary */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-[#3b82f6]/10" />
                    
                    <div className="flex items-center justify-between mb-8 relative">
                        <h2 className="text-xl font-bold text-white tracking-tight">System Propagation</h2>
                        <button className="text-xs font-semibold text-[#3b82f6] hover:underline" onClick={() => navigate('/admin/requests')}>
                            View all requests
                        </button>
                    </div>

                    {stats?.pending_reactivation_requests > 0 ? (
                        <div className="bg-[#fbbf2408] border border-[#fbbf2415] rounded-2xl p-6 flex items-center gap-6 relative animate-pulse-slow">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">Attention Required</h4>
                                <p className="text-[#666] text-sm">There are {stats.pending_reactivation_requests} users requesting account reactivation.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/admin/requests')}
                                className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                            >
                                Resolve Now
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-3xl bg-[#111] border border-[#222] flex items-center justify-center text-[#333] mx-auto mb-6">
                                <i className="fa-solid fa-check-circle text-2xl"></i>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Systems Nominal</h3>
                            <p className="text-[#666] text-sm max-w-xs mx-auto">No pending administrative actions at this time. All user nodes are synchronized.</p>
                        </div>
                    )}
                </div>

                {/* Right Panel - Quick Info */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-[#1a1a1a] pb-4">Security Division</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[#808080] text-sm font-medium">Core Services</span>
                            </div>
                            <span className="text-white text-sm font-bold">Stable</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[#808080] text-sm font-medium">Authentication Node</span>
                            </div>
                            <span className="text-white text-sm font-bold">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                                <span className="text-[#808080] text-sm font-medium">Database Latency</span>
                            </div>
                            <span className="text-white text-sm font-bold">24ms</span>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-[#3b82f6]/5 border border-[#3b82f6]/10 rounded-2xl">
                        <h4 className="text-[#3b82f6] font-bold text-xs uppercase tracking-wider mb-2">Internal Note</h4>
                        <p className="text-[#666] text-[11px] leading-relaxed">
                            Admin actions are logged. Misuse of the administrative override system will trigger a security isolation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
