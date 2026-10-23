import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabase";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    configured: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    try {
      const supabase = getSupabaseClient();

      supabase.auth.getSession().then(({ data, error }) => {
        if (!active) return;
        setState({
          session: data.session,
          user: data.session?.user ?? null,
          loading: false,
          configured: true,
          error: error?.message ?? null,
        });
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setState((current) => ({ ...current, session, user: session?.user ?? null, loading: false }));
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error) {
      if (active) {
        setState((current) => ({
          ...current,
          loading: false,
          configured: false,
          error: error instanceof Error ? error.message : "Supabase is not configured",
        }));
      }
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}
