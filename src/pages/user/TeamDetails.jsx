import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getTeamMembers, addTeamMember, removeTeamMember } from '../../services/teamService';

const TeamDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const teamName = location.state?.teamName || "Team Space";

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

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [addModal, setAddModal] = useState({ visible: false, email: '' });
  const [deleteModal, setDeleteModal] = useState({ visible: false, memberId: null, email: '' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getTeamMembers(id);
      setMembers(res.data);
    } catch (err) {
      showToast("Failed to load team members.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addModal.email.trim()) return;
    try {
      await addTeamMember(id, addModal.email.trim().toLowerCase());
      showToast("Member added successfully!");
      setAddModal({ visible: false, email: '' });
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to add member.", "error");
    }
  };

  const handleRemoveMember = async () => {
    try {
      await removeTeamMember(id, deleteModal.memberId);
      showToast("Member removed successfully.", "success");
      setDeleteModal({ visible: false, memberId: null, email: '' });
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to remove member.", "error");
    }
  };

  return (
    <main className={`flex-1 min-h-screen overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>

      {/* Toast */}
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

      {/* Header */}
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
            <p className={`text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Team ID: {id}</p>
          </div>
        </div>

        <button
          onClick={() => setAddModal({ visible: true, email: '' })}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
        >
          <i className="fa-solid fa-user-plus text-xs" /> Add Member
        </button>
      </div>

      {/* Table */}
      <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-neutral-900 bg-[#050505]' : 'border-slate-200 bg-white'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-neutral-900 bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Team Members</h3>
            <p className={`text-[10px] font-bold mt-0.5 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>{members.length} Members</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-900 bg-[#080808]/70' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                <th className="py-4 pl-6 font-bold">Email</th>
                <th className="py-4 font-bold">Joined Date</th>
                <th className="py-4 pr-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-sm text-neutral-500">
                    Loading...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-sm text-neutral-500">
                    No members in this team yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className={`transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 pl-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
                          <i className="fa-regular fa-envelope text-[10px] text-neutral-500" /> {member.email}
                        </span>
                      </div>
                    </td>
                    <td className={`py-4 text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                      {new Date(member.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 pr-6 text-sm text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ visible: true, memberId: member.id, email: member.email })}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-600 hover:text-red-400 hover:bg-neutral-800' : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'}`}
                        title="Remove Member"
                      >
                        <i className="fa-solid fa-user-minus text-sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {addModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-base font-bold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Add Member</h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-6">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Email Address</label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@example.com"
                  value={addModal.email}
                  onChange={(e) => setAddModal({ ...addModal, email: e.target.value })}
                  className={`w-full border p-3 rounded-xl outline-none text-sm font-medium transition-colors ${isDark ? 'bg-black border-[#222] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'}`}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModal({ visible: false, email: '' })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#111] border border-[#222] text-slate-300 hover:bg-[#161616]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-user-minus text-sm" />
            </div>
            <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Remove Member</h3>
            <p className={`text-xs px-1 mb-6 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Are you sure you want to remove <span className="font-semibold text-red-400">{deleteModal.email}</span> from this team?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ visible: false, memberId: null, email: '' })}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#111] border border-[#222] text-slate-300 hover:bg-[#161616]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveMember}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeamDetails;