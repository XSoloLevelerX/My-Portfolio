# Amartya's Universe — portfolio

A Netflix-style catalogue of my work. Browse projects like titles: a billboard hero,
shelves that surface what is new and what is getting attention, and a detail view per project.

**Stack** — Angular (frontend) · Spring Boot (API) · Supabase Postgres (data).

```
frontend/  Angular 22, standalone components + signals, zoneless
backend/   Spring Boot, Maven, Java 21 target        (Phase 2)
```

## Running the frontend

```bash
cd frontend
npm install
npm start          # http://localhost:4200
```

## The static-first rule

`frontend/src/app/data/projects.snapshot.json` is baked into the bundle, so the site renders
completely **before any network call** — with the backend cold and the database paused. The API
only enriches it (live view counts, trending order). If the API never answers, the static content
simply stays.

Render's free tier sleeps after 15 minutes and Supabase pauses when idle, so this is not a
nicety: it is the only reason the site is always fast. **A portfolio that looks broken is worse
than one that is slightly stale.**

Acceptance test: kill the backend, reload the page, everything still renders.

## Adding a project

One object in the snapshot (and one row in `projects` once the DB is live). No layout work:

```jsonc
{
  "slug": "my-project",
  "title": "My Project",
  "tagline": "One line, shown on the card.",
  "description": "Long copy for the detail modal.",
  "domain": "AI",            // AI | SECURITY | GRAPHICS | SYSTEMS | ML | WEB
  "stack": ["TypeScript"],
  "liveUrl": null,           // set this when you deploy — it enables the Play button
  "repoUrl": null,
  "status": "WIP",           // LIVE once liveUrl works
  "featured": false,
  "complexity": 2,           // 1..3 → SDE-1 / SDE-2 / SDE-3 badge
  "releasedAt": "2026-08-19"
}
```

Only projects with a working `liveUrl` get a **Play** button — there are never dead buttons.

## The intro

A five-phase title sequence: bars sweep down, converge into an **A**, the crossbar wipes
(the sting lands here), the roles unfold, and the mark **docks into the navbar logo** — so the
logo you keep seeing is the object you watched assemble.

- Plays silently; sound arms on first interaction (browsers block autoplay audio).
- The sting is synthesised with WebAudio — no audio file, no licensing exposure.
- Once per session (`sessionStorage`), skippable, and `prefers-reduced-motion` gets a static card.

## Status

- [x] Phase 1 — intro, navbar, billboard, static catalogue
- [x] Phase 2a — Supabase schema, RLS, trending function, 18 projects seeded
- [ ] Phase 2b — Spring Boot API
- [ ] Phase 3 — shelves, hover preview, detail modal, engagement tracking
- [ ] Phase 4 — skills, certifications, blog, about, contact
- [ ] Phase 5 — deploy

## Database

Supabase project **My Portfolio** (`joxllpydilnextdlxzhj`, ap-southeast-2, Postgres 17).
Migrations live in `backend/src/main/resources/db/migration/` and match what is applied.

Eight tables: `projects`, `project_events`, `project_daily_stats`, `skills`,
`certifications`, `blog_posts`, `profile`, `contact_messages`.

**Access posture** — RLS is on everywhere:

| Role | Can |
| --- | --- |
| `anon` (the browser) | read non-archived projects, skills, certifications, published posts, profile |
| `anon` | append contact messages and engagement events — never read them back |
| `service_role` (Spring Boot) | everything, plus the maintenance functions |

The maintenance functions (`recompute_trending_scores`, `rollup_daily_stats`) are
`service_role` only. They were briefly reachable over the public REST API as
`SECURITY DEFINER` functions — the database linter caught it and `V4` revokes those grants.

Credentials go in `.env` (gitignored); `.env.example` lists what is needed.
