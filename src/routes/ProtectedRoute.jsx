import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RouteLoading from "./RouteLoading";
import ErrorState from "../components/shared/ErrorState/ErrorState";

// Guards every authenticated route. While `loading` is true (AuthContext is
// still rehydrating from GET /auth/me) no redirect decision is made yet —
// deciding early would flash /login even for an already-logged-in user.
//
// `hydrateError` means the rehydration request itself failed to reach the
// server (not that the session was rejected) — see AuthContext.hydrate().
// Show a retryable error instead of redirecting to /login, so a transient
// outage (or a page reload while offline) doesn't silently sign the user
// out of an otherwise-valid session.
const ProtectedRoute = () => {
  const { isAuthenticated, loading, hydrateError, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) return <RouteLoading />;
  if (!isAuthenticated && hydrateError) {
    return <ErrorState error={hydrateError} onRetry={refreshUser} />;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

export default ProtectedRoute;
