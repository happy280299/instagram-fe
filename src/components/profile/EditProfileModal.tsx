"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { UpdateProfileBody, User } from "@/types";

const LIMITS = { name: 50, username: 30, bio: 150 };
const USERNAME_RE = /^[a-z0-9._]+$/;
const URL_RE = /^https?:\/\/\S+$/;

interface Form {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

/** Same rules as PATCH /api/auth/me, so most mistakes never reach the server. */
function validate(form: Form): string | null {
  if (!form.name.trim()) return "Name can't be empty.";
  if (form.name.trim().length > LIMITS.name) return `Name must be at most ${LIMITS.name} characters.`;
  if (!USERNAME_RE.test(form.username)) return "Username can only use lowercase letters, numbers, periods and underscores.";
  if (form.username.length > LIMITS.username) return `Username must be at most ${LIMITS.username} characters.`;
  if (form.bio.length > LIMITS.bio) return `Bio must be at most ${LIMITS.bio} characters.`;
  if (form.avatarUrl && !URL_RE.test(form.avatarUrl)) return "Avatar URL must start with http:// or https://.";
  return null;
}

/** The user's avatar is a generated placeholder when the backend has none; don't prefill that. */
function initialForm(user: User): Form {
  const placeholder = user.avatar.startsWith("https://i.pravatar.cc/300?u=");
  return { name: user.fullName, username: user.username, bio: user.bio, avatarUrl: placeholder ? "" : user.avatar };
}

export function EditProfileModal({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Edit profile" className="md:max-w-md!">
      {open && <EditProfileForm user={user} onDone={onClose} />}
    </Modal>
  );
}

function EditProfileForm({ user, onDone }: { user: User; onDone: () => void }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [initial] = useState(() => initialForm(user));
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { ...form, name: form.name.trim(), bio: form.bio.trim(), avatarUrl: form.avatarUrl.trim() };
    const invalid = validate(next);
    if (invalid) return setError(invalid);

    const body: UpdateProfileBody = {};
    for (const key of Object.keys(next) as (keyof Form)[]) {
      if (next[key] !== initial[key]) body[key] = next[key];
    }
    if (Object.keys(body).length === 0) return onDone();

    setSaving(true);
    setError(null);
    try {
      const { data, message } = await authService.updateMe(body);
      setUser(data);
      toast(message ?? "Profile updated");
      onDone();
      if (body.username) router.replace(`/${data.username}`);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't update your profile. Try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 overflow-y-auto p-4">
      <div className="flex items-center gap-3">
        <Avatar src={URL_RE.test(form.avatarUrl.trim()) ? form.avatarUrl.trim() : user.avatar} username={form.username} size="lg" />
        <div className="min-w-0 text-sm">
          <p className="truncate font-semibold">{form.username || user.username}</p>
          <p className="text-muted truncate">{form.name || user.fullName}</p>
        </div>
      </div>
      <TextField label="Name" value={form.name} maxLength={LIMITS.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" />
      <TextField
        label="Username"
        value={form.username}
        maxLength={LIMITS.username}
        onChange={(e) => set("username")(e.target.value.toLowerCase())}
        autoCapitalize="none"
        autoComplete="username"
        spellCheck={false}
      />
      <TextField
        label="Avatar URL (leave empty to remove)"
        type="url"
        value={form.avatarUrl}
        onChange={(e) => set("avatarUrl")(e.target.value)}
        spellCheck={false}
      />
      <div className="bg-secondary border-separator focus-within:border-muted rounded-sm border">
        <label htmlFor="edit-bio" className="sr-only">
          Bio
        </label>
        <textarea
          id="edit-bio"
          value={form.bio}
          maxLength={LIMITS.bio}
          rows={3}
          placeholder="Bio"
          onChange={(e) => set("bio")(e.target.value)}
          className="placeholder:text-muted block w-full resize-none bg-transparent px-2 py-2 text-xs outline-none"
        />
        <p className="text-muted px-2 pb-1 text-right text-xs" aria-live="polite">
          {form.bio.length} / {LIMITS.bio}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-danger text-center text-sm whitespace-pre-line">
          {error}
        </p>
      )}
      <Button type="submit" loading={saving} fullWidth>
        Save
      </Button>
    </form>
  );
}
