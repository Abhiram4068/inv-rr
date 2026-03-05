import React from "react";
import { Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
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
import Trash from "./pages/user/Trash";
import UploadFilesMain from "./pages/user/UploadFile";
import UserProfile from "./pages/profile/UserProfile";
import AccountSettings from "./pages/profile/Profilesettings";

import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ExternalShareView from "./pages/public/PublicView";


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
        <Route path="/trash" element={<Trash />} />
        <Route path="/upload-file" element={<UploadFilesMain />} />
        <Route path="/viewallshares" element={<ViewAllShares />} />
        <Route path="/myprofile" element={<UserProfile />} />
        <Route path="/settings" element={<AccountSettings />} />

      </Route>


      <Route element={<RecentLayout />}>
      <Route path="/recent" element={<RecentFiles />} />
      </Route>
      <Route element={<CollectionLayout />}>
      <Route path="/viewcollection" element={<CollectionDetails />} />
      </Route>
 

<Route path="/404" element={<NotFound />} />
<Route path="/downloadpage" element={<ExternalShareView />} />  
    </Routes>
  );
}

export default App;