import React, { useState, useEffect, useRef } from 'react';
import { getReports, toggleMonthlyReport } from '../../services/reportService';
import { formatDateTime } from '../../utils/dateFormatter';

const ManagerReports = () => {



  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const [reports, setReports] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [monthlyReportEnabled, setMonthlyReportEnabled] = useState(false);
  const [hasReports, setHasReports] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const searchDebounceRef = useRef(null);

  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilReport = Math.ceil((lastDayOfMonth - today) / (1000 * 60 * 60 * 24));

  // Theme sync
  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'light');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  // Fetch on page/search change
  useEffect(() => {
    fetchReports();
  }, [currentPage, search]);

  // Search debounce
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchInput]);

  const fetchReports = async () => {
    try {
      const res = await getReports(currentPage, rowsPerPage, false, 'monthly', search);
      if (res.data.detail) {
        setReports([]);
        setDashboard({});
        setTotalCount(0);
        setMonthlyReportEnabled(res.data.is_toggle ?? false);
        setHasReports(false);  
        return;
      }
      setReports(res.data.results);
      setDashboard(res.data.dashboard);
      setTotalCount(res.data.count);
      setMonthlyReportEnabled(res.data.is_toggle);
      setHasReports(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await getReports(1, rowsPerPage, true, 'monthly', search);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'monthly_report.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV download failed:', err);
    }
  };

  const handleToggleMonthlyReport = async () => {
    try {
      const res = await toggleMonthlyReport();
      setMonthlyReportEnabled(res.data.monthly_report_enabled);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const isDark = theme === 'dark';

  const currentData = {
    totalShared: dashboard?.total_shares || 0,
    activeLinks: dashboard?.active_links || 0,
    hasReports: dashboard?.has_reports || false,
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Downloaded':
      case 'SHARES':
        return isDark ? 'text-emerald-500' : 'text-emerald-600';
      case 'SCHEDULES':
        return isDark ? 'text-blue-500' : 'text-blue-600';
      case 'Expired':
        return isDark ? 'text-red-500' : 'text-red-600';
      default:
        return isDark ? 'text-[#808080]' : 'text-slate-500';
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#EFEFEF] text-slate-800'} p-6 lg:p-10`}>

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Delivery Reports
          </h1>
          <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1`}>
            Tracking recipient activity for{' '}
            <span className="text-blue-500 font-bold uppercase text-[12px]">monthly</span> cycle.
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
            CSV reports auto-generated each month
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {/* Monthly Reports Toggle */}
          <button
            onClick={handleToggleMonthlyReport}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all shadow-sm cursor-pointer ${
              monthlyReportEnabled
                ? isDark
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-blue-500 border-blue-400 text-white'
                : isDark
                ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#808080] hover:border-[#333] hover:text-white'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`w-7 h-4 rounded-full transition-all relative ${monthlyReportEnabled ? 'bg-white/30' : isDark ? 'bg-[#1a1a1a]' : 'bg-slate-200'}`}>
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                  monthlyReportEnabled
                    ? 'left-3.5 bg-white'
                    : 'left-0.5 ' + (isDark ? 'bg-[#444]' : 'bg-slate-400')
                }`}
              />
            </div>
            Monthly Reports
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!hasReports}
            className={`px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 ${!hasReports ? 'bg-emerald-600 opacity-40 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'}`}
            >
            <i className="fa-solid fa-file-excel"></i> Export CSV
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className={`w-full max-w-md border p-[10px_16px] rounded-xl flex items-center mb-8 transition-colors shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
        <i className={`fa fa-search text-xs ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
        <input
          type="text"
          placeholder="Search by file name or recipient..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white placeholder:text-[#444]' : 'text-slate-800 placeholder:text-slate-400'}`}
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className={`ml-2 ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        )}
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Shares', val: currentData.totalShared },
          { label: 'Active Links', val: currentData.activeLinks },
         {
          label: 'Next Report',
          val:
            daysUntilReport === 0? 'Today': daysUntilReport === 1? 'Tomorrow': `In ${daysUntilReport} Days`,
          isHighlight: true
        }
        ].map((kpi, i) => (
          <div
            key={i}
            className={`border p-6 rounded-lg transition-all shadow-sm ${
              isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'
            } ${kpi.isHighlight ? 'border-l-4 border-l-blue-500' : ''}`}
          >
            <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
              {kpi.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${kpi.isHighlight ? 'text-blue-500' : isDark ? 'text-white' : 'text-slate-800'}`}>
              {kpi.val}
            </p>
          </div>
        ))}
      </div>

      {/* RECIPIENT ACTIVITY TABLE */}
      <div className={`border rounded-xl overflow-hidden shadow-2xl transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#1a1a1a] bg-[#080808]/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Recipient Engagement Log
            </h3>
            <p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
              Showing {totalCount === 0 ? 0 : indexOfFirstRow + 1}–{indexOfFirstRow + reports?.length || 0} of {totalCount}
            </p>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <span className={`text-[10px] font-bold uppercase px-2 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'} ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : isDark ? 'bg-[#0a0a0a] text-white hover:border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50'}`}
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'} ${currentPage === totalPages || totalPages === 0 ? 'opacity-20 cursor-not-allowed' : isDark ? 'bg-[#0a0a0a] text-white hover:border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50'}`}
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-800/40 bg-[#080808]/70' : 'text-slate-400 border-slate-200 bg-slate-50/50'}`}>
                <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Recipient</th>
                <th className="py-4 px-4 font-bold whitespace-nowrap text-center">File Shared</th>
                <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Sent Date</th>
                <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Accessed Date</th>
                <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Sent Method</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#0a0a0a]' : 'divide-slate-50'}`}>
              {reports?.map((log, i) => (
                <tr key={i} className={`transition-colors group ${isDark ? 'hover:bg-[#080808]' : 'hover:bg-slate-50/50'}`}>
                  <td className="py-7 px-4 text-sm text-center align-middle">
                    <p className={`font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                      {log.recipient}
                    </p>
                  </td>
                  <td className="py-7 px-4 text-sm text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-file-pdf text-xs text-red-500/50"></i>
                      <span className={`font-bold block leading-tight ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {log.file_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-7 px-4 text-sm text-center align-middle">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      {formatDateTime(log.sort_time)}
                    </div>
                  </td>
                  <td className="py-7 px-4 text-sm text-center align-middle">
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      {log.accessed ? formatDateTime(log.accessed_at) : 'Not yet Accessed'}
                    </div>
                  </td>
                  <td className="py-7 px-4 text-sm text-center align-middle">
                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${getStatusStyle(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;