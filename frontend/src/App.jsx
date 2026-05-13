import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PrivateRoute } from "./components/PrivateRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FacultyPage from "./pages/FacultyPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrivateRoute roles={["faculty"]} />}>
          <Route path="/faculty" element={<FacultyPage />} />
        </Route>

        <Route element={<PrivateRoute roles={["student"]} />}>
          <Route path="/student" element={<StudentDashboardPage />} />
          <Route path="/student/scan" element={<Navigate to="/student" replace />} />
          <Route path="/student/submit-attendance" element={<Navigate to="/student" replace />} />
          <Route path="/student/records" element={<Navigate to="/student" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
