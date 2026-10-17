"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { getErrorMessage } from "@/lib/api";
import { removeCachedPost } from "@/lib/post-cache";
import { queryKeys } from "@/lib/query-keys";
import { postService } from "@/services/post.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";
import type { PostWithAuthor } from "@/types";

/** Deletes one of your posts: gone from every list at once, put back if the request fails. */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    async (post: PostWithAuthor) => {
      const restore = removeCachedPost(post.id);
      // Viewing it (page or modal): leave, since it no longer exists.
      if (pathname === `/p/${post.id}`) {
        if (window.history.length > 1) router.back();
        else router.replace(`/${post.author.username}`);
      }
      try {
        await postService.remove(post.id);
        queryClient.removeQueries({ queryKey: queryKeys.post(post.id), exact: true });
        // Post counts: the profile page's and the session's (/auth/me).
        void queryClient.invalidateQueries({ queryKey: queryKeys.profile(post.author.username.toLowerCase()) });
        void useAuthStore.getState().refreshMe();
        toast("Post deleted");
      } catch (err) {
        restore();
        toast(getErrorMessage(err, "Couldn't delete the post. Try again."));
      }
    },
    [pathname, queryClient, router],
  );
}
