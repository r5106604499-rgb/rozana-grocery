import type { Paise, Timestamp } from "@/types/app";

/**
 * Format a paise amount as an Indian rupee string, e.g. 89900n -> "₹899".
 * Paise are the backend's smallest unit (1 rupee = 100 paise).
 */
export function formatPaise(amount: Paise | bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  const rupees = value / 100;
  const hasFraction = Math.round(rupees * 100) % 100 !== 0;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a paise amount without the currency symbol. */
export function formatRupees(amount: Paise | bigint | number): string {
  return formatPaise(amount).replace("₹", "");
}

/**
 * Convert a backend nanosecond timestamp to a Date.
 * Returns null when the value cannot be represented.
 */
export function timestampToDate(timestamp: Timestamp | bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a short date, e.g. "12 Mar 2026". */
export function formatDate(timestamp: Timestamp | bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a backend timestamp as date + time, e.g. "12 Mar 2026, 4:30 pm". */
export function formatDateTime(timestamp: Timestamp | bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative time such as "2 hours ago", falling back to a date. */
export function formatRelative(timestamp: Timestamp | bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(timestamp);
}

/** Percentage saved between an original and discounted price. */
export function discountPercent(
  original: Paise | bigint,
  discounted: Paise | bigint,
): number {
  const originalValue = Number(original);
  if (originalValue <= 0) return 0;
  const saved = originalValue - Number(discounted);
  return Math.max(0, Math.round((saved / originalValue) * 100));
}

/** Absolute savings in paise between an original and discounted price. */
export function savingsPaise(
  original: Paise | bigint,
  discounted: Paise | bigint,
): bigint {
  const saved = BigInt(original) - BigInt(discounted);
  return saved > 0n ? saved : 0n;
}

/** Pluralise a count with a noun, e.g. "3 items". */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Convert a bigint count to a plain number for display logic. */
export function toNumber(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

/** Clamp a quantity into a safe positive integer range. */
export function clampQuantity(quantity: number, max = 99): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(Math.trunc(quantity), 1), max);
}

/** Initials for an avatar fallback. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
