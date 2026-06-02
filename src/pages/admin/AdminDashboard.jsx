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
            console.error("Failed to fetch admin dashboard statistics:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    if (loading) {
        return (
            <div className="flex-1 bg-[#f0f2f7] min-h-screen flex items-center justify-center w-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-top-color-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Standard individual metric card
    const DashboardTile = ({ label, value, icon, onClickAction, actionLabel }) => (
        <div className="bg-white rounded-sm border border-slate-200 p-6 flex flex-col justify-between transition-all hover:shadow-sm h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {label}
                    </span>
                    <span className="text-3xl font-bold text-slate-800">
                        {value !== undefined && value !== null ? value.toLocaleString() : 0}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-sm bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <i className={`fa-solid ${icon} text-base`}></i>
                </div>
            </div>
            
            {onClickAction && (
                <div className="border-t border-slate-100 pt-3 mt-2 flex justify-end">
                    <button 
                        onClick={onClickAction}
                        className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 tracking-wide uppercase flex items-center gap-1"
                    >
                        {actionLabel || 'Manage'} <i className="fa-solid fa-chevron-right text-[9px]"></i>
                    </button>
                </div>
            )}
        </div>
    );

    // Calculate total users safely from available metrics
    const totalUsersCount = (stats?.active_users || 0) + 
                            (stats?.blocked_users || 0) + 
                            (stats?.deactivated_users || 0) + 
                            (stats?.idle_users || 0);

    // Formatted current date for the context text header
    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Top Welcome & Overview Context Section */}
                <div className="bg-white border border-slate-200 p-6 rounded-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-wider mb-1">
                            <i className="fa-solid fa-shield-halved"></i> Security Node Active
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Control Console</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Welcome back, Administrator. Review pending registration bottlenecks and localized data pools below.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-sm w-full md:w-auto justify-between md:justify-start">
                        <span className="text-slate-400 font-medium">Session Frame:</span>
                        <span className="text-slate-700 font-bold flex items-center gap-1.5">
                            <i className="fa-regular fa-calendar text-[11px] text-slate-400"></i> {formattedDate}
                        </span>
                    </div>
                </div>

                {/* Sub-Header Label */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Infrastructure</h2>
                    </div>
                </div>

                {/* Primary Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    
                    {/* Visual Breaker: Large Total Users Breakdown Card (Spans 2 Columns) */}
                    <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-sm p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-5 -mt-5 pointer-events-none"></div>
                        
                        <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center w-full z-10">
                            {/* Main Counter */}
                            <div className="border-r border-slate-700/50 pr-6 min-w-[140px]">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                                    Total Users
                                </span>
                                <span className="text-4xl font-extrabold tracking-tight">
                                    {totalUsersCount.toLocaleString()}
                                </span>
                            </div>

                            {/* Sub-metrics Breakdown Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 w-full">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active</p>
                                        <p className="text-base font-bold text-slate-100">{(stats?.active_users || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Idle</p>
                                        <p className="text-base font-bold text-slate-100">{(stats?.idle_users || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Blocked</p>
                                        <p className="text-base font-bold text-slate-100">{(stats?.blocked_users || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Deactivated</p>
                                        <p className="text-base font-bold text-slate-100">{(stats?.deactivated_users || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/40 pt-3 mt-4 flex justify-between items-center z-10">
                            <span className="text-[10px] text-slate-400">Live User Directory Profiles</span>
                            <button 
                                onClick={() => navigate('/admin/users')}
                                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 tracking-wide uppercase flex items-center gap-1 transition-colors"
                            >
                                View All <i className="fa-solid fa-arrow-right text-[9px]"></i>
                            </button>
                        </div>
                    </div>

                    {/* Remaining Standard Tiles */}
                    <DashboardTile 
                        label="Total Files Handled" 
                        value={stats?.total_files} 
                        icon="fa-cloud-arrow-up" 
                    />
                    <DashboardTile 
                        label="History Pending" 
                        value={stats?.pending_registration_approvals || 0} 
                        icon="fa-clock-rotate-left"
                        onClickAction={() => navigate('/admin/requests')}
                        actionLabel="View Queue"
                    />
                </div>

                {/* Secondary Row with Notice Board & Balanced Metric Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Action Cards Grid System directly alongside Notice Board */}
                    <div className="lg:col-span-1">
                        <DashboardTile 
                            label="Reactivation Requests" 
                            value={stats?.pending_deactivation_requests || 0} 
                            icon="fa-user-minus"
                            onClickAction={() => navigate('/admin/requests?type=deactivation')}
                            actionLabel="Review"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <DashboardTile 
                            label="New User Approvals" 
                            value={stats?.pending_registration_approvals || 0} 
                            icon="fa-user-plus" 
                            onClickAction={() => navigate('/admin/requests?type=registration')}
                            actionLabel="Approve"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <DashboardTile 
                            label="New User Approvals" 
                            value={stats?.pending_registration_approvals || 0} 
                            icon="fa-user-plus" 
                            onClickAction={() => navigate('/admin/requests?type=registration')}
                            actionLabel="Approve"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;