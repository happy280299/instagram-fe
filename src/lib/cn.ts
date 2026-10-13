type ClassValue = string | false | null | undefined | 0;

/** Tiny className joiner (no dependency needed for our use-cases). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
