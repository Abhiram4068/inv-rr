import React from 'react';

const HelpModal = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-[6px] flex justify-center items-center z-[2000] p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className={`border w-full max-w-[500px] p-8 rounded-[4px] shadow-2xl transition-all overflow-hidden ${
          isDark ? 'bg-[#0a0a0a] border-[#1a1a1a]' : 'bg-white border-slate-200'
        }`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg  flex items-center justify-center text-blue-500">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Threads User Guide</h2>
          </div>
          <i 
            className={`fa-solid fa-xmark cursor-pointer transition-colors ${isDark ? 'text-[#808080] hover:text-white' : 'text-slate-400 hover:text-slate-700'}`} 
            onClick={onClose}
          ></i>
        </div>

        <div className="space-y-5 text-sm leading-relaxed">
          <p className={isDark ? 'text-[#808080]' : 'text-slate-500'}>
            Threads help you organize your project tasks visually. You can create a step-by-step plan, track what needs to be done, and attach important files to each step.
          </p>

          <hr className={isDark ? 'border-[#1a1a1a]' : 'border-slate-100'} />

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs ${isDark ? 'bg-[#111] text-blue-400' : 'bg-slate-50 text-blue-600'}`}>1</div>
              <div>
                <h4 className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Start a New Thread</h4>
                <p className={`text-xs ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>Click the "New Thread" button on the main page. Give it a name and a brief description of what you're trying to achieve.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs ${isDark ? 'bg-[#111] text-blue-400' : 'bg-slate-50 text-blue-600'}`}>2</div>
              <div>
                <h4 className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Add Your Steps (Nodes)</h4>
                <p className={`text-xs ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>Open your thread and click "+ Add stage" or click the "+" button on an existing stage to break your project down into smaller, manageable tasks.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs ${isDark ? 'bg-[#111] text-blue-400' : 'bg-slate-50 text-blue-600'}`}>3</div>
              <div>
                <h4 className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Connect and Upload Files</h4>
                <p className={`text-xs ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>Drag connections between steps to show what needs to happen first, and upload related files directly into each step using the file menu.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs ${isDark ? 'bg-[#111] text-blue-400' : 'bg-slate-50 text-blue-600'}`}>4</div>
              <div>
                <h4 className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Track File Versions</h4>
                <p className={`text-xs ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>You can add new nodes to denote different versions of the same file. This enables you to easily track version history and store your files chronologically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8">
          <button 
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all border ${
              isDark 
                ? 'bg-[#111] border-[#1a1a1a] text-white hover:bg-[#161616]' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            onClick={onClose}
          >
            Understood, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
