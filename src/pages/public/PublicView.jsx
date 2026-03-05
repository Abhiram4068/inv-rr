import React from 'react';

const ExternalShareView = () => {
  // This would typically come from a URL param / API
  const fileData = {
    name: "Project_Proposal_2024.pdf",
    size: "4.2 MB",
    sender: "Abhiram S",
    expiry: "Expires in 48 hours",
    icon: "fa-file-pdf",
    color: "#ff4444"
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
      {/* Background Glow Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[480px] z-10">
        {/* Brand/Logo Area */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            
            <span className="font-bold text-xl tracking-tight">HiveDrive</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[14px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Progress Bar Decoration at top */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#111] border border-[#1a1a1a] mb-6 shadow-inner">
               <i className={`fa-solid ${fileData.icon} text-3xl`} style={{ color: fileData.color }}></i>
            </div>
            
            <h1 className="text-xl font-bold mb-2 truncate px-4">
              You've received a file
            </h1>
            <p className="text-[#808080] text-sm mb-8 px-6 leading-relaxed">
              {fileData.sender} has securely shared a document with you. Click below to save it to your device.
            </p>

            {/* File Info Box */}
            <div className="bg-black/40 border border-[#1a1a1a] rounded-xl p-4 mb-8 text-left flex items-center justify-between">
                <div className="overflow-hidden mr-4">
                    <p className="text-sm font-medium text-white truncate">{fileData.name}</p>
                    <p className="text-[11px] text-[#808080] mt-0.5">{fileData.size} • {fileData.expiry}</p>
                </div>
                <i className="fa-solid fa-shield-check text-emerald-500/50 text-sm"></i>
            </div>

            {/* Action Button */}
            <button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 group shadow-lg shadow-blue-500/10 active:scale-[0.98]">
               <span>Download File</span>
               <i className="fa-solid fa-download text-sm group-hover:translate-y-0.5 transition-transform"></i>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
            <p className="text-[11px] text-[#444] uppercase tracking-[0.2em] font-medium">
                Encrypted & Secured by Hive Protocol
            </p>
            <div className="mt-4 flex justify-center gap-6">
                <a href="#" className="text-[#808080] text-[12px] hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-[#808080] text-[12px] hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-[#808080] text-[12px] hover:text-white transition-colors">Report Abuse</a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalShareView;