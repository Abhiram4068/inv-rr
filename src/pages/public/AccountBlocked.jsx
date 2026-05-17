import React from 'react';
import useAuth from "../../hooks/useAuth";

const AccountBlocked = () => {
    const { logout } = useAuth();

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
            {/* Visual Element */}
            <div className="relative mb-8">
                <div className="text-[120px] md:text-[160px] font-black text-[#111] leading-none select-none">
                    BLOCKED
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-[#ef444410] border border-[#ef444430] flex items-center justify-center backdrop-blur-md rotate-12 animate-pulse">
                        <i className="fa-solid fa-ban text-[#ef4444] text-4xl -rotate-12"></i>
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <div className="max-w-md w-full">
                <h1 className="text-3xl font-bold mb-4 tracking-tight">
                    Account Blocked
                </h1>
                <p className="text-[#808080] text-base mb-8 leading-relaxed">
                    Your access to the HiveDrive workspace has been blocked by an administrator. Please contact your system administrator or support team for further assistance.
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={logout}
                        className="text-[#666] hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-right-from-bracket text-[12px]"></i>
                        Sign out and try another account
                    </button>
                </div>
            </div>

            {/* Subtle Footer Note */}
            <div className="mt-20 flex items-center gap-2 text-[10px] text-[#333] uppercase tracking-[0.2em]">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Hive Security Division</span>
            </div>
        </main>
    );
};

export default AccountBlocked;
