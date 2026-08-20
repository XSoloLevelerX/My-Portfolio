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

Four beats: the **A** rides forward at centre, the rest of AMARTYA unfurls out of the
depth and pushes the A leftward, the wordmark holds, then the camera dives into the R's
stem through a wall of colour bars and lands on the profile picker.

**Audio sync.** `intro-sting.mp3` is silent for its first 300ms and peaks at 0.30s, so
playback starts 300ms *before* the beat it should land on. The anchor is the moment the
wordmark completes — `GROW_AT + LETTER_STAGGER * 6 + LETTER_TRANSITION`, derived from the
same constants the CSS uses rather than hard-coded, so retiming the cascade cannot desync
it. Measured drift: **9ms**. The 2.5s decay then carries through the hold and into the dive.

- Sound is on by default. Chrome refuses unmuted autoplay on a cold visit
  (`NotAllowedError`), so the element is primed muted and unmuted at the beat; if that is
  refused, the first interaction plays it, and a synthesised hit covers a missing file.
- A queued sting **expires** when the intro ends — one landing on the profile picker is
  worse than none.
- Once per session (`sessionStorage`), skippable, and `prefers-reduced-motion` gets a
  static card with no dive and no bars.

## Before the site

Nothing routes, renders or fetches until a profile is picked: the router's initial
navigation is disabled and the shell is gated. Deep links bypass both screens, because a
shared link to `/skills` should open `/skills`.

## Status

- [x] Phase 1 — intro, navbar, billboard, static catalogue
- [x] Phase 2a — Supabase schema, RLS, trending function, 18 projects seeded
- [x] Phase 2b — Spring Boot API
- [x] Phase 3 — intro, shelves, hover cards, detail modal, event tracking
- [x] Phase 4 — routing, loading screen, profile picker, skills, blog, extracurricular, hobbies
- [ ] Phase 5 — certifications, about and contact content; backend wired to the deployed API

## Content

Markdown in `frontend/src/content/`, compiled to JSON by `scripts/build-content.mjs`
before every build — so adding an entry is adding a file, and no markdown parser ships to
the browser.

`skills/` · `extracurricular/` · `hobbies/` · `blog/`

LinkedIn posts carry **only the URN**, never the embed HTML:

```md
---
title: Six months at Reliance Industries
platform: LINKEDIN
linkedin: urn:li:ugcPost:7489990373394796544
embedHeight: 1699
link: https://lnkd.in/p/gkk27KKC
---
```

The iframe is rebuilt at render time against a hard-coded origin, and the URN is
shape-checked at build time and again before the sanitizer bypass. Storing a vendor's
`<iframe>` string would make every future content file an injection vector.

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

## The API

Spring Boot 4.1 on Java 25, Maven. Run it:

```bash
cd backend
cp ../.env.example ../.env      # fill in the Supabase values
set -a; . ../.env; set +a
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/projects` | `?domain=` `?status=` |
| GET | `/api/v1/projects/rows` | the whole home page in one call |
| GET | `/api/v1/projects/{slug}` | |
| POST | `/api/v1/projects/{slug}/events` | `202`, fire-and-forget |
| GET | `/api/v1/skills` · `/skills/favorites` | grouped, favourites first |
| GET | `/api/v1/certifications` | |
| GET | `/api/v1/blog` · `/blog/{slug}` | published only, paginated |
| GET | `/api/v1/profile` | |
| POST | `/api/v1/contact` | rate-limited per session |
| GET | `/actuator/health` | plus a `/health` on every controller |

`/projects/rows` exists so the home page makes **one** request instead of six.
Empty shelves are dropped rather than rendered as a heading with nothing under it.

### Connecting to Supabase

On the free tier `db.<ref>.supabase.co` is **IPv6-only** — on an IPv4 network it fails
with `No route to host`. Use the session pooler (`aws-0-<region>.pooler.supabase.com`),
where the username is tenant-qualified: `postgres.<ref>`. Both forms are in `.env.example`.

The schema is owned by the SQL migrations, never by Hibernate: `ddl-auto` is `validate`.

### Trending

The formula lives in the SQL function `recompute_trending_scores()` (migration `V3`),
not in Java. One definition, and it still works when this service is asleep.
`TrendingService` only schedules it — nightly at 03:00, plus once on startup so a
freshly woken instance is not serving stale ordering.

## Deployment

Vercel project **amartya-panigrahi** is linked to this repo, so **every push to `main`
deploys automatically**. `vercel.json` at the repo root builds `frontend/` and rewrites
to `index.html` for client routing.

Latest: https://amartya-panigrahi-git-main-xsololevelerxs-projects.vercel.app

## TODO

1. **Make the deployment public.** Vercel Authentication (`ssoProtection`) is enabled on
   the project, so the `.vercel.app` URLs currently serve a Vercel login page instead of
   the site. Turn it off in *Project → Settings → Deployment Protection*. A portfolio
   behind a login cannot do its job.
2. **Run the backend end-to-end.** The API compiles and its web layer is tested, but a
   live JDBC connection has never been made — port 5432 was unreachable from the
   development sandbox. On your machine:
   ```bash
   cd backend && set -a; . ../.env; set +a
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   curl localhost:8080/api/v1/projects/rows | jq '.[].title'
   ```
   Use the **session pooler** host: the free tier's direct host is IPv6-only. Both forms
   are in `.env.example`.
3. **Set `EVENT_SESSION_SALT`** to a long random value before any events are recorded.
4. **Fill in `SUPABASE_SERVICE_KEY`** from the Supabase dashboard.
5. **Point the frontend at the deployed API** — `frontend/src/app/core/config.ts` still
   targets `localhost:8080`.
6. **Add live URLs** for the 14 projects that have none, and real poster art to replace
   the generated gradients.
