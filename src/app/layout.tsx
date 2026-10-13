import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/layout/AppProviders";
import { UI_STORAGE_KEY } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Instaclone", template: "%s • Instaclone" },
  description: "Share moments with friends on Instaclone — a photo-sharing UI demo.",
  applicationName: "Instaclone",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// Runs before paint so the correct theme is applied without a flash.
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('${UI_STORAGE_KEY}')||'{}').state||{};var t=s.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <AppProviders />
      </body>
    </html>
  );
}
