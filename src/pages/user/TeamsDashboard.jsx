import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../services/teamService';
import { formatDateTime } from '../../utils/dateFormatter';

const TeamsDashboard = () => {
  const navigate = useNavigate();

  // 1. Theme Sync matching your UI template
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

  // State Management
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Modal States
  const [teamModal, setTeamModal] = useState({ visible: false, type: 'create', teamId: null, name: '' });
  const [confirmModal, setConfirmModal] = useState({ visible: false, teamId: null, teamName: '' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  // Fetch on mount and on search
  useEffect(() => {
    fetchTeams();
  }, [searchInput]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const res = await getTeams(searchInput);
      setTeams(res.data);
    } catch (err) {
      showToast("Failed to load teams.", "error");
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleCreateOrUpdateTeam = async (e) => {
    e.preventDefault();
    if (!teamModal.name.trim()) return;
    try {
      if (teamModal.type === 'create') {
        await createTeam({ name: teamModal.name.trim() });
        showToast("Team created successfully!");
      } else {
        await updateTeam(teamModal.teamId, { name: teamModal.name.trim() });
        showToast("Team renamed successfully!");
      }
      await fetchTeams();
    } catch (err) {
      showToast(err.response?.data?.detail || err.response?.data?.name?.[0] || "Action failed.", "error");
    }
    setTeamModal({ visible: false, type: 'create', teamId: null, name: '' });
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(confirmModal.teamId);
      showToast("Team deleted successfully.", "error");
      await fetchTeams();
    } catch (err) {
      showToast("Failed to delete team.", "error");
    }
    setConfirmModal({ visible: false, teamId: null, teamName: '' });
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <main className={`flex-1 min-h-screen overflow-y-auto p-4 md:p-6 lg:p-[24px_40px] transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#E6EBF2]'}`}>
      
      {/* Toast Notification Container */}
      {toast.visible && (
        <div className="fixed top-6 left-0 right-0 flex justify-center z-[9999] animate-fade-in">
          <div className={`flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-sm font-medium shadow-xl border min-w-[300px]
            ${isDark ? 'bg-[#0d0d0d] border-[#1e1e1e] text-slate-200' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${toast.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <i className={`fa-solid text-xs ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} />
            </div>
            <span className="flex-1 leading-normal text-[13px]">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Search and Action Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className={`w-full max-w-[450px] border p-[10px_16px] rounded-xl flex items-center shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <i className={`fa fa-search ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}></i>
          <input
            type="text"
            placeholder="Search Creator Teams..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`bg-transparent border-none ml-3 w-full outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}
          />
        </div>
        <button
          onClick={() => setTeamModal({ visible: true, type: 'create', teamId: null, name: '' })}
          className="w-full md:w-auto bg-[#3b82f6] text-white p-[10px_20px] rounded-xl font-semibold text-sm transition-all hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
        >
          <i className="fa-solid fa-plus"></i> Create New Team
        </button>
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div className={`text-[18px] md:text-[20px] font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Project Teams</div>
        <div className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm`}>{filteredTeams.length} Active Team(s)</div>
      </div>

      {/* Teams Display Workspace */}
      {loadingTeams ? (
        <div className="flex justify-center py-20">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[#111]' : 'bg-white shadow-sm'}`}>
            <i className="fa-solid fa-users text-3xl text-gray-400 opacity-50"></i>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>No Teams Found</h3>
          <p className={`text-sm max-w-xs ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>Try altering your filter settings or formulate a brand new team setup context.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => navigate(`/team/${team.id}`, { state: { teamName: team.name } })}
              className={`group relative p-5 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col justify-between h-[160px]
                ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]' : 'bg-white border-slate-200 hover:shadow-md'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#141414]' : 'bg-slate-100'}`}>
                    <i className="fa-solid fa-people-group text-lg text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-bold text-sm truncate pr-2 tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {team.name}
                    </h3>
                    <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                      Created on {formatDateTime(team.created_at)}
                    </p>
                  </div>
                </div>
                
                {/* Actions Inline Dropdown Context Trigger */}
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setTeamModal({ visible: true, type: 'edit', teamId: team.id, name: team.name })}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-500 hover:text-blue-400 hover:bg-neutral-900' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'}`}
                    title="Rename Team"
                  >
                    <i className="fa-solid fa-pen text-xs" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ visible: true, teamId: team.id, teamName: team.name })}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'text-neutral-500 hover:text-red-400 hover:bg-neutral-900' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'}`}
                    title="Delete Team"
                  >
                    <i className="fa-regular fa-trash-can text-xs" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3 mt-4 border-dashed border-neutral-800">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {team.member_count} Employees
                </span>
                <span className={`text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Manage Members <i className="fa-solid fa-arrow-right text-[10px]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FORM UPDATE / CREATE MODAL --- */}
      {teamModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 transition-all shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {teamModal.type === 'create' ? 'Create Project Team' : 'Rename Project Team'}
            </h3>
            <form onSubmit={handleCreateOrUpdateTeam}>
              <div className="mb-5">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Team Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Platform Engineering"
                  value={teamModal.name}
                  onChange={(e) => setTeamModal({ ...teamModal, name: e.target.value })}
                  className={`w-full border p-3 rounded-xl outline-none text-sm font-medium transition-colors ${isDark ? 'bg-black border-[#222] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'}`}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTeamModal({ visible: false, type: 'create', teamId: null, name: '' })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#111] border border-[#222] text-slate-300 hover:bg-[#161616]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
                >
                  {teamModal.type === 'create' ? 'Create Dynamic Team' : 'Save Structural Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION ACTION MODAL --- */}
      {confirmModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-6 text-center transition-all shadow-2xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-lg" />
            </div>
            <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Destructive Action Alert</h3>
            <p className={`text-xs px-2 mb-6 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Are you absolutely sure you want to delete <span className="font-semibold text-red-400">"{confirmModal.teamName}"</span>? This operations destroys all associated roster data blocks.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ visible: false, teamId: null, teamName: '' })}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-[#111] border border-[#222] text-slate-300 hover:bg-[#161616]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                No, Maintain Integrity
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Yes, Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TeamsDashboard;