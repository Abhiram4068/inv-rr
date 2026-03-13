import React from "react";
import { Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
import StorageLayout from "./layouts/StorageManagement";
import RecentLayout from "./layouts/RecentLayout";
import CollectionLayout from "./layouts/CollectionLayout";


import Dashboard from "./pages/user/Dashboard";
import PaginatedFiles from "./pages/user/PaginatedFiles";
import ViewAllShares from "./pages/user/ViewAllShares";
import NotFound from "./pages/public/NotFound";
import FileDetails from "./pages/user/FileDetails";
import RecentFiles from "./pages/user/RecentFiles";
import Starred from "./pages/user/Starred";
import Shared from "./pages/user/Shared";
import Collections from "./pages/user/Collections";
import CollectionDetails from "./pages/user/CollectionDetails";
import TrashManagement from "./pages/user/storage/Trash";
import UploadFilesMain from "./pages/user/UploadFile";
import StorageDashboard from "./pages/user/StorageDashboard";

import UserProfile from "./pages/profile/UserProfile";
import AccountSettings from "./pages/profile/Profilesettings";

import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ExternalShareView from "./pages/public/PublicView";


import ManageStorage from "./pages/user/storage/ManageStorage"
import DuplicateManager from "./pages/user/storage/ViewDuplicates";
import OldFilesManager from "./pages/user/storage/ViewOldFiles";
import ScheduleMail from "./pages/user/ScheduleMail";
import SchedulesList from "./pages/user/SchedulesList";
import ManagerReports from "./pages/user/ManagerReports";

function App() {
  return (
    <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/files" element={<PaginatedFiles />} />
        <Route path="/details" element={<FileDetails />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/collections" element={<Collections />} />
        
        <Route path="/upload-file" element={<UploadFilesMain />} />
        <Route path="/viewallshares" element={<ViewAllShares />} />
        <Route path="/myprofile" element={<UserProfile />} />
        <Route path="/settings" element={<AccountSettings />} />
        <Route path="/storage" element={<StorageDashboard />} />
        <Route path="/schedule-mail" element={<ScheduleMail/>} />
        <Route path="/schedules" element={<SchedulesList/>} />
        <Route path="/reports" element={<ManagerReports/>} />
        

      </Route>
      <Route element={<StorageLayout />}>
         <Route path="/storage/storage-cleanup" element={<ManageStorage />} />
          <Route path="/storage/view-duplicates" element={<DuplicateManager />} />
          <Route path="/storage/trash" element={<TrashManagement />} />
          <Route path="/storage/view-oldfiles" element={<OldFilesManager />} />
      </Route>
       

      <Route element={<RecentLayout />}>
      <Route path="/recent" element={<RecentFiles />} />
      </Route>
      <Route element={<CollectionLayout />}>
      <Route path="/viewcollection" element={<CollectionDetails />} />
      </Route>
 
      <Route path="/downloadpage" element={<ExternalShareView />} />  
      <Route path="*" element={<NotFound />} />




    </Routes>
  );
}

export default App;