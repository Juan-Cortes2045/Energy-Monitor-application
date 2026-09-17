import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../features/landingPage/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import VerifyAccount from "../features/auth/pages/VerifyAccount";
import RecoverPassword from "../features/auth/pages/RecoverPassword";
import VerifyRecoverPassword from "../features/auth/pages/VerifyRecoverPassword";
import Profile from "../features/auth/pages/Profile";
import Account from "../features/Account/Account";
import Consumption from "../features/DetailHome/Consumption/Consumption";
import Favorites from "../features/Favorites/Favorites";
import Notifications from "../features/Notifications/Notifications";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import Settings from "../features/SettingsPage/pages/Settings";
import SupportI from "../features/landingPage/pages/SupportI";
import AboutI from "../features/landingPage/pages/AboutI";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import HomeMemberRoute from "./HomeMemberRoute";
import NotFoundPage from "./NotFoundPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutI />} />
        <Route path="/support" element={<SupportI />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-account" element={<VerifyAccount />} />
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route path="/verify-recover-password" element={<VerifyRecoverPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<Account />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<HomeMemberRoute />}>
              <Route path="/homes/:homeId" element={<Consumption />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
