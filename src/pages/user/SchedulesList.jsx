import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { getScheduledFiles, revokeScheduledMail } from '../../services/shareService';
import { getFileVisuals } from '../../utils/fileUtils';
import { formatDateTime } from '../../utils/dateFormatter';

const SchedulesList = () => {
  // --- STATE ---



  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking]         = useState(false);
  const [toast, setToast]               = useState({ visible: false, message: '', error: false });

  const scrollRef = useRef(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [viewMode, setViewMode] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [schedules, setSchedules] = useState([]);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rowsPerPage = 7;
  const [pendingCount, setPendingCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  // --- NEW STATE for calendar cell selection ---
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null); // { dateStr, schedules }

  const showToast = (message, error = false) => {
  setToast({ visible: true, message, error });
  setTimeout(() => setToast({ visible: false, message: '', error: false }), 3000);
  };

  const transformSchedule = (item) => ({
    id: item.id,
    title: item.title || item.file_name,
    description: item.message,
    date: item.scheduled_for.split('T')[0],
    time: item.scheduled_for.split('T')[1].slice(0, 5),
    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    share: item.share,
    file_size: item.file_size,
    recipients: [item.recipient_email],
    isProtected: false,
    file_name: item.file_name,
    content_type: item.content_type,
    created_at: item.created_at,
    scheduled_for: item.scheduled_for,
    expiration_datetime: item.expiration_datetime,
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await getScheduledFiles(currentPage, rowsPerPage, statusFilter);
        const { total, filtered_total, pending, completed, data } = response.data;
        setTotalSchedules(total);
        setFilteredTotal(filtered_total);
        setPendingCount(pending);
        setSentCount(completed);
        setSchedules(data.map(transformSchedule));
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [currentPage, statusFilter]); 

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

  const filteredSchedules = statusFilter === 'All'
    ? schedules
    : schedules.filter(s => s.status === statusFilter);

  const totalPages = Math.ceil(filteredTotal / rowsPerPage) || 1;
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const [calendarData, setCalendarData] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);


  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      setRevoking(true);
      await revokeScheduledMail(revokeTarget.id);
      setSchedules(prev =>
        prev.map(s => s.id === revokeTarget.id
          ? { ...s, status: 'Revoked' } : s)
      );
      if (selectedSchedule?.id === revokeTarget.id)
        setSelectedSchedule(null);
      showToast('Scheduled mail revoked successfully');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to revoke schedule', true);
    } finally {
      setRevoking(false);
      setRevokeTarget(null);
    }
  };

  // Note: getScheduledCalendar and groupByDate need to be defined/imported 
  // but keeping original structure as requested.
  useEffect(() => {
    if (viewMode !== 'calendar') return;
    const fetchCalendar = async () => {
      try {
        setCalendarLoading(true);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        // const res = await getScheduledCalendar(month, year);
        // const grouped = groupByDate(res.data.data); // Logic omitted in original snippet
        // setCalendarData(grouped);
      } catch (err) {
        console.error("Calendar fetch error", err);
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendar();
  }, [viewMode, currentDate]);

  // Clear selected calendar day when switching away from calendar
  useEffect(() => {
    if (viewMode !== 'calendar') {
      setSelectedCalendarDay(null);
    }
  }, [viewMode]);

  const getShareStyle = (share) => {
    switch (share) {
      case 'Active': return isDark ? 'text-emerald-500 ' : 'text-emerald-600';
      case 'Accessed': return isDark ? 'text-blue-500 ' : 'text-blue-600';
      case 'Revoked': return isDark ? 'text-red-500 ' : 'text-red-600';
      default: return isDark ? 'text-[#808080] ' : 'text-slate-500';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Sent': return isDark ? ' text-emerald-500 ' : ' text-emerald-600 ';
      case 'Failed': return isDark ? ' text-red-500 ' : ' text-red-600 ';
      case 'Pending': return isDark ? ' text-yellow-400 ' : ' text-yellow-600 ';
      case 'Revoked': return isDark ? ' text-orange-500 ' : ' text-orange-600 ';
      default: return isDark ? 'text-[#808080] ' : ' text-slate-500 ';
    }
  };

  const getShareStatusStyle = (share) => {
    switch (share) {
      case 'Active': return isDark ? ' text-green-500 ' : ' text-green-600 ';
      case 'Accessed': return isDark ? ' text-blue-500 ' : ' text-blue-600 ';
      case 'Revoked': return isDark ? ' text-red-500 ' : ' text-red-600 ';
      default: return isDark ? 'text-[#808080] ' : ' text-slate-500 ';
    }
  };

  const formatFileName = (name, maxLength = 25) => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength) + '...';
  };

  // --- CALENDAR CELL CLICK HANDLER ---
  const handleCalendarCellClick = (dateStr, daySchedules) => {
    if (daySchedules.length === 0) return;
    setSelectedCalendarDay({ dateStr, schedules: daySchedules });
    scrollRef.current?.closest('[class*="overflow-y"]')?.scrollTo({ top: 0, behavior: 'smooth' });
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={scrollRef} className={`flex-1 min-h-screen p-6 lg:p-10 overflow-y-auto no-scrollbar transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-[#E6EBF2] text-slate-800'}`}>
{toast.visible && (
  <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-7 py-4 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3`}>
      <i className={`fa-solid ${toast.error ? 'fa-circle-xmark text-red-500' : 'fa-circle-check text-emerald-500'} text-lg`}></i>
      {toast.message}
    </div>
  </div>
)}
{revokeTarget && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
    <div className={`p-8 rounded-xl w-full max-w-lg shadow-2xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${isDark ? 'text-red-500' : 'text-red-600'}`}>
            Confirm Revoke
          </p>
          <h3 className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Are you sure?
          </h3>
        </div>
        <button
          onClick={() => setRevokeTarget(null)}
          className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-100 text-slate-400'} hover:text-red-500`}
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div className="space-y-6">
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDark ? 'bg-[#111] border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <i className="fa-solid fa-ban text-red-500"></i>
          </div>
          <div>
            <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {revokeTarget.file_name}
            </p>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
              {revokeTarget.recipients?.[0]} · {revokeTarget.date} at {revokeTarget.time}
            </p>
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          This will permanently cancel the scheduled delivery. The action cannot be undone.
        </p>
      </div>

      <div className="flex gap-3 mt-10">
        <button
          onClick={() => setRevokeTarget(null)}
          disabled={revoking}
          className={`flex-1 border py-4 rounded-2xl text-sm font-bold transition-all ${isDark ? 'bg-transparent text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
        >
          Cancel
        </button>
        <button
          onClick={handleRevoke}
          disabled={revoking}
          className="flex-[2] py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {revoking
            ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Revoking...</>
            : <><i className="fa-solid fa-ban"></i> Yes, Revoke</>}
        </button>
      </div>
    </div>
  </div>
)}
      {/* --- DETAIL MODAL --- */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
          <div className={`p-8 rounded-xl w-full max-w-lg shadow-2xl border animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-2 ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>Schedule Details</p>
                <div className="flex items-center gap-3">
                  <h3 className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedSchedule.file_name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedSchedule(null)} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-100 text-slate-400'} hover:text-red-500`}><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Release Date and Time</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{formatDateTime(selectedSchedule.scheduled_for)}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Created On</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{formatDateTime(selectedSchedule.created_at)}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Schedule Status</p>
                  <span className={`text-sm font-medium  ${getStatusStyle(selectedSchedule.status)}`}>{selectedSchedule.status}</span>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Share Status</p>
                  <p className={`text-sm font-medium ${getShareStatusStyle(selectedSchedule.share)}`}>{selectedSchedule.share}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Last Accessed</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedSchedule.accessed_at ? formatDateTime(selectedSchedule.accessed_at) : 'Not yet accessed'}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Expires On</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{formatDateTime(selectedSchedule.expiration_datetime)}</p>
                </div>
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold mb-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Recipients ({selectedSchedule.recipients.length})</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {selectedSchedule.recipients.map((email, idx) => (
                    <div key={idx} className={`text-[11px] px-3 py-2 rounded-lg border flex items-center gap-2 ${isDark ? 'text-neutral-400 bg-[#0d0d0d] border-neutral-800' : 'text-slate-600 bg-white border-slate-100 shadow-sm'}`}>
                      <i className="fa-regular fa-envelope text-blue-500 opacity-70"></i> {email}
                    </div>
                  ))}
                </div>
              </div>
            </div>
<div className="flex gap-3 mt-10">
  {/* Cancel Button */}
  <button
    onClick={() => setSelectedSchedule(null)}
    className={`flex-1 border py-4 rounded-xl text-sm font-bold transition-all ${
      isDark
        ? 'bg-transparent text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:text-white'
        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
    }`}
  >
    Cancel
  </button>

  {/* Revoke Button */}
<button
  onClick={() => {
    if (selectedSchedule.status !== "Pending") return;
    const schedule = selectedSchedule;
    setSelectedSchedule(null);
    setRevokeTarget(schedule);
  }}
  disabled={selectedSchedule.status !== "Pending"}
  className={`flex-[2] py-4 rounded-xl text-sm font-bold transition-all
    ${selectedSchedule.status !== "Pending" ? 'opacity-40 cursor-not-allowed bg-gray-400' : 'bg-red-600 hover:bg-red-900'}
    text-white shadow-lg
  `}
>
    Revoke Schedule
  </button>
</div>       </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Transfer Schedules</h1>
          <p className={`${isDark ? 'text-[#808080]' : 'text-slate-500'} text-sm mt-1`}>Manage your automated and upcoming file deliveries.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Link to="/schedule-mail" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-plus"></i> Schedule
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
              {['All', 'Pending', 'Sent', 'Failed', 'Revoked'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${statusFilter === status ? (isDark ? 'bg-[#1a1a1a] text-white' : 'bg-slate-100 text-slate-800') : 'text-[#444] hover:text-[#666]'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'list' ? (isDark ? 'bg-[#1a1a1a] text-white shadow-lg' : 'bg-slate-100 text-slate-800 shadow-sm') : 'text-[#444] hover:text-[#666]'}`}>
                <i className="fa-solid fa-list-ul"></i>
              </button>
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'calendar' ? (isDark ? 'bg-[#1a1a1a] text-white shadow-lg' : 'bg-slate-100 text-slate-800 shadow-sm') : 'text-[#444] hover:text-[#666]'}`}>
                <i className="fa-solid fa-calendar-days"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUMMARY STATS (list view) / CALENDAR SIDE PANEL (calendar view) --- */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[
            { label: 'Scheduled', val: pendingCount, icon: 'fa-clock', color: 'text-blue-500' },
            { label: 'Total Sent', val: sentCount, icon: 'fa-check-double', color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className={`border p-6 rounded-2xl flex items-center gap-5 transition-colors shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-slate-50 border-slate-100'} ${stat.color}`}>
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.val}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- CALENDAR SIDE PANEL: same height as stats row, shows selected day's schedule tiles --- */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Left panel: prompt or selected day info */}
          <div className={`border p-6 rounded-2xl flex flex-col justify-center shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            {selectedCalendarDay ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Selected Day</p>
                    <p className={`text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {new Date(selectedCalendarDay.dateStr + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCalendarDay(null)}
                    className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-500' : 'hover:bg-slate-100 text-slate-400'} hover:text-red-500`}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>
                  {selectedCalendarDay.schedules.length} Schedule{selectedCalendarDay.schedules.length > 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-blue-500' : 'bg-slate-50 border-slate-100 text-blue-500'}`}>
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Calendar View</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Click a day to see schedules</p>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: schedule event tiles for selected day */}
          <div className={`border p-6 rounded-2xl shadow-sm overflow-hidden ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
            {selectedCalendarDay && selectedCalendarDay.schedules.length > 0 ? (
              <div className="flex flex-col h-full">
                <p className={`text-[10px] uppercase font-bold tracking-widest mb-3 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>Events</p>
                <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[120px]">
                  {selectedCalendarDay.schedules.map((event) => {
                    const visuals = getFileVisuals(event.content_type || event.file_name);
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedSchedule(event)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-95 ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#2a2a2a]' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'}`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`fa-solid ${visuals.icon} text-sm`} style={{ color: visuals.color }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>{formatFileName(event.file_name)}</p>
                          <p className={`text-[10px] font-medium truncate ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{event.recipients[0]}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className={`text-[9px] font-bold uppercase ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{event.time}</span>
                          <span className={`text-[9px] font-bold uppercase mt-0.5 ${getStatusStyle(event.status)}`}>{event.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5 h-full">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-neutral-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                  <i className="fa-solid fa-list-ul"></i>
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-[#444]' : 'text-slate-400'}`}>No Day Selected</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Schedule tiles will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CONTENT --- */}
      {viewMode === 'list' ? (
        <div className={`border rounded-lg overflow-hidden animate-in fade-in duration-400 shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-slate-100 bg-slate-50/50'}`}>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Schedules</h3>
              <p className={`text-[10px] font-bold mt-1 uppercase ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>
                Showing {filteredTotal === 0 ? 0 : indexOfFirstRow + 1}-{indexOfFirstRow + schedules.length} of {filteredTotal}
              </p>
            </div>
            <div className="flex items-center gap-3 p-1.5">
              <span className={`text-[10px] font-bold uppercase px-2 ${isDark ? 'text-neutral-600' : 'text-slate-400'}`}>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'} ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : (isDark ? 'bg-[#0a0a0a] text-white hover:border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50')}`}><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isDark ? 'border-[#1a1a1a]' : 'border-slate-200'} ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : (isDark ? 'bg-[#0a0a0a] text-white hover:border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50')}`}><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse pb-4">
              <thead>
                <tr className={`text-[10px] uppercase tracking-[0.15em] border-b ${isDark ? 'text-neutral-500 border-neutral-800/40 bg-[#080808]/70' : 'text-slate-400 border-slate-200 bg-slate-50/50'}`}>
                  <th className="py-4 pl-8 font-bold whitespace-nowrap text-center">File Name</th>
                  <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Recipient</th>
                  <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Scheduled Date & Time</th>
                  <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Status</th>
                  <th className="py-4 px-4 font-bold whitespace-nowrap text-center">Share Status</th>
                  <th className="py-4 pr-8 font-bold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-neutral-900' : 'divide-slate-200'}`}>
                {filteredSchedules.map((item) => {
                  const visuals = getFileVisuals(item.content_type || item.file_name);
                  return (
                    <tr key={item.id} className={`group transition-colors ${isDark ? 'hover:bg-neutral-900/40' : 'hover:bg-slate-50'}`}>
                      <td className="py-7 px-4 text-sm text-center align-middle">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors">
                            <i className={`fa-solid ${visuals.icon} text-lg`} style={{ color: visuals.color }}></i>
                          </div>
                          <div>
                            <span className={`font-bold block line-clamp-2 break-all max-w-[250px] leading-tight ${isDark ? 'text-white' : 'text-slate-700'}`}>{formatFileName(item.file_name)}</span>
                            {item.isProtected && <span className="flex items-center gap-1 text-[9px] text-blue-500 font-bold uppercase mt-1 rounded"><i className="fa-solid fa-shield-halved"></i> Protected</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-7 px-4 text-sm text-center align-middle">
                        <span className={`font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{item.recipients[0]}</span>
                      </td>
                      <td className="py-7 px-4 text-sm text-center align-middle">
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.date}</div>
                        <div className={`text-[10px] font-bold uppercase mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>{item.time}</div>
                      </td>
                      <td className="py-7 px-4 text-sm text-center align-middle">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${getStatusStyle(item.status)}`}>{item.status}</span>
                      </td>
                      <td className="py-7 px-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight ${getShareStyle(item.share)}`}>{item.share || "N/A"}</span>
                      </td>
                      <td className="py-7 pr-8 text-sm text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setSelectedSchedule(item)} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isDark ? 'border border-transparent hover:bg-neutral-800 text-blue-400' : 'border border-transparent hover:shadow-sm hover:shadow text-blue-600'}`} title="View Details"><i className="fa-solid fa-eye"></i></button>
<button
  onClick={() => item.status === "Pending" && setRevokeTarget(item)}
  disabled={item.status !== "Pending"}
  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all
    ${item.status !== "Pending" ? 'opacity-30 cursor-not-allowed' : ''}
    ${isDark ? 'border border-transparent hover:border-red-500/30 hover:bg-neutral-800 text-red-400' : 'border border-transparent hover:shadow-sm hover:shadow text-red-500'}
  `}
  title="Revoke Schedule"
>
  <i className="fa-solid fa-ban"></i>
</button>                     </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- CALENDAR VIEW CONTENT --- */
        <div className={`border rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-400 shadow-sm ${isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-8">
              <h3 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] text-[#808080]' : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-500'}`}><i className="fa-solid fa-chevron-left text-xs"></i></button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] text-[#808080]' : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-500'}`}><i className="fa-solid fa-chevron-right text-xs"></i></button>
              </div>
          </div>
          
          <div className={`grid grid-cols-7 gap-px border rounded-xl overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'bg-slate-200 border-slate-200'}`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`p-4 text-center text-[10px] uppercase font-bold tracking-widest ${isDark ? 'bg-[#080808] text-[#444]' : 'bg-slate-50 text-slate-400'}`}>{day}</div>
            ))}
            
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className={`${isDark ? 'bg-[#030303]' : 'bg-slate-50/50'} min-h-[120px]`}></div>
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              
              const daySchedules = schedules.filter(s => s.date === dateStr);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              const isSelected = selectedCalendarDay?.dateStr === dateStr;

              return (
                <div
                  key={i}
                  onClick={() => handleCalendarCellClick(dateStr, daySchedules)}
                  className={`min-h-[120px] p-3 transition-all relative border-r border-b group overflow-y-auto no-scrollbar ${daySchedules.length > 0 ? 'cursor-pointer' : ''} ${isSelected ? (isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50/50 border-blue-100') : (isDark ? 'bg-[#050505] border-[#1a1a1a]/30 hover:bg-[#080808]' : 'bg-white border-slate-100 hover:bg-slate-50/30')}`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md' : (isDark ? 'text-[#333]' : 'text-slate-300')}`}>
                    {day}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {daySchedules.length > 1 ? (
                      /* --- MULTIPLE SCHEDULES ICON/SUMMARY --- */
                      <div 
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all border-dashed ${isDark ? 'bg-blue-500/5 border-blue-500/30 hover:bg-blue-500/10' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
                      >
                        <i className="fa-solid fa-layer-group text-blue-500 text-xs"></i>
                        <span className="text-[9px] font-black uppercase text-blue-500">{daySchedules.length} Schedules</span>
                      </div>
                    ) : (
                      /* --- SINGLE SCHEDULE --- */
                      daySchedules.map((event) => (
                        <div 
                          key={event.id}
                          className={`p-1.5 rounded-md border text-left transition-all shadow-sm ${getStatusStyle(event.status)}`}
                        >
                          <p className="text-[9px] font-bold truncate leading-tight">
                            {event.title}
                          </p>
                          <p className="text-[7px] opacity-70 font-bold uppercase">
                            {event.time}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesList;