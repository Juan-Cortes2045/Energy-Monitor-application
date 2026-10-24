import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../services/auth/usePermissions";
import PageLoading from "../components/shared/PageLoading/PageLoading";

/**
 * Pantallas de hogares (inicio, hogar, favoritos): una cuenta de administración no las usa y
 * va a la administración. Mientras los permisos no han llegado no decide nada y muestra la carga.
 */
const UserOnlyRoute = () => {
  const { loaded, isAdmin } = usePermissions();
  if (!loaded) return <PageLoading />;
  return isAdmin ? <Navigate to="/admin/users" replace /> : <Outlet />;
};

export default UserOnlyRoute;
