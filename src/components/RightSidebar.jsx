import React from 'react';

const RightSidebar = () => {
  return (
    <aside className="hidden lg:block w-[320px] p-[24px_20px] border-l border-[#1a1a1a] overflow-y-auto bg-black">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-4 text-white">
        <div className="text-base font-semibold mb-2">Home</div>
        <p className="text-[12px] text-[#808080] leading-relaxed mb-5">Your personal HiveDrive frontpage. Check in with your most important documents.</p>
        <a 
  href="/upload-file"
  className="block w-full p-2.5 bg-[#e3e3e3] text-black rounded-[20px] font-semibold text-center text-sm mb-3 inline-block"
>
  Upload File
</a>

<a 
  href="/collections"
  className="block w-full p-2.5 bg-transparent text-white border border-[#1a1a1a] rounded-[20px] font-semibold text-center text-sm hover:bg-[#111] inline-block"
>
  Collections
</a>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
        <div className="flex items-center gap-[10px] text-[#ff4444] text-[13px] font-semibold">
          <i className="fa-solid fa-bullhorn"></i>
          <span>STORAGE CRITICAL</span>
        </div>
        <div className="h-1 bg-[#222] rounded-full my-3">
          <div className="w-[93%] h-full bg-[#ff4444]"></div>
        </div>
        <p className="text-[12px] text-[#808080] m-0">14.08 GB of 15 GB used (93%)</p>
        <p className="text-[11px] text-[#3b82f6] mt-[10px] cursor-pointer hover:underline">Upgrade Storage Plan</p>
      </div>
    </aside>
  );
};

export default RightSidebar;