# Instaclone

A photo-sharing web app UI modeled on Instagram web, built with **Next.js 15 (App Router)**, **React 19**, **TypeScript (strict)**, **Tailwind CSS v4**, **Zustand** and **lucide-react**. All data comes from a local mock backend (JSON fixtures + Route Handlers), so it runs without any external services.

> Instaclone uses its own wordmark and logo. It is a UI demo and is not affiliated with Instagram or Meta.

## Getting started

Requirements: **Node 20+** and **pnpm**.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Log in with **Log in with the demo account**, or use any mock username (for example `alex.morgan` or `maya_chen`) with any password of 6+ characters. Sign-up creates a new account in server memory.

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `pnpm dev`            | Development server                                        |
| `pnpm build`          | Production build                                          |
| `pnpm start`          | Serve the production build                                |
| `pnpm lint`           | ESLint (`--max-warnings=0`)                               |
| `pnpm typecheck`      | `tsc --noEmit`                                            |
| `pnpm mocks:generate` | Regenerate `src/mocks/*.json` (deterministic, seeded)     |

## Features

- **Responsive shell.** At ≥1264px: full sidebar with labels. At 768–1263px: icon-only rail. Below 768px: top bar plus bottom tab bar. The sidebar collapses while the Search or Notifications panel is open, and always on `/direct`.
- **Dark and light mode.** Follows the system preference by default; switch it under **More → Appearance**. An inline pre-paint script prevents a flash of the wrong theme.
- **Home feed**
  - Story bar with gradient rings for unseen stories; seen stories move to the end.
  - Full-screen story viewer: 5-second progress bars, tap left or right, arrow keys, press-and-hold or Space to pause, Esc to close.
  - Post cards: image carousel (arrows and swipe), double-tap to like with a heart animation, like, comment, share and save, caption "more" truncation, relative time, inline comment box, and a "…" menu (Report, Unfollow, Go to post, Copy link, Cancel).
  - Infinite scroll using IntersectionObserver.
  - Right column with the current user and "Suggested for you" (follow buttons).
- **Profile** (`/[username]`, plus `/reels`, `/saved` and `/tagged`)
  - Header with stats and optimistic follow/unfollow (the follower count updates instantly).
  - Highlights, which open in the story viewer.
  - Tabs with a 3-column grid and a hover overlay showing like and comment counts.
  - The Saved tab is visible only on your own profile.
- **Post detail.** `/p/[id]` opens as a modal over the current page (intercepting + parallel routes). Opening the URL directly renders a full page with "More posts from …".
- **Comments.** A modal with paginated threads, comment likes, reply (prefills `@username`) and collapsible replies.
- **Share.** A modal with a searchable recipient list and multi-select send, plus copy link with a toast.
- **Captions.** `#hashtags` link to `/explore?tag=…`; `@mentions` link to the profile.
- **Explore.** Grid pattern of one tall tile and four squares, alternating sides, with infinite scroll, a hashtag filter, and a slide-out search panel with recent searches.
- **Reels.** Vertical scroll-snap feed. The reel in view autoplays and the rest pause; global mute toggle; tap to pause.
- **Direct**
  - Two panes (inbox and thread) on desktop; one pane on mobile.
  - Optimistic sending with a failure state.
  - Emoji picker (no dependency, loaded on demand).
  - Heart quick-send.
- **Create post.** Drag and drop or file picker, then:
  1. Crop: 1:1, 4:5 or 16:9, with zoom and drag-to-pan.
  2. Filter: live preview of 8 filters.
  3. Caption: 2,200-character counter.

  On Share, the image is rendered to a canvas and posted to the mock API. The new post appears at the top of the feed and profile.
- **Notifications.** A slide-out panel grouped into New / Today / This week / This month / Earlier, with infinite scroll.
- **Auth.** Login and signup pages (UI plus mock API). The session is stored in Zustand and persisted to `localStorage`; `(main)` routes redirect to `/login?next=…` when signed out.
- **Toasts** for user feedback. **Empty states, skeletons, error boundaries, not-found pages and image fallbacks** throughout.

## Architecture decisions

