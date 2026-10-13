const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** Instagram-style short relative time: "now", "5m", "3h", "2d", "4w". */
export function timeAgoShort(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - Date.parse(iso));
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d`;
  return `${Math.floor(diff / WEEK)}w`;
}

/** Long relative time used under post details: "5 minutes ago", "2 days ago". */
export function timeAgoLong(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - Date.parse(iso));
  const units: [number, string][] = [[WEEK, "week"], [DAY, "day"], [HOUR, "hour"], [MINUTE, "minute"]];
  for (const [ms, label] of units) {
    if (diff >= ms) {
      const n = Math.floor(diff / ms);
      return `${n} ${label}${n === 1 ? "" : "s"} ago`;
    }
  }
  return "Just now";
}

const compactFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const fullFormatter = new Intl.NumberFormat("en-US");

export function compactNumber(n: number): string {
  return n < 10_000 ? fullFormatter.format(n) : compactFormatter.format(n);
}

export function fullNumber(n: number): string {
  return fullFormatter.format(n);
}

export function pluralize(n: number, word: string): string {
  return `${fullNumber(n)} ${word}${n === 1 ? "" : "s"}`;
}
