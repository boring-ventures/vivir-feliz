import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to get correct dashboard path for role
function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "THERAPIST":
      return "/therapist/dashboard";
    case "PARENT":
    default:
      return "/parent/dashboard";
  }
}

// Helper function to check if path matches user's role
function isCorrectRoleForPath(role: string, pathname: string): boolean {
  // Allow access to general dashboard routes
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile")
  ) {
    return true;
  }

  // Check role-specific paths
  if (role === "ADMIN" && pathname.startsWith("/admin/")) {
    return true;
  }

  if (role === "THERAPIST" && pathname.startsWith("/therapist/")) {
    return true;
  }

  if (role === "PARENT" && pathname.startsWith("/parent/")) {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Skip auth check for the auth callback route
  if (req.nextUrl.pathname.startsWith("/auth/callback")) {
    return res;
  }

  // If there's no session and the user is trying to access a protected route
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session and the user is trying to access auth routes
  if (session && (req.nextUrl.pathname.startsWith("/sign-in") || false)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session and the user is on the root page, redirect to dashboard
  if (session && req.nextUrl.pathname === "/") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control for dashboard routes
  if (session && req.nextUrl.pathname.startsWith("/dashboard")) {
    try {
      // Make an internal API call to get user role
      const protocol = req.nextUrl.protocol;
      const host = req.nextUrl.host;
      const apiUrl = `${protocol}//${host}/api/profile`;

      const response = await fetch(apiUrl, {
        headers: {
          Cookie: req.headers.get("cookie") || "",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userRole = data.role;

        if (userRole && !isCorrectRoleForPath(userRole, req.nextUrl.pathname)) {
          // User is trying to access a page for a different role
          const correctDashboardPath = getRoleDashboardPath(userRole);
          const redirectUrl = req.nextUrl.clone();
          redirectUrl.pathname = correctDashboardPath;
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch (error) {
      console.error("Error checking user role in middleware:", error);
      // Continue without role check if there's an error
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/auth/callback", "/"],
};
