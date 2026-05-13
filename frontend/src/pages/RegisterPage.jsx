import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [studentUsn, setStudentUsn] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "faculty" || r === "student") setRole(r);
  }, [searchParams]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      await register({ name, email, password, role, studentId: role === "student" ? studentUsn : undefined });
      nav(`/login?role=${role}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check server/database connection.");
    }
  }

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    name &&
    email &&
    password.length >= 6 &&
    confirmPassword &&
    passwordsMatch &&
    (role !== "student" || studentUsn.trim().length > 0);

  return (
    <div className="page-with-nav">
      <TopNav />
      <main className="layout layout--narrow">
        <div className="card auth-card">
          <h1 className="auth-card__title">Register</h1>
          <p className="muted auth-card__subtitle">Create an account if you do not already have one.</p>

          {error ? <div className="msg msg-error">{error}</div> : null}

          <form onSubmit={onSubmit} className="auth-card__form">
            <div className="field">
              <label htmlFor="reg-name">Full name</label>
              <input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Create password</label>
              <div className="password-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
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
            <div className="field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <div className="password-wrap">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>
              {confirmPassword && !passwordsMatch ? (
                <small className="field-error">Create password and confirm password must match.</small>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="reg-role">Role</label>
              <select id="reg-role" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            {role === "student" ? (
              <div className="field">
                <label htmlFor="reg-usn">USN (roll number)</label>
                <input
                  id="reg-usn"
                  value={studentUsn}
                  onChange={(e) => setStudentUsn(e.target.value)}
                  required
                  placeholder="e.g. 1RN21CS001"
                  autoComplete="off"
                />
              </div>
            ) : null}
            <button className="btn btn-primary auth-card__submit" type="submit" disabled={!canSubmit}>
              Sign up
            </button>
          </form>

          <div className="auth-card__footer auth-card__footer--register">
            <span className="muted">Already have an account?</span>
            <Link className="auth-card__signup" to={`/login?role=${role}`}>
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
