# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install deps.
- `npm start` / `npx expo start` — Metro dev server (then press `w`/`i`/`a` to launch web/iOS/Android).
- `npm run web` / `npm run ios` / `npm run android` — start with a specific target.
- `npm run lint` — `expo lint` (ESLint via Expo's preset). There is no test runner configured.
- `npx expo export --platform web` — production web build (output → `dist/`); this is what `vercel.json` runs.
- `npm run reset-project` — destructive; archives `src/` to `example/` and scaffolds an empty starter. Don't run unless the user explicitly asks.

## Environment

Required public env vars (read from `process.env.EXPO_PUBLIC_*` at build time, so a Metro restart is needed after changes):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SITE_URL` — canonical web origin (no trailing slash) used as a fallback for OAuth `redirectTo`. Production is `https://www.carriage.app`.

`isSupabaseConfigured()` in `src/lib/supabase.ts` is the gate that screens use to avoid calling auth when env is missing — keep it; don't throw at import time.

## Architecture

Expo SDK 55 (canary) + expo-router v5 universal app (iOS, Android, web) on React 19 / RN 0.83. Single codebase serves a marketplace with two user types: **couples** (find an officiant) and **officiants** (apply to be listed, manage leads). Web is exported as a SPA static site (`output: "static"` in `app.json`) and deployed to Vercel — `vercel.json` rewrites everything except `/_expo` and `/assets` to `index.html`.

### Routing (file-based, `src/app/`)

- `app.json` sets `experiments.typedRoutes: true` and `experiments.reactCompiler: true`.
- `index.tsx` — public landing / role selection. Sets role in `WeddingContext` and routes couples to `/match`, officiants to `/officiant/apply`.
- `match.tsx` — anonymous quiz (5 steps); on completion either persists to `profiles.quiz_completed` (if signed in) or sets a `PENDING_QUIZ_SYNC_KEY` flag and routes to `/(couple)/sign-in`.
- `(couple)/` — authenticated couple tabs (`browse`, `saved`, `messages`, `profile`) plus `sign-in`. Tabs use `ResponsiveTabBar` (bottom on mobile, top nav on web ≥ 768px). The `sign-in` tab is hidden via `href: null`.
- `(officiant)/` — authenticated officiant tabs (`leads`, `profile`).
- `officiant/` (no parens) — onboarding flow (`apply.tsx`, `pending.tsx`); separate Stack outside the authed tab groups.
- Browse/messages/leads use dynamic `[id].tsx` segments under their own nested Stacks.

### Auth + post-OAuth routing (the fragile part)

Supabase + Google OAuth with **PKCE** flow type (`src/lib/supabase.ts`). Several non-obvious invariants — preserve them:

1. **Same-origin redirect is required.** `getGoogleOAuthRedirectTo()` in `src/lib/auth-oauth.ts` returns the *current tab's* origin so PKCE verifier and pending-quiz state in `localStorage` survive the redirect. It only falls back to `EXPO_PUBLIC_SITE_URL` when there's no `window`. Both `https://www.carriage.app/sign-in` and the apex `https://carriage.app/sign-in` (and any local `http://localhost:PORT/sign-in`) must be in Supabase Auth redirect URLs.
2. **Web auth storage is `localStorage`** (custom adapter, not AsyncStorage) — AsyncStorage breaks static SSR/Node export. Don't import AsyncStorage in code that runs at module top-level on web.
3. **The sign-in screen exchanges the `?code=` itself** via `supabase.auth.exchangeCodeForSession` before relying on `detectSessionInUrl`, then strips the query with `history.replaceState`. This avoids racing `getProfileQuizCompleted`.
4. **Pending quiz sync** (`src/lib/couple-profile.ts`): if a user finishes the quiz signed-out, `setPendingQuizCompletionFlag()` sets a localStorage marker; `applyPendingQuizCompletionIfNeeded()` is called from both the sign-in screen *and* the `(couple)/browse/_layout.tsx` gate after the session lands, then upserts `profiles.quiz_completed = true`. There's a `PROFILE_READ_RETRY_MS` retry because the upsert may not be visible immediately.
5. The browse tab has its own auth gate in `(couple)/browse/_layout.tsx` that re-runs the same logic — both screens must remain in sync.

### State

- `WeddingContext` (`src/context/wedding-context.tsx`) — single in-memory store wrapping the whole app. Holds `role`, `matchProfile` (quiz answers), favorites, mock message threads, display names. Most domain data is currently mock (see `src/data/`); only `profiles` and `officiant_applications` are persisted to Supabase.
- `MatchProfile` (`src/types/match-profile.ts`) carries `scoreOfficiantForMatch` / `sortOfficiantsByMatch` — pure functions used to rank `MOCK_OFFICIANTS` on the browse screen.

### Responsive layout

`useResponsive()` (`src/hooks/use-responsive.ts`) is the single source of truth for breakpoints: `TOP_NAV_BREAKPOINT = 768`, `DESKTOP_BREAKPOINT = 960`, `WIDE_BREAKPOINT = 1320`. `ResponsiveTabBar` swaps between the RN bottom tab bar and a custom desktop top nav at the top-nav breakpoint. On web, **avoid inline `gridTemplateColumns`** — `src/app/index.tsx` injects a `<style>` tag with media-query CSS because RN Web's inline grid styles can win over stylesheets in production and break mobile layouts (see the comment on `LANDING_OFFICIANT_GRID_WEB_SUPPLEMENT`).

### Styling

No Tailwind / NativeWind. All styling is `StyleSheet.create` plus the design tokens in `src/constants/wedding-theme.ts` (`WeddingPalette`, `WeddingShadows`, `WeddingFonts`). Fonts are loaded via `useFonts` in `src/app/_layout.tsx` (Cormorant Garamond serif + DM Sans) — the splash screen is held until they load.

### Path aliases

`tsconfig.json` maps `@/*` → `src/*` and `@/assets/*` → `assets/*`. Use these — most imports already do.

### Platform-specific files

`.web.tsx` / `.web.ts` siblings exist for web-only implementations (`animated-icon.web.tsx`, `use-color-scheme.web.ts`). Metro picks them automatically on the web target.

### Supabase schema

Migrations in `supabase/migrations/`. Two tables only:

- `profiles` — `id` (FK to `auth.users`), `quiz_completed`, RLS scoped to `auth.uid() = id`.
- `officiant_applications` — pending-approval queue; insert-only for `anon` and `authenticated`, no public reads.

Apply with `supabase db push` or via the SQL editor.
