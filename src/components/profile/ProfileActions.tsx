"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { User } from "@/types";
import { EditProfileModal } from "./EditProfileModal";
import { FollowButton } from "@/components/user/FollowButton";

export function ProfileActions({ user }: { user: User }) {
  const hydrated = useHydrated();
  const me = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  if (!hydrated) return <div className="h-8 w-48" aria-hidden />;

  if (me?.id === user.id) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          Edit profile
        </Button>
        <Button size="sm" variant="secondary" onClick={() => toast("Archive isn't available in this demo")}>
          View archive
        </Button>
        <EditProfileModal user={me} open={editing} onClose={() => setEditing(false)} />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <FollowButton user={user} />
      <Link href="/direct" className="bg-hover hover:bg-separator inline-flex h-8 items-center rounded-lg px-4 text-sm font-semibold">
        Message
      </Link>
    </div>
  );
}
