import React, { useState } from 'react';

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@innovaturelabs.com',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
  };

  return (
    <div className="flex-1 flex min-w-0 bg-black overflow-hidden">
  <div className="flex-1 p-3 lg:p-5 overflow-y-auto no-scrollbar">
        
        {/* --- Center Dashboard --- */}
        <main className="flex-1 bg-[#0a0a0a] m-1 rounded-[10px] border border-[#1a1a1a] p-10 overflow-y-auto no-scrollbar">
          
          {/* Back Navigation Link */}
          <div className="mb-6">
            <a 
              href="/myprofile" 
              className="group flex items-center gap-2 text-[#808080] hover:text-white transition-colors text-base font-medium"
            >
              <i className="fa-solid fa-chevron-left text-[10px] group-hover:-translate-x-1 transition-transform"></i>
              <span>Account</span>
              <span className="text-[#333]">/</span>
              <span className="text-white"> Account Settings</span>
            </a>
          </div>

          <div className="flex items-center gap-[30px] mb-10 pb-10 border-b border-[#1a1a1a]">
            <div className="w-[100px] h-[100px] bg-[#3b82f6] rounded-full flex items-center justify-center text-[36px] font-bold text-white relative shadow-lg">
              JD
              
            </div>
            <div>
              <h2 className="text-2xl font-bold m-0 text-white">Account Settings</h2>
              <p className="text-[#808080] text-sm mt-1">Manage your profile details and security preferences.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="text-base font-semibold mb-5 flex items-center gap-2.5 text-white">
              <i className="fa-solid fa-address-card text-[#3b82f6]"></i> Personal Information
            </div>
            
            <div className="grid grid-cols-2 gap-[30px] mb-10">
              <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              <div className="col-span-2">
                <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            {/* Authentication */}
            <div className="text-base font-semibold mb-5 flex items-center gap-2.5 text-white">
              <i className="fa-solid fa-lock text-[#3b82f6]"></i> Authentication
            </div>
            
            <div className="grid grid-cols-2 gap-[30px] mb-10">
              <div className="col-span-2">
                <InputGroup 
                  label="Old Password" 
                  name="oldPassword" 
                  type="password"
                  placeholder="Enter current password"
                  value={formData.oldPassword} 
                  onChange={handleChange} 
                />
              </div>
              <InputGroup label="New Password" name="newPassword" type="password" placeholder="New password" value={formData.newPassword} onChange={handleChange} />
              <InputGroup label="Confirm New Password" name="confirmPassword" type="password" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            {/* Danger Zone */}
            <div className="text-[#ff4444] text-base font-semibold mb-5 flex items-center gap-2.5">
              <i className="fa-solid fa-circle-exclamation"></i> Danger Zone
            </div>
            <div className="border border-[#2a1111] bg-[#110505] p-6 rounded-xl mb-10">
              <div className="text-sm font-medium text-white">Disable Account</div>
              <p className="text-[12px] text-[#808080] mt-1.5 mb-4">
                Deactivating your account will restrict access to your files. This action can be reversed by an administrator.
              </p>
              <button type="button" className="text-[#ff4444] border border-[#ff4444] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#ff4444] hover:text-white transition-all">
                Disable My Account
              </button>
            </div>

            {/* Actions */}
            <div className="pt-[30px] border-t border-[#1a1a1a] flex gap-[15px]">
              <button type="submit" className="bg-white text-black px-[30px] py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                Save Changes
              </button>
              <a href="/myprofile" className="text-[#808080] px-[30px] py-3 rounded-full border border-[#1a1a1a] font-bold text-sm text-center hover:bg-[#111] transition-all">
                Cancel
              </a>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

// Helper components remain the same...
const InputGroup = ({ label, type = "text", placeholder, name, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] uppercase text-[#808080] tracking-wider">{label}</label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-[#111] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3b82f6] transition-colors"
    />
  </div>
);

export default AccountSettings;