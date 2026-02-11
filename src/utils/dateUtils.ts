/**
 * Parse a "yyyy-MM-dd" date string without timezone shift.
 * new Date("2025-01-15") creates UTC midnight which shows as previous day in negative UTC offsets.
 * This function creates a local date instead.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
