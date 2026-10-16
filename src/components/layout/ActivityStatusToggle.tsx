"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { getErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";

/**
 * "Show activity status" switch (PATCH /api/auth/me). Like Instagram, off hides yours from people
 * you chat with and theirs from you. Optimistic; rolls back on failure.
 */
export function ActivityStatusToggle() {
  const me = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);
  if (!me) return null;
  // On by default on the backend; absent only until /auth/me has answered.
  const on = me.showActivityStatus ?? true;

  async function toggle() {
    const current = useAuthStore.getState().user;
    if (!current) return;
    const next = !on;
    setUser({ ...current, showActivityStatus: next });
    setSaving(true);
    try {
      const { data } = await authService.updateMe({ showActivityStatus: next });
      setUser(data);
    } catch (err) {
      setUser({ ...current, showActivityStatus: !next });
      toast(getErrorMessage(err, "Couldn't update activity status. Try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="min-w-0">
        <span id="activity-status-label" className="block text-sm">
          Show activity status
        </span>
        <span className="text-muted block text-xs">People you chat with see when you&apos;re active.</span>
      </span>
      <Switch checked={on} onChange={() => void toggle()} labelledBy="activity-status-label" disabled={saving} />
    </div>
  );
}
