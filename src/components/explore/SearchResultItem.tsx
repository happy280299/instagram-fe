import { X } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { UserSummary } from "@/types";

interface SearchResultItemProps {
  user: UserSummary;
  onSelect: (user: UserSummary) => void;
  onRemove?: (user: UserSummary) => void;
  /** Defaults to the full name. */
  subtitle?: string;
}

export function SearchResultItem({ user, onSelect, onRemove, subtitle = user.fullName }: SearchResultItemProps) {
  return (
    <li className="hover:bg-hover flex items-center">
      <Link href={`/${user.username}`} onClick={() => onSelect(user)} className="flex min-w-0 flex-1 items-center gap-3 px-6 py-2">
        <Avatar src={user.avatar} username={user.username} size="md" />
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-sm font-semibold">
            <span className="truncate">{user.username}</span>
            {user.isVerified && <VerifiedBadge />}
          </span>
          <span className="text-muted block truncate text-sm">{subtitle}</span>
        </span>
      </Link>
      {onRemove && (
        <button type="button" onClick={() => onRemove(user)} aria-label={`Remove ${user.username} from recent`} className="text-muted mr-4 p-2 hover:opacity-60">
          <X aria-hidden className="size-4" />
        </button>
      )}
    </li>
  );
}
