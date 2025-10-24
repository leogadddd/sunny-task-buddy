import { toast } from "sonner";

/**
 * utils/formatDate.ts
 *
 * Utility to format a date string/Date/number into various formats:
 * - "MM-DD-YYYY" (default) or other common patterns
 * - relative human friendly strings like "5 minutes ago", "yesterday"
 *
 * Uses Intl.RelativeTimeFormat when available for locale-aware relative strings.
 * On invalid input or unexpected errors, it notifies via sonner and returns an empty string.
 */

export type FormatOption =
  | "MM-DD-YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "short" // e.g. "Oct 20, 2025"
  | "long" // e.g. "October 20, 2025"
  | "relative";

export interface FormatDateOptions {
  format?: FormatOption;
  locale?: string; // defaults to browser locale
  includeTime?: boolean; // append "HH:MM" to formatted date when not relative
  // Allow callers to use `relative` boolean shorthand
  relative?: boolean;
}

/** Pad a number to 2 digits */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Build a formatted date string according to simple patterns */
function buildFormattedDate(
  d: Date,
  format: FormatOption,
  includeTime: boolean,
  locale?: string
) {
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hours = pad2(d.getHours());
  const minutes = pad2(d.getMinutes());

  let base: string;
  switch (format) {
    case "MM-DD-YYYY":
      base = `${month}-${day}-${year}`;
      break;
    case "MM/DD/YYYY":
      base = `${month}/${day}/${year}`;
      break;
    case "YYYY-MM-DD":
      base = `${year}-${month}-${day}`;
      break;
    case "short":
      base = d.toLocaleDateString(locale ?? undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      break;
    case "long":
      base = d.toLocaleDateString(locale ?? undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      break;
    default:
      base = `${month}-${day}-${year}`;
  }

  if (includeTime) {
    return `${base} ${hours}:${minutes}`;
  }
  return base;
}

/** Create a human-friendly relative time string (fallback if Intl.RelativeTimeFormat not desired) */
function humanizeRelative(diffMs: number, locale?: string) {
  const rtfAvailable =
    typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl;
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  // When Date is in the future, we use positive value (in X days) otherwise negative (X ago)
  const isPast = diffMs < 0 ? false : true; // diffMs = now - date; positive => past
  const sign = isPast ? -1 : 1;

  if (rtfAvailable) {
    const rtf = new Intl.RelativeTimeFormat(locale ?? undefined, {
      numeric: "auto",
    });
    // thresholds chosen to match common UX patterns
    if (Math.abs(seconds) < 45) return "just now";
    if (Math.abs(seconds) < 90) return rtf.format(sign * 1, "minute"); // "in 1 minute" or "1 minute ago"
    if (Math.abs(minutes) < 45) return rtf.format(sign * minutes, "minute");
    if (Math.abs(minutes) < 90) return rtf.format(sign * 1, "hour");
    if (Math.abs(hours) < 24) return rtf.format(sign * hours, "hour");
    if (Math.abs(hours) < 48) return isPast ? "yesterday" : "tomorrow";
    if (Math.abs(days) < 30) return rtf.format(sign * days, "day");
    if (Math.abs(days) < 45) return rtf.format(sign * 1, "month");
    if (Math.abs(days) < 365) return rtf.format(sign * months, "month");
    return rtf.format(sign * years, "year");
  }

  // Fallback human readable
  if (Math.abs(seconds) < 45) return "just now";
  if (Math.abs(seconds) < 90) return isPast ? "a minute ago" : "in a minute";
  if (Math.abs(minutes) < 45)
    return isPast ? `${minutes} minutes ago` : `in ${minutes} minutes`;
  if (Math.abs(minutes) < 90) return isPast ? "an hour ago" : "in an hour";
  if (Math.abs(hours) < 24)
    return isPast ? `${hours} hours ago` : `in ${hours} hours`;
  if (Math.abs(hours) < 48) return isPast ? "yesterday" : "tomorrow";
  if (Math.abs(days) < 30)
    return isPast ? `${days} days ago` : `in ${days} days`;
  if (Math.abs(days) < 45) return isPast ? "a month ago" : "in a month";
  if (Math.abs(days) < 365)
    return isPast ? `${months} months ago` : `in ${months} months`;
  return isPast ? `${years} years ago` : `in ${years} years`;
}

/**
 * Format a date input.
 *
 * - input: string | number | Date (e.g. "2025-10-20T04:02:18.365Z")
 * - options.format: 'MM-DD-YYYY' | 'relative' | 'short' | 'long' ...
 * - options.relative: shorthand to request relative format (overrides format)
 *
 * Returns formatted string or '' on error (and shows an error toast via sonner).
 */
export default function formatDate(
  input: string | number | Date,
  options: FormatDateOptions = {}
): string {
  const {
    format = "MM-DD-YYYY",
    locale,
    includeTime = false,
    relative = false,
  } = options;

  try {
    const date =
      input instanceof Date ? input : new Date(input as string | number);

    if (!date || Number.isNaN(date.getTime())) {
      toast.error("Invalid date provided");
      return "";
    }

    // If caller asked for relative explicitly
    if (relative || format === "relative") {
      const now = Date.now();
      const diffMs = now - date.getTime(); // positive => past
      return humanizeRelative(diffMs, locale);
    }

    return buildFormattedDate(
      date,
      format as FormatOption,
      includeTime,
      locale
    );
  } catch (err) {
    // Notify and return empty string so callers can handle gracefully
    toast.error("Error formatting date");
    // keep console info for debugging purposes
    // eslint-disable-next-line no-console
    console.error("formatDate error:", err);
    return "";
  }
}

// also allow named export
export { formatDate };
