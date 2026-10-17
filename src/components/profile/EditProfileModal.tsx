"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/lib/api";
import { renderImage } from "@/lib/render-image";
import { authService } from "@/services/auth.service";
import { uploadService } from "@/services/upload.service";
import { ChangePasswordModal } from "@/components/user/ChangePasswordModal";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { UpdateProfileBody, User } from "@/types";
import { AVATAR_ASPECT } from "./AvatarCropper";
import { type AvatarChange, AvatarPicker } from "./AvatarPicker";

const LIMITS = { name: 50, username: 30, bio: 150 };
const USERNAME_RE = /^[a-z0-9._]+$/;
/** Square side of the uploaded avatar; the backend serves a 320px thumbnail, so 2x covers retina. */
const AVATAR_OUTPUT_PX = 640;

interface Form {
  name: string;
  username: string;
  bio: string;
}

/** Same rules as PATCH /api/auth/me, so most mistakes never reach the server. */
function validate(form: Form): string | null {
  if (!form.name.trim()) return "Name can't be empty.";
  if (form.name.trim().length > LIMITS.name) return `Name must be at most ${LIMITS.name} characters.`;
  if (!USERNAME_RE.test(form.username)) return "Username can only use lowercase letters, numbers, periods and underscores.";
  if (form.username.length > LIMITS.username) return `Username must be at most ${LIMITS.username} characters.`;
  if (form.bio.length > LIMITS.bio) return `Bio must be at most ${LIMITS.bio} characters.`;
  return null;
}

function initialForm(user: User): Form {
  return { name: user.fullName, username: user.username, bio: user.bio };
}

/** The avatarUrl to send: a fresh upload's URL, "" to remove it, or nothing to keep it. */
async function avatarUrlFor(change: AvatarChange): Promise<string | undefined> {
  if (change.kind === "remove") return "";
  if (change.kind === "new") {
    const { blob } = await renderImage({ ...change, aspect: AVATAR_ASPECT, filter: "none", outputWidth: AVATAR_OUTPUT_PX });
    return (await uploadService.media(blob, "avatar.jpg")).url;
  }
  return undefined;
}

export function EditProfileModal({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  const [changingPassword, setChangingPassword] = useState(false);
  return (
    <>
      <Modal open={open} onClose={onClose} title="Edit profile" className="md:max-w-md!">
        {open && <EditProfileForm user={user} onDone={onClose} onChangePassword={() => setChangingPassword(true)} />}
      </Modal>
      {/* Also reachable here because the sidebar's More menu doesn't exist on mobile. */}
      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
    </>
  );
}

function EditProfileForm({ user, onDone, onChangePassword }: { user: User; onDone: () => void; onChangePassword: () => void }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const [initial] = useState(() => initialForm(user));
  const [form, setForm] = useState(initial);
  const [avatar, setAvatar] = useState<AvatarChange>({ kind: "keep" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = { ...form, name: form.name.trim(), bio: form.bio.trim() };
    const invalid = validate(next);
    if (invalid) return setError(invalid);

    const body: UpdateProfileBody = {};
    for (const key of Object.keys(next) as (keyof Form)[]) {
      if (next[key] !== initial[key]) body[key] = next[key];
    }
    if (Object.keys(body).length === 0 && avatar.kind === "keep") return onDone();

    setSaving(true);
    setError(null);
    try {
      const avatarUrl = await avatarUrlFor(avatar);
      if (avatarUrl !== undefined) body.avatarUrl = avatarUrl;
      const { data, message } = await authService.updateMe(body);
      setUser(data);
      // Cached posts, comments and stories carry the old name/avatar; refresh them when next shown.
      void queryClient.invalidateQueries({ refetchType: "none" });
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
      <AvatarPicker
        user={user}
        value={avatar}
        onChange={(value) => {
          setAvatar(value);
          setError(null);
        }}
        onError={setError}
        disabled={saving}
      />
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
      <Button variant="ghost" onClick={onChangePassword} disabled={saving} fullWidth>
        Change password
      </Button>
    </form>
  );
}
