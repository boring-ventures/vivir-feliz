import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/utils";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   * @param email User's email
   * @param hashedPassword Password that has been hashed client-side
   */
  const signIn = async (email: string, hashedPassword: string) => {
    // The password has already been hashed client-side
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: hashedPassword,
    });

    if (error) throw error;

    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
      await supabase.auth.setSession(data.session);
      return data.session;
    }
  };

  /**
   * Sign up with email and password
   * @param email User's email
   * @param hashedPassword Password that has been hashed client-side
   */
  const signUp = async (email: string, hashedPassword: string) => {
    try {
      // Get the site URL from the environment or current location
      const siteUrl = getSiteUrl();

      // The password has already been hashed client-side
      const { data, error } = await supabase.auth.signUp({
        email,
        password: hashedPassword,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            email_confirmed: false,
          },
        },
      });

      if (error) {
        throw error;
      }

      // For email confirmation, we won't get a session immediately
      // The user needs to verify their email first
      // Note: Profile creation is handled in the auth/callback route

      return {
        success: true,
        user: data.user,
        session: data.session,
        confirmEmail: true,
        error: null,
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        user: null,
        session: null,
        confirmEmail: false,
        error,
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    router.push("/");
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
