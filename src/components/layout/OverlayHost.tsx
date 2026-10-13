"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/ui";

const CommentsModal = dynamic(() => import("@/components/comment/CommentsModal").then((m) => m.CommentsModal), { ssr: false });
const CreatePostModal = dynamic(() => import("@/components/create/CreatePostModal").then((m) => m.CreatePostModal), { ssr: false });
const NotificationsPanel = dynamic(() => import("@/components/notification/NotificationsPanel").then((m) => m.NotificationsPanel), { ssr: false });
const SearchPanel = dynamic(() => import("@/components/explore/SearchPanel").then((m) => m.SearchPanel), { ssr: false });
const ShareModal = dynamic(() => import("@/components/share/ShareModal").then((m) => m.ShareModal), { ssr: false });

/**
 * Mounts global panels and modals on demand. Heavy pieces are code-split with
 * next/dynamic so they never ship in the initial bundle.
 */
export function OverlayHost() {
  const pathname = usePathname();
  const closePanel = useUIStore((s) => s.closePanel);
  const closeComments = useUIStore((s) => s.closeComments);
  const closeShare = useUIStore((s) => s.closeShare);
  const commentsOpen = useUIStore((s) => s.commentsPostId !== null);
  const shareOpen = useUIStore((s) => s.shareTarget !== null);
  const panel = useUIStore((s) => s.panel);
  const createOpen = useUIStore((s) => s.createOpen);

  // Navigating anywhere dismisses transient overlays (not on first mount).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    closePanel();
    closeComments();
    closeShare();
  }, [pathname, closePanel, closeComments, closeShare]);

  return (
    <>
      {panel === "search" && <SearchPanel />}
      {panel === "notifications" && <NotificationsPanel />}
      {commentsOpen && <CommentsModal />}
      {shareOpen && <ShareModal />}
      {createOpen && <CreatePostModal />}
    </>
  );
}
