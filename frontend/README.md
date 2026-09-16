# 🎨 Inkwell Frontend

The user-facing SPA for [Inkwell](https://inkwell-0tx.pages.dev/) — a full-stack blogging
platform. Built with **React 19** and **Vite**, styled with **TailwindCSS v4**, enriched by
a **TipTap** WYSIWYG editor, and powered by the Hono API in
[`../backend`](../backend).

Part of the [Inkwell monorepo](https://github.com/Anos714/Inkwell) — see the root
[`README.md`](../README.md) for the big picture.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Routes](#routes)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [State Management](#state-management)
- [API Client](#api-client)
- [Rich Text Editor](#rich-text-editor)
- [Styling & Theming](#styling--theming)
- [Authentication & Authorization](#authentication--authorization)
- [Image Uploads](#image-uploads)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)

---

## Tech Stack

| Concern              | Choice                                              |
| -------------------- | --------------------------------------------------- |
| Framework            | [React 19](https://react.dev/)                      |
| Build tool           | [Vite 8](https://vite.dev/)                         |
| Language             | [TypeScript](https://www.typescriptlang.org/) ~6 (strict) |
| Styling              | [TailwindCSS v4](https://tailwindcss.com/) (CSS-first `@theme`, no config file) |
| Routing              | [React Router v8](https://reactrouter.com/)         |
| Server state         | [TanStack React Query v5](https://tanstack.com/query) |
| Client state         | [Zustand v5](https://github.com/pmndrs/zustand) (`persist`) |
| Rich text            | [TipTap v3](https://tiptap.dev/)                    |
| Animation            | [Motion](https://motion.dev/) (`motion/react`)      |
| Icons                | [React Icons](https://react-icons.github.io/react-icons/) |
| Sanitization         | [DOMPurify](https://github.com/cure53/DOMPurify)    |
| Validation           | [Zod v4](https://zod.dev/)                          |
| Compiler             | React Compiler (via `@rolldown/plugin-babel`)      |
| Linting              | ESLint 10 + typescript-eslint, react-hooks, react-refresh |

Package manager: **Bun** (`bun.lock` present).

---

## Features

**Reading experience**

- 📰 Blog listing with **debounced search** (300 ms) and **pagination** (9 per page)
- 📖 Article pages with reading-friendly typography and sanitized HTML rendering
- ❤️ **Like / unlike** with **optimistic updates** and automatic rollback on failure
- 💬 **Comments** — post (2000-char limit with counter) and delete your own
- 👀 **View tracking** — recorded once per article visit
- 🔗 **Share menu** — copy link, WhatsApp, X/Twitter intent
- 🌗 **Dark / light theme** persisted in `localStorage`, initialized before render (no FOUC)
- 💀 **Skeleton shimmer loaders**, friendly empty states, and error states throughout
- ✨ Motion-powered hero and scroll-reveal animations (`whileInView`, `once`)

**Writing & admin**

- 🔐 Google sign-in with a CSRF `state` check (`sessionStorage`) and silent session refresh
- 📊 **Dashboard** — stat cards for total / published / draft blogs, views, likes, comments
- ✍️ **Rich-text editor** with a full toolbar and its own light/dark theme
- 🖼️ Cover-image and avatar uploads with instant local previews
- 🏷️ Tags, auto slugs, draft/publish toggle
- 🗂️ **Content manager** to edit and delete any post (with confirmation dialogs)
- 👤 Profile editing and account deletion (with a confirmation modal)
- 🛡️ Role-based route protection — admins only, with automatic redirects

**Quality**

- ⚡ Route-level **code splitting** (`React.lazy`) and **React Compiler** memoization
- ♿ Accessibility — ARIA attributes, alert/alertdialog roles, Escape + outside-click dismissal
- 🔍 SEO — Open Graph + Twitter card meta, canonical title, 1200×630 social preview image
- 🧼 Stored blog HTML is always run through **DOMPurify** before rendering

---

## Routes

Defined in [`src/App.tsx`](src/App.tsx). Every page except `AuthPage` is **lazy-loaded**
with `React.lazy()` and wrapped in a `<Suspense>` fallback. Unknown paths redirect home.

| Path                            | Component          | Access       | Notes                                    |
| ------------------------------- | ------------------ | :----------: | ---------------------------------------- |
| `/`                             | `BlogHome`         | Public       | Landing page + recent posts              |
| `/home`                         | `BlogHome`         | Public       | Post-login redirect target               |
| `/login`                        | `AuthPage`         | Public       | Google sign-in                           |
| `/api/auth/google/callback`     | `AuthPage`         | Public       | OAuth redirect URI (same component)      |
| `/blogs`                        | `BlogListPage`     | Public       | Search + pagination                      |
| `/blogs/:slug`                  | `BlogDetail`       | Public       | Post, views, likes, comments, share      |
| `/profile`                      | `ProfilePage`      | 🔒 Auth      | Redirects to `/login` when signed out    |
| `/admin/blogs`                  | `AdminDashboard`   | 🔒 Admin     | Redirects to `/` unless `role === 'admin'` |
| `/admin/blogs/create`           | `AdminCreatePage`  | 🔒 Admin     | New post form                            |
| `/admin/blogs/manage`           | `AdminManagePage`  | 🔒 Admin     | List / edit / delete posts               |
| `/admin/blogs/edit/:blogId`     | `AdminEditPage`    | 🔒 Admin     | Edit an existing post                    |
| `*`                             | `Navigate to="/"`  | —            | Catch-all → home                         |

**Route protection** is enforced inside each page with `<Navigate>`:

- `ProfilePage` — `if (!token || !user) → /login`
- `AdminDashboard` & shared `AdminFrame` — `if (!token || user?.role !== 'admin') → /`

---

## Project Structure

```
frontend/
├── public/
│   ├── favicon.svg               # Inkwell logo (also used by BrandLogo)
│   ├── og-image.svg              # 1200×630 social preview card
│   └── icons.svg                 # SVG sprite (currently unused)
├── src/
│   ├── main.tsx                  # StrictMode + QueryClientProvider + initializeTheme()
│   ├── App.tsx                   # BrowserRouter + lazy Routes + Suspense
│   ├── lib/
│   │   └── api.ts                # fetch client, Zod-validated responses
│   ├── styles/
│   │   └── globals.css           # Tailwind v4 @theme tokens + all custom CSS
│   ├── assets/                   # template leftovers (unused)
│   ├── components/               # shared UI
│   │   ├── brand-logo.tsx
│   │   ├── theme-toggle.tsx
│   │   └── theme.ts              # initializeTheme() — runs pre-render
│   └── features/                 # feature-sliced modules
│       ├── auth/
│       │   ├── api/auth-api.ts
│       │   ├── components/
│       │   │   ├── auth-page.tsx
│       │   │   ├── profile-page.tsx
│       │   │   └── welcome-page.tsx      # exists, not wired to a route
│       │   ├── hooks/use-auth.ts         # Google OAuth flow + refresh
│       │   ├── schemas.ts
│       │   ├── store/auth-store.ts       # zustand + persist
│       │   └── types.ts
│       └── blogs/
│           ├── api/
│           │   ├── blog-api.ts
│           │   └── upload-api.ts
│           ├── components/
│           │   ├── blog-home.tsx
│           │   ├── blog-list-page.tsx
│           │   ├── blog-detail.tsx
│           │   ├── blog-comments.tsx
│           │   ├── blog-skeleton.tsx
│           │   ├── rich-text-editor.tsx
│           │   ├── admin-dashboard.tsx
│           │   ├── admin-pages.tsx       # AdminCreatePage / AdminEditPage
│           │   ├── admin-blog-form.tsx
│           │   └── admin-blog-manager.tsx
│           └── types.ts
├── index.html                    # SEO meta, OG/Twitter tags, #root
├── vite.config.ts                # tailwindcss + react + babel(reactCompiler)
├── eslint.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .env / .env.example
└── package.json
```

**Feature-sliced by design** — each feature owns its `api/`, `components/`, `hooks/`,
`store/`, and schemas. Cross-cutting code lives in `lib/`, `components/`, and `styles/`.

---

## Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
#   ↑ set VITE_API_URL to your running backend (default http://localhost:8000)

# 3. Start the dev server
bun run dev
```

Open **http://localhost:5173** — the API must be running at `VITE_API_URL`
(see [`../backend/README.md`](../backend/README.md)).

To try the full flow locally, sign in with Google. Admin features require the signed-in
user's `role` to be `admin` (set it in Postgres; see the backend README).

---

## Environment Variables

| Variable                   | Required | Example / Default                                    | Purpose                     |
| -------------------------- | :------: | ---------------------------------------------------- | --------------------------- |
| `VITE_API_URL`             |   yes    | `http://localhost:8000`                              | Backend API base URL        |
| `VITE_GOOGLE_CLIENT_ID`    |   yes    | `xxxx.apps.googleusercontent.com`                    | Google OAuth client ID      |
| `VITE_GOOGLE_REDIRECT_URI` |   no     | `${window.location.origin}/api/auth/google/callback` | OAuth redirect (used if set) |

All variables are **`VITE_`-prefixed** so Vite statically inlines them at build time —
changing them requires a rebuild.

---

## State Management

**Server state — React Query v5**

A single `QueryClient` is created in `main.tsx`. Queries/mutations are declared inline
inside the components that use them. Query keys:

- `['auth', 'me']`
- `['blogs', 'published', { limit }]`
- `['blogs', 'all', { search, page, limit }]`
- `['blogs', 'admin-manage']`
- `['blog', slug | blogId]`
- `['blog-like', blogId]`
- `['blog-comments', blogId]`
- `['dashboard-summary']`

Patterns used: `invalidateQueries` after mutations, `queryClient.clear()` on logout,
`enabled` gating on token presence, `retry: false` on the `me` query, and **optimistic
like toggles** (`onMutate` write + rollback in `onError`).

**Client state — Zustand v5**

A single persisted auth store (`src/features/auth/store/auth-store.ts`):

```ts
create(persist((set) => ({
  token, user,
  setSession(token, user),
  clearSession(),
}), { name: 'inkwell-auth' }))   // localStorage
```

The `user` object carries an optional `role: 'user' | 'admin'` used for admin gating.

---

## API Client

[`src/lib/api.ts`](src/lib/api.ts) is built on the native **`fetch`** API (no axios) and:

- Sends `credentials: 'include'` (refresh cookie) and `Content-Type: application/json`
- Prepends the `Bearer <token>` header via an `authHeaders` helper
- **Validates every response with Zod** — `apiRequest<T>(path, schema, init?)` returns
  fully typed data; passing no schema yields `unknown`
- Handles errors gracefully — tolerates empty bodies, parses `{ message }` payloads, and
  falls back to `Request failed with status <code>`

Endpoints consumed (all under `/api/v1` on the backend): auth & profile, blogs (public +
admin), likes, comments, and Cloudinary upload signatures.

---

## Rich Text Editor

[`src/features/blogs/components/rich-text-editor.tsx`](src/features/blogs/components/rich-text-editor.tsx)
is a controlled TipTap editor that emits `getHTML()` via `onChange`, and re-syncs external
value with `editor.commands.setContent(value, { emitUpdate: false })`.

**Extensions**

- `StarterKit` — bold, italic, strike, code, headings, lists, blockquote, code block, HR, undo/redo
- `Underline`, `TextStyle`, `Color`
- `Highlight` (multicolor)
- `Link` (`openOnClick: false`, `autolink`)
- `TextAlign` (headings + paragraphs)
- `Image` (**`allowBase64: false`** — images must be hosted)
- `TaskList` + `TaskItem` (nested)

**Toolbar:** undo/redo, paragraph/H1–H3 dropdown, bold/italic/underline/strikethrough/inline
code/highlight, native color picker, bullet/ordered/task lists, blockquote, code block,
align left/center/right, horizontal rule, insert link (URL prompt), insert image (URL
prompt), and an editor theme toggle.

The editor theme **auto-syncs with the site theme** via a `MutationObserver` on
`document.documentElement[data-theme]`. Node styles live in `globals.css` under
`.rich-text-editor`.

---

## Styling & Theming

**TailwindCSS v4** is imported with `@import "tailwindcss"` via the `@tailwindcss/vite`
plugin — there is **no `tailwind.config.js`**; configuration is CSS-first.

A custom `@theme` block in `globals.css` defines the **"inkwell" design system**:

- **Palette:** `inkwell-950` `#121412` → `900`/`800`, `brown`, `cream` `#f3f0e9`,
  `gold` `#d9b47b`, `light`, `muted`, `dim`
- **Fonts:** `Manrope` (sans), `Playfair Display` (display), `DM Mono` (mono) from Google Fonts

**Dark mode is the default.** Light mode activates by setting `data-theme="light"` on
`<html>`, which overrides the same CSS variables (plus a few `!important` overrides).
`initializeTheme()` in `main.tsx` runs **before React renders**, reading
`localStorage['inkwell-theme']` to prevent a flash of unstyled content.

Hand-written CSS companions in `globals.css` cover what utilities can't:
`.skeleton-shimmer`, `.rich-text-editor[-light|-dark]`, `.rich-text-toolbar`,
`.blog-content` (prose styles), `.auth-shell` / `.auth-visual` / `.auth-grid`,
`.theme-toggle`, `.color-picker`, `.toolbar-divider`.

---

## Authentication & Authorization

`useAuth` (`src/features/auth/hooks/use-auth.ts`) implements the Google OAuth 2.0
authorization-code flow by hand:

1. Builds the `accounts.google.com/o/oauth2/v2/auth` URL
   (scope `openid email profile`, `access_type: offline`, `prompt: select_account`)
2. Stores a `crypto.randomUUID()` `state` value in `sessionStorage`
3. On redirect, **validates `state`**, sends the `code` to the backend, and sanitizes the URL
4. Stores the access token + decoded user (including `role`) in the Zustand store
5. On mount, attempts a **silent refresh** via the cookie (`POST /users/refresh`)

The `role` is decoded from the JWT payload (`atob`) on the client and used for admin
gating. If the `me` query errors (invalid/expired session), the store is cleared.

---

## Image Uploads

Avatars and blog covers use **Cloudinary signed direct uploads** — the backend signs the
payload and the browser uploads the binary straight to Cloudinary, so the API never
handles file data.

1. Client validates type (JPG / PNG / WebP) and size (5 MB covers; avatar limit from signature)
2. `GET /api/v1/uploads/signature?type=blogCover|avatar` returns signed params
3. Browser `POST`s to `https://api.cloudinary.com/v1_1/<cloud>/image/upload`
4. The returned secure URL is saved via the blog/profile API
5. Covers get an **instant local preview** with `URL.createObjectURL` (revoked after use)

---

## Available Scripts

| Script            | Command                | Description                              |
| ----------------- | ---------------------- | ---------------------------------------- |
| `bun run dev`     | `vite`                 | Dev server with HMR on `:5173`           |
| `bun run build`   | `tsc -b && vite build` | Typecheck + production build → `./dist`  |
| `bun run preview` | `vite preview`         | Preview the production build locally     |
| `bun run lint`    | `eslint .`             | Lint the codebase                        |

---

## Deployment

The live site is hosted on **Cloudflare Pages**: [inkwell-0tx.pages.dev](https://inkwell-0tx.pages.dev/).

- **Framework preset:** None (or Vite)
- **Build command:** `bun run build`
- **Output directory:** `frontend/dist`
- **Environment variables:** `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`,
  `VITE_GOOGLE_REDIRECT_URI` (set in the Pages dashboard — they're inlined at build time)
- **SPA fallback:** Cloudflare Pages automatically serves `index.html` when no static asset
  matches, so client-side routes (`/blogs/:slug`, `/admin/*`, …) work on refresh
- **API:** point `VITE_API_URL` at the deployed backend (HTTPS required, since the refresh
  cookie is `secure` + `sameSite=none`)
- **Google Console:** add the production redirect URI
  (`https://inkwell-0tx.pages.dev/api/auth/google/callback`) to authorized redirect URIs
