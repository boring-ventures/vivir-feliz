import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  // Redirect to role-specific dashboard
  if (profile?.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (profile?.role === "THERAPIST") {
    redirect("/therapist/dashboard");
  } else {
    // Default to parent dashboard for PARENT role or fallback
    redirect("/parent/dashboard");
  }
}
