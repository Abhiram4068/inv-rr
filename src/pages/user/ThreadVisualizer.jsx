import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// --- DUMMY DATA FOR THE SPECIFIC THREAD ---
const MOCK_THREAD_DETAILS = {
  id: "thread_01",
  projectName: "Website Rebranding 2026",
  nodes: [
    { id: 'root', title: "Website Rebranding 2026", type: 'root', comments: 0, files: 0 },
    { id: 'n1', title: "Brand Guidelines", type: 'task', comments: 3, files: 2, parentId: 'root' },
    { id: 'n2', title: "Hero Section Assets", type: 'task', comments: 5, files: 8, parentId: 'n1' },
    { id: 'n3', title: "Footer Links", type: 'task', comments: 1, files: 1, parentId: 'n1' },
    { id: 'n4', title: "Final Deployment", type: 'task', comments: 0, files: 0, parentId: 'n2' },
  ]
};

const ThreadVisualizer = () => {
  const { id } = useParams();
  const [theme] = useState(localStorage.getItem('theme') || 'dark');
  const [nodes, setNodes] = useState(MOCK_THREAD_DETAILS.nodes);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Form State for new Node
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeComment, setNewNodeComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dependsOn, setDependsOn] = useState('root');

  const isDark = theme === 'dark';

  const handleAddNode = (e) => {
    e.preventDefault();
    const newNode = {
      id: `n${Math.random().toString(36).substr(2, 4)}`,
      title: newNodeTitle,
      type: 'task',
      comments: newNodeComment ? 1 : 0,
      files: selectedFile ? 1 : 0,
      parentId: dependsOn
    };
    setNodes([...nodes, newNode]);
    setNewNodeTitle('');
    setNewNodeComment('');
    setSelectedFile(null);
    setSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#050505] text-white' : 'bg-[#F0F2F5] text-slate-800'}`}>
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* TOP NAV */}
        <div className={`p-4 flex justify-between items-center border-b ${isDark ? 'border-[#1a1a1a] bg-black/50' : 'border-slate-200 bg-white/50'} backdrop-blur-md z-10`}>
          <div className="flex items-center gap-4">
            <Link to="/threads" className={`p-2 rounded-lg hover:bg-blue-500/10 ${isDark ? 'text-[#808080]' : 'text-slate-500'}`}>
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <h1 className="font-bold text-lg">{MOCK_THREAD_DETAILS.projectName}</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <i className="fa-solid fa-plus"></i> Add Task Node
          </button>
        </div>

        {/* VISUAL FLOWCHART CANVAS */}
        <div className="flex-1 relative overflow-auto p-20 flex flex-col items-center no-scrollbar">
          
          {/* We render the nodes in a vertical/centered flow for the dummy version */}
          {nodes.map((node, index) => {
            const hasParent = node.parentId;
            return (
              <React.Fragment key={node.id}>
                {/* Connecting Line */}
                {hasParent && (
                  <div className={`w-[2px] h-12 ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-300'} relative`}>
                    <div className="absolute inset-0 bg-blue-500/30 blur-[2px]"></div>
                  </div>
                )}

                {/* Node Card */}
                <div className={`
                  relative w-full max-w-[300px] p-5 rounded-2xl border transition-all cursor-pointer group
                  ${node.type === 'root' 
                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                    : isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                  }
                `}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold uppercase tracking-widest ${node.type === 'root' ? 'text-blue-100' : 'text-blue-500'}`}>
                      {node.type === 'root' ? 'Project Root' : `Task ${index}`}
                    </span>
                    <i className={`fa-solid ${node.type === 'root' ? 'fa-crown text-yellow-400' : 'fa-circle-check text-emerald-500'}`}></i>
                  </div>

                  <h3 className={`font-bold mb-4 ${node.type === 'root' ? 'text-white text-lg' : isDark ? 'text-white' : 'text-slate-800'}`}>
                    {node.title}
                  </h3>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <i className={`fa-solid fa-paperclip text-xs ${node.type === 'root' ? 'text-blue-200' : 'text-[#808080]'}`}></i>
                        <span className={`text-[11px] ${node.type === 'root' ? 'text-blue-100' : 'text-[#808080]'}`}>{node.files} Files</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <i className={`fa-solid fa-comment text-xs ${node.type === 'root' ? 'text-blue-200' : 'text-[#808080]'}`}></i>
                        <span className={`text-[11px] ${node.type === 'root' ? 'text-blue-100' : 'text-[#808080]'}`}>{node.comments} Comments</span>
                    </div>
                  </div>

                  {/* Add mini context menu on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-[#808080] hover:text-white"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          
        </div>
      </div>

      {/* RIGHT SIDEBAR - ADD NODE */}
      {isSidebarOpen && (
        <div className={`w-[400px] border-l shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300 ${isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'}`}>
          <div className="p-6 flex justify-between items-center border-b border-[#1a1a1a]">
            <h2 className="font-bold text-lg">Add New Node</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-[#808080] hover:text-white">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <form className="p-6 flex-1 overflow-y-auto no-scrollbar" onSubmit={handleAddNode}>
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-[#666] uppercase mb-2">Node Title</label>
              <input 
                required
                value={newNodeTitle}
                onChange={(e) => setNewNodeTitle(e.target.value)}
                className={`w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                placeholder="e.g. Design System Approval"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[11px] font-bold text-[#666] uppercase mb-2">Depends On (Flow)</label>
              <select 
                value={dependsOn}
                onChange={(e) => setDependsOn(e.target.value)}
                className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white' : 'bg-slate-50 border-slate-200'}`}
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
                <label className="block text-[11px] font-bold text-[#666] uppercase mb-2">Initial Comment</label>
                <textarea 
                  rows="3"
                  value={newNodeComment}
                  onChange={(e) => setNewNodeComment(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none resize-none ${isDark ? 'bg-[#111] border-[#1a1a1a] text-white' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="What needs to be done in this node?"
                ></textarea>
            </div>

            <div className="mb-8">
                <label className="block text-[11px] font-bold text-[#666] uppercase mb-2">Attach Resources</label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer hover:border-blue-500/50 ${isDark ? 'border-[#1a1a1a] bg-[#050505]' : 'border-slate-200 bg-slate-50'}`}>
                    <input type="file" className="hidden" id="file-upload" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <i className="fa-solid fa-cloud-arrow-up text-3xl text-blue-500 mb-2"></i>
                        <p className="text-xs text-[#808080]">{selectedFile ? selectedFile.name : "Click to upload files or references"}</p>
                    </label>
                </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
              Create Node & Connect
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default ThreadVisualizer;