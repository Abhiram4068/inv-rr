import React from 'react';
import { Link } from "react-router-dom";

const UserProfile = () => {
  return (
   <div className="flex-1 flex min-w-0 bg-black overflow-hidden">
  <div className="flex-1 p-3 lg:p-5 overflow-y-auto no-scrollbar">
        <div className="w-full bg-[#0a0a0a] border border-neutral-900 rounded-xl p-8 lg:p-12 shadow-2xl">
          
          <h1 className="text-xl font-bold text-white mb-10">Account Profile</h1>

          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-neutral-900">
            {/* Avatar Circle */}
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 shadow-lg shadow-blue-900/20">
              JD
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-1">John Doe</h2>
              <p className="text-neutral-500 font-medium">
                Project Manager • <span className="text-neutral-600">john.doe@innovaturelabs.com</span>
              </p>
            </div>

           <Link 
  to="/settings"
  className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors inline-block"
>
  Edit Profile
</Link>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
            <DetailItem label="First Name" value="John" />
            <DetailItem label="Last Name" value="Doe" />
            <DetailItem label="Role / Occupation" value="Project Manager" />
            <DetailItem label="Total Files Managed" value="1,248 Files" />
            <DetailItem label="Date Joined" value="January 15, 2024" />
            <DetailItem label="Account Status" value="Active" valueColor="#00c851" />
          </div>
        </div>
      </div>

     
    </div>
  );
};

const DetailItem = ({ label, value, valueColor }) => (
  <div className="space-y-2">
    <span className="block text-[10px] uppercase tracking-[0.15em] font-bold text-neutral-600">
      {label}
    </span>
    <span 
      className="block text-lg font-semibold tracking-wide" 
      style={{ color: valueColor || '#ffffff' }}
    >
      {value}
    </span>
  </div>
);

export default UserProfile;