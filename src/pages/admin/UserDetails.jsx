import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService'; // Adjust path based on your file tree
import userService from '../../services/adminservice/userservice';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const data = await userService.getUserDetails(id);
                setUser(data);
            } catch (err) {
                setError(err?.response?.data?.detail);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);



    const handleBlockUser = async () => {
        setIsActionLoading(true);
        try {
            await userService.blockUser(id);
            setUser(prev => ({ ...prev, account_status: "blocked" }));
            setIsBlockModalOpen(false);
        } catch (error) {
            console.error("Failed to update user privilege state:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setIsActionLoading(true);
        try {
            await userService.deleteUser(id);
            setIsDeleteModalOpen(false);
            navigate('/admin/users');
        } catch (error) {
            console.error("Failed to delete user:", error);
            setIsActionLoading(false);
        }
    };
    
    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

      if (loading) {
        return (
            <div className="flex-1 bg-[#f0f2f7] min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex-1 bg-[#f0f2f7] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="fa-solid fa-circle-exclamation text-3xl text-rose-300 mb-3 block"></i>
                    <p className="text-slate-500 text-sm font-medium">{error || 'User not found.'}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="mt-4 px-4 py-2 text-xs font-bold text-indigo-500 border border-indigo-200 rounded-sm hover:bg-indigo-50 transition-all uppercase tracking-wider"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans relative">
            {/* Increased max width from max-w-4xl to max-w-7xl to push boundaries out on all 4 sides */}
            <div className="max-w-7xl mx-auto">
                
                {/* Back Navigation Bar */}
                <button 
                    onClick={() => navigate('/admin/users')} 
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-wider mb-6"
                >
                    <i className="fa-solid fa-arrow-left-long"></i> Back to Profiles
                </button>

                {/* Main Profile Shell (Removed border-slate-200) */}
                <div className="bg-white rounded-sm shadow-sm overflow-hidden mb-6">
                    
                    {/* Minimal Branding Banner Accenting */}
                    <div className="h-2 bg-indigo-500 w-full" />

                    {/* Top Identity Block - Increased padding to p-10 for breathing room */}
                    <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-2xl uppercase">
                                {(user.first_name?.[0] || '')}{(user.last_name?.[0] || '')}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{user.first_name} {user.last_name}</h1>
                                <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wide ${
                                user.account_status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                user.account_status === 'blocked' ? 'bg-rose-50 text-rose-600' : 
                                user.account_status === 'deleted' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                                {user.account_status}
                            </span>
                            
                            {user.account_status !== 'blocked' && user.account_status !== 'deleted' && (
                                <button
                                    onClick={() => setIsBlockModalOpen(true)}
                                    className="px-4 py-2 bg-white border border-rose-200 rounded-sm text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-wider shadow-sm"
                                >
                                    Block User
                                </button>
                            )}
                            
                            {user.account_status !== 'deleted' && (
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="px-4 py-2 bg-white border border-red-500 rounded-sm text-xs font-bold text-red-500 hover:bg-red-50 transition-all uppercase tracking-wider shadow-sm"
                                >
                                    Delete User
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Core System Properties Data Grid - Increased grid spacing and section padding */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6 border-b border-slate-400 pb-2">Profile Details</h3>
                            
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                    <span className="text-slate-400 font-medium">First Name</span>
                                    <span className="text-slate-700 font-semibold text-base">{user.first_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                    <span className="text-slate-400 font-medium">Last Name</span>
                                    <span className="text-slate-700 font-semibold text-base">{user.last_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pb-1">
                                    <span className="text-slate-400 font-medium">System Designation</span>
                                    <span className="text-slate-700 font-semibold bg-slate-50 border border-slate-100 px-3 py-1 rounded-sm text-sm">{user.designation}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6 border-b border-slate-400 pb-2">Activity Status </h3>
                            
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                    <span className="text-slate-400 font-medium">Date Joined</span>
                                    <span className="text-slate-600 font-medium text-sm">
                                        {new Date(user.date_joined).toLocaleString('en-US', { dateStyle: 'medium' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                    <span className="text-slate-400 font-medium">Last Login</span>
                                    <span className="text-slate-600 font-medium text-sm">
                                        {user.last_login ? new Date(user.last_login).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                                    <span className="text-slate-400 font-medium">Total Files Tracked</span>
                                    <span className="text-slate-700 font-bold text-base">{user.total_files_uploaded || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pb-1">
                                    <span className="text-slate-400 font-medium">Storage Metrics</span>
                                    <span className="text-slate-500 font-medium text-sm">
                                        <strong className="text-slate-700 font-semibold text-base">{formatBytes(user.storage_used_bytes)}</strong> / {formatBytes(user.storage_limit_bytes)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION DELETE MODAL OVERLAY */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !isActionLoading && setIsDeleteModalOpen(false)}
                    />
                    
                    {/* Modal Window Container */}
                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                                    <i className="fa-solid fa-trash text-base"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Delete Account?</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                        Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>? The account will be deleted softly and retained for 30 days before being permanently deleted. This action cannot be undone after the retention period.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Row */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-500 border border-red-600 text-white rounded-sm text-xs font-bold hover:bg-red-600 uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isActionLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-top-color-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMATION BLOCK MODAL OVERLAY */}
            {isBlockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !isActionLoading && setIsBlockModalOpen(false)}
                    />
                    
                    {/* Modal Window Container (Removed border-slate-200) */}
                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                    <i className="fa-solid fa-triangle-exclamation text-base"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Restrict Account Access?</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                        Are you sure you want to block <strong>{user.first_name} {user.last_name}</strong>? This will instantly terminate all concurrent sessions and freeze access privileges until manually reviewed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Action Row */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => setIsBlockModalOpen(false)}
                                className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={handleBlockUser}
                                className="px-4 py-2 bg-rose-500 border border-rose-600 text-white rounded-sm text-xs font-bold hover:bg-rose-600 uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isActionLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white border-top-color-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : 'Confirm Block'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;