import React from 'react';
import { Link } from "react-router-dom";
const Dashboard = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar bg-black text-white">
      
      {/* 1. TOP BAR: SEARCH & PRIMARY ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full max-w-[500px] bg-[#0a0a0a] border border-[#1a1a1a] p-[12px_20px] rounded-2xl flex items-center shadow-sm">
          <i className="fa fa-search text-[#444]"></i>
          <input type="text" placeholder="Search files, logs, or schedules..." className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-[#0a0a0a] border border-[#1a1a1a] text-[#808080] p-[10px_20px] rounded-xl font-bold text-xs hover:text-white transition-all flex items-center justify-center gap-2">
            <i className="fa-solid fa-gear"></i> Settings
          </button>
          <Link to="/upload-file" className="flex-1 md:flex-none bg-blue-600 text-white p-[10px_24px] rounded-xl font-bold text-xs transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
            <i className="fa fa-plus text-[10px]"></i> New Document
         </Link>
        </div>
      </div>

      {/* 2. KPI STRIP: TOTALS & NEXT REPORT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Sent" value="8,492" sub="Files delivered"  color="text-blue-500" />
        <StatCard label="Shared Contacts" value="142" sub="Active recipients" color="text-purple-500" />
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl flex flex-col justify-center">
          <div className="text-[10px] text-blue-500 uppercase tracking-widest font-black mb-1">Next Report In</div>
          
          <div className="text-[10px] text-[#444] mt-1 font-bold uppercase">Weekly Cycle</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-[#808080] uppercase font-bold tracking-widest">Storage used</span>
            
          </div>
          <div className="text-xl font-bold">14.08 <span className="text-xs text-[#444]">GB</span></div>
          <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full w-[28%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 3. SCHEDULED TODAY (Horizontal Scroller/List) */}
     

      {/* 4. ACTIVITY & LINKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-l p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="font-bold text-sm uppercase tracking-tighter text-white">Recent Activities</div>
            <div className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">View all logs</div>
          </div>
          <div className="space-y-3">
            <ActivityItem icon="fa-folder" title="Q1_Financial_Review" sub="Folder • Shared with 8 people" time="2h ago" />
            <ActivityItem icon="fa-file-pdf" title="Project_Brief_V2" sub="PDF Document • Modified 5h ago" time="5h ago" />
            <ActivityItem icon="fa-file-zipper" title="Assets_Export" sub="Archive • Downloaded 12 times" time="Yesterday" />
          </div>
        </div>

        {/* Active Shared Links */}
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-l p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="font-bold text-sm uppercase tracking-tighter text-white">Active Shared Links</div>
            <div className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Manage links</div>
          </div>
          <div className="space-y-3">
            <SharedLinkItem title="hivedrive.io/s/bk82k9" expiry="Expires in 2 days" clicks="124" active={true} />
            <SharedLinkItem title="hivedrive.io/s/pw15x2" expiry="Expired" clicks="45" active={false} />
            <SharedLinkItem title="hivedrive.io/s/ml09z4" expiry="Expires in 5 days" clicks="12" active={true} />
          </div>
        </div>
      </div>
    </main>
  );
};

/* --- MINI COMPONENTS --- */

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-2xl transition-all hover:border-[#222]">
    <div className="flex justify-between items-start mb-2">
      <div className="text-2xl font-bold">{value}</div>
   
    </div>
    <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold">{label}</div>
    <div className="text-[10px] text-[#333] mt-1 font-medium">{sub}</div>
  </div>
);

const ScheduleCard = ({ time, title, desc, type, isDone }) => (
  <div className={`p-4 rounded-2xl border transition-all ${isDone ? 'bg-black border-[#1a1a1a] opacity-50' : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-blue-500/30'}`}>
    <div className="flex justify-between items-start mb-3">
      <span className="text-[10px] font-black text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded uppercase tracking-tighter">{time}</span>
      <span className="text-[9px] text-[#444] font-bold uppercase tracking-widest">{type}</span>
    </div>
    <h5 className="text-sm font-bold mb-1 truncate">{title}</h5>
    <p className="text-[11px] text-[#666] leading-relaxed line-clamp-1">{desc}</p>
  </div>
);

const ActivityItem = ({ icon, title, sub, time }) => (
  <div className="flex items-center p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-[#0f0f0f] transition-all cursor-pointer group">
    <div className="w-10 h-10 rounded-xl bg-black border border-[#1a1a1a] flex items-center justify-center mr-4 group-hover:border-blue-500/50 transition-all">
        <i className={`fa-solid ${icon} text-[16px] text-[#333] group-hover:text-blue-500`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate text-[#ccc] group-hover:text-white">{title}</p>
      <p className="text-[11px] text-[#444] font-medium">{sub}</p>
    </div>
    <div className="text-[10px] font-bold text-[#333] uppercase ml-2">{time}</div>
  </div>
);

const SharedLinkItem = ({ title, expiry, clicks, active }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-[#0f0f0f] transition-all cursor-pointer">
    <div className="flex items-center min-w-0">
      <div className={`w-2 h-2 rounded-full mr-4 ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-[#222]'}`}></div>
      <div className="min-w-0">
        <p className="text-sm font-bold truncate text-[#ccc]">{title}</p>
        <p className="text-[10px] text-[#444] font-black uppercase tracking-tighter">{clicks} views • {expiry}</p>
      </div>
    </div>
    <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-[#222]"></i>
  </div>
);

export default Dashboard;