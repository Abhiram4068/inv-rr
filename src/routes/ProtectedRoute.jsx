import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user && user.account_status?.toLowerCase() === "blocked") {
      logout();
    }
  }, [user, logout]);

  if (loading || (user && user.account_status?.toLowerCase() === "blocked")) {
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
    return <Navigate to={(user.is_staff || user.is_superuser) ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  // Redirect admin users from normal dashboard to admin dashboard
  if ((user.is_staff || user.is_superuser) && location.pathname === "/dashboard") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;