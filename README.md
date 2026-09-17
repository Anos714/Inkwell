# 📝 Inkwell

**Inkwell** is a full-featured, full-stack blogging platform where readers explore
published stories and admins write rich, beautifully formatted posts. It ships with
Google authentication, a WYSIWYG rich-text editor, likes, comments, view tracking,
image uploads, and a role-based admin dashboard — all wrapped in a warm,
editorial "inkwell" design system with dark/light themes.

![Inkwell](https://img.shields.io/badge/Inkwell-Blogging%20Platform-d9b47b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-d9b47b?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

- 🔗 **Live demo:** [https://inkwell-0tx.pages.dev/](https://inkwell-blogs.pages.dev/)
- 🧑‍💻 **Repository:** [https://github.com/Anos714/Inkwell](https://github.com/Anos714/Inkwell)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [For Readers](#for-readers)
  - [For Writers & Admins](#for-writers--admins)
  - [Technical Highlights](#technical-highlights)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up the database & Redis](#2-set-up-the-database--redis)
  - [3. Configure external services](#3-configure-external-services)
  - [4. Run the backend](#4-run-the-backend)
  - [5. Run the frontend](#5-run-the-frontend)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Inkwell is a monorepo with two independently deployable applications:

| App          | Stack                                      | Port (dev) | Description                                          |
| ------------ | ------------------------------------------ | ---------- | ---------------------------------------------------- |
| **frontend** | React 19, Vite, TailwindCSS v4, TypeScript | `5173`     | Public blog reader + authenticated admin workspace   |
| **backend**  | Bun, Hono, Drizzle ORM, TypeScript         | `8000`     | REST API (`/api/v1`), auth, content, uploads         |

The backend talks to a **Neon Postgres** database and a **Redis** instance (used as a
refresh-token store), uses **Cloudinary** for image hosting, and **Google OAuth 2.0**
as the sole identity provider. The frontend is a single-page app that communicates
with the API using `fetch` with `credentials: 'include'` (cookie-based refresh).

---

## Features

### For Readers

- 📰 **Blog listing** with **debounced search** (300 ms) and **pagination**
- 📖 **Article pages** rendered from sanitized HTML with a reading-friendly layout
- ❤️ **Like / unlike** posts with **optimistic UI updates** and rollback on failure
- 💬 **Comments** — post your own (2000-char limit) and delete ones you own
- 👀 **View counts** — tracked once per visit per article
- 🔗 **Share menu** — copy link, share to WhatsApp or X/Twitter
- 🌗 **Dark / light theme**, persisted to `localStorage` with no flash of unstyled content
- 🎨 Polished **skeleton shimmer loaders**, empty states, and error states everywhere

### For Writers & Admins

- 🔐 **Google sign-in** (OAuth 2.0 authorization-code flow with a `state` param to prevent CSRF)
- 📊 **Admin dashboard** — aggregate stats: total/published/draft posts, views, likes, comments
- ✍️ **Rich-text editor** (TipTap) with headings, lists, task lists, quotes, code blocks,
  text alignment, colors, highlighting, links, and images
- 🖼️ **Cover image & avatar uploads** — signed by the backend, uploaded directly to Cloudinary
- 🏷️ **Tags, slugs, drafts, and publishing toggle** for every post
- 🗂️ **Content manager** — list, edit, and delete any post with confirmation dialogs
- 👤 **Profile page** — update your username and avatar, or delete your account
- 🛡️ **Role-based access** — admin-only routes redirect unauthorized users automatically

### Technical Highlights

- **Layered backend** — route → controller → service → repository, one module per feature
- **JWT auth with Redis-backed refresh rotation** — 15-minute access tokens plus 7-day
  refresh tokens stored only as a **SHA-256 hash** in httpOnly, `sameSite`, `secure` cookies
- **Zod everywhere** — request validation on the server and typed/validated API responses on the client
- **Centralized error handling** — operational errors, Zod issues (422), Postgres unique
  violations (409), and malformed JSON (400) all map to consistent JSON payloads
- **Fail-fast environment validation** — the server refuses to boot on missing config
- **Security touches** — DOMPurify sanitization of stored HTML, base64 images disabled in the
  editor, `rel="noreferrer"` on outbound share links, and strict CORS with credentials
- **Performance** — route-level code splitting (`React.lazy`), React Compiler, direct-to-CDN
  uploads so the backend never touches binary data
- **Accessibility** — ARIA labels, `role="alert"` / `role="alertdialog"` modals, keyboard
  (Escape) + outside-click dismissal, and semantic markup
- **SEO** — Open Graph and Twitter card meta tags plus a 1200×630 social preview image

---

## Tech Stack

**Frontend**

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [TailwindCSS v4](https://tailwindcss.com/) (CSS-first config, custom `@theme` tokens)
- [React Router v8](https://reactrouter.com/)
- [TanStack React Query v5](https://tanstack.com/query) (server state)
- [Zustand v5](https://github.com/pmndrs/zustand) (auth store, persisted)
- [TipTap v3](https://tiptap.dev/) (rich-text editor)
- [Motion](https://motion.dev/) (animations)
- [DOMPurify](https://github.com/cure53/DOMPurify) (HTML sanitization)
- [Zod v4](https://zod.dev/) (schema validation)

**Backend**

- [Bun](https://bun.sh/) (runtime & bundler)
- [Hono v4](https://hono.dev/) (web framework)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Drizzle ORM](https://orm.drizzle.team/) + [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) (migrations)
- [Zod v4](https://zod.dev/) + [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator)
- [hono/jwt](https://hono.dev/docs/helpers/jwt) (JWT, HS256)

**Data & services**

- [Neon](https://neon.tech/) — serverless PostgreSQL
- [Redis](https://redis.io/) — refresh-token store (via `ioredis`)
- [Cloudinary](https://cloudinary.com/) — image hosting with signed uploads
- [Google Cloud](https://cloud.google.com/identity) — OAuth 2.0 identity (`google-auth-library`)

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Browser (SPA)                              │
│  React 19 + React Router + React Query + Zustand + TailwindCSS v4       │
└───────────────────────────┬────────────────────────────────────────────┘
                            │ fetch, credentials: 'include'
                            │ Bearer <access-token>
                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Backend (Bun + Hono)                           │
│                                                                         │
│  Middleware:  cors → errorHandler (global) → requireAuth (per route)    │
│  Modules:     users · blogs · blog-likes · blog-comments · uploads      │
│  Layers:      route → controller → service → repository → drizzle       │
└──────┬───────────────────────┬───────────────────────┬───────────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
  ┌─────────┐          ┌──────────────┐        ┌───────────────┐
  │  Neon   │          │    Redis     │        │  Cloudinary   │
  │ Postgres│          │ refresh-token│        │   (images)    │
  │         │          │   hashes     │        │               │
  └─────────┘          └──────────────┘        └───────────────┘
                            ▲
                            │ Google OAuth 2.0 (IdP)
                   ┌────────────────────┐
                   │  Google Cloud      │
                   │  Identity Platform │
                   └────────────────────┘
```

**Request lifecycle (example: creating a post)**

1. `POST /api/v1/blogs` hits `blogs.route.ts`
2. `requireAuth` verifies the Bearer JWT and loads `{ id, role }` onto the Hono context
3. `zValidator` runs `createBlogSchema` (strict) against the JSON body
4. `blogs.controller` slugifies the title and delegates to `blogs.service`
5. `blogs.service` enforces the **admin-only** check, then calls `blogs.repository`
6. `blogs.repository` inserts the row via Drizzle into Neon Postgres
7. Any thrown `AppError` / `ZodError` is normalized by the global `errorHandler`

**Auth flow**

1. The client redirects to Google with a random `state` value stored in `sessionStorage`
2. Google redirects back with an authorization `code`
3. The client sends `{ code }` to `POST /api/v1/users/auth/google`
4. The server exchanges the code, verifies the ID token, and find-or-creates the user
5. An **access token (15 min)** is returned in the body; a **refresh token (7 d)** is set as
   an httpOnly cookie, and only its **SHA-256 hash** is stored in Redis
6. On load, the client silently refreshes via `POST /api/v1/users/refresh` (cookie)

---

## Project Structure

```
Inkwell/
├── backend/
│   ├── migrations/                # Drizzle Kit SQL migrations
│   ├── src/
│   │   ├── config/                # env (Zod), cors, redis, google, cloudinary
│   │   ├── db/                    # drizzle client + schema.ts (tables/relations)
│   │   ├── middleware/            # requireAuth, global errorHandler
│   │   ├── modules/
│   │   │   ├── users/             # auth, profile, refresh, logout
│   │   │   ├── blogs/             # CRUD, dashboard, admin listing
│   │   │   ├── blog_likes/        # like toggle + status
│   │   │   ├── blog-comments/     # comments + moderation
│   │   │   └── uploads/           # Cloudinary signed upload params
│   │   ├── types/hono.d.ts        # Context augmentation (user: { id, role })
│   │   ├── utils/                 # AppError, JWT sign/verify helpers
│   │   └── index.ts               # app bootstrap + route mounting
│   ├── drizzle.config.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/                    # favicon.svg, og-image.svg, icons sprite
│   ├── src/
│   │   ├── components/            # brand-logo, theme-toggle, theme init
│   │   ├── features/
│   │   │   ├── auth/              # api, components, useAuth hook, store, schemas
│   │   │   └── blogs/             # api, components (home, list, detail,
│   │   │                          #        editor, admin pages), types
│   │   ├── lib/api.ts             # fetch client with Zod-validated responses
│   │   ├── styles/globals.css     # Tailwind v4 @theme tokens + custom CSS
│   │   ├── App.tsx                # BrowserRouter + lazy routes
│   │   └── main.tsx               # QueryClientProvider + theme bootstrap
│   ├── index.html                 # SEO meta, OG/Twitter tags
│   ├── vite.config.ts             # tailwindcss + react + babel(reactCompiler)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

The frontend uses a **feature-sliced** layout: each feature (`auth`, `blogs`) is
self-contained with its own `api/`, `components/`, `hooks/`, `store/`, and `schemas`.
Shared, app-wide code lives in `lib/`, `components/`, and `styles/`.

---

## Prerequisites

Make sure the following are installed and set up before you begin:

| Requirement                | Version / Notes                              |
| -------------------------- | -------------------------------------------- |
| [Node.js](https://nodejs.org/) | ≥ 20 (for tooling)                        |
| [Bun](https://bun.sh/)     | ≥ 1.4 (backend runtime & package manager)    |
| A code editor              | [VS Code](https://code.visualstudio.com/) recommended |
| A terminal                 | with `git`, `curl`                           |

You will also need free-tier accounts for the external services:

- **[Neon](https://neon.tech/)** — create a project and copy the `DATABASE_URL`
- **[Redis](https://redis.io/)** — any instance (e.g. [Upstash](https://upstash.com/)); copy the `REDIS_URL`
- **[Cloudinary](https://cloudinary.com/)** — copy your cloud name, API key, and API secret
- **[Google Cloud Console](https://console.cloud.google.com/)** — create an OAuth 2.0
  **Web application** client ID to get `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
  set an authorized **redirect URI**

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Anos714/Inkwell.git
cd Inkwell
```

### 2. Set up the database & Redis

Create a Neon Postgres project and a Redis instance, then keep both connection strings
handy — you'll add them to the backend `.env` in [step 4](#4-run-the-backend).

Apply the existing migrations (recommended) or generate fresh ones from the schema:

```bash
cd backend
bun install
bun run db:migrate     # apply existing migrations in ./migrations
# or
bun run db:generate    # generate a new migration from src/db/schema.ts
```

> **Tip — promoting a user to admin:** authentication is Google-only, and roles default
> to `user`. To unlock the admin workspace, promote your account in Postgres:
>
> ```sql
> UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
> ```

### 3. Configure external services

**Google OAuth (Cloud Console)**

1. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**
2. Choose **Web application**
3. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/api/auth/google/callback` (development)
   - your production callback URL (e.g. `https://inkwell-0tx.pages.dev/api/auth/google/callback`)
4. Copy the **Client ID** and **Client secret**

**Cloudinary**

1. Create an account (or use the programmable media demo environment)
2. Copy your **Cloud name**, **API Key**, and **API Secret** from the dashboard

### 4. Run the backend

```bash
cd backend
cp .env.example .env          # then fill in the values (see below)
bun install
bun run dev                   # watch mode on http://localhost:8000
```

Verify it is alive:

```bash
curl http://localhost:8000/ping
# { "success": true, "message": "pong" }
```

Fill `backend/.env` with the values from [Environment Variables](#environment-variables).
If any required variable is missing, the server prints a structured error and exits.

### 5. Run the frontend

```bash
cd frontend
cp .env.example .env          # then fill in the values (see below)
bun install
bun run dev                   # Vite dev server on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173), sign in with Google, and start
exploring. 🎉

---

## Environment Variables

### Backend (`backend/.env`)

> The committed `backend/.env.example` is intentionally a stub — copy it and fill in every
> value below. All variables are **validated with Zod at startup**; the process exits with
> a clear error tree if any are missing or malformed.

| Variable                     | Required | Example / Default                              | Purpose                                        |
| ---------------------------- | :------: | ---------------------------------------------- | ---------------------------------------------- |
| `PORT`                       |    no    | `8000`                                         | Server port                                    |
| `BUN_ENV`                    |    no    | `development`                                   | `development` \| `production` \| `test` (CORS/cookies) |
| `DATABASE_URL`               |   yes    | `postgresql://user:pass@host/db?sslmode=require` | Neon Postgres connection string               |
| `REDIS_URL`                  |   yes    | `red://default:pass@host:6379`                 | Redis (refresh-token store)                    |
| `ACCESS_TOKEN_SECRET_KEY`    |   yes    | _random 32+ char string_                        | JWT access-token signing secret (15 min)       |
| `REFRESH_TOKEN_SECRET_KEY`   |   yes    | _random 32+ char string_                        | JWT refresh-token signing secret (7 days)      |
| `FRONTEND_URL`               |   yes    | `http://localhost:5173`                         | Allowed CORS origin in production              |
| `GOOGLE_CLIENT_ID`           |   yes    | `xxxx.apps.googleusercontent.com`              | Google OAuth client ID + IdToken audience      |
| `GOOGLE_CLIENT_SECRET`       |   yes    | `GOCSPX-xxxx`                                   | Google OAuth client secret                     |
| `GOOGLE_REDIRECT_URI`        |   yes    | `http://localhost:5173/api/auth/google/callback` | Must match the Google Console redirect URI    |
| `CLOUDINARY_CLOUD_NAME`      |   yes    | `your-cloud`                                    | Cloudinary cloud name                           |
| `CLOUDINARY_API_KEY`         |   yes    | `123456789012345`                              | Cloudinary API key (sent to client for uploads)|
| `CLOUDINARY_API_SECRET`      |   yes    | `xxxx`                                          | Cloudinary secret (server-side signing only)   |

Generate strong secrets with:

```bash
openssl rand -base64 48
```

### Frontend (`frontend/.env`)

| Variable                   | Required | Example / Default                                        | Purpose                          |
| -------------------------- | :------: | -------------------------------------------------------- | -------------------------------- |
| `VITE_API_URL`             |   yes    | `http://localhost:8000`                                  | Base URL of the backend API      |
| `VITE_GOOGLE_CLIENT_ID`    |   yes    | `xxxx.apps.googleusercontent.com`                        | Google OAuth client ID           |
| `VITE_GOOGLE_REDIRECT_URI` |   no     | `${window.location.origin}/api/auth/google/callback`     | OAuth redirect URI (fallback used if unset) |

---

## Available Scripts

### Backend (`cd backend`)

| Script          | Command            | Description                                        |
| --------------- | ------------------ | -------------------------------------------------- |
| `bun run dev`   | `bun --watch`      | Start the dev server with hot reloading            |
| `bun run start` | —                  | Start the production server                        |
| `bun run build` | —                  | Typecheck + bundle to `./dist`                     |
| `bun run typecheck` | `tsc --noEmit`  | Strict type checking                                |
| `bun run lint`  | `eslint`           | Lint `src/**/*.ts`                                  |
| `bun run db:generate` | drizzle-kit    | Generate a migration from `src/db/schema.ts`       |
| `bun run db:migrate`  | drizzle-kit    | Apply pending migrations                            |

### Frontend (`cd frontend`)

| Script         | Command            | Description                                        |
| -------------- | ------------------ | -------------------------------------------------- |
| `bun run dev`  | `vite`             | Start the Vite dev server                          |
| `bun run build`| `tsc -b && vite build` | Typecheck + production build to `./dist`       |
| `bun run preview` | `vite preview`   | Preview the production build locally               |
| `bun run lint` | `eslint .`         | Lint the codebase                                  |

---

## API Reference

Base URL: `http://localhost:8000` · API prefix: `/api/v1` · Auth: `Authorization: Bearer <token>`

### Health

| Method | Endpoint | Auth | Description                       |
| ------ | -------- | :--: | --------------------------------- |
| `GET`  | `/ping`  | —    | Health check → `{ message: "pong" }` |

### Users — `/api/v1/users`

| Method   | Endpoint                | Auth   | Description                                                        |
| -------- | ----------------------- | :----: | ------------------------------------------------------------------ |
| `POST`   | `/users/auth/google`    | —      | Google OAuth login/signup (accepts `{ code }`), issues tokens       |
| `POST`   | `/users/refresh`        | —      | Exchange the refresh cookie for a new access token                 |
| `GET`    | `/users/me`             | ✅     | Current authenticated user                                         |
| `PATCH`  | `/users/me`             | ✅     | Update profile (username, uniqueness-checked)                      |
| `PATCH`  | `/users/me/avatar`      | ✅     | Set avatar URL                                                     |
| `DELETE` | `/users/me`             | ✅     | Delete own account (cascades to likes & comments)                  |
| `POST`   | `/users/logout`         | ✅     | Revoke refresh token & clear cookie                                |

### Blogs — `/api/v1/blogs`

| Method   | Endpoint               | Auth      | Description                                                  |
| -------- | ---------------------- | :-------: | ------------------------------------------------------------ |
| `GET`    | `/blogs`               | —         | List published blogs (`?page&limit&search`)                  |
| `GET`    | `/blogs/:slug`         | —         | Get a published blog by slug (+ likes count)                 |
| `POST`   | `/blogs/:slug/views`   | —         | Increment the view counter (published only, atomic)          |
| `POST`   | `/blogs`               | ✅ admin  | Create a blog (slug auto-generated)                           |
| `PATCH`  | `/blogs/:blogId`       | ✅ admin  | Update a blog (any subset of fields)                          |
| `DELETE` | `/blogs/:blogId`       | ✅ admin  | Delete a blog                                                 |
| `GET`    | `/blogs/dashboard`     | ✅ admin  | Aggregate stats (blogs, published, drafts, views, likes, comments) |
| `GET`    | `/blogs/admin`         | ✅ admin  | List **all** blogs including drafts                            |
| `GET`    | `/blogs/admin/:slug`   | ✅ admin  | Get any blog by slug including drafts                          |

### Likes — `/api/v1/blog-likes`

| Method | Endpoint                  | Auth | Description                                             |
| ------ | ------------------------- | :--: | ------------------------------------------------------- |
| `POST` | `/blog-likes/:blogId/like`| ✅   | Toggle like → `201` liked / `200` unliked + `totalLikes` |
| `GET`  | `/blog-likes/:id/like-status` | ✅ | Current user's like status + total likes                |

### Comments — `/api/v1/blog-comments`

| Method   | Endpoint                          | Auth     | Description                                    |
| -------- | --------------------------------- | :------: | ---------------------------------------------- |
| `POST`   | `/blog-comments/:blogId/comments` | ✅       | Create a comment                               |
| `GET`    | `/blog-comments/:blogId/comments` | —        | List comments (with author username & avatar)  |
| `DELETE` | `/blog-comments/comments/:commentId` | ✅    | Delete a comment (owner **or** admin)          |

### Uploads — `/api/v1/uploads`

| Method | Endpoint                    | Auth     | Description                                              |
| ------ | --------------------------- | :------: | -------------------------------------------------------- |
| `GET`  | `/uploads/signature?type=`  | ✅       | Cloudinary signed upload params. `type`: `blogCover` (5 MB, admin) or `avatar` (2 MB) |

**Error format** — all errors return a consistent JSON payload:

```json
{
  "success": false,
  "message": "Validation failed",
  "issues": [{ "path": ["title"], "message": "Title is required" }]
}
```

Common status codes: `400` bad request, `401` unauthorized, `403` forbidden (admin-only),
`404` not found, `409` conflict (unique violation), `422` validation error, `500` server error.

---

## Database Schema

PostgreSQL (Neon), managed with Drizzle ORM. All IDs are `uuid` (`uuidv7`); all
timestamps are `timestamptz`. `role` is a Postgres enum: `user` | `admin`.

```text
users
├── id            uuid PK (uuidv7)
├── username      varchar(100) UNIQUE NOT NULL
├── email         varchar(255) UNIQUE NOT NULL
├── avatar_url    text
├── google_id     text UNIQUE NOT NULL
├── role          role enum DEFAULT 'user'
├── created_at    timestamptz NOT NULL
└── updated_at    timestamptz NOT NULL

blogs
├── id            uuid PK (uuidv7)
├── title         varchar(255) NOT NULL
├── slug          varchar(255) UNIQUE NOT NULL
├── description   text
├── content       jsonb NOT NULL          -- rich-text editor HTML
├── cover_image   text
├── tags          text[] NOT NULL DEFAULT '{}'
├── is_published  boolean NOT NULL DEFAULT false
├── published_at  timestamptz
├── views         integer NOT NULL DEFAULT 0
├── created_at    timestamptz NOT NULL
└── updated_at    timestamptz NOT NULL

blog_likes                        -- composite PK, both FKs ON DELETE CASCADE
├── user_id       uuid FK → users.id
├── blog_id       uuid FK → blogs.id
└── created_at    timestamptz NOT NULL

blog_comments
├── id            uuid PK (uuidv7)
├── blog_id       uuid FK → blogs.id  ON DELETE CASCADE
├── user_id       uuid FK → users.id  ON DELETE CASCADE
├── content       text NOT NULL
├── created_at    timestamptz NOT NULL
└── updated_at    timestamptz NOT NULL
```

**Relations:** one user → many likes & comments; one blog → many likes & comments.

---

## Deployment

The project is designed to deploy the two apps independently.

**Frontend (Cloudflare Pages)** — the live demo runs at
[inkwell-0tx.pages.dev](https://inkwell-blogs.pages.dev/).

- Build command: `bun run build`
- Output directory: `frontend/dist`
- Environment variables: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`
- Add a SPA fallback so client-side routes resolve to `index.html` (Pages does this
  automatically when there is no matching static asset)

**Backend** — any runtime that supports Bun (or the compiled bundle):

- Build with `bun run build` (emits `backend/dist`), or run `bun run start`
- Set all [backend environment variables](#environment-variables) in the host's secret store
- Ensure `FRONTEND_URL` points to your deployed frontend so CORS and cookies work
- Keep the `/api/auth/google/callback` redirect URI consistent between the client,
  the server, and the Google Cloud Console

> Cookies: in production the refresh cookie is `httpOnly`, `secure`, and
> `sameSite=none`, so the API must be served over **HTTPS** for credentials to be sent.

---

## Roadmap

Ideas for future work (not yet implemented):

- [ ] Rate limiting / request throttling
- [ ] Full-text search (Postgres `tsvector`) instead of `ilike`
- [ ] Email notifications & newsletter signup
- [ ] Draft previews and scheduling
- [ ] Reading list / bookmarks
- [ ] richer author profiles and bios
- [ ] Automated test suite (unit + integration)
- [ ] Analytics dashboard with charts

---

## Contributing

Contributions are welcome! Please follow this workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
   (e.g. `feat(blogs): add bookmarks`) — this repo follows that style
4. Make sure linting and typechecking pass:
   ```bash
   cd backend  && bun run lint && bun run typecheck
   cd ../frontend && bun run lint
   ```
5. Open a Pull Request describing your changes

---

## License

This project is open source and released under the **MIT License** — see the
[`LICENSE`](LICENSE) file for details. A permissive license means you're free to
learn from, fork, and adapt this project for your own use.

---

<p align="center">
  Built with ☕ &amp; <a href="https://bun.sh/">Bun</a> + <a href="https://react.dev/">React</a>.
  <br/>
  <a href="https://github.com/Anos714/Inkwell">⭐ Star the repo</a> if you like it!
</p>
