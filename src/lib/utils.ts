import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes the first letter of each word in a string
 * Handles multiple spaces, hyphens, and special characters
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;

  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      // Handle hyphenated words (e.g., "maria-jose" -> "Maria-Jose")
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");
      }
      // Handle regular words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Capitalizes names specifically, handling common name patterns
 */
export function capitalizeName(name: string): string {
  if (!name) return name;

  // Handle common prefixes and suffixes
  const prefixes = [
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "van",
    "von",
    "di",
    "da",
    "du",
    "del",
    "della",
    "delle",
    "dello",
    "degli",
    "dei",
    "della",
    "delle",
    "dello",
    "degli",
    "dei",
  ];

  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      // Don't capitalize prefixes unless it's the first word
      if (index > 0 && prefixes.includes(word)) {
        return word;
      }

      // Handle hyphenated names
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Capitalizes addresses, handling street names, cities, etc.
 */
export function capitalizeAddress(address: string): string {
  if (!address) return address;

  // Common address words that should remain lowercase
  const lowercaseWords = [
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "y",
    "con",
    "sin",
    "por",
    "para",
    "entre",
    "cerca",
    "lejos",
    "calle",
    "avenida",
    "plaza",
    "paseo",
    "carrera",
    "transversal",
    "diagonal",
  ];

  return address
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      // Always capitalize the first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Don't capitalize common address words
      if (lowercaseWords.includes(word)) {
        return word;
      }

      // Handle numbers (keep as is)
      if (/^\d+$/.test(word)) {
        return word;
      }

      // Handle hyphenated words
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-");
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
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
