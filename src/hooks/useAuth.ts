import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string | null; preferred_persona: string | null } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("display_name, preferred_persona")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, profile, signOut };
}
