import React, { useState } from 'react';

const ManagerReports = () => {
  const [reportType, setReportType] = useState('weekly'); 
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3; // Adjust this number as needed

  const dataSources = {
    weekly: {
      totalShared: 342,
      activeLinks: 24,
      storageUsed: "12.8 GB",
      avgEngagement: "82%",
      deliveryLogs: [
        { recipient: "Abhiram K.", email: "abhiram@innovature.com", file: "Project_Brief.pdf", date: "Today, 09:00 AM", method: "Direct Link", status: "Downloaded" },
        { recipient: "Sarah Chen", email: "sarah.c@client.com", file: "Design_Assets.zip", date: "Yesterday", method: "Email", status: "Opened" },
        { recipient: "Legal Team", email: "legal@firm.com", file: "NDA_Final.docx", date: "Mar 11, 2026", method: "Secure Portal", status: "Pending" },
        { recipient: "John Doe", email: "john@example.com", file: "Invoice_01.pdf", date: "Mar 10, 2026", method: "Email", status: "Downloaded" },
      ]
    },
    monthly: {
      totalShared: 1540,
      activeLinks: 92,
      storageUsed: "54.2 GB",
      avgEngagement: "74%",
      deliveryLogs: [
        { recipient: "Marketing Dept", email: "marketing@global.com", file: "Q1_Brand_Kit.zip", date: "Mar 05, 2026", method: "Email", status: "Downloaded" },
        { recipient: "James Wilson", email: "j.wilson@partner.com", file: "Contract_V2.pdf", date: "Feb 28, 2026", method: "Direct Link", status: "Downloaded" },
        { recipient: "Product Team", email: "product@internal.com", file: "Roadmap_2026.pptx", date: "Feb 20, 2026", method: "Secure Portal", status: "Expired" },
        { recipient: "Abhiram K.", email: "abhiram@innovature.com", file: "Invoices_Feb.rar", date: "Feb 15, 2026", method: "Email", status: "Downloaded" },
        { recipient: "External Audit", email: "audit@deloitte.com", file: "Tax_Docs.zip", date: "Feb 10, 2026", method: "Direct Link", status: "Opened" },
      ]
    }
  };

  const currentData = dataSources[reportType];
  
  // Pagination Logic
  const totalPages = Math.ceil(currentData.deliveryLogs.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = currentData.deliveryLogs.slice(indexOfFirstRow, indexOfLastRow);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Downloaded': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Opened': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Expired': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-[#808080] bg-[#111] border-[#1a1a1a]';
    }
  };

  return (
    <div className="flex-1 bg-black p-6 lg:p-10 overflow-y-auto no-scrollbar">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Delivery Reports</h1>
          <p className="text-[#808080] text-sm mt-1">
            Tracking recipient activity for <span className="text-blue-500 font-bold uppercase text-[12px]">{reportType}</span> cycle.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
            {['weekly', 'monthly'].map((type) => (
              <button 
                key={type}
                onClick={() => { setReportType(type); setCurrentPage(1); }}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all capitalize ${reportType === type ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444] hover:text-[#808080]'}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Shares', val: currentData.totalShared, icon: 'fa-paper-plane', color: 'text-blue-500' },
          { label: 'Recipient Reach', val: currentData.activeLinks + ' People', icon: 'fa-users', color: 'text-purple-500'},
          { label: 'Bandwidth', val: currentData.storageUsed, icon: 'fa-cloud-arrow-up', color: 'text-orange-500' },
          { label: 'Completion Rate', val: currentData.avgEngagement, icon: 'fa-circle-check', color: 'text-emerald-500'},
        ].map((kpi, i) => (
          <div key={i} className="bg-[#050505] border border-[#1a1a1a] p-6 rounded-2xl">
            <div className={`w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-sm mb-4 ${kpi.color}`}>
              <i className={`fa-solid ${kpi.icon}`}></i>
            </div>
            <p className="text-[10px] uppercase text-[#444] font-bold tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* RECIPIENT ACTIVITY TABLE */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-l overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1a1a1a] bg-[#080808]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Recipient Engagement Log</h3>
            <p className="text-[10px] text-[#444] font-bold mt-1 uppercase">Detailed delivery status</p>
          </div>

          {/* TABLE PAGINATION CONTROLS */}
          <div className="flex items-center gap-3 p-1.5 ">
            <span className="text-[10px] font-bold text-[#444] uppercase px-2">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a1a1a] transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-[#0a0a0a] text-white hover:border-[#333]'}`}
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a1a1a] transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-[#0a0a0a] text-white hover:border-[#333]'}`}
              >
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#080808] text-[10px] font-bold text-[#444] uppercase tracking-widest border-b border-[#1a1a1a]">
                <th className="p-5">Recipient</th>
                <th className="p-5">File Shared</th>
                <th className="p-5">Date & Method</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a0a0a]">
              {currentRows.map((log, i) => (
                <tr key={i} className="hover:bg-[#080808] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#0a0a0a] border border-[#333] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        {log.recipient.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{log.recipient}</p>
                        <p className="text-[11px] text-[#444] mt-1 group-hover:text-[#666]">{log.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-file-pdf text-xs text-red-500/50"></i>
                      <span className="text-sm text-[#ccc]">{log.file}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="text-sm text-white font-medium">{log.date}</p>
                    <p className="text-[10px] text-[#444] uppercase font-bold">{log.method}</p>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${getStatusColor(log.status)}`}>
                      {log.status}
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