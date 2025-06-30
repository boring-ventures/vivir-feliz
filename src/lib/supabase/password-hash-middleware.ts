import { SupabaseClient } from "@supabase/supabase-js";

/**
 * This middleware extension allows the Supabase client to work with
 * client-side hashed passwords by modifying the auth calls.
 *
 * By applying this middleware, the server will understand that passwords
 * are already hashed and will handle them accordingly.
 */
export const applyPasswordHashMiddleware = (supabase: SupabaseClient) => {
  // Create a wrapper for the original fetch function
  const originalFetch = globalThis.fetch;

  // Override the global fetch to intercept Supabase auth requests
  globalThis.fetch = async (input, init) => {
    // Only modify Supabase auth endpoints for password-related operations
    const url = input instanceof Request ? input.url : input.toString();
    const isSupabaseAuthEndpoint =
      url.includes("/auth/v1") &&
      (url.includes("/token") || url.includes("/user"));

    // Exclude signup from password hashing to avoid interfering with email verification
    const isSignupEndpoint = url.includes("/signup");

    // Check if this is a password-related operation
    const body = init?.body ? JSON.parse(init.body.toString()) : null;
    const hasPassword = body && "password" in body;

    // Only add the header for non-signup operations to avoid interfering with email verification
    if (isSupabaseAuthEndpoint && hasPassword && !isSignupEndpoint) {
      // Add the custom header to indicate password is pre-hashed
      init = {
        ...init,
        headers: {
          ...(init?.headers || {}),
          "x-password-hashed": "true",
        },
      };
    }

    // Call the original fetch with potentially modified headers
    return originalFetch(input, init);
  };

  return supabase;
};
