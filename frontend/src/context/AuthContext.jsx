import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const r = await api.get("/auth/me");
    setUser(r.data.user);
  }, []);

  useEffect(() => {
    const auth = api.defaults.headers.common.Authorization;
    if (!auth) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, role) => {
    const { data } = await api.post("/auth/login", { email, password, role });
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, register, refreshUser }),
    [user, loading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
