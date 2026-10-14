import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../services/auth/usePermissions";

/**
 * Deja pasar solo a quien tiene el permiso global `permission`; al resto lo
 * manda al inicio. Es solo visibilidad: el backend responde 403 de todos modos.
 * Mientras los permisos no han llegado (sesión de antes) no decide nada.
 */
const RequirePermission = ({ permission }) => {
  const { loaded, has } = usePermissions();
  if (!loaded) return null;
  return has(permission) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RequirePermission;
