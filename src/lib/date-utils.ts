// Date utility functions for appointments

/**
 * Parse date string from DD/MM/YYYY format to Date object
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns Date object or current date if parsing fails
 */
export const parseAppointmentDate = (dateStr: string): Date => {
  try {
    const [day, month, year] = dateStr.split("/").map(Number);

    // Validate the parsed values
    if (
      !day ||
      !month ||
      !year ||
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > 2100
    ) {
      console.error("Invalid date format:", dateStr);
      return new Date(); // Return today as fallback
    }

    const date = new Date(year, month - 1, day);

    // Additional validation: check if the date is valid
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      console.error("Invalid date values:", dateStr);
      return new Date(); // Return today as fallback
    }

    return date;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return new Date(); // Return today as fallback
  }
};

/**
 * Format date to DD/MM/YYYY string
 * @param date - Date object
 * @returns Formatted date string
 */
export const formatAppointmentDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

/**
 * Check if a date is in the future (after today)
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

/**
 * Get the number of days in a month
 * @param date - Date object
 * @returns Number of days in the month
 */
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
 * @param date - Date object
 * @returns Day of week for first day of month
 */
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * Format month and year for display
 * @param date - Date object
 * @returns Formatted month and year string
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
};

/**
 * Format full date for display in Spanish
 * @param date - Date object
 * @returns Formatted date string
 */
export const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
