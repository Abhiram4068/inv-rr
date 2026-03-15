import React from 'react';
import FileCard from '../../components/FileCard';

const PaginatedFiles = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] no-scrollbar bg-black">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="w-full max-w-[450px] bg-[#0a0a0a] border border-[#1a1a1a] p-[10px_16px] rounded-xl flex items-center">
          <i className="fa fa-search text-[#808080]"></i>
          <input 
            type="text" 
            placeholder="Search Your Files..." 
            className="bg-transparent border-none text-white ml-3 w-full outline-none text-sm" 
          />
        </div>
        <a href="/upload-file" className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl no-underline font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2">
          <i className="fa fa-plus"></i> New Document
        </a>
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-[18px] md:text-[20px] font-semibold text-white">My Files</div>
        <div className="text-[#808080] text-sm">1,248 items</div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        <FileCard 
          title="Project_Proposal_2024.pdf" 
          size="4.2 MB" 
          time="2h ago" 
          iconClass="fa-file-pdf" 
          isLink={true} 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="Q4_Financial_Report.docx" 
          size="1.8 MB" 
          time="Yesterday" 
          iconClass="fa-file-word" 
        />
        <FileCard 
          title="branding_assets.zip" 
          size="124 MB" 
          time="3 days ago" 
          iconClass="fa-file-zipper" 
        />
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-center items-center gap-2 py-6">
        <button className="bg-[#0a0a0a] border border-[#1a1a1a] text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#111]">
          <i className="fa fa-chevron-left text-xs"></i>
        </button>
        <button className="bg-[#0a0a0a] border-[#3b82f6] text-[#3b82f6] border w-10 h-10 rounded-lg font-semibold">1</button>
        <button className="bg-[#0a0a0a] border border-[#1a1a1a] text-white w-10 h-10 rounded-lg hover:bg-[#111]">2</button>
        <button className="bg-[#0a0a0a] border border-[#1a1a1a] text-white w-10 h-10 rounded-lg hover:bg-[#111]">3</button>
        <button className="bg-[#0a0a0a] border border-[#1a1a1a] text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#111]">
          <i className="fa fa-chevron-right text-xs"></i>
        </button>
      </div>

      {/* Mobile Storage Warning (matches your HTML) */}
      <div className="lg:hidden mt-8 space-y-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
          <div className="text-sm font-semibold mb-2 text-white">Storage Status</div>
          <div className="h-1.5 bg-[#222] rounded-full overflow-hidden mb-3">
            <div className="w-[93%] h-full bg-[#ff4444]"></div>
          </div>
          <p className="text-xs text-[#808080]">14.08 GB of 15 GB used (93%)</p>
        </div>
      </div>
    </main>
  );
};

export default PaginatedFiles;