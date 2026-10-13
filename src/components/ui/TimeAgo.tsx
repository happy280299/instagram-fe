import { timeAgoLong, timeAgoShort } from "@/lib/format";

interface TimeAgoProps {
  date: string;
  variant?: "short" | "long";
  className?: string;
}

/** Relative time; suppresses the expected server/client clock drift. */
export function TimeAgo({ date, variant = "short", className }: TimeAgoProps) {
  const label = variant === "short" ? timeAgoShort(date) : timeAgoLong(date);
  return (
    <time dateTime={date} title={new Date(date).toUTCString()} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
