"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { userService } from "@/services/user.service";
import { useUIStore } from "@/store/ui";
import type { UserSummary } from "@/types";
import { SearchResultItem } from "./SearchResultItem";

export function SearchPanel() {
  const close = useUIStore((s) => s.closePanel);
  const recent = useUIStore((s) => s.recentSearches);
  const addRecent = useUIStore((s) => s.addRecentSearch);
  const removeRecent = useUIStore((s) => s.removeRecentSearch);
  const clearRecent = useUIStore((s) => s.clearRecentSearches);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ q: string; users: UserSummary[] } | null>(null);
  const q = query.trim();

  // Debounced search; stale responses are ignored.
  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    const id = setTimeout(() => {
      userService.search(q)
        .then((users) => !cancelled && setResults({ q, users }))
        .catch(() => !cancelled && setResults({ q, users: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q]);

  const loading = q !== "" && results?.q !== q;

  return (
    <SlidePanel title="Search" onClose={close}>
      <div className="border-separator border-b px-4 pb-6">
        <label className="bg-hover flex items-center gap-2 rounded-lg px-4 py-2">
          <Search aria-hidden className="text-muted size-4" />
          <span className="sr-only">Search users</span>
          <input data-autofocus type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="placeholder:text-muted flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden" />
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
        {!loading && q && results && (
          results.users.length === 0 ? (
            <p className="text-muted py-16 text-center text-sm">No results found.</p>
          ) : (
            <ul>{results.users.map((u) => <SearchResultItem key={u.id} user={u} onSelect={addRecent} />)}</ul>
          )
        )}
      </div>
    </SlidePanel>
  );
}
