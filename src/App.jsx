import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

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

import UserProfile from "./pages/user/profile/UserProfile";
import AccountSettings from "./pages/user/profile/Profilesettings";

import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ExternalShareView from "./pages/public/PublicView";
import Landing from "./pages/public/Landing";

import ManageStorage from "./pages/user/storage/ManageStorage";
import DuplicateManager from "./pages/user/storage/ViewDuplicates";
import OldFilesManager from "./pages/user/storage/ViewOldFiles";
import ScheduleMail from "./pages/user/ScheduleMail";
import SchedulesList from "./pages/user/SchedulesList";
import ManagerReports from "./pages/user/ManagerReports";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Public routes — no cookie check ── */}
        <Route element={<PublicRoute />}>
          <Route path="/"             element={<Landing />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
        </Route>
        <Route path="/downloadpage" element={<ExternalShareView />} />

        {/* ── Protected routes — cookie checked first ── */}
        <Route element={<ProtectedRoute />}>

          <Route element={<UserLayout />}>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/files"         element={<PaginatedFiles />} />
            <Route path="/file/:id"   element={<FileDetails />} />
            <Route path="/starred"       element={<Starred />} />
            <Route path="/shared"        element={<Shared />} />
            <Route path="/collections"   element={<Collections />} />
            <Route path="/upload-file"   element={<UploadFilesMain />} />
            <Route path="/viewallshares" element={<ViewAllShares />} />
            <Route path="/myprofile"     element={<UserProfile />} />
            <Route path="/settings"      element={<AccountSettings />} />
            <Route path="/storage"       element={<StorageDashboard />} />
            <Route path="/schedule-mail" element={<ScheduleMail />} />
            <Route path="/schedules"     element={<SchedulesList />} />
            <Route path="/reports"       element={<ManagerReports />} />
          </Route>

          <Route element={<StorageLayout />}>
            <Route path="/storage/storage-cleanup" element={<ManageStorage />} />
            <Route path="/storage/view-duplicates" element={<DuplicateManager />} />
            <Route path="/storage/trash"           element={<TrashManagement />} />
            <Route path="/storage/view-oldfiles"   element={<OldFilesManager />} />
          </Route>

          <Route element={<RecentLayout />}>
            <Route path="/recent" element={<RecentFiles />} />
          </Route>

          <Route element={<CollectionLayout />}>
            <Route path="/viewcollection/:id" element={<CollectionDetails />} />
          </Route>

        </Route>
        {/* ── End protected ── */}

        <Route path="*" element={<NotFound />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;