import React from 'react';

const Dashboard = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] custom-scrollbar bg-black text-white">
      {/* Search & Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full max-w-[450px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
          <i className="fa fa-search text-[#808080]"></i>
          <input type="text" placeholder="Search dashboard..." className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" />
        </div>
        <button className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-[10px]">
          <i className="fa fa-plus"></i> New Document
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Files', value: '1,248' },
          { label: 'Storage Used', value: '14.08 GB' },
          { label: 'Shared Contacts', value: '42' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl text-center">
            <div className="text-[24px] md:text-[28px] font-bold mb-1">{stat.value}</div>
            <div className="text-[10px] text-[#808080] uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="font-semibold text-sm">Recent Activities</div>
            <div className="text-[12px] text-[#3b82f6] cursor-pointer hover:underline">View all</div>
          </div>
          <div className="space-y-2">
            <ActivityItem icon="fa-folder" title="ABHIRAM_S_RESUME" sub="Folder • Shared with 3 people" />
            <ActivityItem icon="fa-file-pdf" title="Project_Proposal_2024" sub="PDF Document • Modified 5h ago" />
          </div>
        </div>

        {/* Active Shared Links Section */}
        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="font-semibold text-sm">Active Shared Links</div>
            <div className="text-[12px] text-[#3b82f6] cursor-pointer hover:underline">Manage links</div>
          </div>
          <div className="space-y-2">
            <SharedLinkItem 
              title="hivedrive.io/s/bk82k9" 
              expiry="Expires in 2 days" 
              clicks="124 views"
              active={true}
            />
            <SharedLinkItem 
              title="hivedrive.io/s/pw15x2" 
              expiry="Expired" 
              clicks="45 views"
              active={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

const ActivityItem = ({ icon, title, sub }) => (
  <div className="flex items-center p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] transition-all hover:border-[#333] hover:bg-[#111] cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center mr-4 group-hover:bg-[#1a1a1a]">
        <i className={`fa-solid ${icon} text-[18px] text-[#808080]`}></i>
    </div>
    <div className="overflow-hidden">
      <p className="m-0 text-sm font-medium truncate">{title}</p>
      <span className="text-[11px] text-[#808080]">{sub}</span>
    </div>
  </div>
);

const SharedLinkItem = ({ title, expiry, clicks, active }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] transition-all hover:border-[#333] hover:bg-[#111] cursor-pointer">
    <div className="flex items-center overflow-hidden">
      <i className="fa-solid fa-link text-[16px] text-[#3b82f6] mr-4"></i>
      <div className="overflow-hidden">
        <p className="m-0 text-sm font-medium truncate text-white">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-[#10b98120] text-[#10b981]' : 'bg-[#ef444420] text-[#ef4444]'}`}>
                {active ? 'Active' : 'Expired'}
            </span>
            <span className="text-[11px] text-[#808080]">• {clicks}</span>
        </div>
      </div>
    </div>
    <div className="text-[11px] text-[#808080] whitespace-nowrap ml-4">
        {expiry}
    </div>
  </div>
);

export default Dashboard;