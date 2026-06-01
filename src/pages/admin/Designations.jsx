import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const ManageDesignations = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State for creating a new designation
    const [newDesignationName, setNewDesignationName] = useState('');
    
    // Modal Configuration Architecture
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'create' | 'delete'
        targetDesignation: null
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Notification Banner State
    const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message: string }

    const showBanner = (type, message) => {
        setBanner({ type, message });
        setTimeout(() => setBanner(null), 4000);
    };

    // --- Fetch Designations ---
    const fetchDesignations = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDesignations();
            // Handle both array responses or nested object structures securely
            setDesignations(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Failed to fetch designations", error);
            showBanner('error', 'Could not load designations from cluster.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);

    // --- Modal Control Handlers ---
    const openModal = (type, designation = null) => {
        setModalConfig({
            isOpen: true,
            type,
            targetDesignation: designation
        });
    };

    const closeModal = () => {
        if (!isActionLoading) {
            setModalConfig({ isOpen: false, type: null, targetDesignation: null });
            setNewDesignationName('');
        }
    };

    // --- Action Processing Engine (Create / Delete) ---
    const handleConfirmAction = async (e) => {
        if (e) e.preventDefault();
        setIsActionLoading(true);
        const { type, targetDesignation } = modalConfig;

        try {
            if (type === 'create') {
                if (!newDesignationName.trim()) {
                    showBanner('error', 'Designation name cannot be empty.');
                    setIsActionLoading(false);
                    return;
                }
                const newRecord = await adminService.createDesignation({ name: newDesignationName.trim() });
                setDesignations(prev => [...prev, newRecord]);
                showBanner('success', `Designation "${newRecord.name}" successfully provisioned.`);
            } 
            
            else if (type === 'delete') {
                await adminService.deleteDesignation(targetDesignation.id);
                setDesignations(prev => prev.filter(item => item.id !== targetDesignation.id));
                showBanner('success', `Designation removed from active matrix.`);
            }
            
            closeModal();
        } catch (error) {
            console.error(`Operation failure:`, error);
            const apiError = error.response?.data?.name?.[0] || error.response?.data?.detail || 'Operation aborted by backend validation rules.';
            showBanner('error', apiError);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Filter array safely local side based on the dynamic query field
    const filteredDesignations = designations.filter(desig => 
        desig.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 bg-[#f0f2f7] min-h-screen p-8 font-sans relative">
            <div className="max-w-7xl mx-auto">

                {/* Banner Notifications */}
                {banner && (
                    <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-sm text-xs font-bold flex items-center gap-3 border shadow-md transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
                        banner.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                        <i className={`fa-solid ${banner.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-sm`}></i>
                        {banner.message}
                    </div>
                )}


                {/* Header Context Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Company Designations</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Create and manage organizational designations.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Filter designations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        <button
                            onClick={() => openModal('create')}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all"
                        >
                            <i className="fa-solid fa-plus text-[10px]"></i>
                            Add Title
                        </button>
                    </div>
                </div>

                {/* Primary Data Table Box */}
                <div className="bg-white rounded-sm overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-4 px-6 w-1/4">Designation ID</th>
                                    <th className="py-4 px-6 w-2/4">Designation Name</th>
                                    <th className="py-4 px-6 text-right w-1/4">Administrative Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-12">
                                            <div className="flex justify-center">
                                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDesignations.length > 0 ? (
                                    filteredDesignations.map((designation) => (
                                        <tr key={designation.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-xs text-slate-800 px-2 py-1">
                                                    {designation.id}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-slate-800 tracking-tight text-sm">
                                                    {designation.name}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => openModal('delete', designation)}
                                                    className="px-2.5 py-1.5 border border-rose-200 rounded-sm bg-white text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all shadow-sm uppercase tracking-wider"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-12 text-slate-400 font-medium">
                                            <i className="fa-solid fa-briefcase text-3xl mb-3 block text-slate-200"></i>
                                            {searchTerm ? 'No matching titles found.' : 'No designations are configured within the company register.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Record Count Footer */}
                    <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-tight">
                            Total Architecture: {filteredDesignations.length} {filteredDesignations.length === 1 ? 'Designation' : 'Designations'} Available
                        </span>
                    </div>
                </div>
            </div>

            {/* DYNAMIC OPERATION OVERLAY MODAL */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    />

                    <div className="bg-white rounded-sm shadow-xl max-w-md w-full overflow-hidden relative z-10 transform scale-100 transition-all animate-in fade-in zoom-in-95 duration-150">
                        
                        {modalConfig.type === 'create' ? (
                            /* CREATE DESIGNATION MODAL VIEW */
                            <form onSubmit={handleConfirmAction}>
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-indigo-50 border-indigo-100 text-indigo-500">
                                            <i className="fa-solid fa-briefcase text-base"></i>
                                        </div>
                                        <div className="w-full">
                                            <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                                Provision System Designation
                                            </h3>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-1 mb-4">
                                                Declare a brand new organizational title. This immediately rolls out to the registration pathways and edit-profile options for your users.
                                            </p>

                                            <div className="group w-full">
                                                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-2 text-slate-400">
                                                    Designation Title Name
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    placeholder="e.g., Lead Systems Architect"
                                                    value={newDesignationName}
                                                    onChange={(e) => setNewDesignationName(e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={closeModal}
                                        className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isActionLoading || !newDesignationName.trim()}
                                        className="px-4 py-2 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 bg-indigo-600 border border-indigo-700 hover:bg-indigo-700"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Commit Designation'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* DELETE DESIGNATION CONFIRMATION MODAL VIEW */
                            <div>
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-rose-50 border-rose-100 text-rose-500">
                                            <i className="fa-solid fa-trash-can text-base"></i>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-slate-800 tracking-tight">
                                                Deprecate Corporate Title?
                                            </h3>
                                            <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                                Are you absolutely sure you want to hard-delete <strong>{modalConfig.targetDesignation?.name}</strong>? This action breaks dynamic directory listings and cannot be recovered via backup protocols.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={closeModal}
                                        className="px-3 py-2 border border-slate-200 rounded-sm bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isActionLoading}
                                        onClick={handleConfirmAction}
                                        className="px-4 py-2 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 bg-rose-500 border border-rose-600 hover:bg-rose-600"
                                    >
                                        {isActionLoading ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Removing...
                                            </>
                                        ) : (
                                            'Execute Deletion'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDesignations;