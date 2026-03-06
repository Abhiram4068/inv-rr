import React from 'react';

const StorageDashboard = () => {
  // Mock Data for the requested sections
  const topFiles = [
    { name: "Raw_Footage_4K.mp4", size: "2.4 GB", type: "Video", icon: "fa-video" },
    { name: "Backup_Database_March.sql", size: "1.8 GB", type: "Database", icon: "fa-database" },
    { name: "Product_Photos_HighRes.zip", size: "950 MB", type: "Archive", icon: "fa-file-zipper" },
    { name: "Annual_Report_2025.pdf", size: "420 MB", type: "PDF", icon: "fa-file-pdf" },
    { name: "Old_Project_Assets.iso", size: "380 MB", type: "Image", icon: "fa-compact-disc" },
  ];

  const storageByFormat = [
    { format: "Videos", size: "8.4 GB", color: "#3b82f6", icon: "fa-video" },
    { format: "Images", size: "3.2 GB", color: "#10b981", icon: "fa-image" },
    { format: "Documents", size: "1.5 GB", color: "#f59e0b", icon: "fa-file-lines" },
    { format: "Others", size: "0.98 GB", color: "#8b5cf6", icon: "fa-ellipsis-h" },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar bg-black text-white">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()} 
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-[#111] transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-sm text-[#808080]"></i>
        </button>
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-[#808080] hover:text-white cursor-pointer">Home</span>
          <i className="fa-solid fa-chevron-right text-[10px] text-[#333]"></i>
          <span className="font-semibold text-white">Storage Management</span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Storage Overview</h1>
          <p className="text-sm text-[#808080]">Manage and optimize your workspace storage</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-[300px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
            <i className="fa fa-search text-[#808080]"></i>
            <input type="text" placeholder="Search storage..." className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" />
          </div>
 
        </div>
      </div>

      {/* Main Storage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-[10px] text-[#808080] uppercase tracking-widest mb-1">Total Storage Used</div>
              <div className="text-4xl font-bold">14.08 GB <span className="text-lg font-normal text-[#333]">/ 50 GB</span></div>
            </div>
            <div className="text-sm text-[#10b981] font-medium">28% Used</div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#111] rounded-full overflow-hidden flex mb-8">
            <div style={{ width: '45%' }} className="h-full bg-[#3b82f6]"></div>
            <div style={{ width: '20%' }} className="h-full bg-[#10b981]"></div>
            <div style={{ width: '15%' }} className="h-full bg-[#f59e0b]"></div>
            <div style={{ width: '10%' }} className="h-full bg-[#8b5cf6]"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {storageByFormat.map((item, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-[#808080]">{item.format}</span>
                </div>
                <div className="text-sm font-semibold">{item.size}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl flex flex-col justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#3b82f620] flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-cloud-arrow-up text-[#3b82f6] text-xl"></i>
          </div>
          <div className="text-2xl font-bold mb-1">35.92 GB</div>
          <div className="text-[10px] text-[#808080] uppercase tracking-widest mb-6">Remaining Space</div>
          <a href='/storage/storage-cleanup' className="w-full py-3 border border-[#1a1a1a] rounded-xl text-sm font-medium hover:bg-[#111] transition-colors">
            Free up space
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Large Files */}
        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="font-semibold text-sm">Largest Files</div>
            <div className="text-[12px] text-[#3b82f6] cursor-pointer hover:underline">Clean up</div>
          </div>
          <div className="space-y-2">
            {topFiles.map((file, i) => (
              <ActivityItem key={i} icon={file.icon} title={file.name} sub={`${file.type} • ${file.size}`} />
            ))}
          </div>
        </div>

        {/* Format Breakdown List */}
        <div>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="font-semibold text-sm">Storage by Format</div>
            <div className="text-[12px] text-[#3b82f6] cursor-pointer hover:underline">Full Report</div>
          </div>
          <div className="space-y-2">
            {storageByFormat.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:bg-[#111] transition-all cursor-pointer">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center mr-4">
                    <i className={`fa-solid ${item.icon} text-[16px]`} style={{ color: item.color }}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.format}</p>
                    <span className="text-[11px] text-[#808080]">Usage across all folders</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white">{item.size}</div>
              </div>
            ))}
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

export default StorageDashboard;