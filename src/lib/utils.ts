import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the site URL for the current environment
 * Handles Vercel deployments and development environments
 */
export function getSiteUrl(): string {
  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // If we're in the browser, use the current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // For server-side rendering, try to detect Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost for development
  return "http://localhost:3000";
}
