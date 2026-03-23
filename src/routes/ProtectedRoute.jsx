import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Still checking cookie — render nothing yet
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Cookie valid → render whatever route was requested
  // Cookie missing/expired → kick to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;