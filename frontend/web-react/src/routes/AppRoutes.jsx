import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import VerifyAccount from "../features/auth/pages/VerifyAccount";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/VerifyAccount" element={<VerifyAccount />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
