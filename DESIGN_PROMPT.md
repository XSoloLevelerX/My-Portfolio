# Claude Design Prompt

Paste everything below into Claude Design.

---

I'm a full-stack software engineer building my personal portfolio site. I want it to be
graphically stunning — the kind of site that makes a hiring manager stop scrolling — while
still being fast, readable, and genuinely useful as a way to browse my work.

Give me THREE distinct art directions, then a full design + motion specification for each,
detailed enough that an engineer could build it without asking follow-up questions.

## Who it's for

Recruiters, engineering managers, and senior engineers evaluating me for full-stack roles.
They are skimming, often on a laptop, often with 6 other tabs open. The visuals earn me the
extra 30 seconds; the content has to convert that into an interview. Never let the spectacle
get in the way of "what did this person actually build, and was it hard?"

## The hard constraint: many projects, browsable at once

This is the part I care most about getting right, so treat it as a design problem in its own
right rather than a grid of cards.

- The site must comfortably display a LARGE number of projects — design for ~20, look good
  at 4, and not break at 30. I'll be adding projects over time as I deploy them.
- I want a browsing model where a visitor can see the breadth of my work in a single view or
  a single gesture, then drill into any one project — not endless vertical scrolling through
  identical cards.
- Propose a distinct spatial/organizational metaphor for the project showcase in each of the
  three directions. Some starting points, but invent better ones if you can: an orbital or
  constellation field where each project is a body and clusters imply tech stack; an infinite
  draggable 2D canvas with semantic zoom (zoom out = shapes and color-coded stacks, zoom in =
  title + stack, zoom further = full case study); a horizontally-scrubbed film strip or
  carousel rail driven by scroll; a 3D shelf/archive you fly along; a tactile stack of
  physical cards you flick through.
- Whatever the metaphor, specify: how filtering by tech stack works, how search or keyboard
  navigation works, what the empty and "only 3 projects" states look like, how the hover
  preview reads, and what the transition into a project detail view is.
- The project data should be describable as a simple flat list of objects (title, blurb,
  stack, thumbnail, links, a "featured" flag). Do not design anything that requires me to
  hand-author bespoke layout per project — new projects must slot in by adding one record.

## Performance is a design constraint, not a caveat

I want real 3D — GLB models, custom shaders, scroll-driven camera work — but the site must
stay smooth and must not melt a laptop fan or hang on load.

Design to these budgets and state explicitly how each direction meets them:

- 60fps on an M1-class laptop; degrade gracefully, never jank, on integrated graphics.
- Under 2.5s to Largest Contentful Paint on a normal connection. The first meaningful thing
  a visitor sees must NOT be gated behind a heavy 3D asset finishing its download.
- Total 3D asset payload under roughly 5MB, Draco/Meshopt-compressed, with a stated poly and
  texture-resolution budget per asset.
- Exactly one persistent WebGL canvas at most. Never multiple simultaneous renderers.
- Pause all rendering when the canvas is offscreen or the tab is hidden.
- A full, well-designed no-WebGL and `prefers-reduced-motion` fallback that still looks
  deliberate and good — not a broken-looking stripped version.

For each direction, tell me which effects are genuinely worth their cost and which cheaper
technique (a shader on a plane, a baked normal map, a CSS 3D transform, a pre-rendered video
sprite) buys 80% of the impact for 10% of the budget. Be opinionated about what to cut.

## Sections to specify

Design each of these, in order, with the motion described precisely:

1. Hero — the signature 3D moment. What the object or scene is, how it reacts to cursor and
   scroll, how it loads in, and what the first-paint state looks like before 3D is ready.
2. A short positioning/about beat — who I am, in one strong line plus supporting text.
3. The project showcase — the centerpiece, per the constraint above.
4. Project detail view — the drill-in. Modal, dedicated route, or in-canvas transition?
   Specify the shared-element or camera transition connecting it to the showcase.
5. Skills / tech stack — make this visual and scannable, not a wall of logos.
6. Contact / footer — with a last small memorable moment.

## For each of the three directions, deliver

- A name and a one-paragraph statement of the concept and the feeling it creates.
- Full color system: background, surface, text hierarchy, and accent tokens as hex values,
  in both a light and a dark variant.
- Type system: specific font recommendations (Google Fonts or common licensable faces),
  the scale as concrete sizes, and weights per role.
- Spacing, grid, and radius tokens.
- The 3D concept in detail: what geometry and materials, what lighting, whether it's a GLB or
  procedural, what the shader does, and how it responds to input.
- A scroll-choreography table — for each section: scroll range, what animates, easing, and
  duration.
- Micro-interactions: cursor treatment, link and button hover states, page-transition
  behavior, loading sequence.
- A rendered hero visual and a rendered view of the project showcase, so I can see it.
- The honest tradeoff: what this direction costs to build and what it risks.

## Stack I'll build in

Next.js (App Router) + TypeScript + React Three Fiber / drei + GSAP ScrollTrigger or Lenis +
Tailwind. Deploying to Vercel. Recommend specific libraries where they matter, and flag
anything in your design that would be disproportionately painful in this stack.

## Tone

Be opinionated. I'd rather have three sharp, distinct points of view — where the third is
genuinely risky — than three safe variations on the same dark-with-glowing-accents theme I've
seen a hundred times. Push me somewhere I wouldn't have gone. Avoid: generic particle fields,
floating cubes with no meaning, and neon-purple gradient soup, unless you can justify why it
is right here.
