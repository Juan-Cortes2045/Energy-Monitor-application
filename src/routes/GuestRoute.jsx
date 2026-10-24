import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, landingPath } from "../services/auth/session";

/**
 * Pantallas para quien no tiene sesión (login, registro). Quien llega a ellas con una sesión activa
 * (p. ej. desde "Iniciar sesión" en la landing) va directo a su panel: el de administración o el
 * de hogares.
 *
 * Se decide solo al entrar: la sesión que se abre en esta misma pantalla al iniciar sesión no
 * redirige aquí, la redirección la hace el propio formulario cuando ya tiene los permisos.
 */
const GuestRoute = () => {
  const [signedInOnArrival] = useState(isAuthenticated);
  return signedInOnArrival ? <Navigate to={landingPath()} replace /> : <Outlet />;
};

export default GuestRoute;
