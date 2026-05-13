import React from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";

export default function HomePage() {
  return (
    <div className="page-with-nav">
      <TopNav />
      <main className="layout layout--landing">
        <section className="landing-hero">
          <div className="landing-hero__glow" aria-hidden />
          <div className="landing-hero__inner card">
            <p className="landing-kicker">VTU Edutrainer · Smart attendance</p>
            <h1 className="landing-title">QR attendance that just works</h1>
            <p className="landing-lead">
              Faculty start a timed session and show one QR. Students scan once with their phone — attendance is logged
              instantly to your session report. No paper, no double entry.
            </p>
            <div className="landing-actions">
              <Link className="btn btn-primary landing-btn landing-btn--primary" to="/login?role=faculty">
                Faculty sign in
              </Link>
              <Link className="btn landing-btn landing-btn--secondary" to="/login?role=student">
                Student sign in
              </Link>
            </div>
            <p className="muted landing-foot">
              New here?{" "}
              <Link to="/register?role=student">Create a student account</Link> or{" "}
              <Link to="/register?role=faculty">faculty account</Link>.
            </p>
          </div>
        </section>

        <section className="landing-features">
          <article className="card landing-feature">
            <h2>For faculty</h2>
            <p className="muted">
              Create a class session, display the live QR, and export attendance from the built-in report. Profile and
              department stay on your account.
            </p>
          </article>
          <article className="card landing-feature">
            <h2>For students</h2>
            <p className="muted">
              One tap opens the camera; a valid scan marks you present using your profile. Update semester and department
              anytime from your dashboard.
            </p>
          </article>
          <article className="card landing-feature">
            <h2>Secure &amp; simple</h2>
            <p className="muted">
              Each QR carries a short-lived token tied to that session only, so codes cannot be reused after they expire.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
