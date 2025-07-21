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

export function calculateAgeFromBirthDate(birthDate: string): {
  years: number;
  months: number;
} {
  if (!birthDate) {
    return { years: 0, months: 0 };
  }

  const today = new Date();
  const birth = new Date(birthDate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  // Adjust for day of month
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  return { years, months };
}

/**
 * Calculate total age in months from birthdate to today
 * This calculates the complete months that have passed since birth
 */
export function calculateTotalAgeInMonths(birthDate: string): number {
  if (!birthDate) {
    return 0;
  }

  const today = new Date();

  // Handle different date formats
  let birth: Date;
  if (birthDate.includes("/")) {
    // Handle DD/MM/YYYY format
    const [day, month, year] = birthDate.split("/").map(Number);
    birth = new Date(year, month - 1, day); // month is 0-indexed
  } else {
    // Handle YYYY-MM-DD format - create date in local timezone
    const [year, month, day] = birthDate.split("-").map(Number);
    birth = new Date(year, month - 1, day); // month is 0-indexed
  }

  // Ensure the date is valid
  if (isNaN(birth.getTime())) {
    console.error("Invalid birth date:", birthDate);
    return 0;
  }

  // Calculate total months difference using a more precise method
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth();

  // Calculate total months
  let totalMonths = (todayYear - birthYear) * 12 + (todayMonth - birthMonth);

  // Adjust for day of month - if today's day is before birth day, subtract one month
  if (today.getDate() < birth.getDate()) {
    totalMonths--;
  }

  // Ensure we don't return negative values
  totalMonths = Math.max(0, totalMonths);

  // Debug logging
  console.log("Birth date:", birthDate, "Parsed as:", birth.toISOString());
  console.log("Today:", today.toISOString());
  console.log(
    "Birth year/month:",
    birthYear,
    birthMonth,
    "Today year/month:",
    todayYear,
    todayMonth,
    "Total months:",
    totalMonths
  );

  return totalMonths;
}
