import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useParams } from "react-router-dom"
import TopNavbar from "../components/TopNavbar";
import Sidebar from "../components/Sidebar";
import CollectionRightSidebar from "../components/CollectionRightSidebar";
import { getCollectionById, updateCollection, deleteCollection } from '../services/collectionService';
import { useNavigate } from "react-router-dom";

const CollectionLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [collectionInfo, setCollectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const res = await getCollectionById(id);
        setCollectionInfo(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to fetch collection details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCollection();
    }
  }, [id]);

const handleUpdateCollection = async (updatedData) => {
  try {
    const res = await updateCollection(id, updatedData);
    setCollectionInfo(res.data);
    setIsManageOpen(false);
  } catch (err) {
    console.error(err);
  }
};

const handleDeleteCollection = async () => {
  try {
    await deleteCollection(id);
    navigate("/collections");
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="m-0 text-white flex flex-col h-screen overflow-hidden bg-black">

      <TopNavbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-grow overflow-hidden relative">

        {/* LEFT SIDEBAR */}
        <Sidebar isOpen={isSidebarOpen} />

 {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-gray-400">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-500">{error}</div>
          ) : (
            <Outlet
              context={{
                collectionInfo,   
                handleUpdateCollection,
                isManageOpen,handleDeleteCollection,
                setIsManageOpen,
                isDeleteOpen,
                setIsDeleteOpen
              }}
            />
          )}
        </main>

        {/* RIGHT SIDEBAR */}
        <CollectionRightSidebar
         collectionInfo={collectionInfo}
          onManage={() => setIsManageOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
        />

        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      </div>
    </div>
  );
};

export default CollectionLayout;