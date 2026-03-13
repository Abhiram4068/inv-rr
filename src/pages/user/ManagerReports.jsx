import React, { useState } from 'react';

const ManagerReports = () => {
  const [reportType, setReportType] = useState('weekly'); // 'weekly' or 'monthly'

  // Mock Data organized by report type
  const dataSources = {
    weekly: {
      totalShared: 342,
      activeLinks: 24,
      storageUsed: "12.8 GB",
      avgEngagement: "82%",
      topFiles: [
        { name: "Project_Brief_March.pdf", shares: 120, downloads: 98, status: "High" },
        { name: "Design_Assets.zip", shares: 85, downloads: 70, status: "Stable" },
        { name: "Meeting_Notes.docx", shares: 42, downloads: 12, status: "Low" },
      ]
    },
    monthly: {
      totalShared: 1540,
      activeLinks: 92,
      storageUsed: "54.2 GB",
      avgEngagement: "74%",
      topFiles: [
        { name: "Full_Q1_Report.pdf", shares: 620, downloads: 580, status: "High" },
        { name: "Brand_Guidelines_2026.zip", shares: 450, downloads: 410, status: "High" },
        { name: "Client_Feedback_Log.xlsx", shares: 210, downloads: 190, status: "Stable" },
        { name: "Onboarding_Video.mp4", shares: 180, downloads: 140, status: "Stable" },
        { name: "Archived_Logs.rar", shares: 80, downloads: 20, status: "Low" },
      ]
    }
  };

  // Get current data based on state
  const currentData = dataSources[reportType];

  const downloadExcel = () => {
    // In a real app, you would pass 'currentData' to an excel export library
    alert(`Exporting ${reportType.toUpperCase()} data: ${currentData.totalShared} shares recorded.`);
  };

  return (
    <div className="flex-1 bg-black p-6 lg:p-10 overflow-y-auto no-scrollbar">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
          <p className="text-[#808080] text-sm mt-1">
            Viewing <span className="text-blue-500 font-bold uppercase text-[12px]">{reportType}</span> performance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
            <button 
              onClick={() => setReportType('weekly')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${reportType === 'weekly' ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444] hover:text-[#808080]'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setReportType('monthly')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${reportType === 'monthly' ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444] hover:text-[#808080]'}`}
            >
              Monthly
            </button>
          </div>

          <button 
            onClick={downloadExcel}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <i className="fa-solid fa-file-excel"></i> Export Excel
          </button>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Files Shared', val: currentData.totalShared, icon: 'fa-share-nodes', color: 'text-blue-500' },
          { label: 'Active Links', val: currentData.activeLinks, icon: 'fa-link', color: 'text-purple-500'},
          { label: 'Storage Bandwidth', val: currentData.storageUsed, icon: 'fa-hard-drive', color: 'text-orange-500' },
          { label: 'Avg. Engagement', val: currentData.avgEngagement, icon: 'fa-chart-line', color: 'text-emerald-500'},
        ].map((kpi, i) => (
          <div key={i} className="bg-[#050505] border border-[#1a1a1a] p-6 rounded-2xl group transition-all hover:border-[#333]">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-lg ${kpi.color}`}>
                <i className={`fa-solid ${kpi.icon}`}></i>
              </div>
            </div>
            <p className="text-[10px] uppercase text-[#444] font-bold tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-bold text-white mt-1 tracking-tight">{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* FULL WIDTH TABLE SECTION */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#080808]/50">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Top Performing Assets</h3>
            <p className="text-[10px] text-[#444] font-bold mt-1 uppercase">Stats for this {reportType} cycle</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#080808] text-[10px] font-bold text-[#444] uppercase tracking-widest">
                <th className="p-5">File Name</th>
                <th className="p-5">Shares</th>
                <th className="p-5">Downloads</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a0a0a]">
              {currentData.topFiles.map((file, i) => (
                <tr key={i} className="hover:bg-[#080808] transition-colors group">
                  <td className="p-5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-sm text-blue-500 group-hover:bg-blue-500/10 transition-all">
                      <i className="fa-solid fa-file-lines"></i>
                    </div>
                    <span className="text-sm font-medium text-[#ccc] group-hover:text-white">{file.name}</span>
                  </td>
                  <td className="p-5 text-sm font-bold text-white">{file.shares}</td>
                  <td className="p-5 text-sm text-[#808080]">{file.downloads}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#111] h-1.5 rounded-full overflow-hidden min-w-[100px]">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${file.status === 'High' ? 'bg-emerald-500' : file.status === 'Stable' ? 'bg-blue-500' : 'bg-orange-500'}`} 
                          style={{ width: file.status === 'High' ? '90%' : file.status === 'Stable' ? '60%' : '30%' }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${file.status === 'High' ? 'text-emerald-500' : file.status === 'Stable' ? 'text-blue-500' : 'text-orange-500'}`}>
                        {file.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <i className={`fa-solid ${file.status === 'High' ? 'fa-arrow-trend-up text-emerald-500' : 'fa-arrow-right text-[#444]'}`}></i>
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