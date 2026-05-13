import axios from "axios";

/**
 * Backend mounts routes under `/api` (see server.js).
 * If env is set to `http://localhost:5000` without `/api`, requests would 404.
 */
function normalizeApiBaseURL(envUrl) {
  const fallback = "http://localhost:5000";
  let u = typeof envUrl === "string" && envUrl.trim() ? envUrl.trim() : fallback;
  u = u.replace(/\/+$/, "");
  if (!/\/api$/i.test(u)) {
    u = `${u}/api`;
  }
  return u;
}

const baseURL = normalizeApiBaseURL(import.meta.env.VITE_API_URL);

export const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

/** Session token is kept in memory only (no localStorage). */
export function loadStoredToken() {
  return null;
}
