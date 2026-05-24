import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const TeamDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const teamName = location.state?.teamName || "Team Space";

  // Theme Sync System matching UI Layout settings
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';

  // Base Data Structure Hook
  const [employees, setEmployees] = useState([
    { id: '1', name: "Abhiram S", email: "abhiram.s@gmail.com", joinedDate: "2026-05-10" },
    { id: '2', name: "Jane Smith", email: "janesmith@gmail.com", joinedDate: "2026-05-12" },
  ]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Modals Management Interfaces
  const [memberModal, setMemberModal] = useState({ visible: false, type: 'add', memberId: null, name: '', email: '' });
  const [deleteModal, setDeleteModal] = useState({ visible: false, memberId: null, email: '' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    if (!memberModal.email.endsWith("@gmail.com")) {
      showToast("Access Restricted: Only active @gmail.com IDs are supported", "error");
      return;
    }

    if (memberModal.type === 'add') {
      const newMember = {
        id: Date.now().toString(),
        name: memberModal.name.trim() || memberModal.email.split('@')[0],
        email: memberModal.email.trim().toLowerCase(),
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setEmployees([...employees, newMember]);
      showToast("Employee roster allocation processed!");
    } else {
      setEmployees(employees.map(emp => emp.id === memberModal.memberId ? { 
        ...emp, 
        name: memberModal.name.trim(), 
        email: memberModal.email.trim().toLowerCase() 
      } : emp));
      showToast("Member settings saved!");
    }
    setMemberModal({ visible: false, type: 'add', memberId: null, name: '', email: '' });
  };

  const handleRemoveMember = () => {
    setEmployees(employees.filter(emp => emp.id !== deleteModal.memberId));
    showToast("Employee removed from deployment structural team", "error");
    setDeleteModal({ visible: false, memberId: null, email: '' });
  };

  return (
    <main className={`flex-1 min-h-screen overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* Toast Alert Viewports */}
      {toast.visible && (
        <div className="fixed top-6 left-0 right-0 flex justify-center z-[9999]">
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-xl border min-w-[300px]
            ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
            </div>
            <span className="flex-1 text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Control Nav Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teams')}
            className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-white hover:bg-[#111]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-chevron-left text-xs" />
          </button>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{teamName}</h2>
            <p className={`text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Workspace Identifier: ID-{id}</p>
          </div>
        </div>
        
        <button
          onClick={() => setMemberModal({ visible: true, type: 'add', memberId: null, name: '', email: '' })}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
        >
          <i className="fa-solid fa-user-plus text-xs" /> Deploy New Employee
        </button>
      </div>

      {/* Employee List Table View Frame */}
      <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-neutral-900 bg-[#050505]' : 'border-slate-200 bg-white'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Current Allocation Roster</h3>
            <p className={`text-[10px] font-bold mt-0.5 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>{employees.length} Members Managed</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]/70' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                <th className="py-4 pl-6 font-bold">Employee Target Name</th>
                <th className="py-4 font-bold">Google Mail Reference Address</th>
                <th className="py-4 font-bold">Allocation Date</th>
                <th className="py-4 pr-6 font-bold text-right">Roster Options</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-sm font-medium text-neutral-500">
                    No resources linked to this project layout array structure segment yet.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className={`transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 pl-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isDark ? 'bg-neutral-900 text-blue-400' : 'bg-slate-100 text-blue-600'}`}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-slate-100 text-slate-600'}`}>
                        <i className="fa-regular fa-envelope text-[10px] text-neutral-500" /> {emp.email}
                      </span>
                    </td>
                    <td className={`py-4 text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                      {emp.joinedDate}
                    </td>
                    <td className="py-4 pr-6 text-sm text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setMemberModal({ visible: true, type: 'edit', memberId: emp.id, name: emp.name, email: emp.email })}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-600 hover:text-blue-400 hover:bg-neutral-800' : 'text-slate-300 hover:text-blue-600 hover:bg-slate-100'}`}
                          title="Edit Configuration"
                        >
                          <i className="fa-solid fa-user-gear text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ visible: true, memberId: emp.id, email: emp.email })}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-600 hover:text-red-400 hover:bg-neutral-800' : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'}`}
                          title="Deallocate Member"
                        >
                          <i className="fa-solid fa-user-minus text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT ROSTER RESOURCE MODAL --- */}
      {memberModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 transition-all shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-base font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {memberModal.type === 'add' ? 'Deploy Employee To Roster' : 'Modify Roster Details'}
            </h3>
            <form onSubmit={handleSaveMember}>
              <div className="mb-4">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Abhiram S"
                  value={memberModal.name}
                  onChange={(e) => setMemberModal({ ...memberModal, name: e.target.value })}
                  className={`w-full border p-3 rounded-xl outline-none text-sm font-medium transition-colors ${isDark ? 'bg-black border-[#222] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'}`}
                />
              </div>

              <div className="mb-6">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Google Mail Handle</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={memberModal.email}
                  onChange={(e) => setMemberModal({ ...memberModal, email: e.target.value })}
                  className={`w-full border p-3 rounded-xl outline-none text-sm font-medium transition-colors ${isDark ? 'bg-black border-[#222] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'}`}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMemberModal({ visible: false, type: 'add', memberId: null, name: '', email: '' })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#111] border border-[#222] text-slate-300 hover:bg-[#161616]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {memberModal.type === 'add' ? 'Commit Dynamic Save' : 'Save Operational Matrix Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ROSTER EXCLUSION CONFIRMATION DIALOG --- */}
      {deleteModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 text-center transition-all shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-user-minus text-sm" />
            </div>
            <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Deallocation Request</h3>
            <p className={`text-xs px-1 mb-6 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Are you sure you want to remove <span className="font-semibold text-red-400">{deleteModal.email}</span> from this team tracking configuration branch?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ visible: false, memberId: null, email: '' })}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#111] border border-[#222] text-slate-300 hover:bg-[#161616]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel Action
              </button>
              <button
                type="button"
                onClick={handleRemoveMember}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeamDetails;