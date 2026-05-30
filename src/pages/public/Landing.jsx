import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e) => {
    setScrolled(e.currentTarget.scrollTop > 50);
  };

  const features = [
    {
      title: "Project Knowledge Graph",
      description: "Visualize project relationships and dependencies in one place.",
      icon: "fa-solid fa-diagram-project"
    },
    {
      title: "Automated Mail Scheduler",
      description: "Send scheduled updates and reminders automatically.",
      icon: "fa-solid fa-envelope-open-text"
    },
    {
      title: "Interactive Calendar View",
      description: "Track scheduled tasks and upcoming project events",
      icon: "fa-solid fa-calendar-days"
    },
    {
      title: "30-Day Automated Reports",
      description: "Generate detailed reports on file sharing, downloads, and access activity.",
      icon: "fa-solid fa-chart-line"
    },
    {
      title: "Admin Controls",
      description: "Manage users, files, and system settings from a centralized dashboard.",
      icon: "fa-solid fa-shield-halved"
    },
    {
      title: "Project File Management",
      description: "Manage, organize, and oversee project files from a centralized workspace.",
      icon: "fa-solid fa-file-lines"
    }
  ];

  return (
    <div 
      onScroll={handleScroll}
      className="h-screen overflow-y-auto no-scrollbar bg-black text-white font-['Inter'] antialiased scroll-smooth selection:bg-blue-500/30"
    >
      
      {/* Navigation */}
      <header 
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
scrolled 
  ? "bg-black/90 backdrop-blur-md py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center">
        <i className="fa-solid fa-users text-white"></i>
        </div>
            <span className="text-xl font-bold tracking-tight">
              HiveDrive<span className="text-blue-500">.</span>
            </span>
          </div>
          
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">
          Features
          </a>
          <a href="#threads" className="hover:text-white transition-colors">
          Threads Documentation
          </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-2"
            >
              Log in
            </Link>
            <Link
              to={user ? (user.is_staff || user.is_superuser ? "/admin/dashboard" : "/dashboard") : "/register"}
              className="px-5 py-2.5 text-sm font-semibold bg-white text-black hover:bg-gray-200 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative min-h-[100svh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
         
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
           Centralize your files <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Simplify your workflow.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Secure file management with intelligent organization and seamless workflow integration.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all  flex items-center justify-center gap-2"
            >
              Get Started <i className="fa-solid fa-arrow-right text-sm"></i>
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-all backdrop-blur-sm flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center text-gray-500">
          <span className="text-xs font-medium uppercase tracking-widest mb-2">Scroll</span>
          <i className="fa-solid fa-arrow-down text-sm"></i>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="" className="py-16 border-y border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100<span className="text-blue-500">%</span></div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Project Visibility</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Real-Time<span className="text-blue-500"></span></div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Workflow Tracking</div>
            </div>
            <div>
              <div className="text-2xl md:text-5xl font-bold text-white mb-2">Reports <span className="text-blue-500"></span></div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">30-Day Auto-reports</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Smart</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Scheduling</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-blue-500 font-semibold tracking-wider uppercase text-sm mb-3">Core Platform</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for efficient project management</h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Securely manage documents, streamline project workflows, automate reporting, and keep projects aligned from a single workspace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <i className={`${feature.icon} text-blue-400 text-xl`}></i>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Detail Section */}
      <section id="threads" className="py-32 relative overflow-hidden bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
<h2 className="text-blue-500 font-semibold tracking-wider uppercase text-sm mb-3">
  Threads Guide
</h2>

<h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
  Plan, organize, and track projects visually
</h3>

<p className="text-gray-400 mb-10 leading-relaxed text-lg">
  Threads help teams break projects into manageable stages, connect workflows, and keep important files organized in one visual workspace.
</p>

<ul className="space-y-8">
  <li className="flex items-start gap-4">
    <div className="mt-1 w-8 h-8 rounded-full  flex items-center justify-center shrink-0">
      <span className="text-blue-400 text-xs font-bold">1</span>
    </div>
    <div>
      <h4 className="text-white font-semibold text-lg mb-1">
        Create a Thread
      </h4>
      <p className="text-gray-400">
        Start a new thread with a title and description for your project or workflow.
      </p>
    </div>
  </li>

  <li className="flex items-start gap-4">
    <div className="mt-1 w-8 h-8 rounded-full  flex items-center justify-center shrink-0">
      <span className="text-purple-400 text-xs font-bold">2</span>
    </div>
    <div>
      <h4 className="text-white font-semibold text-lg mb-1">
        Add Project Stages
      </h4>
      <p className="text-gray-400">
        Break work into smaller stages and organize tasks in the order they need to be completed.
      </p>
    </div>
  </li>

  <li className="flex items-start gap-4">
    <div className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
      <span className="text-cyan-400 text-xs font-bold">3</span>
    </div>
    <div>
      <h4 className="text-white font-semibold text-lg mb-1">
        Connect & Upload Files
      </h4>
      <p className="text-gray-400">
        Link stages together and attach relevant files directly to each step of the workflow.
      </p>
    </div>
  </li>

  <li className="flex items-start gap-4">
    <div className="mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
      <span className="text-emerald-400 text-xs font-bold">4</span>
    </div>
    <div>
      <h4 className="text-white font-semibold text-lg mb-1">
        Track Progress & Versions
      </h4>
      <p className="text-gray-400">
        Monitor project progress and maintain file version history through connected stages.
      </p>
    </div>
  </li>
</ul>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="relative bg-[#0d0d12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col group">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono tracking-wider">ThreadVisualizer</div>
                  <div className="w-12"></div>
                </div>
                <div className="relative overflow-hidden bg-black aspect-video flex items-center justify-center p-2">
                  <img 
                    src="/feature-preview.png" 
                    alt="Project Thread Visualizer Interface" 
                    className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-all duration-700 ease-out rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback state if image is not uploaded yet */}
                  <div className="absolute inset-0 hidden flex-col items-center justify-center text-gray-500 bg-[#121214]">
                    <i className="fa-regular fa-image text-4xl mb-3 opacity-50"></i>
                    <p className="text-sm font-medium">Please upload <code className="bg-black px-2 py-1 rounded text-blue-400">feature-preview.png</code> to public folder</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-black border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to organize your projects?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Manage files, streamline workflows, and keep your team aligned with HiveDrive.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl"
            >
              Join the Hive
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-blue-700/50 hover:bg-blue-700 border border-blue-400/30 text-white rounded-full font-medium transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="fa-solid fa-users text-white"></i>
          </div>
            <span className="text-lg font-bold text-white tracking-tight">
              HiveDrive<span className="text-blue-500">.</span>
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2026 HiveDrive. Simplifying project file management.
          </div>
<div className="flex gap-4">
<a
  href="#top"
  className="group px-6 py-3 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-blue-500/30 transition-all flex items-center gap-2"
>
  Back to Top
  <i className="fa-solid fa-arrow-up transition-transform group-hover:-translate-y-0.5"></i>
</a>
</div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;