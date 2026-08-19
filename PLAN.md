# Build plan

Ordered so each phase is shippable on its own. Phases 1–2 are bug fixes and the
routing foundation everything else needs; 3–6 are the new pages.

---

## Phase 1 — Three bugs, one of them structural

### 1.1 Hover cards run off the left edge
`card.scss` has `&:first-child { transform-origin: left center }`. But `.card` is
the **only** child of its `<app-card>` wrapper, so *every* card matches
`:first-child` — all of them expand leftward, and the first one leaves the
screen. Fix with host-level selectors, which see the real sibling order:

```scss
:host(:first-child) .card { transform-origin: left center; }
:host(:last-child)  .card { transform-origin: right center; }
```

Verify by measuring `getBoundingClientRect().left >= 0` on the first card while
hovered, and `.right <= innerWidth` on the last.

### 1.2 Hairline under the nav
`.nav.solid` paints a 1px border and a hard background edge. Replace with a
scrim that fades out — no border, `background: linear-gradient(#000 0%,
rgb(0 0 0 / .72) 55%, transparent 100%)` while transparent, and a solid fill
only once scrolled past the hero.

### 1.3 There is no routing at all
`app.routes.ts` is `[]` and every nav link is a plain `href`. Each click is a
**full page reload**: the whole bundle re-downloads and the intro replays. This
blocks every page below, so it comes first.

- Real routes with `routerLink`, lazy-loaded via `loadComponent`.
- `IntroService` already gates on `sessionStorage`, so the intro correctly plays
  once per session rather than once per navigation.
- `withViewTransitions()` for cross-route fades.

---

## Phase 2 — Loading screen

A pulsing red **A** — the wordmark's own first letter, glowing bright to dull —
shown while a route's chunk is in flight, then handed to the page.

- `LoaderComponent`: the drawn A at rest, `animation: pulse 1.4s ease-in-out
  infinite alternate` on `opacity`/`filter: drop-shadow`.
- Driven by the router: `NavigationStart` → show, `NavigationEnd |
  NavigationError | NavigationCancel` → hide, with a ~180ms delay before showing
  so fast navigations never flash it.
- **On failure**, not just slowness: a global `ErrorHandler` and a
  `loadComponent` `.catch()` keep the loader up and retry once, then fall back to
  the home route rather than leaving a blank screen.
- `prefers-reduced-motion`: static A, no pulse.

---

## Phase 3 — Skills page  `/skills`

"Any and all the skills.md that I love and use on a daily basis."

- Source: markdown files in `frontend/src/content/skills/*.md`, each with front
  matter (`name`, `category`, `level`, `daily: true`, `icon`).
- Parsed at **build time** into a JSON manifest — no markdown parser shipped to
  the browser.
- Layout: Netflix-style rows grouped by category, `daily: true` leading a
  "What I actually use" shelf.
- Reuses the existing `skills` table and `SkillController` for anything stored in
  Supabase; the markdown is the source of truth for prose.

---

## Phase 4 — Blog page  `/blog`

Own posts **and** social posts, since you want both.

- `blog_posts` already exists in Supabase (`slug`, `title`, `excerpt`,
  `content_md`, `tags`, `status`, `published_at`) and `BlogController` already
  serves it.
- Add `external_posts`: `platform` (LINKEDIN | X | GITHUB), `url`, `title`,
  `excerpt`, `posted_at`, `embed_html`.
- **LinkedIn embeds**: LinkedIn gives an `<iframe>` embed per post. A raw iframe
  is an XSS surface, so store only the post **URN** and build the iframe
  ourselves from a fixed template — never store or inject vendor HTML.
- Cards in a shelf, mixed feed sorted by date, platform badge per card.

---

## Phase 5 — Extracurricular page  `/extracurricular`

- New `hobbies` table: `title`, `blurb`, `category`, `image_url`, `link`,
  `sort_order`.
- Same card/shelf components as projects — no new layout system.

---

## Phase 6 — Sound

`Netflix New Logo Animation 2019.mp3` is in the repo root. It would move to
`frontend/public/audio/` and replace the synthesised sting in `IntroService`.

> **Worth your decision before I wire it.** The Netflix "ta-dum" is a
> *registered sound trademark*, not just a copyrighted recording. Using it on a
> public site carries real exposure — more than the red does, because it is the
> mark itself rather than a colour. `IntroService.playSting()` already
> synthesises a two-note hit that costs nothing and carries no exposure.
> I will wire whichever you choose; the swap is one method. Left on the
> synthesised one until you say otherwise.

---

## Phase 7 — Deployment

Project `prj_dzSNoPl5FmxNeTBXJqST37vT5L3l` is linked; every push deploys.

**Still blocked on you:** `ssoProtection` is enabled, so all deployment URLs
serve a Vercel login page. I attempted to disable it via the API and the action
was refused by a permission classifier — I will not work around that. It is
*Project → Settings → Deployment Protection*. Until then nobody but you can see
any of this.

---

## Verification per phase

| Phase | Check |
| --- | --- |
| 1.1 | First card's `left >= 0` and last card's `right <= innerWidth` while hovered |
| 1.2 | No 1px seam at the nav edge at scrollY 0 and scrolled |
| 1.3 | Nav click does not re-request `main.js`; intro does not replay |
| 2 | Throttle to slow 3G — loader appears; force a chunk 404 — loader retries then falls back |
| 3–5 | Each route renders with the API down (static-first still holds) |
| all | Zero horizontal overflow at 390px, no console errors, `ng build` clean |
