import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { profile, updateProfile, getDesignations, changePassword  } from '../../../services/authService';

const EditAccount = () => {
  // --- THEME STATE SYNC (Untouched) ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [designations, setDesignations] = useState([]);

  // --- Modal States ---
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    designation: "",
  });

  const [passwordData, setPasswordData] = useState({
  current_password: "",
  new_password: "",
  confirm_password: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, desigRes] = await Promise.all([
          profile(),
          getDesignations()
        ]);
        
        setUserProfile(profileRes.data);
        setDesignations(desigRes.data);

        // Find the actual value for the designation display string
        const userDesigLabel = profileRes.data.designation;
        const matchedDesig = desigRes.data.find(d => d.label === userDesigLabel);

        setFormData({
          first_name: profileRes.data.first_name,
          last_name: profileRes.data.last_name,
          designation: matchedDesig ? matchedDesig.value : userDesigLabel,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

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

  const handleUpdate = async () => {
    try {
      setShowUpdateModal(false);
      setLoading(true);
      await updateProfile(formData);
      if (passwordData.current_password ||passwordData.new_password ||passwordData.confirm_password){
        if (passwordData.new_password !== passwordData.confirm_password) {
          alert("Passwords do not match");
          setLoading(false);
          return;
        }
      await changePassword(passwordData);
       setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    }
      const profileRes = await profile();
      setUserProfile(profileRes.data);
      const userDesigLabel = profileRes.data.designation;
      const matchedDesig = designations.find(d => d.label === userDesigLabel);
      setFormData({
        first_name: profileRes.data.first_name,
        last_name: profileRes.data.last_name,
        designation: matchedDesig ? matchedDesig.value : userDesigLabel,
      });
    } catch (err) {
       console.log(err.response?.data);
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableAccount = () => {
    // Logic for disabling account goes here
    setShowDisableModal(false);
    alert("Account disable request sent to administrator.");
  };

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className={`flex-1 flex min-w-0 items-center justify-center transition-colors duration-300 ${isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex min-w-0 transition-colors duration-300 ${isDark ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4 flex items-center gap-2 text-[13px] font-bold tracking-widest">
            <Link 
              to="/myprofile" 
              className={`flex items-center gap-2 transition-colors hover:text-blue-500 ${
                isDark ? 'text-neutral-500' : 'text-slate-400'
              }`}
            >
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
              <span>Profile</span>
            </Link>
            <span className={isDark ? 'text-neutral-800' : 'text-slate-300'}>/</span>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>Settings</span>
          </nav>
          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Account</h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Update your personal information and security settings.</p>
            </div>
          </div>

          <div className={`w-full rounded-lg overflow-hidden border transition-all ${
            isDark ? 'bg-[#0F0F0F] border-neutral-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Section 1: Profile Details */}
              <div className={`p-8 lg:p-10 border-b ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
                <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <EditItem
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    isDark={isDark}
                  />
                  <EditItem
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    isDark={isDark}
                  />
                  <EditItem label="Email Address" defaultValue={userProfile?.email} isDark={isDark} disabled />
                  <div className="group">
                    <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors ${
                      isDark ? 'text-neutral-500' : 'text-slate-400'
                    }`}>
                      Designation
                    </label>
                    <div className="relative flex items-center">
                      <select
                        name="designation"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className={`w-full text-[14px] font-semibold py-2.5 pl-4 pr-10 rounded-lg border outline-none transition-all appearance-none cursor-pointer ${
                          isDark 
                          ? 'bg-[#0A0A0A] border-neutral-800 text-white focus:border-blue-500 focus:bg-black' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-500 focus:bg-white'
                        }`}
                      >
                        <option value="" disabled className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>Select designation</option>
                        {designations.map((desig) => (
                          <option key={desig.value} value={desig.value} className={isDark ? "bg-[#0a0a0a]" : "bg-white"}>
                            {desig.label}
                          </option>
                        ))}
                      </select>
                      {/* Custom Dropdown Arrow */}
                      <div className={`absolute right-4 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                        <i className="fa-solid fa-chevron-down text-[10px]"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Authentication */}
              <div className={`p-8 lg:p-10 border-b ${isDark ? 'border-neutral-800' : 'border-slate-100'}`}>
                <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Authentication</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <EditItem label="Old Password" type="password" placeholder="••••••••"  onChange={(e) =>
                    setPasswordData({ ...passwordData, current_password: e.target.value })
                  } 
                    isDark={isDark} />
                  <EditItem label="New Password" type="password" placeholder="••••••••" 
                   onChange={(e) =>
    setPasswordData({ ...passwordData, new_password: e.target.value })
  }
                  isDark={isDark} />
                  <EditItem label="Confirm New Password" type="password" placeholder="••••••••" 
                    onChange={(e) =>
    setPasswordData({ ...passwordData, confirm_password: e.target.value })
  }
                  isDark={isDark} />
                </div>
                <div className="mt-8 flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setShowUpdateModal(true)} 
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
                    >
                        Update Account
                    </button>
                </div>
              </div>

              {/* Section 3: Danger Zone */}
              <div className={`p-8 lg:p-10 ${isDark ? 'bg-[#120a0a]' : 'bg-red-50/30'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="max-w-xl">
                    <h3 className="text-lg font-bold mb-2 text-red-500">Danger Zone</h3>
                    <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                        Deactivating your account will restrict access to your files. This action can be reversed by an administrator.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowDisableModal(true)}
                    className="px-6 py-2.5 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                  >
                    Disable My Account
                  </button>
                </div>
              </div>
            </form>

            {/* Footer Note */}
            <div className={`px-8 py-4 text-[11px] font-medium tracking-wide border-t uppercase opacity-50 ${isDark ? 'border-neutral-800 text-neutral-500' : 'border-slate-100 text-slate-400'}`}>
              Changes require Hive protocol re-validation
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal 
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Update Profile?"
        message="Are you sure you want to save these changes to your account information?"
        confirmText="Save Changes"
        isDark={isDark}
      />

      <ConfirmationModal 
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={handleDisableAccount}
        title="Disable Account?"
        message="This will restrict your access immediately. You will need to contact an administrator to reactivate your account."
        confirmText="Disable Account"
        isDanger={true}
        isDark={isDark}
      />
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDanger = false, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-xl border p-6 shadow-2xl ${
        isDark ? 'bg-[#0F0F0F] border-neutral-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <p className={`text-sm mb-8 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditItem = ({ label, defaultValue, value, onChange, type = "text", placeholder, isDark, disabled = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="group">
      <label className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors ${
        isDark ? 'text-neutral-500' : 'text-slate-400'
      }`}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input 
          type={inputType}
          value={value !== undefined ? value : undefined}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full text-[14px] font-semibold py-2.5 px-4 rounded-lg border outline-none transition-all fill-autofill ${
            isDark 
            ? 'border-neutral-800 text-white focus:border-blue-500 focus:bg-black placeholder-neutral-700 [color-scheme:dark]' 
            : 'border-slate-200 text-slate-700 focus:border-blue-500 focus:bg-white placeholder-slate-300 [color-scheme:light]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 p-1 transition-colors ${isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[12px]`}></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default EditAccount;