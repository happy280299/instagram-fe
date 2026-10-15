# CLAUDE.md

Instagram-style web client. Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Zustand, axios. Package manager: pnpm. Node ≥ 20.

**Current state:** the app is moving from the in-repo mock API (`src/app/api/*`, `src/lib/data.ts`) to the real NestJS backend in `../shop-api`. Screens are migrated one at a time; anything not yet migrated still reads mock data.

## Commands

| Command          | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Dev server                               |
| `pnpm build`     | Production build                         |
| `pnpm typecheck` | `tsc --noEmit`                           |
| `pnpm lint`      | ESLint, fails on any warning             |

## Definition of done

A change is done only when all of these hold:

1. `pnpm typecheck && pnpm lint` pass with no errors or warnings.
2. Every screen touched handles loading, error, empty and success states (see [UI states](#ui-states)).
3. No new mock-only behaviour presented as real; gaps in the backend are reported, not papered over.
4. The change is verified against the running backend when it touches the API, or the report says it wasn't.
5. The report to the user lists what changed, how it was verified, and what is still missing.

## Architecture

### Folders

| Folder                 | Responsibility                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `app/`                 | Routing, layouts, metadata, error/not-found boundaries. Pages stay thin and compose components. |
| `components/ui/`       | Generic primitives with no domain knowledge (Button, Modal, TextField, SafeImage, …).       |
| `components/layout/`   | The app frame only: shell, sidebar, top bar, bottom nav, overlay host.                      |
| `components/<domain>/` | Everything about one domain, used by any page: `post`, `comment`, `story`, `user`, `share`, `notification`. |
| `components/<page>/`   | Pieces specific to one page or flow: `feed`, `profile`, `explore`, `reels`, `direct`, `create`, `auth`. |
| `hooks/`               | Hooks shared by several features.                                                           |
| `services/`            | One file per backend resource. HTTP calls and mapping from backend shapes to app types.     |
| `store/`               | Zustand stores for state shared across screens (session, likes/saves, UI).                  |
| `lib/`                 | Framework-free helpers: api client, formatting, parsing, constants.                         |
| `types/`               | App-level domain types used by the UI.                                                      |

### Organising components by domain

**Group by what a component is about, not by the page that first used it.** A comment component lives in `comment/` even though the feed shows comments.

- A domain folder holds only that domain: `comment/` contains the comment list, item, composer, modal and `useComments`, and nothing about posts or stories.
- A page folder holds only what that page alone uses. `feed/` is the home feed (`Feed`, `RightColumn`), not every component the feed renders.
- **When a component is needed by a second page or domain, move it to its domain folder** (create one if needed) instead of importing it from another page's folder. Example: `FollowButton` started in `profile/` and moved to `user/` once the feed and reels used it.
- Hooks and types used by one domain sit in that domain folder (`comment/useComments.ts`). Shared across domains, they go to `hooks/` or `types/`.
- A file goes in a domain folder named after it: a `Comment*` component in `comment/`, a `Post*` component in `post/`.
- Folder names are singular and lowercase (`comment/`, not `comments/` or `Comment/`).
- Imports between folders use `@/components/<folder>/<File>`. Imports inside the same folder use `./<File>`.
- Domain folders must not import from page folders, and two folders must not import each other. If that happens, the shared piece belongs in a domain folder (or `ui/`).

Current domain folders:

| Folder          | Contains                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| `post/`         | Post card, header, media, actions, caption, menu, detail, modal, grid, skeletons |
| `comment/`      | Comment list, item, composer, caption-as-comment, comments modal, `useComments` |
| `story/`        | Story bar, viewer, progress                                               |
| `user/`         | User-level pieces shared by pages (`FollowButton`, `UserListItem`, `FollowListModal`) |
| `share/`        | Share modal                                                               |
| `notification/` | Notifications panel and item                                              |

### Dependency direction

`app` → `components` → `hooks` / `store` → `services` → `lib/api`. Never the reverse.

- Components never call axios or `fetch` directly.
- Components never see raw backend shapes. `Backend*` types live in the service that maps them; services return app types (`PostWithAuthor`, `User`, …) with string IDs.
- Place a helper in the narrowest scope that serves every caller: the file, then the feature folder, then `lib/` or `hooks/`.

### State

| Kind of state                                   | Where it lives                            |
| ----------------------------------------------- | ----------------------------------------- |
| Backend data (lists, details)                   | TanStack Query cache (`useQuery`, `usePaginatedQuery`) |
| Mock data (screens not migrated yet)            | Hook local state (`useInfiniteList`)      |
| Viewer state shared across screens (session, liked, saved, following) | Zustand store            |
| Transient UI (open menu, input text)            | Component `useState`                      |
| Shareable UI (selected tab, filters)            | URL (route or search params)              |

Do not copy server data into a store "just in case". Select narrow slices from stores: `useStore((s) => s.x)`.

TanStack Query:

- Keys come from `queryKeys` in `src/lib/query-keys.ts`; add new ones there, never inline arrays.
- Queries for viewer-dependent data use `enabled: hydrated` so the first request carries the token.
- Login and logout call `resetServerState()`; keys don't include the viewer.
- After a mutation, update the affected caches (`setQueryData`, `prependToPages`, `removeFromPages`) or invalidate them. Don't keep a parallel list in a store.

## Backend integration

- `NEXT_PUBLIC_API_URL` points at the backend. All requests go through `src/lib/api` (`client` / `http`), which attaches the Bearer token.
- The backend wraps every response as `{ success, statusCode, message, data, meta? }`. The client interceptor unwraps it and exposes `response.message` and `response.meta`. Callers never unwrap again.
- Failures always reject with `HttpError`. Show them with `getErrorMessage(err, fallback)` so the backend's message (409, validation errors) reaches the user.
- Paginated endpoints return `meta.nextCursor`. The service converts the page to `Paginated<T>` (`{ items, nextCursor: string | null }`) for `useInfiniteList`.
- **Never invent an endpoint, field or response shape.** Read the controller/service in `../shop-api/src` or call the running API first. If an endpoint is missing, keep the existing behaviour and say so.
- `../shop-api` is a separate project: read it, don't edit it unless asked.

## UI states

Every view that loads data renders all four states:

- **Loading:** a skeleton shaped like the content (not a bare spinner for page content).
- **Error:** a message plus a retry action. Mutations roll back and show a `toast`.
- **Empty:** `EmptyState` with a hint or next action.
- **Success:** the content.

Mutations are optimistic: update the store, call the service, roll back and `toast` on failure. Disable submit buttons while a request is in flight.

## Code size and splitting

These are guides, not hard limits. Crossing one is a signal to split by responsibility, not to chop by line count.

- **Component file:** under ~150 lines. Split when a file mixes responsibilities (form + validation + a reusable input).
- **Function or hook:** under ~50 lines. Extract named steps instead of nesting.
- **Props:** more than ~6 props usually means the component does too much.
- **One exported component per file**, named after the file. Small private sub-components used only in that file may stay.
- Non-UI logic (validation, mapping, formatting) lives outside components: `lib/`, a service, or a hook.
- When the same markup or logic appears a second time, extract it before a third copy appears.

## TypeScript

- `strict` is on. No `any` (lint error); use `unknown` and narrow.
- Type-only imports use `import type` (lint error otherwise).
- `interface` for object shapes, `type` for unions and aliases.
- App IDs are `ID` (string). Convert backend numeric IDs at the service boundary.
- No `as` casts or `!` assertions where a runtime check can narrow instead. Validate data from outside the app (API, URL params, `localStorage`, user input) before trusting it.
- Exported functions have explicit parameter types; return types may be inferred.

## React and Next.js

- Default to Server Components. Add `"use client"` only for state, effects, event handlers or browser APIs.
- Session data lives in `localStorage`, so the server can't make authenticated requests. Fetch user-specific data on the client.
- Persisted stores rehydrate after mount (`skipHydration`). Gate session-dependent UI on `useAuthStore((s) => s.hydrated)` or `useHydrated()` to avoid hydration mismatches.
- Effects are for syncing with external systems, not for deriving state. Derive values during render.
- Don't read values captured inside a `setState` updater; React may run it later.
- Lists use stable keys from data IDs, never array indexes for dynamic lists.
- Code-split heavy, interaction-only UI with `next/dynamic`.

## Styling, images and accessibility

- Use Tailwind token classes from `src/app/globals.css` (`bg-background`, `text-muted`, `size-avatar-sm`, …). No hex colours or arbitrary colour values.
- Merge classes with `cn()` from `@/lib/cn`.
- Layouts work from 320px wide up, in light and dark themes.
- Images go through `SafeImage` (or `Avatar`), never `<img>` or `next/image` directly. Optimised hosts are listed once in `src/lib/image-hosts.ts`, which `next.config.ts` imports.
- Icon-only buttons use `IconButton` with a `label`. Toggles set `aria-pressed`, disclosures `aria-expanded`. Every input has a label (visible or `sr-only`).
- Dialogs use `Modal` (focus trap, Esc to close, scroll lock).
- Everything clickable is a `<button>` or `<a>`, reachable and operable by keyboard.

## Security

- Never render user content as HTML. `dangerouslySetInnerHTML` is allowed only for static, developer-written strings (e.g. the theme script in `app/layout.tsx`).
- Treat user-entered URLs as untrusted: allow only `http:`/`https:` and render them through `SafeImage` or `rel="noopener noreferrer nofollow"` links.
- The access token is stored in `localStorage`, a known trade-off that makes XSS more damaging. Don't add other secrets client-side, and don't log tokens or user data.
- Only `NEXT_PUBLIC_*` variables reach the browser. Never put secrets in them.

## Environment variables

| Variable              | Required | Purpose                                      |
| --------------------- | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend base URL, e.g. `http://localhost:3000` |

`.env*` files are git-ignored. When adding a variable, add it to this table and to `.env.example`.

## Naming, formatting and comments

- Components and their files: `PascalCase.tsx`. Hooks: `useCamelCase.ts`. Services: `<resource>.service.ts` exporting `<resource>Service`. Stores: `use<Name>Store`. Constants: `UPPER_SNAKE_CASE`.
- Booleans read as questions: `isMine`, `hasMore`, `loading`, `done`.
- Event handler props are `onX`; their implementations are `handleX` or inline.
- Imports use the `@/` alias, not long relative paths.
- Match the surrounding formatting: 2-space indent, double quotes, semicolons, trailing commas.
- Comments explain *why*, not *what*. A short `/** … */` on exported helpers whose purpose isn't obvious; nothing on self-explanatory code. No commented-out code.
- UI copy is English. Code, comments and identifiers are English.

## Git

- Branches: `feat/…`, `fix/…`, `refactor/…`, `chore/…`, `docs/…`, short kebab-case (`feat/feed-api`).
- Commits follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): summary` in the imperative, e.g. `feat(feed): load home feed from backend`.
- One logical change per commit. Formatting-only changes go in their own commit.
- Never commit `.env*`, build output or generated files.
- Claude: don't commit, push, or open PRs unless asked. Never force-push `main`.

## Working agreements for Claude

- Read the relevant code before changing it, and follow the patterns already there.
- Keep the change scoped to the request. Report unrelated problems instead of silently fixing them.
- Ask before adding a dependency, changing public types used across features, or making a change that is hard to undo.
- When something can't be verified (backend down, needs login, no browser), say so in the report.

## Tooling status

Not set up yet. Until they are, the rules above are enforced by review only:

- **Formatter:** Prettier with `prettier-plugin-tailwindcss`.
- **Lint additions:** `max-lines` / `max-lines-per-function` (warn), import ordering.
- **Git hooks:** husky + lint-staged running lint and format on staged files; commitlint for commit messages.
- **Tests:** none exist. Planned: Vitest + Testing Library for service mappers, hooks and stores (`*.test.ts` next to the file); Playwright for login → feed → comment.
- **CI:** typecheck, lint, test and build on every pull request.
- **`.env.example`:** not committed yet.

When one of these is added, move its rule into the relevant section above and delete it here.
