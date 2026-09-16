# 🖥️ Inkwell Backend

The REST API powering [Inkwell](https://inkwell-0tx.pages.dev/) — a full-stack blogging
platform. Built with **Bun** and **Hono**, backed by **Neon Postgres** via **Drizzle ORM**,
with **Redis** for refresh-token storage, **Google OAuth 2.0** for identity, and
**Cloudinary** for image hosting.

Part of the [Inkwell monorepo](https://github.com/Anos714/Inkwell) — the consumer SPA lives
in [`../frontend`](../frontend). See the root [`README.md`](../README.md) for the big picture.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [Authentication & Security](#authentication--security)
- [Middlewares](#middlewares)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)

---

## Tech Stack

| Concern              | Choice                                              |
| -------------------- | --------------------------------------------------- |
| Runtime & bundler    | [Bun](https://bun.sh/)                              |
| Web framework        | [Hono v4](https://hono.dev/)                        |
| Language             | [TypeScript](https://www.typescriptlang.org/) (strict) |
| ORM + migrations     | [Drizzle ORM](https://orm.drizzle.team/) + Drizzle Kit |
| Database             | [Neon](https://neon.tech/) serverless PostgreSQL    |
| Cache / token store  | [Redis](https://redis.io/) via [ioredis](https://github.com/redis/ioredis) |
| Auth                 | [hono/jwt](https://hono.dev/docs/helpers/jwt) + [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) |
| Validation           | [Zod v4](https://zod.dev/) + [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator) |
| Images               | [Cloudinary](https://cloudinary.com/) v2 (signed uploads) |
| Slugs                | [slugify](https://github.com/simov/slugify)         |
| Linting              | ESLint 9 (flat config) + typescript-eslint          |

---

## Architecture

The backend follows a **layered, module-per-feature** architecture:

```
HTTP request
   │
   ▼
route ──► zValidator (Zod schema) ──► controller ──► service ──► repository ──► drizzle ──► Postgres
                                          │              │
                                          │              └── Redis (refresh tokens)
                                          └── AppError thrown on failure → global errorHandler
```

- **`route`** — declares the endpoint, wires validation, and applies `requireAuth`
- **`controller`** — HTTP translation: parses params, calls services, shapes responses
- **`service`** — business rules and authorization (e.g. admin checks)
- **`repository`** — data access; the only layer that touches Drizzle/Postgres

Every module is fully self-contained and exports a single Hono router that `index.ts`
mounts under the versioned prefix `/api/v1`.

---

## Project Structure

```
backend/
├── migrations/                    # Drizzle Kit migration files (SQL + snapshots)
├── src/
│   ├── config/
│   │   ├── env.ts                 # Zod-validated env (fail-fast at boot)
│   │   ├── cors.ts                # CORS options (origin from FRONTEND_URL)
│   │   ├── redis.ts               # ioredis client
│   │   ├── google.ts              # OAuth2Client instance
│   │   └── cloudinary.ts          # cloudinary.v2 config
│   ├── db/
│   │   ├── db.ts                  # drizzle({ client: neon(DATABASE_URL) })
│   │   └── schema.ts              # tables, relations, role enum
│   ├── middleware/
│   │   ├── auth.middleware.ts     # requireAuth — verifies Bearer access JWT
│   │   └── error.middleware.ts    # global errorHandler (+ unused notFoundHandler)
│   ├── modules/
│   │   ├── users/                 # OAuth, refresh, profile, logout
│   │   │   └── users.{route,controller,service,repository,schema,types}.ts
│   │   ├── blogs/                 # CRUD, dashboard, admin listing
│   │   │   └── blogs.{route,controller,service,repository,schema,types}.ts
│   │   ├── blog_likes/            # like toggle + status
│   │   │   └── blog-likes.{route,controller,service,repository}.ts
│   │   ├── blog-comments/         # comments + owner/admin moderation
│   │   │   └── blog-comments.{route,controller,service,repository,schema,type}.ts
│   │   └── uploads/               # Cloudinary signed upload params
│   │       └── uploads.{route,controller,type}.ts
│   ├── types/
│   │   └── hono.d.ts              # augments Context with `user: { id, role }`
│   ├── utils/
│   │   ├── AppError.ts            # operational error class + static factories
│   │   └── auth.ts                # JWT sign/verify + refresh-token hashing
│   └── index.ts                   # bootstrap: CORS, errorHandler, /ping, route mounting
├── drizzle.config.ts
├── eslint.config.mjs
├── tsconfig.json                  # very strict (noUnusedLocals, noUncheckedIndexedAccess…)
├── .env.example
└── package.json
```

> Admin features are enforced inside the `blogs` **service** (`IsAdmin(userId)` checks)
> rather than a separate admin module — there is no `admin/` folder by design.

---

## Prerequisites

- [Bun](https://bun.sh/) **≥ 1.4** installed globally
- A [Neon](https://neon.tech/) Postgres project (connection string)
- A Redis instance — e.g. [Upstash](https://upstash.com/) (connection string)
- A [Cloudinary](https://cloudinary.com/) account (cloud name, API key, API secret)
- A [Google Cloud](https://console.cloud.google.com/) OAuth 2.0 **Web application** credential

---

## Getting Started

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env
#   ↑ fill in every value — see "Environment Variables" below.
#     The server refuses to boot on missing/invalid config.

# 3. Apply database migrations
bun run db:migrate

# 4. Start the dev server (watch mode)
bun run dev
```

The API now listens on **http://localhost:8000** (override with `PORT`).

Verify it is running:

```bash
curl http://localhost:8000/ping
# { "success": true, "message": "pong" }
```

All routes are mounted under **`/api/v1`**.

---

## Environment Variables

`config/env.ts` validates the environment with Zod **at import time**. If anything is
missing or malformed, the process prints a structured error tree and exits with code `1`.

| Variable                    | Req. | Example / Default                                | Purpose                                           |
| --------------------------- | :--: | ------------------------------------------------ | ------------------------------------------------- |
| `PORT`                      |  no  | `8000`                                           | Server port                                        |
| `BUN_ENV`                   |  no  | `development`                                    | `development` \| `production` \| `test` (CORS & cookie behavior) |
| `DATABASE_URL`              | yes  | `postgresql://user:pass@host/db?sslmode=require` | Neon Postgres connection string                    |
| `REDIS_URL`                 | yes  | `rediss://default:pass@host:6379`                | Redis connection string (refresh-token store)      |
| `ACCESS_TOKEN_SECRET_KEY`   | yes  | _random 32+ char string_                          | Signs access tokens (15 min, HS256)                |
| `REFRESH_TOKEN_SECRET_KEY`  | yes  | _random 32+ char string_                          | Signs refresh tokens (7 days, HS256)               |
| `FRONTEND_URL`              | yes  | `http://localhost:5173`                           | Allowed CORS origin in production                  |
| `GOOGLE_CLIENT_ID`          | yes  | `xxxx.apps.googleusercontent.com`                | OAuth client ID; also the verified IdToken audience |
| `GOOGLE_CLIENT_SECRET`      | yes  | `GOCSPX-xxxx`                                     | OAuth client secret                                |
| `GOOGLE_REDIRECT_URI`       | yes  | `http://localhost:5173/api/auth/google/callback`  | Must match a Google Console authorized redirect URI |
| `CLOUDINARY_CLOUD_NAME`     | yes  | `your-cloud`                                      | Cloudinary cloud name                              |
| `CLOUDINARY_API_KEY`        | yes  | `123456789012345`                                 | Returned to clients for signed uploads             |
| `CLOUDINARY_API_SECRET`     | yes  | `xxxx`                                            | Server-side signing only — never expose to clients |

Generate strong JWT secrets:

```bash
openssl rand -base64 48
```

> **Note:** the committed `.env.example` is a stub — copy it and populate all values.

---

## Database & Migrations

The schema lives in a single source of truth: [`src/db/schema.ts`](src/db/schema.ts).
Drizzle Kit generates idempotent migration files into `./migrations`.

```bash
bun run db:generate    # generate a new migration after editing schema.ts
bun run db:migrate     # apply pending migrations
```

Four migrations ship with the repo:

1. Create `users` (with a non-null `avatar_url` default `''`)
2. Create the `role` enum + `blogs` table; add `users.role`
3. Create `blog_comments` & `blog_likes` (composite PK) with `ON DELETE CASCADE` FKs
4. Make `users.avatar_url` nullable and drop its default

**Schema at a glance** (all IDs are `uuid`/`uuidv7`, timestamps are `timestamptz`):

```text
users          id · username (uniq) · email (uniq) · avatar_url · google_id (uniq) · role · created_at · updated_at
blogs          id · title · slug (uniq) · description · content (jsonb) · cover_image · tags (text[]) ·
                is_published · published_at · views · created_at · updated_at
blog_likes     user_id (FK) · blog_id (FK) · created_at          -- composite PK, both FKs CASCADE
blog_comments  id · blog_id (FK) · user_id (FK) · content · created_at · updated_at
```

**Promote a user to admin** (auth is Google-only, so roles can't be self-assigned):

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

---

## Authentication & Security

The only identity provider is **Google OAuth 2.0** (authorization-code flow); there are no
passwords or email/password endpoints.

**Login flow**

1. Client sends `POST /api/v1/users/auth/google` with `{ code }`
2. Server exchanges the code with Google and `verifyIdToken` against `GOOGLE_CLIENT_ID`
3. The user is **find-or-created** by email (googleId & avatar synced on change;
   username collisions are de-duplicated with the Google `sub` suffix)
4. Tokens are issued:
   - **Access token** — 15 min, HS256, payload `{ id, role, type: "access" }`, returned in
     the response body; the client sends it as `Authorization: Bearer <token>`
   - **Refresh token** — 7 days, payload `{ id, type: "refresh" }`, set as an
     **httpOnly, secure (prod), sameSite=none (prod) / lax (dev)** cookie
5. Only the **SHA-256 hash** of the refresh token is stored in Redis under
   `refresh:{userId}` with a 7-day TTL — the raw token never touches the store

**Refresh & logout**

- `POST /users/refresh` compares the cookie's hash against Redis; on **mismatch the key is
  deleted** (revoke-on-reuse). On success a fresh access token is returned.
- `POST /users/logout` deletes the Redis key and clears the cookie.

**Role-based access control**

`role` is a Postgres enum (`user` | `admin`). `requireAuth` loads `{ id, role }` onto the
Hono context; services then enforce:

- Blog create / update / delete, dashboard stats, and admin listings → **admin only**
- `blogCover` upload signatures → **admin only** (`Forbidden` otherwise)
- Comment deletion → **comment owner _or_ any admin**

**Other security touches**

- All request bodies validated with **`.strict()` Zod schemas** (unknown keys rejected)
- CORS locked to `FRONTEND_URL` in production, `credentials: true`
- Cloudinary upload payloads are **server-signed**; the binary goes straight from the
  browser to Cloudinary — the API never receives image data
- Stack traces and original errors are only surfaced outside production

---

## Middlewares

| Middleware                     | File                       | Behavior                                                              |
| ------------------------------ | -------------------------- | --------------------------------------------------------------------- |
| `cors(corsConfig)` (global)    | `config/cors.ts`           | Origin = `FRONTEND_URL` (prod) or `http://localhost:5173` (dev); methods GET/POST/PUT/DELETE/OPTIONS; `credentials: true`; `maxAge: 86400` |
| `errorHandler` (`app.onError`) | `middleware/error.middleware.ts` | Normalizes `AppError`, `ZodError` (422), Postgres `23505` (409), and JSON `SyntaxError` (400) into JSON |
| `requireAuth` (per route)      | `middleware/auth.middleware.ts` | Verifies the Bearer token, requires `type === "access"`, sets `c.var.user` |
| `zValidator` (per route)       | `@hono/zod-validator`      | Runs the route's Zod schema; failures throw into the global handler   |

---

## API Reference

Base URL: `http://localhost:8000` · Prefix: `/api/v1` · Auth: `Authorization: Bearer <token>`

### Health

| Method | Endpoint | Auth | Description                         |
| ------ | -------- | :--: | ----------------------------------- |
| `GET`  | `/ping`  | —    | `{ success: true, message: "pong" }` |

### Users — `/api/v1/users`

| Method   | Endpoint               | Auth | Description                                                       |
| -------- | ---------------------- | :--: | ----------------------------------------------------------------- |
| `POST`   | `/users/auth/google`   | —    | Google OAuth login/signup (`{ code }`); issues tokens + cookie      |
| `POST`   | `/users/refresh`       | —    | Exchange refresh cookie for a new access token                     |
| `GET`    | `/users/me`            | ✅   | Current authenticated user                                         |
| `PATCH`  | `/users/me`            | ✅   | Update profile (username, lowercased + uniqueness-checked)          |
| `PATCH`  | `/users/me/avatar`     | ✅   | Set avatar URL                                                     |
| `DELETE` | `/users/me`            | ✅   | Delete own account (cascades to likes & comments)                  |
| `POST`   | `/users/logout`        | ✅   | Revoke refresh token & clear cookie                                |

### Blogs — `/api/v1/blogs`

| Method   | Endpoint              | Auth     | Description                                                     |
| -------- | --------------------- | :------: | --------------------------------------------------------------- |
| `GET`    | `/blogs`              | —        | List published blogs (`?page&limit&search`, max limit 100)      |
| `GET`    | `/blogs/:slug`        | —        | Get a published blog by slug (+ likes count)                     |
| `POST`   | `/blogs/:slug/views`  | —        | Increment view counter (atomic SQL, published only)              |
| `POST`   | `/blogs`              | ✅ admin | Create a blog (slug auto-generated via `slugify`)                |
| `PATCH`  | `/blogs/:blogId`      | ✅ admin | Update a blog (≥ 1 field, `superRefine` validated)               |
| `DELETE` | `/blogs/:blogId`      | ✅ admin | Delete a blog                                                    |
| `GET`    | `/blogs/dashboard`    | ✅ admin | Aggregate stats (total/published/draft blogs, views, likes, comments) |
| `GET`    | `/blogs/admin`        | ✅ admin | List **all** blogs including drafts                              |
| `GET`    | `/blogs/admin/:slug`  | ✅ admin | Get any blog by slug including drafts                            |

### Likes — `/api/v1/blog-likes`

| Method | Endpoint                     | Auth | Description                                          |
| ------ | ---------------------------- | :--: | ---------------------------------------------------- |
| `POST` | `/blog-likes/:blogId/like`   | ✅   | Toggle like → `201` liked / `200` unliked + `totalLikes` |
| `GET`  | `/blog-likes/:id/like-status`| ✅   | Current user's like status + total likes             |

### Comments — `/api/v1/blog-comments`

| Method   | Endpoint                             | Auth  | Description                                   |
| -------- | ------------------------------------ | :---: | --------------------------------------------- |
| `POST`   | `/blog-comments/:blogId/comments`    | ✅    | Create a comment                               |
| `GET`    | `/blog-comments/:blogId/comments`    | —     | List comments (joined with username & avatar)  |
| `DELETE` | `/blog-comments/comments/:commentId` | ✅    | Delete a comment (owner **or** admin)          |

### Uploads — `/api/v1/uploads`

| Method | Endpoint                   | Auth     | Description                                                        |
| ------ | -------------------------- | :------: | ------------------------------------------------------------------ |
| `GET`  | `/uploads/signature?type=` | ✅       | Cloudinary signed params for direct client upload. `type`: `blogCover` (5 MB, admin) or `avatar` (2 MB) |

Response includes `{ timestamp, signature, apiKey, cloudName, folder, maxSize }`. The client
`POST`s the file directly to `https://api.cloudinary.com/v1_1/<cloud>/image/upload`.

---

## Error Handling

`utils/AppError.ts` is the operational error class. Static factories cover the full status
range: `BadRequest` (400), `Unauthorized` (401), `Forbidden` (403), `NotFound` (404),
`Conflict` (409), `ValidationError` (422), `TooManyRequests` (429), `InternalServerError` (500).

The global `errorHandler` (`app.onError`) converts everything into a consistent JSON shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "issues": [{ "path": ["title"], "message": "Title is required" }]
}
```

| Source                     | Status | Notes                                        |
| -------------------------- | :----: | -------------------------------------------- |
| `AppError`                 | varies | Uses its own `statusCode`                     |
| `ZodError`                 | `422`  | Per-field `issues`, including `unrecognized_keys` |
| Postgres `23505`           | `409`  | Unique violation → "record or email already exists" |
| JSON `SyntaxError`         | `400`  | Malformed request body                         |
| Anything else              | `500`  | `stack`/`originalError` included **only** outside production |

---

## Available Scripts

| Script              | Description                                        |
| ------------------- | -------------------------------------------------- |
| `bun run dev`       | Start the watch-mode dev server (`localhost:8000`)  |
| `bun run start`     | Start the production server                         |
| `bun run build`     | Typecheck + bundle `src/index.ts` → `./dist`        |
| `bun run typecheck` | `tsc --noEmit`                                      |
| `bun run lint`      | ESLint over `src/**/*.ts`                           |
| `bun run db:generate` | Generate a migration from `src/db/schema.ts`      |
| `bun run db:migrate`  | Apply pending migrations                          |

---

## Deployment

Any host that runs Bun (Railway, Render, Fly.io, a VPS, etc.) or a Node-compatible
runtime using the compiled bundle from `bun run build`.

- **Build:** `bun run build` → serve `./dist/index.js`, or just `bun run start`
- **Start command:** `bun run start` (or `bun run src/index.ts`)
- **Secrets:** set every variable from [Environment Variables](#environment-variables)
- **`FRONTEND_URL`** must point to the deployed frontend (CORS + cookie origin)
- **HTTPS is required** in production — the refresh cookie is `secure` + `sameSite=none`,
  so browsers will not send it over plain HTTP
- **`GOOGLE_REDIRECT_URI`** must match an authorized redirect URI in the Google Cloud Console
- **Redis** must be reachable; connection errors are logged by `config/redis.ts`

Health check for your deploy probe: `GET /ping`.

---

## Known Limitations

Honest gaps in the current implementation — good candidates for contributions:

- **No rate limiting** — `AppError.TooManyRequests` exists but nothing throttles requests yet
- **Redis is single-purpose** — used only for refresh tokens; no response caching layer
- **Google-only auth** — no password credentials, email/OTP, or email sending of any kind
- **`notFoundHandler` is defined but not registered** — unmatched routes use Hono's default 404
- **`updateProfileService` throws a raw `Error("Username already taken")`** instead of an
  `AppError`, which the global handler renders as a `500`
- **`updateGoogleAuthUser` overwrites the username** with the Google profile name
- **No automated tests** — no test framework or spec files are configured
- **`.env.example` is a stub** — see [Environment Variables](#environment-variables) for the full list
