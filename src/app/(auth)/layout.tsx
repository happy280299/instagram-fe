import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex flex-1 items-start justify-center px-0 pt-8 md:items-center md:pt-0">
        <div className="w-full max-w-[350px]">{children}</div>
      </main>
      <footer className="text-muted px-4 py-6 text-center text-xs">© {new Date().getFullYear()} Instaclone — UI demo, not affiliated with any real service</footer>
    </div>
  );
}
