import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type Role = "citizen" | "admin";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ward: string | null;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadContext(userId: string | undefined) {
    if (!userId) {
      setProfile(null);
      setRole(null);
      return;
    }
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, name, email, phone, ward").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((prof as Profile | null) ?? null);
    const list = (roles ?? []).map((r) => r.role as Role);
    setRole(list.includes("admin") ? "admin" : list.length ? "citizen" : null);
  }

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      void loadContext(next?.user?.id);
    });
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadContext(data.session?.user?.id);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthValue = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    role,
    isAdmin: role === "admin",
    refresh: () => loadContext(session?.user?.id),
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setRole(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}