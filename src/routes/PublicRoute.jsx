import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is authenticated, redirect them away from landing/login pages to dashboard
  if (user) {
    return <Navigate to={(user.is_staff || user.is_superuser) ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
