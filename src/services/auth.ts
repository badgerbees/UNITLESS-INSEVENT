import { getSupabaseClient } from "../lib/supabase";

export type AuthMode = "mother" | "companion";

export type AuthForm = {
  view: "login" | "register" | "forgot";
  mode: AuthMode;
  email: string;
  password: string;
  name: string;
};

export const auth = {
  async signIn(email: string, password: string) {
    return getSupabaseClient().auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, fullName: string, mode: AuthMode) {
    return getSupabaseClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: mode } },
    });
  },

  async resetPassword(email: string) {
    return getSupabaseClient().auth.resetPasswordForEmail(email);
  },

  async signOut() {
    return getSupabaseClient().auth.signOut();
  },
};
