import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../features/auth/pages/Login"

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;