import React, { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { api } from "../api/client.js";
import TopNav from "../components/TopNav.jsx";
import ProfileEditModal from "../components/ProfileEditModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatWhen(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [recordsError, setRecordsError] = useState("");
  const [phase, setPhase] = useState("idle");
  const [scanErr, setScanErr] = useState("");
  const [scanOk, setScanOk] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const scannerRef = useRef(null);
  const historyAnchorRef = useRef(null);
  const scanBusyRef = useRef(false);

  const loadHistory = useCallback(async () => {
    setRecordsError("");
    try {
      const { data } = await api.get("/attendance/mine");
      setRecords(data.records || []);
    } catch (e) {
      setRecordsError(e.response?.data?.message || "Could not load attendance history");
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (phase !== "scanning") return;

    let cancelled = false;
    const regionId = "student-qr-reader";

    async function start() {
      setScanErr("");
      setScanOk("");
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        if (!cameras.length) {
          setScanErr("No camera found on this device.");
          setPhase("idle");
          return;
        }
        await scanner.start(
          cameras[0].id,
          {
            fps: 6,
            qrbox: { width: 260, height: 260 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          async (text) => {
            if (scanBusyRef.current) return;
            scanBusyRef.current = true;
            try {
              await scanner.pause(true);
              const { data } = await api.post("/attendance/mark-scan", { qrText: text });
              await scanner.stop().catch(() => {});
              scanner.clear().catch(() => {});
              scannerRef.current = null;
              if (cancelled) return;
              setPhase("idle");
              const msg = data.message || "Success.";
              setScanOk(msg);
              setScanErr("");
              await loadHistory();
              historyAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (e) {
              const m = e.response?.data?.message || e.message || "Scan failed";
              setScanErr(m);
              setScanOk("");
              try {
                await scanner.resume();
              } catch {
                /* ignore */
              }
            } finally {
              scanBusyRef.current = false;
            }
          },
          () => {}
        );
      } catch (e) {
        if (!cancelled) {
          setScanErr(e.message || "Could not start camera. Allow camera access and try again.");
          setPhase("idle");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      scanBusyRef.current = false;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, [phase, loadHistory]);

  function beginScan() {
    setScanErr("");
    setScanOk("");
    setPhase("scanning");
  }

  function cancelScanning() {
    setPhase("idle");
  }

  return (
    <div className="page-with-nav">
      <TopNav />
      <main className="layout layout--wide">
        <div className="page-intro page-intro--student">
          <h1>Student dashboard</h1>
          <p className="muted">Your profile is used when you scan class QR — attendance is recorded automatically.</p>
        </div>

        <div className="card profile-strip">
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
              <span className="profile-strip__dot">·</span>
              <span>USN {user?.studentId || "—"}</span>
              {(user?.department || user?.semester) && (
                <>
                  <span className="profile-strip__dot">·</span>
                  <span>
                    {[user?.department, user?.semester ? `Sem ${user.semester}` : ""].filter(Boolean).join(" · ")}
                  </span>
                </>
              )}
            </div>
          </div>
          <button type="button" className="btn btn-ghost profile-strip__edit" onClick={() => setProfileOpen(true)}>
            Edit profile
          </button>
        </div>

        <ProfileEditModal open={profileOpen} onClose={() => setProfileOpen(false)} role="student" />

        <div className="card student-scanner-card student-scanner-card--enhanced">
          <div className="student-scanner-card__head">
            <div>
              <h2 style={{ margin: 0 }}>Mark attendance</h2>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                Open the camera, point at the faculty QR in class. One successful scan records you for that session.
              </p>
            </div>
          </div>

          {scanOk ? <div className="msg msg-success">{scanOk}</div> : null}
          {scanErr ? <div className="msg msg-error">{scanErr}</div> : null}

          {phase === "idle" ? (
            <button type="button" className="btn btn-primary student-scanner-card__cta" onClick={beginScan}>
              Scan &amp; mark attendance
            </button>
          ) : null}

          {phase === "scanning" ? (
            <div className="student-scanner-card__stage">
              <div id="student-qr-reader" className="student-scanner-card__viewport" />
              <button type="button" className="btn btn-ghost student-scanner-card__cancel" onClick={cancelScanning}>
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        <div ref={historyAnchorRef} className="card history-card" style={{ marginTop: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Attendance history</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Submitted sessions appear below and on the faculty report for that class.
          </p>
          {recordsError ? <div className="msg msg-error">{recordsError}</div> : null}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Course</th>
                  <th>USN</th>
                  <th>Sem</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.session?.title || "—"}</td>
                    <td>{r.session?.courseCode || "—"}</td>
                    <td>{r.formUsn || "—"}</td>
                    <td>{r.formSem || "—"}</td>
                    <td>{formatWhen(r.markedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length === 0 && !recordsError ? <p className="muted">No attendance yet.</p> : null}
        </div>
      </main>
    </div>
  );
}
