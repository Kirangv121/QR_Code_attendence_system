import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import TopNav from "../components/TopNav.jsx";
import ProfileEditModal from "../components/ProfileEditModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Accept raw base64 or full data URL from the API / Python service. */
function qrImageSrc(b64) {
  if (!b64 || typeof b64 !== "string") return "";
  const t = b64.trim();
  if (t.startsWith("data:image")) return t;
  return `data:image/png;base64,${t}`;
}

/** Remaining time tone: 5–3 min green, 3–2 min orange, 2–0 min red. */
function countdownTone(msRemaining) {
  if (msRemaining <= 0) return "qr-countdown--expired";
  if (msRemaining > 3 * 60 * 1000) return "qr-countdown--safe";
  if (msRemaining > 2 * 60 * 1000) return "qr-countdown--warn";
  return "qr-countdown--crit";
}

function QrExpiryCountdown({ expiresAtIso, onExpired }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!expiresAtIso) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [expiresAtIso]);

  useEffect(() => {
    if (!expiresAtIso || !onExpired) return undefined;
    const ms = new Date(expiresAtIso).getTime() - Date.now();
    if (ms <= 0) {
      onExpired();
      return undefined;
    }
    const t = setTimeout(onExpired, ms + 50);
    return () => clearTimeout(t);
  }, [expiresAtIso, onExpired]);

  if (!expiresAtIso) return null;

  const ms = Math.max(0, new Date(expiresAtIso).getTime() - Date.now());
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const label = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const tone = countdownTone(ms);

  let hint = "5–3 min left — good time to scan";
  if (ms <= 0) hint = "QR expired";
  else if (ms <= 2 * 60 * 1000) hint = "2 min or less — scan now";
  else if (ms <= 3 * 60 * 1000) hint = "3–2 min left — hurry";

  return (
    <div className={`qr-countdown ${tone}`} aria-live="polite">
      <span className="qr-countdown__label">Time left</span>
      <span className="qr-countdown__time">{label}</span>
      <span className="qr-countdown__hint">{hint}</span>
    </div>
  );
}

