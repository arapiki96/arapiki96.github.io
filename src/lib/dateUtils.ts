/**
 * Formats a date for display in the NZ locale
 * @param date - Date to format (Date object or string)
 * @returns Formatted date string (e.g., "15 Jan 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dateObj.valueOf())) {
    return typeof date === 'string' ? date : '';
  }

  return new Intl.DateTimeFormat("en-NZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Formats a date and time for display in the NZ locale
 * @param date - Date to format (Date object or string)
 * @returns Formatted date and time string (e.g., "15 Jan 2024, 14:30")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dateObj.valueOf())) {
    return typeof date === 'string' ? date : '';
  }

  return new Intl.DateTimeFormat("en-NZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Converts a value to ISO string format for datetime attributes
 * @param value - Value to convert (Date object, string, or number)
 * @returns ISO string or undefined if invalid
 */
export function toIsoString(value: Date | string | number | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}
