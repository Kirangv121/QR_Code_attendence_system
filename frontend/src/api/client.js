import axios from "axios";

function normalizeApiBaseURL(envUrl) {
  const fallback = "http://localhost:5000";
  let u = typeof envUrl === "string" && envUrl.trim() ? envUrl.trim() : fallback;
  u = u.replace(/\/+$/, "");
  if (!/\/api$/i.test(u)) {
    u = `${u}/api`;
  }
  return u;
}

/**
 * Production (Vercel): set VITE_RELATIVE_API=true so requests go to /api on the same domain.
 * Local dev: uses VITE_API_URL or http://localhost:5000/api
 */
function resolveApiBaseURL() {
  if (import.meta.env.VITE_RELATIVE_API === "true") {
    return "/api";
  }
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    return "/api";
  }
  return normalizeApiBaseURL(import.meta.env.VITE_API_URL);
}

const baseURL = resolveApiBaseURL();

export const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function loadStoredToken() {
  return null;
}
