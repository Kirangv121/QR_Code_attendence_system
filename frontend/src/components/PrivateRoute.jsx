import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function PrivateRoute({ roles }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="layout">
        <p className="muted">Loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
