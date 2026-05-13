import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="site-header__brand">
        QR Code Attendance
      </Link>
      <nav className="site-header__nav" aria-label="Main">
        {user ? (
          <>
            {user.role === "faculty" ? (
              <Link className="btn btn-ghost" to="/faculty">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/student">
                  Dashboard
                </Link>
              </>
            )}
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-ghost" to="/login?role=faculty">
              Faculty login
            </Link>
            <Link className="btn btn-ghost" to="/login?role=student">
              Student login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
