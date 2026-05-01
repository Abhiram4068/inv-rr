import React, { useState, useEffect, useRef  } from 'react';
import { getReports } from '../../services/reportService';
import { formatDateTime } from '../../utils/dateFormatter';
const ManagerReports = () => {
  // 1. Theme State Sync Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [reportType, setReportType] = useState('weekly'); 
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12; 

  const [reports, setReports] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [totalCount, setTotalCount] = useState(0);


  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
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

    useEffect(() => {
    fetchReports();
    }, [currentPage, reportType, search]);

    useEffect(() => {
  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  searchDebounceRef.current = setTimeout(() => {
    setSearch(searchInput);
    setCurrentPage(1);
  }, 400);
  return () => clearTimeout(searchDebounceRef.current);
}, [searchInput]);

const handleExportCSV = async () => {
  try {
    const res = await getReports(1, rowsPerPage, true, reportType, search);

    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "mail_report.csv";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("CSV download failed:", err);
  }
};

    const fetchReports = async () => {
    try {
      const res = await getReports(currentPage, rowsPerPage, false, reportType, search); // match your rowsPerPage

      setReports(res.data.results);
      setDashboard(res.data.dashboard);
      setTotalCount(res.data.count);

    } catch (err) {
      console.error(err);
    }
    };

  const isDark = theme === 'dark';

  const dataSources = {
    weekly: {
      totalShared: 342,
      activeLinks: 24,
      storageUsed: "12.8 GB",
      avgEngagement: "82%",
      deliveryLogs: [
        { recipient: "Abhiram K.", email: "abhiram@innovature.com", file: "Project_Brief.pdf", date: "Today, 09:00 AM", status: "Downloaded", accessedDate: "Today, 10:15 AM", expiry: "Mar 20, 2026" },
        { recipient: "Sarah Chen", email: "sarah.c@client.com", file: "Design_Assets.zip", date: "Yesterday", status: "Opened", accessedDate: "Yesterday, 02:30 PM", expiry: "Mar 19, 2026" },
        { recipient: "Legal Team", email: "legal@firm.com", file: "NDA_Final.docx", date: "Mar 11, 2026", status: "Pending", accessedDate: null, expiry: "Mar 18, 2026" },
        { recipient: "John Doe", email: "john@example.com", file: "Invoice_01.pdf", date: "Mar 10, 2026", status: "Downloaded", accessedDate: "Mar 11, 2026", expiry: "Mar 17, 2026" },
      ]
    },
    monthly: {
      totalShared: 1540,
      activeLinks: 92,
      storageUsed: "54.2 GB",
      avgEngagement: "74%",
      deliveryLogs: [
        { recipient: "Marketing Dept", email: "marketing@global.com", file: "Q1_Brand_Kit.zip", date: "Mar 05, 2026", status: "Downloaded", accessedDate: "Mar 06, 2026", expiry: "Apr 05, 2026" },
        { recipient: "James Wilson", email: "j.wilson@partner.com", file: "Contract_V2.pdf", date: "Feb 28, 2026", status: "Downloaded", accessedDate: "Mar 01, 2026", expiry: "Mar 28, 2026" },
        { recipient: "Product Team", email: "product@internal.com", file: "Roadmap_2026.pptx", date: "Feb 20, 2026", status: "Expired", accessedDate: null, expiry: "Feb 27, 2026" },
        { recipient: "Abhiram K.", email: "abhiram@innovature.com", file: "Invoices_Feb.rar", date: "Feb 15, 2026", status: "Downloaded", accessedDate: "Feb 16, 2026", expiry: "Mar 15, 2026" },
        { recipient: "External Audit", email: "audit@deloitte.com", file: "Tax_Docs.zip", date: "Feb 10, 2026", status: "Opened", accessedDate: "Feb 11, 2026", expiry: "Feb 20, 2026" },
      ]
    }
  };

  const currentData = {
  totalShared: dashboard.total_shares || 0,
  activeLinks: dashboard.active_links || 0,
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
    <div className={`flex-1 overflow-y-auto no-scrollbar transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'} p-6 lg:p-10`}>
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Delivery Reports</h1>
          <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1`}>
            Tracking recipient activity for <span className="text-blue-500 font-bold uppercase text-[12px]">{reportType}</span> cycle.
          </p>
        </div>
        
         <div className="flex items-center justify-center gap-3">
          <div className={`flex p-1 rounded-xl border transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            {['weekly', 'monthly'].map((type) => (
              <button 
                key={type}
                onClick={() => { setReportType(type); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all capitalize ${reportType === type ? (isDark ? 'bg-[#1a1a1a] text-white shadow-lg' : 'bg-slate-100 text-slate-800 shadow-sm') : (isDark ? 'text-[#444] hover:text-[#808080]' : 'text-slate-400 hover:text-slate-600')}`}
              >
                {type}
              </button>
            ))}
          </div>

          <button 
           onClick={handleExportCSV}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
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
    <button onClick={() => setSearchInput('')} className={`ml-2 ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
      <i className="fa-solid fa-xmark text-xs"></i>
    </button>
  )}
</div>


        {/* KPI METRICS */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Shares', val: currentData.totalShared },
          { label: 'Active Links', val: currentData.activeLinks},
         
          { 
            label: 'Next Report', 
            val: reportType === 'weekly' ? 'In 7 Days' : 'In 23 Days',
            isHighlight: true 
          }
        ].map((kpi, i) => (
          <div 
            key={i} 
            className={`border p-6 rounded-lg transition-all shadow-sm ${
              isDark 
                ? 'bg-[#050505] border-[#1a1a1a]' 
                : 'bg-white border-slate-200'
            } ${kpi.isHighlight ? 'border-l-4 border-l-blue-500' : ''}`}
          >
            <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
              {kpi.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${
              kpi.isHighlight 
                ? 'text-blue-500' 
                : (isDark ? 'text-white' : 'text-slate-800')
            }`}>
              {kpi.val}
            </p>
          </div>
        ))}
      </div>
      

      {/* RECIPIENT ACTIVITY TABLE */}
      <div className={`border rounded-xl overflow-hidden shadow-2xl transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#1a1a1a] bg-[#080808]/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Recipient Engagement Log</h3>
<p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
  Showing {totalCount === 0 ? 0 : indexOfFirstRow + 1}-{indexOfFirstRow + reports.length} of {totalCount}
</p>          </div>

          <div className="flex items-center gap-3 p-1.5 ">
            <span className={`text-[10px] font-bold uppercase px-2 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'} ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : (isDark ? 'bg-[#0a0a0a] text-white hover:border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50')}`}
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'} ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : (isDark ? 'bg-[#0a0a0a] text-white hover:border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50')}`}
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
              {reports.map((log, i) => {
                 
                return (
                  <tr key={i} className={`transition-colors group ${isDark ? 'hover:bg-[#080808]' : 'hover:bg-slate-50/50'}`}>
                    <td className="py-7 px-4 text-sm text-center align-middle">
                       <div className="flex items-center justify-center gap-3">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{log.recipient}</p>
                          
                        </div>
                      </div>
                    </td>
                    <td className="py-7 px-4 text-sm text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-file-pdf text-xs text-red-500/50"></i>
                        <span className={`font-bold block leading-tight ${isDark ? 'text-white' : 'text-slate-700'}`}>{log.file_name}</span>
                      </div>
                    </td>
                   <td className="py-7 px-4 text-sm text-center align-middle">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {formatDateTime(log.sort_time)}
                  </div>
                  <div className={`text-[10px] font-bold uppercase mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    {/* extract time if needed OR leave blank */}
                  </div>
                </td>
   <td className="py-7 px-4 text-sm text-center align-middle">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{log.accessed ? formatDateTime(log.accessed_at) : "Not yet Accessed"}</div>

                      </td>
                  <td className="py-7 px-4 text-sm text-center align-middle">
                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${getStatusStyle(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;