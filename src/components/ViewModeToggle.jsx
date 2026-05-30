import React from 'react';

const ViewModeToggle = ({ viewMode = 'file_grid', onChange, isDark }) => {
  const prefix = viewMode.includes('_') ? viewMode.split('_')[0] : 'file';
  const gridMode = `${prefix}_grid`;
  const listMode = `${prefix}_list`;

  return (
    <div className={`flex items-center rounded-xl border overflow-hidden flex-shrink-0 ${isDark ? 'border-[#1a1a1a] bg-[#0a0a0a]' : 'border-slate-200 bg-white'}`}>
      <button
        type="button"
        onClick={() => onChange(gridMode)}
        title="Grid View"
        className={`w-10 h-10 flex items-center justify-center transition-all text-sm
          ${viewMode === gridMode
            ? 'bg-blue-600/10 text-blue-500'
            : isDark ? 'text-[#555] hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <i className="fa-solid fa-grip" />
      </button>
      <div className={`w-px h-5 ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-200'}`} />
      <button
        type="button"
        onClick={() => onChange(listMode)}
        title="List View"
        className={`w-10 h-10 flex items-center justify-center transition-all text-sm
          ${viewMode === listMode
            ? 'bg-blue-600/10 text-blue-500'
            : isDark ? 'text-[#555] hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <i className="fa-solid fa-list" />
      </button>
    </div>
  );
};

export default ViewModeToggle;