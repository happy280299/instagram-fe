"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Logo";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import { AuthCard } from "./AuthCard";
import { useSessionRedirect } from "./useSessionRedirect";

const EMPTY = { email: "", password: "" };

export function SignupForm() {
  useSessionRedirect();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set =
    (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  const canSubmit = form.email.trim().length > 0 && form.password.length >= 6;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const email = form.email.trim().toLowerCase();
      // The backend's RegisterDto requires `name`; derive it from the email until profiles are editable.
      const name = email.split("@")[0];
      const { session, message } = await authService.register({
        name,
        email,
        password: form.password,
      });
      console.log("message", message);
      login(session);
      toast(message ?? "Welcome to Instaclone!");
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <>
      <AuthCard className="py-10">
        <h1 className="mb-4 flex justify-center">
          <Wordmark className="text-4xl" />
          <span className="sr-only">Sign up for Instaclone</span>
        </h1>
        <p className="text-muted mb-6 text-center font-semibold">
          Sign up to see photos and videos from your friends.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-1.5" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            value={form.email}
            onChange={set("email")}
          />
          <TextField
            label="Password (6+ characters)"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
          />
          <div className="my-2" />
          <Button
            type="submit"
            fullWidth
            size="sm"
            disabled={!canSubmit}
            loading={loading}
          >
            Sign up
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-danger mt-4 text-center text-sm">
            {error}
          </p>
        )}
      </AuthCard>
      <AuthCard className="mt-2.5 py-5 text-center text-sm">
        Have an account?{" "}
        <Link href="/login" className="text-primary font-semibold">
          Log in
        </Link>
      </AuthCard>
    </>
  );
}
