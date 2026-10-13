"use client";

import { Check, Link2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { userService } from "@/services/user.service";
import { cn } from "@/lib/cn";
import { toast, useUIStore } from "@/store/ui";
import type { UserSummary } from "@/types";
import { copyToClipboard } from "@/components/post/PostMenu";

export function ShareModal() {
  const target = useUIStore((s) => s.shareTarget);
  const close = useUIStore((s) => s.closeShare);
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    userService.list(30)
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  if (!target) return null;
  const q = query.trim().toLowerCase();
  const visible = (users ?? []).filter((u) => !q || u.username.includes(q) || u.fullName.toLowerCase().includes(q));
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Modal open onClose={close} title={target.title} className="h-[min(80dvh,600px)] md:max-w-[548px]!">
      <label className="border-separator flex items-center gap-3 border-b px-4 py-2">
        <Search aria-hidden className="text-muted size-4" />
        <span className="sr-only">Search people</span>
        <input data-autofocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="placeholder:text-muted flex-1 bg-transparent py-1 text-sm outline-none" />
      </label>
      <ul className="flex-1 overflow-y-auto py-2" aria-label="Recipients" aria-busy={users === null}>
        {users === null &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2" aria-hidden>
              <Skeleton rounded="full" className="size-avatar-md" />
              <Skeleton className="h-3 w-40" />
            </li>
          ))}
        {users !== null && visible.length === 0 && <li className="text-muted px-4 py-6 text-center text-sm">No account found.</li>}
        {visible.map((u) => {
          const on = selected.includes(u.id);
          return (
            <li key={u.id}>
              <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(u.id)} className="hover:bg-hover flex w-full items-center gap-3 px-4 py-2 text-left">
                <Avatar src={u.avatar} username={u.username} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.fullName}</span>
                  <span className="text-muted block truncate text-sm">{u.username}</span>
                </span>
                <span className={cn("flex size-6 items-center justify-center rounded-full border-2", on ? "border-primary bg-primary text-on-media" : "border-separator")}>
                  {on && <Check aria-hidden className="size-4" strokeWidth={3} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-separator flex flex-col gap-2 border-t p-4">
        <Button variant="secondary" fullWidth onClick={() => void copyToClipboard(target.path)}>
          <Link2 aria-hidden className="size-4" /> Copy link
        </Button>
        <Button
          fullWidth
          disabled={selected.length === 0}
          onClick={() => {
            toast(`Sent to ${selected.length} ${selected.length === 1 ? "person" : "people"}`);
            close();
          }}
        >
          Send{selected.length > 1 ? " separately" : ""}
        </Button>
      </div>
    </Modal>
  );
}
