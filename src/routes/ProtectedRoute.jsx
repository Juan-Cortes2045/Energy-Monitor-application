import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/auth/session";

const ProtectedRoute = () =>
  isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;

export default ProtectedRoute;
