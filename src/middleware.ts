import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to get correct dashboard path for role
function getRoleDashboardPath(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin/dashboard";
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
  if (role === "SUPER_ADMIN" && pathname.startsWith("/super-admin/")) {
    return true;
  }

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

// Helper function to check if a path is an auth flow that should not redirect authenticated users
function isAuthFlowPath(pathname: string): boolean {
  const authFlowPaths = [
    "/reset-password",
    "/forgot-password",
    "/verify-email",
    "/magic-link",
  ];
  return authFlowPaths.some((path) => pathname.startsWith(path));
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

  // If there's a session and the user is trying to access sign-in (but not other auth flows)
  if (
    session &&
    req.nextUrl.pathname.startsWith("/sign-in") &&
    !isAuthFlowPath(req.nextUrl.pathname)
  ) {
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

  // Role-based access control for dashboard routes (but not for /dashboard itself)
  if (
    session &&
    req.nextUrl.pathname.startsWith("/dashboard") &&
    req.nextUrl.pathname !== "/dashboard"
  ) {
    try {
      // Make an internal API call to get user role
      const protocol = req.nextUrl.protocol;
      const host = req.nextUrl.host;
      const apiUrl = `${protocol}//${host}/api/profile`;

      // Set a timeout for the API call to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(apiUrl, {
        headers: {
          Cookie: req.headers.get("cookie") || "",
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const userRole = data.role;

        if (userRole && !isCorrectRoleForPath(userRole, req.nextUrl.pathname)) {
          // User is trying to access a page for a different role
          console.log(
            `Middleware: Redirecting user with role ${userRole} from ${req.nextUrl.pathname} to correct dashboard`
          );
          const correctDashboardPath = getRoleDashboardPath(userRole);
          const redirectUrl = req.nextUrl.clone();
          redirectUrl.pathname = correctDashboardPath;
          return NextResponse.redirect(redirectUrl);
        }
      } else {
        console.log(
          `Middleware: Failed to fetch user profile, status: ${response.status}, continuing without role check`
        );
        // Continue without role check if API call fails
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log(
          "Middleware: API call timeout, continuing without role check"
        );
      } else {
        console.error("Error checking user role in middleware:", error);
      }
      // Continue without role check if there's an error
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/auth/callback", "/"],
};
