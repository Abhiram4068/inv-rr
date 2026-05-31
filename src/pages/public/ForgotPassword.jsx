import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = "An error occurred. Please try again.";
      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.error) {
          errorMsg = data.error;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const fieldError = data[firstKey];
            if (Array.isArray(fieldError)) {
              errorMsg = fieldError[0];
            } else if (typeof fieldError === "string") {
              errorMsg = fieldError;
            }
          }
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141d2a] flex font-['Inter']">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#050505] border-r border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>

        <div className="relative z-10">
          <div className="text-2xl font-bold tracking-tighter text-white mb-12">HiveDrive</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Reset your <br />
            <span className="text-blue-500">Password.</span>
          </h1>
          <p className="text-[#808080] text-lg max-w-md leading-relaxed">
            No worries. Enter your email and we'll send you a link to get back into your account.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden text-center mb-8">
            <div className="text-2xl font-bold tracking-tighter text-white">HiveDrive</div>
          </div>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
                <p className="text-[#808080] text-sm">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && (
                <div className="p-2 mb-2 rounded-md text-red-400 text-xs tracking-wide text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col">
                  <label className="text-[11px] uppercase tracking-widest text-[#808080] mb-2 font-medium">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <i className="fa-solid fa-envelope absolute left-4 text-[#404040] text-sm"></i>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-3 pl-[45px] pr-4 rounded-[10px] text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 text-white border-none rounded-[10px] font-semibold text-sm cursor-pointer mt-2 transition-all hover:bg-blue-700 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5">
                <i className="fa-solid fa-paper-plane text-2xl"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Check your inbox</h3>
              <p className="text-[#808080] text-sm leading-relaxed mb-2">
                If an account exists for
              </p>
              <p className="text-white font-medium text-sm mb-4">{email}</p>
              <p className="text-[#808080] text-sm leading-relaxed mb-6">
                a password reset link has been sent to it. Check your spam folder if you don't see it.
              </p>

              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-500 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-[12px] text-[#808080] opacity-70 transition-all hover:opacity-100 hover:text-white"
            >
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;