"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { User } from "@/types";
import { EditProfileModal } from "./EditProfileModal";
import { FollowButton } from "@/components/user/FollowButton";
import { MessageButton } from "@/components/user/MessageButton";

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
      <MessageButton username={user.username} />
    </div>
  );
}
