import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteLoading from "./RouteLoading";

// Guards /login, /register, /recover-password, /verify-recover-password and
// /verify-account: an already-authenticated user gets bounced to /dashboard
// instead of seeing the login form again.
const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <RouteLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default PublicOnlyRoute;
