import React, { useState } from 'react';

const SchedulesList = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null); // Dialogue State

  // Mock data
  const schedules = [
    {
      id: 1,
      title: "Weekly Project Update",
      date: "2026-03-20",
      time: "09:00 AM",
      status: "Pending",
      recipients: ["abhiram@innovature.com", "demo@innovature.com", "team@innovature.com"],
      filesCount: 5,
      isProtected: true,
      description: "Standard weekly sync files for the internal development team. Includes latest build logs."
    },
    {
      id: 2,
      title: "Quarterly Brand Assets",
      date: "2026-03-15",
      time: "14:30 PM",
      status: "Processing",
      recipients: ["marketing@client.com"],
      filesCount: 12,
      isProtected: false,
      description: "Q1 Branding package including vector logos, social media templates, and font files."
    },
    {
      id: 3,
      title: "Legal Documents - Final",
      date: "2026-03-10",
      time: "10:00 AM",
      status: "Completed",
      recipients: ["legal@firm.com", "compliance@firm.com"],
      filesCount: 2,
      isProtected: true,
      description: "Fully executed NDAs and Service Agreements for the upcoming fiscal year."
    }
  ];

  // Logic to calculate days and alignment
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-[#111] text-[#808080] border-[#1a1a1a]';
    }
  };

  return (
    <div className="flex-1 bg-black min-h-screen p-6 lg:p-10 overflow-y-auto no-scrollbar relative">
      
      {/* --- DIALOGUE MODAL --- */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0d0d0d]">
              <h2 className="text-white font-bold text-lg">Schedule Details</h2>
              <button onClick={() => setSelectedSchedule(null)} className="text-[#444] hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(selectedSchedule.status)}`}>
                  {selectedSchedule.status}
                </span>
                <h3 className="text-xl font-bold text-white mt-3 leading-tight">{selectedSchedule.title}</h3>
                <p className="text-[#666] text-xs mt-2 leading-relaxed">{selectedSchedule.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#050505] p-3 rounded-xl border border-[#1a1a1a]">
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Release Date</p>
                  <p className="text-white text-sm font-medium">{selectedSchedule.date}</p>
                </div>
                <div className="bg-[#050505] p-3 rounded-xl border border-[#1a1a1a]">
                  <p className="text-[9px] font-bold text-[#444] uppercase mb-1">Release Time</p>
                  <p className="text-white text-sm font-medium">{selectedSchedule.time}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold text-[#444] uppercase tracking-widest mb-2">Recipients ({selectedSchedule.recipients.length})</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {selectedSchedule.recipients.map((email, idx) => (
                    <div key={idx} className="text-[11px] text-[#aaa] bg-[#0d0d0d] px-3 py-2 rounded-lg border border-[#1a1a1a] flex items-center gap-2">
                      <i className="fa-regular fa-envelope text-blue-500 opacity-70"></i> {email}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0d0d0d] border-t border-[#1a1a1a] flex gap-3">
              <button className="flex-1 py-3 bg-[#1a1a1a] hover:bg-[#222] text-white text-xs font-bold rounded-xl transition-all border border-[#333]">
                Edit Sync
              </button>
              <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20">
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transfer Schedules</h1>
          <p className="text-[#808080] text-sm mt-1">Manage your automated and upcoming file deliveries.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-[#1a1a1a]">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444] hover:text-[#666]'}`}
            >
              <i className="fa-solid fa-list-ul"></i> List
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-[#444] hover:text-[#666]'}`}
            >
              <i className="fa-solid fa-calendar-days"></i> Calendar
            </button>
          </div>
          <a href="/schedule-mail" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
            <i className="fa-solid fa-plus"></i> Schedule
          </a>
        </div>
      </div>

      {/* --- SUMMARY STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {[
          { label: 'Scheduled', val: '12', icon: 'fa-clock', color: 'text-blue-500' },
          { label: 'Sent Today', val: '04', icon: 'fa-check-double', color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#050505] border border-[#1a1a1a] p-6 rounded-2xl flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-xl ${stat.color}`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#444] font-bold tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white tracking-tight">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- LIST VIEW CONTENT --- */}
      {viewMode === 'list' ? (
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1a1a1a] bg-[#080808]">
                  <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Schedule Info</th>
                  <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Recipients</th>
                  <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Release Date</th>
                  <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest">Status</th>
                  <th className="p-4 text-[10px] uppercase text-[#444] font-bold tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item.id} className="border-b border-[#0a0a0a] hover:bg-[#080808] transition-colors group">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center text-blue-500">
                                <i className="fa-solid fa-box-archive"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                    {item.title}
                                    {item.isProtected && <i className="fa-solid fa-shield-halved text-[10px] text-blue-500"></i>}
                                </p>
                                <p className="text-[10px] text-[#444] font-bold uppercase">{item.filesCount} Files Attached</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex -space-x-2">
                            {item.recipients.map((r, i) => (
                                <div key={i} className="w-7 h-7 rounded-full bg-[#1a1a1a] border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold text-[#808080]">
                                    {r[0].toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="text-sm text-[#808080] font-medium">{item.date}</div>
                        <div className="text-[10px] text-[#444] font-bold uppercase">{item.time}</div>
                    </td>
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.status)}`}>
                            {item.status}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedSchedule(item)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:text-blue-500 transition-all">
                                <i className="fa-solid fa-eye text-xs"></i>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:text-red-500 transition-all">
                                <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- CALENDAR VIEW CONTENT --- */
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-lg text-white tracking-tight">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
             </h3>
             <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-all text-[#808080]"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-all text-[#808080]"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-[#080808] p-4 text-center text-[10px] uppercase font-bold text-[#444] tracking-widest">{day}</div>
            ))}
            
            {/* Empty boxes for calendar alignment (First day of month) */}
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="bg-[#030303] min-h-[120px]"></div>
            ))}

            {/* Render Days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasEvent = schedules.find(s => s.date === dateStr);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <div key={i} className="bg-[#050505] min-h-[120px] p-3 transition-all relative border-r border-b border-[#1a1a1a]/30 group">
                  <span className={`text-xs font-bold ${isToday ? 'text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md' : 'text-[#333]'}`}>
                    {day}
                  </span>
                  
                  {hasEvent && (
                    <div 
                      onClick={() => setSelectedSchedule(hasEvent)}
                      className={`mt-3 p-2 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95 ${getStatusStyle(hasEvent.status)}`}
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{hasEvent.title}</p>
                      <p className="text-[8px] mt-1 opacity-70 font-bold uppercase">{hasEvent.time}</p>
                    </div>
                  )}

                  <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center text-[10px] hover:bg-blue-600 hover:text-white">
                    <i className="fa-solid fa-plus"></i>
                  </button>
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