import React, { useState } from 'react';

const SchedulesList = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  // 1. Add Current Month State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock data
  const schedules = [
    {
      id: 1,
      title: "Weekly Project Update",
      date: "2026-03-20",
      time: "09:00 AM",
      status: "Pending",
      recipients: ["abhiram@innovature...", "demo@innovature..."],
      filesCount: 5,
      isProtected: true
    },
    {
      id: 2,
      title: "Quarterly Brand Assets",
      date: "2026-03-15",
      time: "14:30 PM",
      status: "Processing",
      recipients: ["marketing@client.com"],
      filesCount: 12,
      isProtected: false
    },
    {
      id: 3,
      title: "Legal Documents - Final",
      date: "2026-03-10",
      time: "10:00 AM",
      status: "Completed",
      recipients: ["legal@firm.com"],
      filesCount: 2,
      isProtected: true
    }
  ];

  // 4. Calculate Days in Month Dynamically
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-[#111] text-[#808080] border-[#1a1a1a]';
    }
  };

  return (
    <div className="flex-1 bg-black p-6 lg:p-10 overflow-y-auto no-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Transfer Schedules</h1>
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

      {/* Summary Stats */}
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

      {/* DYNAMIC VIEW CONTENT */}
      {viewMode === 'list' ? (
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl overflow-hidden animate-in fade-in duration-500">
          {/* Table content remains the same */}
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
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:text-white transition-all"><i className="fa-solid fa-pen-to-square text-xs"></i></button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:text-red-500 transition-all"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CALENDAR VIEW SECTION */
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
             {/* 2. Dynamic Month and Year Header */}
             <h3 className="font-bold text-lg text-white">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
             </h3>
             <div className="flex gap-2">
                {/* 3. Dynamic Previous Month Button */}
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-all"
                >
                  <i className="fa-solid fa-chevron-left text-xs text-[#808080]"></i>
                </button>
                {/* 3. Dynamic Next Month Button */}
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333] transition-all"
                >
                  <i className="fa-solid fa-chevron-right text-xs text-[#808080]"></i>
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-[#080808] p-4 text-center text-[10px] uppercase font-bold text-[#9ca3af] tracking-widest">{day}</div>
            ))}
            
            {/* 4. Map Dynamically Calculated Days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              
              {/* 5. Precise Event Matching (YYYY-MM-DD) */}
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasEvent = schedules.find(s => s.date === dateStr);
              
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <div key={i} className="bg-[#050505] min-h-[120px] p-3 transition-all group relative border-r border-b border-[#1a1a1a]/30">
                  <span className={`text-xs font-bold ${isToday ? 'text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md' : 'text-[#aaa]'}`}>
                    {day}
                  </span>
                  
                  {hasEvent && (
                    <div className={`mt-3 p-2 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] ${getStatusStyle(hasEvent.status)}`}>
                      <p className="text-[10px] font-bold truncate leading-tight">{hasEvent.title}</p>
                      <p className="text-[8px] mt-1 opacity-70 font-bold uppercase">{hasEvent.time}</p>
                    </div>
                  )}

                 
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