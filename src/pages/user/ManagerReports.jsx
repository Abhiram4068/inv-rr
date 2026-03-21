import React, { useState, useEffect } from 'react';

const ManagerReports = () => {
  // 1. Theme State Sync Logic
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [reportType, setReportType] = useState('weekly'); 
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3; 

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

  const currentData = dataSources[reportType];
  const totalPages = Math.ceil(currentData.deliveryLogs.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = currentData.deliveryLogs.slice(indexOfFirstRow, indexOfLastRow);

  const getStatusDisplay = (status) => {
    const isAccessed = status === 'Downloaded' || status === 'Opened';
    return {
      label: isAccessed ? 'Accessed' : 'Sent',
      classes: isAccessed 
        ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
        : 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    };
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
        
        <div className="flex items-center gap-3">
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

          <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
            <i className="fa-solid fa-file-excel"></i> Export CSV
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Shares', val: currentData.totalShared },
          { label: 'Active Links', val: currentData.activeLinks + ' People'},
          { label: 'Accessed', val: currentData.storageUsed }
        ].map((kpi, i) => (
          <div key={i} className={`border p-6 rounded-2xl transition-colors shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* RECIPIENT ACTIVITY TABLE */}
      <div className={`border rounded-xl overflow-hidden shadow-2xl transition-colors ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#1a1a1a] bg-[#080808]/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Recipient Engagement Log</h3>
            <p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Detailed delivery status</p>
          </div>

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
              <tr className={`text-[10px] font-bold uppercase tracking-widest border-b ${isDark ? 'bg-[#080808] text-[#444] border-[#1a1a1a]' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                <th className="p-5">Recipient</th>
                <th className="p-5">File Shared</th>
                <th className="p-5">Date</th>
                <th className="p-5">Accessed Date</th>
                <th className="p-5">Expiry</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#0a0a0a]' : 'divide-slate-50'}`}>
              {currentRows.map((log, i) => {
                const statusInfo = getStatusDisplay(log.status);
                return (
                  <tr key={i} className={`transition-colors group ${isDark ? 'hover:bg-[#080808]' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold uppercase transition-colors ${isDark ? 'bg-gradient-to-tr from-[#1a1a1a] to-[#0a0a0a] border-[#333] text-white' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {log.recipient.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-none ${isDark ? 'text-white' : 'text-slate-700'}`}>{log.recipient}</p>
                          <p className={`text-[11px] mt-1 transition-colors ${isDark ? 'text-[#444] group-hover:text-[#666]' : 'text-slate-400 group-hover:text-slate-500'}`}>{log.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-file-pdf text-xs text-red-500/50"></i>
                        <span className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-slate-600'}`}>{log.file}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{log.date}</p>
                    </td>
                    <td className="p-5">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{log.accessedDate || "NA"}</p>
                    </td>
                    <td className="p-5">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{log.expiry}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${statusInfo.classes}`}>
                        {statusInfo.label}
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