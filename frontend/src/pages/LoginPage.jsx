import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("faculty");
  const [error, setError] = useState("");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "faculty" || r === "student") {
      setRole(r);
    }
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const u = await login(email, password, role);
      if (u.role === "faculty") nav("/faculty");
      else nav("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check server/database connection.");
    }
  }

  return (
    <div className="page-with-nav">
      <TopNav />
      <main className="layout layout--auth">
        <div className="login-shell card">
          <div className="login-shell__intro">
            <h1 className="login-shell__title">Welcome back</h1>
            <p className="muted login-shell__subtitle">Sign in with your institutional email and password.</p>
            <div className="login-role-toggle" role="tablist" aria-label="Account type">
              <button
                type="button"
                role="tab"
                aria-selected={role === "faculty"}
                className={`login-role-toggle__btn ${role === "faculty" ? "login-role-toggle__btn--active" : ""}`}
                onClick={() => setRole("faculty")}
              >
                Faculty
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === "student"}
                className={`login-role-toggle__btn ${role === "student" ? "login-role-toggle__btn--active" : ""}`}
                onClick={() => setRole("student")}
              >
                Student
              </button>
            </div>
          </div>

          {error ? <div className="msg msg-error">{error}</div> : null}

          <form onSubmit={onSubmit} className="login-shell__form">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <input type="hidden" name="role" value={role} readOnly />
            <button className="btn btn-primary login-shell__submit" type="submit">
              Continue as {role === "faculty" ? "faculty" : "student"}
            </button>
          </form>

          <div className="login-shell__footer">
            <Link className="auth-card__signup" to={`/register?role=${role}`}>
              Need an account? Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
