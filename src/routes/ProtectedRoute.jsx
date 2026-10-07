import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/auth/session";
import { refreshProfile } from "../services/auth/authApi";

const ProtectedRoute = () => {
  const authenticated = isAuthenticated();

  // Nombre, apellido y foto para el Sidebar aunque la sesión sea de antes del cambio.
  useEffect(() => {
    if (authenticated) refreshProfile().catch(() => {});
  }, [authenticated]);

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
