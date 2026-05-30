import React, { useEffect, useState, useMemo } from 'react';
import adminService from '../../services/adminservice/userservice';
import { useNavigate } from 'react-router-dom';

const TIME_FILTERS = [
  { label: 'All time', value: null },
  { label: 'Last 1 hr', value: 1 },
  { label: 'Last 4 hrs', value: 4 },
  { label: 'Last 24 hrs', value: 24 },
];

const AdminActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogsData();
  }, []);

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getActivityLogs({});
      const results = data.results || data;
      setLogs(results);
    } catch (error) {
      console.error('Failed to fetch admin activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const activityTypes = useMemo(() => {
    const types = [...new Set(logs.map(l => l.activity_type).filter(Boolean))];
    return ['ALL', ...types];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter(log => {
      if (timeFilter) {
        const logTime = new Date(log.timestamp).getTime();
        if (now - logTime > timeFilter * 60 * 60 * 1000) return false;
      }
      if (typeFilter !== 'ALL' && log.activity_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inEmail = (log.target_user_email || '').toLowerCase().includes(q);
        const inAction = (log.action_details || '').toLowerCase().includes(q);
        const inType = (log.activity_type || '').toLowerCase().includes(q);
        const inActor = (log.actor_email || '').toLowerCase().includes(q);
        if (!inEmail && !inAction && !inType && !inActor) return false;
      }
      return true;
    });
  }, [logs, searchQuery, typeFilter, timeFilter]);

  const stats = useMemo(() => ({
    total: filteredLogs.length,
    user_ops: filteredLogs.filter(a => a.activity_type?.startsWith('USER_')).length,
    resolved: filteredLogs.filter(a => a.activity_type?.endsWith('_RESOLVED')).length,
    requests: filteredLogs.filter(a => a.activity_type?.endsWith('_REQUEST')).length,
  }), [filteredLogs]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex-1 bg-[#f0f2f7] flex items-center justify-center w-full">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f0f2f7] p-8 pb-16 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white border border-slate-200 p-6 rounded-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">System Activity Log</h1>
            <p className="text-xs text-slate-400 mt-0.5">Monitor admin activities, critical updates and access changes.</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-xs bg-white text-slate-600 font-bold px-4 py-2.5 rounded-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> Dashboard Overview
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { label: 'Total Logs', value: stats.total, icon: 'fa-database', color: 'indigo' },
            { label: 'User Operations', value: stats.user_ops, icon: 'fa-users', color: 'indigo' },
            { label: 'Resolved', value: stats.resolved, icon: 'fa-check-double', color: 'emerald' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-sm border border-slate-200 p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">{label}</span>
                <span className={`text-2xl font-bold text-${color}-600`}>{value.toLocaleString()}</span>
              </div>
              <div className={`w-9 h-9 rounded-sm bg-${color}-50 text-${color}-500 flex items-center justify-center border border-${color}-100/50`}>
                <i className={`fa-solid ${icon} text-sm`}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white border border-slate-200 rounded-sm mb-10 overflow-hidden">

          {/* Filters */}
          <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by email, action, or type…"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 text-xs rounded-sm focus:outline-none focus:border-indigo-400 bg-slate-50/50 placeholder:text-slate-400 text-slate-700"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              )}
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-indigo-400 min-w-[160px]"
            >
              {activityTypes.map(t => (
                <option key={t} value={t}>{t === 'ALL' ? 'All types' : t.replace(/_/g, ' ')}</option>
              ))}
            </select>

            {/* Time filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {TIME_FILTERS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setTimeFilter(value)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-sm border transition-colors whitespace-nowrap ${
                    timeFilter === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {(searchQuery || typeFilter !== 'ALL' || timeFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setTypeFilter('ALL'); setTimeFilter(null); }}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-500 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-xmark"></i> Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6 w-[180px]">Timestamp</th>
                  <th className="py-3 px-6">Action / Event</th>
                  <th className="py-3 px-6 w-[220px]">Target User</th>
                  <th className="py-3 px-6 text-right w-[160px]">Activity Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-900 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{log.action_details}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-900 whitespace-nowrap">
                      {log.target_user_email || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm  text-slate-600 ">
                        {log.activity_type_display}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400 text-xs">
                      <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-folder-open text-base text-slate-300"></i>
                        <span>No logs match the current filters.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span>Showing {filteredLogs.length} of {logs.length} logs</span>
            {(searchQuery || typeFilter !== 'ALL' || timeFilter) && (
              <span className="text-indigo-500">Filters active</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminActivityLog;