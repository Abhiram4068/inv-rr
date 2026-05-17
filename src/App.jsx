import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import UserLayout from "./layouts/UserLayout";
import StorageLayout from "./layouts/StorageManagement";
import CollectionLayout from "./layouts/CollectionLayout";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/user/Dashboard";
import PaginatedFiles from "./pages/user/PaginatedFiles";
import ViewAllShares from "./pages/user/ViewAllShares";
import NotFound from "./pages/public/NotFound";
import FileDetails from "./pages/user/FileDetails";
import RecentFiles from "./pages/user/RecentFiles";
import Starred from "./pages/user/Starred";
import StarredFiles from "./pages/user/StarredFiles";
import ArchivesList from "./pages/user/Archives";
import Collections from "./pages/user/Collections";
import CollectionDetails from "./pages/user/CollectionDetails";
import TrashManagement from "./pages/user/storage/Trash";
import UploadFilesMain from "./pages/user/UploadFile";
import StorageDashboard from "./pages/user/StorageDashboard";
import Threads from "./pages/user/Threads";
import ThreadVisualizer from "./pages/user/ThreadVisualizer";
import UserProfile from "./pages/user/profile/UserProfile";
import AccountSettings from "./pages/user/profile/Profilesettings";
import ThreadLayout from "./layouts/ThreadLayout";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ExternalShareView from "./pages/public/PublicView";
import Landing from "./pages/public/Landing";
import ResetPassword from "./pages/public/ResetPassword";
import ForgotPassword from "./pages/public/ForgotPassword";
import ManageStorage from "./pages/user/storage/ManageStorage";
import DuplicateManager from "./pages/user/storage/ViewDuplicates";
import OldFilesManager from "./pages/user/storage/ViewOldFiles";
import ScheduleMail from "./pages/user/ScheduleMail";
import SchedulesList from "./pages/user/SchedulesList";
import ManagerReports from "./pages/user/ManagerReports";
import AccountDeactivated from "./pages/public/AccountDeactivated";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserView";
import UserDetails from "./pages/admin/UserDetails";
import PendingApprovals from "./pages/admin/PendingApprovals";
import RoleChangeRequests from "./pages/admin/RoleChangeRequests";
import ReactivationRequests from "./pages/admin/ReactivationRequests";
import BlockedUsers from "./pages/admin/BlockedUsers";
import DeletedUsers from "./pages/admin/DeletedUsers";
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password/confirm" element={<ResetPassword />} />
        {/* ── Protected routes — cookie checked first ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account-deactivated" element={<AccountDeactivated />} />

          <Route element={<UserLayout />}>
            <Route path="/archives"     element={<ArchivesList />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/files"         element={<PaginatedFiles />} />
            <Route path="/file/:id"   element={<FileDetails />} />
            <Route path="/starred"       element={<Starred />} />
            <Route path="/starred-files" element={<StarredFiles />} />
            <Route path="/collections"   element={<Collections />} />
            <Route path="/upload-file"   element={<UploadFilesMain />} />
            <Route path="/viewallshares" element={<ViewAllShares />} />
            <Route path="/myprofile"     element={<UserProfile />} />
            <Route path="/settings"      element={<AccountSettings />} />
            <Route path="/storage"       element={<StorageDashboard />} />
            <Route path="/schedule-mail" element={<ScheduleMail />} />
            <Route path="/schedules"     element={<SchedulesList />} />
            <Route path="/reports"       element={<ManagerReports />} />
            <Route path="/threads"     element={<Threads />} />
            <Route path="/storage/trash"           element={<TrashManagement />} />
            <Route path="/recent" element={<RecentFiles />} />
          </Route>

         <Route element={<ThreadLayout />}>
          <Route path="/thread/:id" element={<ThreadVisualizer />} />
         </Route>

          <Route element={<StorageLayout />}>
            <Route path="/storage/storage-cleanup" element={<ManageStorage />} />
            <Route path="/storage/view-duplicates" element={<DuplicateManager />} />
            
            <Route path="/storage/view-oldfiles"   element={<OldFilesManager />} />
          </Route>

          <Route element={<CollectionLayout />}>
            <Route path="/viewcollection/:id" element={<CollectionDetails />} />
          </Route>

          {/* ── Admin Exclusive Routes ── */}
          <Route element={<AdminLayout />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/requests" element={<ReactivationRequests />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/user/detail/:id/" element={<UserDetails />} />
              <Route path="/admin/pending-users" element={<PendingApprovals />} />
              <Route path="/admin/role-change" element={<RoleChangeRequests />} />
              <Route path="/admin/blocked-users" element={<BlockedUsers />} />
              <Route path="/admin/deleted-users" element={<DeletedUsers />} />
              <Route path="/admin/reactivation-requests" element={<ReactivationRequests />} />
            </Route>
          </Route>
          
        </Route>
        {/* ── End protected ── */}

        <Route path="*" element={<NotFound />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;