import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle Deactivated Account status
  const isDeactivated = user.account_status?.toLowerCase() === "deactivated";
  const isDeactivatedPage = location.pathname === "/account-deactivated";

  if (isDeactivated && !isDeactivatedPage) {
    return <Navigate to="/account-deactivated" replace />;
  }

  if (!isDeactivated && isDeactivatedPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;