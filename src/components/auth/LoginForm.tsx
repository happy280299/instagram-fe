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
import type { LoginBody } from "@/types";
import { AuthCard } from "./AuthCard";
import { nextPath, useSessionRedirect } from "./useSessionRedirect";

export function LoginForm() {
  useSessionRedirect();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length >= 6;

  async function signIn(credentials: LoginBody) {
    setLoading(true);
    setError(null);
    try {
      const { session, message } = await authService.login(credentials);
      login(session);
      toast(message ?? `Welcome back, ${session.user.username}!`);
      router.replace(nextPath());
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (canSubmit) void signIn({ email, password });
  }

  return (
    <>
      <AuthCard className="py-10">
        <h1 className="mb-8 flex justify-center">
          <Wordmark className="text-4xl" />
          <span className="sr-only">Log in to Instaclone</span>
        </h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-1.5" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            size="sm"
            className="mt-3"
            disabled={!canSubmit}
            loading={loading}
          >
            Log in
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-danger mt-4 text-center text-sm">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => toast("Password reset isn't available in this demo")}
          className="mt-4 block w-full text-center text-sm"
        >
          Forgot password?
        </button>
      </AuthCard>
      <AuthCard className="mt-2.5 py-5 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold">
          Sign up
        </Link>
      </AuthCard>
    </>
  );
}
