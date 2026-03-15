import React, { useState } from 'react';

const ExternalShareView = () => {
  // Mock statuses: 'active', 'expired', or 'revoked'
  const linkStatus = "active"; 
  // Protection toggle: 'protected' or 'public'
  const linkType = "protected"; 

  const [email, setEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(linkType === "public");
  const [error, setError] = useState("");

  const fileData = {
    name: "Project_Proposal_2024.pdf",
    size: "4.2 MB",
    sender: "Abhiram S",
    expiry: "48h",
    icon: "fa-file-pdf",
    color: "#ff4444"
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    // Basic validation check
    if (!email.includes("@") || email.length < 5) {
      setError("Please enter a valid recipient email.");
      return;
    }
    setError("");
    setIsUnlocked(true);
  };

  // Helper to render the content based on status and protection
  const renderCardContent = () => {
    if (linkStatus === 'expired') {
      return (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6 shadow-inner">
             <i className="fa-solid fa-clock-rotate-left text-3xl text-amber-500"></i>
          </div>
          <h1 className="text-xl font-bold mb-2">Link Expired</h1>
          <p className="text-[#808080] text-sm mb-8 px-6 leading-relaxed">
            This shared link has reached its time limit and is no longer accessible. Please contact <strong>{fileData.sender}</strong> for a new link.
          </p>
        </>
      );
    }

    if (linkStatus === 'revoked') {
      return (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6 shadow-inner">
             <i className="fa-solid fa-ban text-3xl text-red-500"></i>
          </div>
          <h1 className="text-xl font-bold mb-2">Access Revoked</h1>
          <p className="text-[#808080] text-sm mb-8 px-6 leading-relaxed">
            The sender has manually revoked access to this file. You no longer have permission to view or download this content.
          </p>
        </>
      );
    }

    // Active Status - Handle Protection Logic
    if (!isUnlocked) {
      return (
        <>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-6">
             <i className="fa-solid fa-shield-lock text-3xl text-blue-500"></i>
          </div>
          <h1 className="text-xl font-bold mb-2 px-4">Protected Transfer</h1>
          <p className="text-[#808080] text-sm mb-8 px-6 leading-relaxed">
            This file is protected by <strong>Identity Validation</strong>. Please enter the email address where you received this link to unlock it.
          </p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter recipient email"
                    className={`w-full bg-black border ${error ? 'border-red-500/50' : 'border-[#1a1a1a]'} rounded-xl py-4 px-5 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-[#333]`}
                />
                {error && <p className="text-left text-[10px] text-red-500 mt-2 ml-1 font-bold uppercase tracking-wider">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-white text-black hover:bg-[#eee] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
               <span>Unlock File</span>
               <i className="fa-solid fa-key text-xs group-hover:rotate-12 transition-transform"></i>
            </button>
          </form>
        </>
      );
    }

    // Active & Unlocked State
    return (
      <>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#111] border border-[#1a1a1a] mb-6 shadow-inner animate-in zoom-in duration-500">
           <i className={`fa-solid ${fileData.icon} text-3xl`} style={{ color: fileData.color }}></i>
        </div>
        <h1 className="text-xl font-bold mb-2 truncate px-4">Ready for Download</h1>
        <p className="text-[#808080] text-sm mb-8 px-6 leading-relaxed">
          {fileData.sender} has securely shared a document with you. Click below to save it to your device.
        </p>
        <div className="bg-black/40 border border-[#1a1a1a] rounded-xl p-4 mb-8 text-left flex items-center justify-between group hover:border-blue-500/30 transition-colors">
            <div className="overflow-hidden mr-4">
                <p className="text-sm font-medium text-white truncate">{fileData.name}</p>
                <p className="text-[11px] text-[#808080] mt-0.5">{fileData.size} • Expires in {fileData.expiry}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <i className="fa-solid fa-shield-check text-emerald-500 text-xs"></i>
            </div>
        </div>
        <button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 group shadow-lg shadow-blue-500/10 active:scale-[0.98]">
           <span>Download File</span>
           <i className="fa-solid fa-download text-sm group-hover:translate-y-0.5 transition-transform"></i>
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
      {/* Background Glow Decor */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] blur-[120px] pointer-events-none transition-colors duration-1000 ${
        linkStatus === 'expired' ? 'bg-amber-600/10' : 
        linkStatus === 'revoked' ? 'bg-red-600/10' : 
        (!isUnlocked ? 'bg-blue-900/20' : 'bg-blue-600/10')
      }`}></div>

      <div className="w-full max-w-[480px] z-10">
        <div className="flex justify-center mb-10">
          <span className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-[10px]">
                <i className="fa-solid fa-database"></i>
            </div>
            HiveDrive
          </span>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[24px] p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500">
          {/* Status-specific top accent line */}
          <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors duration-500 ${
            linkStatus === 'expired' ? 'bg-amber-500/50' : 
            linkStatus === 'revoked' ? 'bg-red-500/50' : 
            (!isUnlocked ? 'bg-blue-500/50' : 'bg-emerald-500/50')
          }`}></div>

          <div className="text-center">
            {renderCardContent()}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
            <p className="text-[11px] text-[#444] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2">
                <i className="fa-solid fa-lock text-[9px]"></i>
                End-to-End Encrypted Transfer
            </p>
        </div>
      </div>
    </div>
  );
};

export default ExternalShareView;