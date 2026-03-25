import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white font-['Inter']">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-2xl font-bold tracking-tight">HiveDrive</h1>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-sm font-medium hover:bg-[#111] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#808080] mb-4">
            Secure Cloud Workspace
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Store, manage, and share files with confidence.
          </h2>
          <p className="text-base text-[#9b9b9b] leading-relaxed mb-10">
            HiveDrive helps teams keep files organized, searchable, and safe.
            Sign in to continue or create a new account to get started.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="px-6 py-3 rounded-lg bg-white text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg border border-[#2a2a2a] text-sm font-medium hover:bg-[#111] transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
