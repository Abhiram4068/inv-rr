import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { submitReactivationRequest } from "../../services/authService";

const AccountDeactivated = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setLoading(true);
        setError("");
        try {
            await submitReactivationRequest({ reason });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
            {/* Visual Element */}
            <div className="relative mb-8">
                <div className="text-[120px] md:text-[160px] font-black text-[#111] leading-none select-none">
                    INACTIVE
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-[#ef444410] border border-[#ef444430] flex items-center justify-center backdrop-blur-md rotate-12 animate-pulse">
                        <i className="fa-solid fa-user-slash text-[#ef4444] text-4xl -rotate-12"></i>
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <div className="max-w-md w-full">
                <h1 className="text-3xl font-bold mb-4 tracking-tight">
                    Account Deactivated
                </h1>
                <p className="text-[#808080] text-base mb-8 leading-relaxed">
                    Your access to the HiveDrive workspace has been restricted. If you believe this is a mistake or wish to reactivate your account, please let us know.
                </p>

                {user.has_pending_reactivation_request || submitted ? (
                    <div className="bg-[#10b98110] border border-[#10b98130] p-6 rounded-2xl mb-8 animate-in fade-in zoom-in duration-500">
                        <i className="fa-solid fa-clock-rotate-left text-[#3b82f6] text-3xl mb-4"></i>
                        <h3 className="text-white font-semibold mb-2">Request Pending</h3>
                        <p className="text-sm text-[#808080]">You have already submitted a reactivation request. The administrator will review your case shortly. Please wait for an email notification.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                        <div className="relative">
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why should your account be reactivated?"
                                className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl p-4 text-sm focus:outline-none focus:border-[#3b82f6] transition-all min-h-[120px] resize-none"
                                required
                            />
                        </div>
                        {error && <p className="text-xs text-red-500 text-left px-2">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3b82f6] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane text-[12px]"></i>
                                    Request Reactivation
                                </>
                            )}
                        </button>
                    </form>
                )}

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

export default AccountDeactivated;
