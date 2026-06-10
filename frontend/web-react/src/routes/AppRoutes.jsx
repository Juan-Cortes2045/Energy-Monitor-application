import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../features/landingPage/pages/Home";
import HowItWorksPage from "../features/landingPage/pages/HowItWorksPage";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import VerifyAccount from "../features/auth/pages/VerifyAccount";
import RecoverPassword from "../features/auth/pages/RecoverPassword";
import VerifyRecoverPassword from "../features/auth/pages/VerifyRecoverPassword";
import Account from "../features/Account/Account";
import Consumption from "../features/DetailProject/Consumption/Consumption";

import MainLayout from "../components/layout/MainLayout/MainLayout";
import DashboarPage from "../features/dashboard/pages/DashboardPage";
import Settings from "../features/SettingsPage/pages/Settings";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/VerifyAccount" element={<VerifyAccount />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/Account" element={<Account />} />|
        <Route>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboarPage />}></Route>
            <Route path="/Consumption" element={<Consumption />} />
            <Route path="/Settings" element={<Settings/>} />
          </Route>
        </Route>
        <Route
          path="VerifyRecoverPassword"
          element={<VerifyRecoverPassword />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
