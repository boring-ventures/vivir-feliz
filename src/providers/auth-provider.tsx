"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User, Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/profile";
import { getSiteUrl } from "@/lib/utils";
import { authClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    user: User | null;
    session: Session | null;
    confirmEmail: boolean;
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => ({
    success: false,
    user: null,
    session: null,
    confirmEmail: false,
    error: null,
  }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch profile function
  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  // Helper function to check if current path should not auto-redirect
  const shouldNotAutoRedirect = (pathname: string) => {
    const noRedirectPaths = [
      "/reset-password",
      "/forgot-password",
      "/verify-email",
      "/magic-link",
      "/sign-in",
      "/sign-up",
    ];
    return noRedirectPaths.some((path) => pathname.startsWith(path));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);

      // Handle different auth events
      if (event === "SIGNED_OUT") {
        router.push("/sign-in");
      } else if (event === "SIGNED_IN" && session) {
        // Only redirect to dashboard if we're not on auth pages or already on dashboard
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;

          // Don't redirect if user is on auth pages (like reset-password)
          if (
            !currentPath.startsWith("/dashboard") &&
            !shouldNotAutoRedirect(currentPath) &&
            currentPath === "/" // Only redirect from home page, let middleware handle dashboard routing
          ) {
            router.push("/dashboard");
          }
        }
      }
      // Remove TOKEN_REFRESHED redirect to prevent conflicts with middleware
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    router.push("/dashboard");
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Get the site URL from the environment or current location
      const siteUrl = getSiteUrl();

      // Use the clean auth client without middleware
      const { data, error } = await authClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            email_confirmed: false,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return {
          success: false,
          user: null,
          session: null,
          confirmEmail: false,
          error,
        };
      }

      console.log("Sign up successful:", data);
      return {
        success: true,
        user: data.user,
        session: data.session,
        confirmEmail: !data.session, // If no session, email confirmation is required
        error: null,
      };
    } catch (error) {
      console.error("Sign up exception:", error);
      return {
        success: false,
        user: null,
        session: null,
        confirmEmail: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    router.push("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
