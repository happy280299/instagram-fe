"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";

/** Same rules as PATCH /api/auth/password (bcrypt only uses the first 72 bytes). */
const MIN_LENGTH = 6;
const MAX_LENGTH = 72;

interface Form {
  current: string;
  next: string;
  confirm: string;
}

function validate({ current, next, confirm }: Form): string | null {
  if (!current) return "Enter your current password.";
  if (next.length < MIN_LENGTH) return `New password must be at least ${MIN_LENGTH} characters.`;
  if (next.length > MAX_LENGTH) return `New password can be up to ${MAX_LENGTH} characters.`;
  if (next === current) return "New password must be different from the current one.";
  if (next !== confirm) return "The new passwords don't match.";
  return null;
}

/** "Change password". On success other devices are logged out and this one keeps going with new tokens. */
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const setTokens = useAuthStore((s) => s.setTokens);
  const [form, setForm] = useState<Form>({ current: "", next: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const invalid = validate(form);
    if (invalid) return setError(invalid);
    setSaving(true);
    setError(null);
    try {
      const { data, message } = await authService.changePassword({ currentPassword: form.current, newPassword: form.next });
      setTokens(data);
      toast(message ?? "Password changed");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't change your password. Try again."));
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={() => !saving && onClose()} title="Change password" className="md:max-w-md!">
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 overflow-y-auto p-4">
        <p className="text-muted text-sm">You&apos;ll stay logged in here; other devices will be logged out.</p>
        <TextField label="Current password" type="password" autoComplete="current-password" value={form.current} onChange={(e) => set("current")(e.target.value)} />
        <TextField label="New password" type="password" autoComplete="new-password" maxLength={MAX_LENGTH} value={form.next} onChange={(e) => set("next")(e.target.value)} />
        <TextField label="Re-type new password" type="password" autoComplete="new-password" maxLength={MAX_LENGTH} value={form.confirm} onChange={(e) => set("confirm")(e.target.value)} />
        {error && (
          <p role="alert" className="text-danger text-center text-sm whitespace-pre-line">
            {error}
          </p>
        )}
        <Button type="submit" loading={saving} fullWidth>
          Change password
        </Button>
      </form>
    </Modal>
  );
}
