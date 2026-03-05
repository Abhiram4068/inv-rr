import React from 'react';

const NotFound = () => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
      {/* Visual Element */}
      <div className="relative mb-8">
        <div className="text-[120px] md:text-[160px] font-black text-[#0a0a0a] leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#3b82f610] border border-[#3b82f630] flex items-center justify-center backdrop-blur-sm rotate-12 animate-pulse">
            <i className="fa-solid fa-link-slash text-[#3b82f6] text-3xl -rotate-12"></i>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
          Lost in the cloud?
        </h1>
        <p className="text-[#808080] text-sm md:text-base mb-10 leading-relaxed">
          The document or link you're looking for doesn't exist or has been moved to a private vault.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="/" 
            className="w-full sm:w-auto bg-[#3b82f6] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-house text-[12px]"></i>
            Back to Dashboard
          </a>
          
         
        </div>
      </div>

      {/* Subtle Footer Note */}
      <div className="mt-20 flex items-center gap-2 text-[10px] text-[#333] uppercase tracking-[0.2em]">
        <i className="fa-solid fa-shield-halved"></i>
        <span>Secure Hive Protocol</span>
      </div>
    </main>
  );
};

export default NotFound;