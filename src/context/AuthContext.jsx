import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { auth } from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const SESSION_TOKEN_KEY = "session_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
  });
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/user");
      const data = res.data?.user ?? res.data;
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }
    fetchUser().finally(() => setInitializing(false));
  }, [token, fetchUser]);

  const isAuthenticated = !!token;
  const role = user?.role ?? null;
  const isAdmin = role === "admin";
  const isStudent = role === "student";

  const setStoredToken = useCallback((nextToken, { remember } = { remember: true }) => {
    if (!nextToken) {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      setToken(null);
      setUser(null);
      return;
    }
    if (remember) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } else {
      sessionStorage.setItem(SESSION_TOKEN_KEY, nextToken);
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(nextToken);
  }, []);

  const loginAsStudent = useCallback(async ({ email, password, remember }) => {
    const res = await auth.studentLogin({ email, password });
    const nextToken = res?.data?.token;
    if (!nextToken) {
      const err = new Error("Login succeeded but token missing.");
      err.code = "TOKEN_MISSING";
      throw err;
    }
    setStoredToken(nextToken, { remember: remember ?? true });
    setUser(res?.data?.user ?? res?.data?.user ?? null);
    return res;
  }, [setStoredToken]);

  const loginAsAdmin = useCallback(async ({ email, password, remember }) => {
    const res = await auth.adminLogin({ email, password });
    const nextToken = res?.data?.token;
    if (!nextToken) {
      const err = new Error("Login succeeded but token missing.");
      err.code = "TOKEN_MISSING";
      throw err;
    }
    setStoredToken(nextToken, { remember: remember ?? true });
    setUser(res?.data?.user ?? res?.data?.user ?? null);
    return res;
  }, [setStoredToken]);

  const register = useCallback(async (payload) => {
    const res = await auth.studentRegister(payload);
    const nextToken = res?.data?.token;
    if (nextToken) setStoredToken(nextToken, { remember: true });
    return res;
  }, [setStoredToken]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      // If backend logout fails (token expired, etc), still clear locally.
    } finally {
      setStoredToken(null);
    }
  }, [setStoredToken]);

  const value = useMemo(
    () => ({
      api,
      token,
      user,
      role,
      isAdmin,
      isStudent,
      initializing,
      isAuthenticated,
      loginAsStudent,
      loginAsAdmin,
      register,
      logout,
      fetchUser,
    }),
    [token, user, role, isAdmin, isStudent, initializing, isAuthenticated, loginAsStudent, loginAsAdmin, register, logout, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

