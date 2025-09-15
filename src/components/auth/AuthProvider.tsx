"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, me, type User } from "@/lib/apiSpa";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hent innlogget bruker ved mount (dersom sesjonscookie finnes)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const u = await me();
        if (active) setUser(u);
      } catch {
        // ikke innlogget er ok
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      await apiLogin(email, password);
      const u = await me();
      setUser(u);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const u = await me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}