### Data flow

```
src/mocks/*.json ──► src/lib/db.ts (in-memory db, timestamps shifted to "now")
                         │
                         ▼
                    src/lib/data.ts (typed queries + mutations)
                    │                         │
     Server Components (first paint)   app/api/* Route Handlers (+300–800ms latency)
                                              │
                                   client components via src/lib/api.ts
                                   (pagination, mutations, optimistic UI)
```

- **Server Components read the mock layer directly** (`lib/data.ts`), so the first page of the feed, profile grids, explore and reels arrive as HTML with no client waterfall.
- **Client components call `/api/*`** for everything after first paint. The API covers next pages, comments, notifications, search, suggestions, conversations, like/save/follow and post creation. Every handler adds **300–800ms of simulated latency** so the skeletons are visible.
- **Cursor pagination.** The cursor is the id of the last item returned (`?cursor=<id>&limit=n` → `{ items, nextCursor }`). One generic hook, `useInfiniteList`, drives every infinite list.
- **Fresh-looking timestamps.** Fixture timestamps are stored relative to a fixed anchor and shifted to the server's start time, so the feed always reads "5m", "2h" and so on.
- **Mock identity.** The client sends `x-viewer-id` with every request (set from the auth store). The server is otherwise stateless about the viewer.

### Client state (Zustand)

| Store            | Holds                                                                  | Persisted                                  |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `useAuthStore`   | Session user, follow state (with the login-time baseline for count deltas) | ✅                                     |
| `usePostStore`   | Liked/saved posts, liked comments, seen stories, posts created this session | ✅ (except created posts)             |
| `useUIStore`     | Theme, open panel/modals, toasts, recent searches, reels mute          | ✅ theme + recent searches                 |
| `useDirectStore` | Inbox previews shared between the list and the open thread             | ❌                                         |

- **Optimistic updates.** Like, save and follow update the store first, then call the API, and roll back with a toast if the call fails. The server does not change counts; the UI adds the viewer's own like or follow on top of the server count, so counts never double-count.
- **Hydration-safe persistence.** Persisted stores use `skipHydration: true` and are rehydrated in a layout effect in `AppProviders`. The first client render therefore matches the server HTML (no hydration warnings), and no component can overwrite persisted state with defaults before it has been read.

### Routing

- **`(main)`** route group: the app shell (sidebar, top bar, bottom nav) and an `@modal` parallel slot.
  - `@modal/(.)p/[postId]` intercepts client navigation to a post and shows it as a modal; closing calls `router.back()`.
  - `@modal/[...catchAll]` and `@modal/page.tsx` clear the slot on other soft navigations.
- **`(auth)`** route group: login and signup with a minimal centered layout.
- `/[username]` uses a layout (header, highlights, tabs) with nested tab routes (`/reels`, `/saved`, `/tagged`).
- Inbox routes are `/direct` and `/direct/t/[conversationId]`.

### Styling

- All design tokens live in `src/app/globals.css` as **Tailwind v4 `@theme`** variables. They cover:
  - Semantic colors (`background`, `secondary`, `elevated`, `separator`, `foreground`, `muted`, `primary`, `like`) and the story gradient.
  - Breakpoints: 768 / 1160 / 1264px.
  - Widths: feed 470px, sidebar 244/72px.
  - Avatar sizes: 24/32/44/56/77/150px.
  - Animations.
- Light and dark values swap under `[data-theme="dark"]`. Components use only token classes (`bg-background`, `text-muted`, `size-avatar-lg`, …) and never hex values.

### Performance and accessibility

- Heavy, interaction-only UI is code-split with `next/dynamic`: story viewer, create flow, share and comments modals, search and notifications panels, and the emoji picker.
- Every image goes through `next/image` (wrapped by `SafeImage`, which shows a fallback tile on error) with appropriate `sizes`.
- Accessibility:
  - Semantic landmarks and a skip link.
  - `aria-label` on every icon-only button (`IconButton` requires a `label` prop).
  - `aria-pressed` and `aria-expanded` states.
  - Focus-trapped dialogs with Esc to close and focus restore.
  - Keyboard-operable carousels, stories, menus and radio groups.
  - Live regions for toasts and chat.
  - Honors `prefers-reduced-motion`.

