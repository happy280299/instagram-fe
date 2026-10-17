"use client";

import { Hash, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { compactNumber } from "@/lib/format";
import { SEARCH_MAX_LENGTH, type SearchUser } from "@/services/user.service";
import { useUIStore } from "@/store/ui";
import { hashtagHref } from "@/lib/parse-caption";
import { SearchResultItem } from "./SearchResultItem";
import { useHashtagSearch } from "./useHashtagSearch";
import { useUserSearch } from "./useUserSearch";

/** Like Instagram: who you follow, otherwise how many followers. */
function resultSubtitle(user: SearchUser): string {
  if (user.isFollowing) return `${user.fullName} • Following`;
  if (user.followerCount > 0) return `${user.fullName} • ${compactNumber(user.followerCount)} followers`;
  return user.fullName;
}

export function SearchPanel() {
  const close = useUIStore((s) => s.closePanel);
  const recent = useUIStore((s) => s.recentSearches);
  const addRecent = useUIStore((s) => s.addRecentSearch);
  const removeRecent = useUIStore((s) => s.removeRecentSearch);
  const clearRecent = useUIStore((s) => s.clearRecentSearches);
  const [query, setQuery] = useState("");
  // "#…" searches hashtags instead of people, like Instagram's search.
  const hashtagMode = query.trim().startsWith("#");
  const people = useUserSearch(hashtagMode ? "" : query);
  const tagSearch = useHashtagSearch(hashtagMode ? query : "");
  const { q, loading, error, retry } = hashtagMode ? tagSearch : people;
  const { users } = people;
  const { tags } = tagSearch;

  return (
    <SlidePanel title="Search" onClose={close}>
      <div className="border-separator border-b px-4 pb-6">
        <label className="bg-hover flex items-center gap-2 rounded-lg px-4 py-2">
          <Search aria-hidden className="text-muted size-4" />
          <span className="sr-only">Search people or #hashtags</span>
          <input data-autofocus type="search" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={SEARCH_MAX_LENGTH + 1} placeholder="Search" className="placeholder:text-muted flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="bg-muted text-background rounded-full p-0.5">
              <X aria-hidden className="size-3" />
            </button>
          )}
        </label>
      </div>
      <div className="flex-1 overflow-y-auto py-3" aria-live="polite" aria-busy={loading}>
        {!q && (
          <>
            <div className="flex items-center justify-between px-6 pb-2">
              <h3 className="font-semibold">Recent</h3>
              {recent.length > 0 && (
                <button type="button" onClick={clearRecent} className="text-primary hover:text-foreground text-sm font-semibold">
                  Clear all
                </button>
              )}
            </div>
            {recent.length === 0 ? (
              <p className="text-muted py-16 text-center text-sm font-semibold">No recent searches.</p>
            ) : (
              <ul>{recent.map((u) => <SearchResultItem key={u.id} user={u} onSelect={addRecent} onRemove={(r) => removeRecent(r.id)} />)}</ul>
            )}
          </>
        )}
        {loading &&
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-2" aria-hidden>
              <Skeleton rounded="full" className="size-avatar-md" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-muted text-sm">{error}</p>
            <Button size="sm" variant="secondary" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
        {tags &&
          (tags.length === 0 ? (
            <p className="text-muted py-16 text-center text-sm">No hashtags found.</p>
          ) : (
            <ul>
              {tags.map((t) => (
                <li key={t.name}>
                  <Link href={hashtagHref(t.name)} onClick={close} className="hover:bg-hover flex items-center gap-3 px-6 py-2">
                    <span className="border-separator flex size-avatar-md shrink-0 items-center justify-center rounded-full border">
                      <Hash aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">#{t.name}</span>
                      <span className="text-muted block text-sm">
                        {compactNumber(t.postCount)} {t.postCount === 1 ? "post" : "posts"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        {users &&
          (users.length === 0 ? (
            <p className="text-muted py-16 text-center text-sm">No results found.</p>
          ) : (
            <ul>
              {users.map((u) => (
                <SearchResultItem key={u.id} user={u} subtitle={resultSubtitle(u)} onSelect={addRecent} />
              ))}
            </ul>
          ))}
      </div>
    </SlidePanel>
  );
}
