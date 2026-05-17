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
      description: "Map complex relationships between team dependencies, system components, and architectural models in a unified semantic graph.",
      icon: "fa-solid fa-diagram-project"
    },
    {
      title: "Automated Mail Scheduler",
      description: "Dispatch contextual event triggers and system logs dynamically based on milestones, sprint schedules, or continuous deployment pipelines.",
      icon: "fa-solid fa-envelope-open-text"
    },
    {
      title: "Interactive Calendar View",
      description: "Track enterprise milestones, deployment freezes, and stakeholder availability in a cross-team synchronized timeline.",
      icon: "fa-solid fa-calendar-days"
    },
    {
      title: "30-Day Automated Reports",
      description: "Compile and aggregate production metrics, server traffic patterns, and workforce performance velocities into audit-ready executive snapshots.",
      icon: "fa-solid fa-chart-line"
    },
    {
      title: "Role-Based Access (RBAC)",
      description: "Enforce strict security perimeter guardrails utilizing attribute and granular resource level authorization controls.",
      icon: "fa-solid fa-shield-halved"
    },
    {
      title: "Real-time Telemetry Sync",
      description: "Integrated state trackers map asynchronous modifications instantly to distributed endpoints across geographical nodes.",
      icon: "fa-solid fa-satellite-dish"
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
            ? "bg-black/90 backdrop-blur-md border-b border-white/5 py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              HiveDrive<span className="text-blue-500">.</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#threads" className="hover:text-white transition-colors">Project Threads</a>
            <a href="#metrics" className="hover:text-white transition-colors">Metrics</a>
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
      <section className="relative min-h-[100svh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
         
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            Build faster with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              absolute precision.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The unified core infrastructure layer designed to handle object storage, knowledge cross-referencing, and continuous operational pipeline dispatching securely.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
            >
              Start Building Free <i className="fa-solid fa-arrow-right text-sm"></i>
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
      <section id="metrics" className="py-16 border-y border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.99<span className="text-blue-500">%</span></div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50<span className="text-blue-500">ms</span></div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Global Latency</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10<span className="text-blue-500">M+</span></div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Daily Events</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">Zero</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Trust Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-blue-500 font-semibold tracking-wider uppercase text-sm mb-3">Core Platform</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for high-velocity teams</h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Everything you need to manage your enterprise architecture, deployment pipelines, and operational telemetry in one unified workspace.
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
              <h2 className="text-blue-500 font-semibold tracking-wider uppercase text-sm mb-3">Edge Topology</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Uncompromising performance and security</h3>
              <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                Our global edge network ensures your data is exactly where it needs to be, with zero-trust security built into every layer of the architecture.
              </p>
              
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-lock text-blue-400 text-xs"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Immutable Asset Management</h4>
                    <p className="text-gray-400">System layers utilize hash-addressed content identification preventing variable reference collisions.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-network-wired text-purple-400 text-xs"></i>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Zero-Trust Network Access</h4>
                    <p className="text-gray-400">Resource routing vectors resolve explicitly through validation nodes matching encryption certificates.</p>
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to scale your infrastructure?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of high-velocity engineering teams building the future with HiveDrive.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl"
            >
              Initialize Workspace
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-blue-700/50 hover:bg-blue-700 border border-blue-400/30 text-white rounded-full font-medium transition-all backdrop-blur-sm"
            >
              Sign In to Console
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-bolt text-white text-[10px]"></i>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              HiveDrive<span className="text-blue-500">.</span>
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} HiveDrive Labs Inc. All telemetry parameters operational.
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <i className="fa-brands fa-github"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <i className="fa-brands fa-discord"></i>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;