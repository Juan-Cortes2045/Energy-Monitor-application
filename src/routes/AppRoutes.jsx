import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../features/landingPage/pages/Home";
import HomeRoute from "./HomeRoute";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import RequirePermission from "./RequirePermission";
import UserOnlyRoute from "./UserOnlyRoute";
import NotFound from "./NotFound";
import PageLoading from "../components/shared/PageLoading/PageLoading";
import { PERMISSIONS } from "../services/admin/adminApi";

// Las pantallas se descargan al visitarlas (un solo bundle superaba 1 MB); la portada y los
// marcos (layout, guardas) siguen en el bundle inicial.
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const VerifyAccount = lazy(() => import("../features/auth/pages/VerifyAccount"));
const RecoverPassword = lazy(() => import("../features/auth/pages/RecoverPassword"));
const VerifyRecoverPassword = lazy(() => import("../features/auth/pages/VerifyRecoverPassword"));
const Account = lazy(() => import("../features/Account/Account"));
const Consumption = lazy(() => import("../features/DetailHome/Consumption/Consumption"));
const Favorites = lazy(() => import("../features/Favorites/Favorites"));
const Notifications = lazy(() => import("../features/Notifications/Notifications"));
const DashboarPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const Settings = lazy(() => import("../features/SettingsPage/pages/Settings"));
const SupportI = lazy(() => import("../features/landingPage/pages/SupportI"));
const AboutI = lazy(() => import("../features/landingPage/pages/AboutI"));
const AdminUsers = lazy(() => import("../features/Admin/AdminUsers"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutI />} />
          <Route path="/support" element={<SupportI />} />
          {/* Con una sesión activa, login y registro llevan directo al panel */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/VerifyAccount" element={<VerifyAccount />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route element={<ProtectedRoute />}>
            {/* El perfil necesita sesión: sin ella cargaría datos vacíos y llamadas con 401. */}
            <Route path="/account" element={<Account />} />
            <Route element={<MainLayout />}>
              <Route element={<UserOnlyRoute />}>
                <Route path="/dashboard" element={<DashboarPage />} />
                <Route path="/homes/:homeId" element={<HomeRoute />}>
                  <Route index element={<Consumption />} />
                </Route>
                <Route path="/favorites" element={<Favorites />} />
              </Route>
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route element={<RequirePermission permission={PERMISSIONS.USER_READ} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
            </Route>
          </Route>
          <Route
            path="/verifyRecoverPassword"
            element={<VerifyRecoverPassword />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
