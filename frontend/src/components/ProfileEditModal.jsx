import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const MAX_FILE_BYTES = 320 * 1024;

export default function ProfileEditModal({ open, onClose, role }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoPending, setPhotoPending] = useState(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name || "");
    setDepartment(user.department || "");
    setSemester(user.semester || "");
    setPhotoPreview(user.profilePhotoDataUrl || "");
    setPhotoPending(undefined);
    setError("");
  }, [open, user]);

  if (!open || !user) return null;

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setError("Choose an image file (PNG or JPEG).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Image must be about 300 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setPhotoPending(url);
      setPhotoPreview(url);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setPhotoPending("");
    setPhotoPreview("");
    setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const url = role === "student" ? "/auth/profile/student" : "/auth/profile/faculty";
      const body =
        role === "student"
          ? {
              name: name.trim(),
              department: department.trim(),
              semester: semester.trim(),
              profilePhotoDataUrl:
                photoPending === undefined ? undefined : photoPending === "" ? "" : photoPending,
            }
          : {
              name: name.trim(),
              department: department.trim(),
              profilePhotoDataUrl:
                photoPending === undefined ? undefined : photoPending === "" ? "" : photoPending,
            };
      await api.patch(url, body);
      await refreshUser();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="modal-panel__head">
          <h2 id="profile-modal-title" style={{ margin: 0 }}>
            Edit profile
          </h2>
          <button type="button" className="btn btn-ghost modal-panel__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>
          Email and USN cannot be changed here. Use a small photo (under ~300 KB).
        </p>
        {error ? <div className="msg msg-error">{error}</div> : null}
        <form onSubmit={onSubmit}>
          <div className="profile-photo-row">
            <div className="profile-photo-frame">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="profile-photo-frame__img" />
              ) : (
                <span className="muted">No photo</span>
              )}
            </div>
            <div className="profile-photo-actions">
              <label className="btn btn-ghost profile-photo-file">
                Upload photo
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickPhoto} hidden />
              </label>
              <button type="button" className="btn btn-ghost" onClick={clearPhoto}>
                Remove photo
              </button>
            </div>
          </div>
          <div className="field">
            <label htmlFor="prof-name">Full name</label>
            <input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="prof-dept">Department</label>
            <input id="prof-dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE" />
          </div>
          {role === "student" ? (
            <div className="field">
              <label htmlFor="prof-sem">Semester</label>
              <input id="prof-sem" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. 5" />
            </div>
          ) : null}
          <div className="modal-panel__actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
