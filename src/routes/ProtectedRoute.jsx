import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getPermissions, getSessionSnapshot, isAuthenticated, subscribeSession } from "../services/auth/session";
import { refreshProfile } from "../services/auth/authApi";
import ErrorState from "../components/shared/ErrorState/ErrorState";

const ProtectedRoute = () => {
  // Reactivo: si la sesión se borra (logout en otra pestaña, refresh rechazado), se sale al login
  // sin dejar a la vista el contenido protegido.
  useSyncExternalStore(subscribeSession, getSessionSnapshot);
  const authenticated = isAuthenticated();
  const [profileError, setProfileError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // Nombre, apellido y foto para el Sidebar aunque la sesión sea de antes del cambio.
  useEffect(() => {
    if (!authenticated) return;
    refreshProfile()
      .then(() => setProfileError(null))
      .catch((err) => setProfileError(err));
  }, [authenticated, attempt]);

  const retry = useCallback(() => {
    setProfileError(null);
    setAttempt((n) => n + 1);
  }, []);

  if (!authenticated) return <Navigate to="/login" replace />;
  // Sin permisos guardados las rutas hijas esperan para siempre: mejor ofrecer reintentar.
  if (profileError && getPermissions() === null) {
    return <ErrorState error={profileError} onRetry={retry} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
