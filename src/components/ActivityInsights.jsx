import React from "react";
import { Link } from "react-router-dom";
const ActivityInsights = () => {
  return (
    <aside className="hidden lg:block w-[320px] p-[24px_20px] border-l border-[#555] bg-black overflow-y-auto custom-scrollbar">
      {/* ACTIVITY SUMMARY */}
      <div className="bg-[#0a0a0a] border border-[#555] rounded-xl p-5 mb-4">
        <div className="text-base font-semibold mb-3 text-white">
          Activity Summary
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#808080]">Added Today</span>
            <span className="text-xs font-semibold text-white">12 files</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#808080]">Shares Received</span>
            <span className="text-xs font-semibold text-white">4 folders</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#808080]">Recent Downloads</span>
            <span className="text-xs font-semibold text-white">8 items</span>
          </div>
        </div>
      </div>

      {/* SYNC STATUS */}
      <div className="bg-[#0a0a0a] border border-[#555] rounded-xl p-5">
        <div className="text-[13px] font-semibold mb-2 text-white">
          Sync Status
        </div>

        <div className="flex items-center gap-2 text-[#00c851] text-[12px] mb-3">
          <i className="fa-solid fa-circle-check"></i>
          <span>All files up to date</span>
        </div>

        <p className="text-[11px] text-[#808080] leading-relaxed">
          Your cloud storage was last synchronized at 7:34 PM today.
        </p>
      </div>
    </aside>
  );
};

export default ActivityInsights;