import React from 'react';

const FileCard = ({ title, size, time, iconClass, isLink = false }) => {
  const Content = (
    <>
      <div className="h-[140px] bg-[#111] flex items-center justify-center relative border-b border-[#1a1a1a]">
        <i className={`fa-solid ${iconClass} text-[40px] text-[#808080] absolute z-10 group-hover:scale-110 transition-transform`}></i>
        <img src="https://via.placeholder.com/300x140/111/111" alt="preview" className="w-full h-full object-cover opacity-40" />
      </div>
      <div className="p-4">
        <span className="block text-sm font-medium mb-2 truncate text-white">{title}</span>
        <div className="flex justify-between text-[12px] text-[#808080]">
          <span>{size}</span>
          <span>{time}</span>
        </div>
      </div>
    </>
  );

  const containerClass = "bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition-all hover:border-[#333] hover:-translate-y-1 no-underline group cursor-pointer";

  return isLink ? (
    <a href="/details" className={containerClass}>{Content}</a>
  ) : (
    <div className={containerClass}>{Content}</div>
  );
};

export default FileCard;