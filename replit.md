# FlagIt — People Review App

## Overview

FlagIt is a full-stack anonymous people review app. Verified users can leave green flag (good) or red flag (bad) reviews with 1–5 star ratings about anyone. All reviews are anonymous to protect reviewers.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: bcryptjs + express-session + connect-pg-simple
- **Email**: nodemailer (logs to console if SMTP not configured)
- **Frontend**: React + Vite + Tailwind + shadcn/ui + React Query + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── pwa-app/            # React + Vite frontend (FlagIt)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks (with credentials: include)
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Database Schema

- **users** — email, password_hash, display_name, email_verified, is_mod, verification_token
- **people** — name, slug, description, review_count, good_count, bad_count, avg_rating
- **reviews** — person_id, reviewer_user_id, flag_type (good/bad), rating (1-5), text, report_count, removed
- **reports** — review_id, reporter_user_id, reason, details, status (pending/resolved/dismissed)
- **user_sessions** — auto-created by connect-pg-simple

## API Routes (all under /api)

- `GET /healthz` — health check
- `POST /auth/signup` — create account
- `POST /auth/login` — log in
- `POST /auth/logout` — log out
- `GET /auth/me` — get current user
- `POST /auth/verify-email` — verify email with token
- `POST /auth/resend-verification` — resend verification email
- `GET /people/search?q=` — search people
- `POST /people` — create person profile (verified users)
- `GET /people/:slug` — get person profile
- `GET /people/:slug/reviews` — get reviews for person
- `POST /people/:slug/reviews` — leave review (verified users)
- `POST /reviews/:id/report` — report a review (authenticated users)
- `GET /feed` — recent reviews feed
- `GET /moderation/reports` — get flagged reports (mods only)
- `PUT /moderation/reports/:id` — resolve/dismiss report (mods only)

## Frontend Pages

- `/` — Home: hero search + recent activity feed
- `/search?q=` — Search results
- `/person/:slug` — Person profile with rating summary + all reviews
- `/person/new` — Create a new person profile
- `/login` — Login
- `/signup` — Sign up
- `/verify-email?token=` — Email verification
- `/mod` — Mod dashboard (mods only)

## Key Features

- **Anonymous reviews** — no reviewer identity shown
- **Email verification gate** — must verify to post reviews
- **Green/Red flags** — visual flag system on every review
- **Star ratings** — 1–5 stars
- **Report system** — anyone can report a review
- **Mod dashboard** — mods can resolve/dismiss reports and remove reviews
- **Community guidelines** — safety-first design

## Email Setup

By default, verification links are logged to the API server console (no SMTP needed for development). To enable real email sending, set:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Making a User a Mod

Run SQL directly: `UPDATE users SET is_mod = true WHERE email = 'email@example.com';`