## Folder structure

```
scripts/generate-mocks.mjs     # seeded fixture generator
src/
├─ app/
│  ├─ (auth)/{login,signup}/   # auth pages (no app shell)
│  ├─ (main)/
│  │  ├─ page.tsx              # home feed
│  │  ├─ explore/ reels/ direct/(t/[conversationId])/
│  │  ├─ [username]/(reels|saved|tagged)/
│  │  ├─ p/[postId]/           # full post page (+ generateMetadata)
│  │  ├─ @modal/(.)p/[postId]/ # intercepted post modal
│  │  └─ layout.tsx, loading.tsx, error.tsx, not-found.tsx
│  ├─ api/                     # mock REST API (Route Handlers)
│  ├─ globals.css              # Tailwind v4 @theme tokens
│  ├─ icon.svg, manifest.ts, robots.ts, not-found.tsx, global-error.tsx
├─ components/
│  ├─ ui/            # primitives: Avatar, Button, IconButton, Modal, ActionMenu, SafeImage, Skeleton, Toaster, …
│  ├─ layout/        # app frame: AppShell, Sidebar, TopBar, BottomNav, MoreMenu, OverlayHost, …
│  ├─ post/          # domain: PostCard, PostMedia, PostActions, PostDetail, PostModal, PostGrid, GridItem, …
│  ├─ comment/       # domain: CommentList, CommentItem, AddComment, CommentsModal, useComments
│  ├─ story/         # domain: StoryBar, StoryViewer, StoryProgress
│  ├─ user/          # domain: FollowButton
│  ├─ share/         # domain: ShareModal
│  ├─ notification/  # domain: NotificationsPanel, NotificationItem
│  ├─ feed/          # page: Feed, RightColumn, SuggestionItem
│  ├─ profile/       # page: ProfileHeader, Highlights, ProfileTabs, EditProfileModal, …
│  ├─ explore/       # page: ExploreGrid, SearchPanel
│  ├─ reels/         # page: ReelsFeed, ReelItem, ReelActions
│  ├─ direct/        # page: DirectShell, ConversationList, ChatPane, MessageComposer, EmojiPicker
│  ├─ create/        # flow: CreatePostModal, DropZone, CropStep, FilterStep, CaptionStep
│  └─ auth/          # page: LoginForm, SignupForm
├─ hooks/        # useInfiniteList, useInView, useFocusTrap, useDoubleTap, useHydrated, useLockBodyScroll
├─ lib/          # data.ts (mock queries), db.ts, api.ts (client fetch), http.ts, format.ts, parse-caption.ts, …
├─ mocks/        # 30 users, 80 posts, 438 comments, 15 stories, 20 reels, 10 conversations, 40 notifications
├─ store/        # auth.ts, post.ts, ui.ts, direct.ts (Zustand)
└─ types/        # User, Post, Story, Comment, Reel, Message, Conversation, Notification, …
```

## Known limitations

- **Mock persistence is in-memory.** Comments, messages, new posts and new accounts are kept in the server process and reset on restart (or across serverless instances if deployed). Likes, saves, follows and seen stories persist per browser via `localStorage`.
- **Counts are client overlays.** Like and follower counts add the current viewer's action on top of the fixture counts; they are not shared across users.
- **Create post** supports one image per post (no multi-image carousel upload or video). Canvas filters rely on `CanvasRenderingContext2D.filter`; browsers without it upload the unfiltered crop.
- **Saved tab** lists saved photo posts only; reels can be liked, commented on and shared, but not saved.
- **Stubs.** Edit profile, archive, password reset, photo DMs and reel "more" options show an explanatory toast.
- **Remote media.** Images (`picsum.photos`, `i.pravatar.cc`) and reel videos (public sample hosts) are fetched from third-party CDNs. If a CDN is unreachable, image tiles fall back to a placeholder and reels show "Video unavailable".
- **Auth is client-side only.** Protected routes still server-render, and the redirect to `/login` happens after hydration.
