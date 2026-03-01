import { Outlet } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";

export default function MainLayout() {
  return (
    <div className="bg-black text-white flex flex-col font-sans min-h-screen">
      <TopNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}