export default function FacultyPage() {
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [active, setActive] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/sessions/mine");
      setSessions(data.sessions);
      if (selectedId) {
        try {
          const r = await api.get(`/sessions/${selectedId}/report`);
          setReport(r.data);
        } catch {
          /* keep last report */
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sessions");
    }
  }, [selectedId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 12000);
    return () => clearInterval(t);
  }, [load]);

  async function createSession(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/sessions", { title, courseCode });
      setTitle("");
      setCourseCode("");
      setActive(data);
      setSelectedId(null);
      setReport(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create session");
    }
  }

  const refreshActiveQr = useCallback(async () => {
    const id = active?.session?.id;
    if (!id) return;
    try {
      const { data } = await api.get(`/sessions/${id}`);
      setActive(data);
    } catch {
      /* keep current view */
    }
  }, [active?.session?.id]);

  async function openLiveQr(id) {
    setError("");
    try {
      const { data } = await api.get(`/sessions/${id}`);
      setActive(data);
      setSelectedId(id);
      setReport(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load session");
    }
  }

  async function loadReport(id) {
    setError("");
    setLoadingReport(true);
    setSelectedId(id);
    try {
      const { data } = await api.get(`/sessions/${id}/report`);
      setReport(data);
      setActive(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load report");
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  }

  async function closeSession(id) {
    setError("");
    try {
      await api.post(`/sessions/${id}/close`);
      if (selectedId === id) {
        setSelectedId(null);
        setReport(null);
      }
      setActive(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not close");
    }
  }

  return (
    <div className="page-with-nav">
      <TopNav />
      <main className="layout layout--wide">
        <div className="page-intro">
          <h1>Faculty dashboard</h1>
          <p className="muted">Sessions refresh periodically. Click a row for the attendance report.</p>
        </div>

        <div className="card profile-strip profile-strip--faculty">
          <div className="profile-strip__avatar">
            {user?.profilePhotoDataUrl ? (
              <img src={user.profilePhotoDataUrl} alt="" className="profile-strip__avatar-img" />
            ) : (
              <div className="profile-strip__avatar-placeholder" aria-hidden>
                {(user?.name || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-strip__body">
            <div className="profile-strip__title">{user?.name || "—"}</div>
            <div className="profile-strip__meta">
              <span>{user?.email || "—"}</span>
              {user?.department ? (
                <>
                  <span className="profile-strip__dot">·</span>
                  <span>{user.department}</span>
                </>
              ) : null}
            </div>
          </div>
          <button type="button" className="btn btn-ghost profile-strip__edit" onClick={() => setProfileOpen(true)}>
            Edit profile
          </button>
        </div>

        <ProfileEditModal open={profileOpen} onClose={() => setProfileOpen(false)} role="faculty" />

        {error ? <div className="msg msg-error">{error}</div> : null}

        <div className="grid grid-2 faculty-grid">
          <div className="card card--session-form">
            <h2>New session</h2>
            <form onSubmit={createSession}>
              <div className="field">
                <label>Subject / title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Data Structures" />
              </div>
              <div className="field">
                <label>Course code (optional)</label>
                <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="CS301" />
              </div>
              <button className="btn btn-primary" type="submit">
                Create &amp; generate QR
              </button>
            </form>
          </div>

          <div className="card qr-code-card qr-code-card--panel">
            <div className="qr-code-card__header">
              <h2 style={{ margin: 0 }}>Live attendance QR</h2>
              <span className="qr-code-card__badge">5 min limit</span>
            </div>
            {active?.session?.qrExpiresAt && !active.qrExpired ? (
              <QrExpiryCountdown
                expiresAtIso={active.session.qrExpiresAt}
                onExpired={refreshActiveQr}
              />
            ) : null}
            {active && active.qrImageBase64 && !active.qrExpired ? (
              <div className="qr-code-card__body">
                <div className="qr-wrap qr-wrap--hero">
                  <img src={qrImageSrc(active.qrImageBase64)} alt="Attendance QR" />
                </div>
                <p className="muted qr-code-card__hint" style={{ marginBottom: 0 }}>
                  Students open their dashboard, tap <strong>Scan &amp; mark attendance</strong>, and scan this code once.
                </p>
              </div>
            ) : null}

            {active && active.qrExpired && active.session ? (
              <p className="msg msg-error" style={{ marginBottom: 0 }}>
                QR expired for this session. Open Live QR on a newer session or create a new one.
              </p>
            ) : null}

            {active && active.session && !active.qrImageBase64 && !active.qrExpired ? (
              <p className="msg msg-error" style={{ marginBottom: 0 }}>
                QR image could not be generated. Check the server console or tap <strong>Live QR</strong> again.
                {active.qrError ? ` (${active.qrError})` : ""}
              </p>
            ) : null}

            {!active ? (
              <p className="muted" style={{ margin: 0 }}>
                Create a session or use <strong>Live QR</strong> on a row. Each QR is valid for <strong>5 minutes</strong>{" "}
                (green → orange → red countdown).
              </p>
            ) : null}
          </div>
        </div>

        <div className="card" style={{ marginTop: "1rem" }}>
          <h2>Your sessions</h2>
          {sessions.length === 0 ? <p className="muted">No sessions yet.</p> : null}
          <div className="table-scroll">
            <table className="session-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Submissions</th>
                  <th>QR status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={selectedId === s.id ? "session-table__row--selected" : ""}
                    onClick={() => loadReport(s.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{idx + 1}</td>
                    <td>{s.title}</td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>{formatTime(s.createdAt)}</td>
                    <td>{s.attendanceCount ?? 0}</td>
                    <td>
                      <span className="badge">{s.qrStatus}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem" }} onClick={() => openLiveQr(s.id)}>
                        Live QR
                      </button>
                      <button type="button" className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem" }} onClick={() => closeSession(s.id)}>
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {loadingReport ? <p className="muted" style={{ marginTop: "1rem" }}>Loading report…</p> : null}

        {report && !loadingReport ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h2>
              Attendance — {report.session?.title ?? "Session"}{" "}
              <span className="muted">
                ({report.totalPresent} submitted · {formatDate(report.session?.createdAt)} {formatTime(report.session?.createdAt)} · QR:{" "}
                {report.session?.isClosed ? "Closed" : new Date() > new Date(report.session?.qrExpiresAt) ? "Expired" : "Active"}
                )
              </span>
            </h2>
            <table>
              <thead>
                <tr>
                  <th>Form name</th>
                  <th>USN</th>
                  <th>Sem</th>
                  <th>Account email</th>
                  <th>Submitted at</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((row) => (
                  <tr key={row.attendanceId}>
                    <td>{row.formFullName || row.student?.name}</td>
                    <td>{row.formUsn || row.student?.usn}</td>
                    <td>{row.formSem}</td>
                    <td>{row.student?.email}</td>
                    <td>{row.markedAt ? new Date(row.markedAt).toLocaleString() : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.students.length === 0 ? <p className="muted">No submissions yet for this session.</p> : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
