# Portfolio — "Observatory"

A portfolio built to the Observatory art direction: parchment and brass, with every
project plotted by **domain × layer of the stack** rather than listed in a grid.

The signature 3D moment is an armillary sphere generated entirely in code —
three torus rings, an icosahedron core, and a runtime-canvas gradient standing in
for an HDR environment. **Zero bytes of 3D assets are downloaded.**

## Adding a project

Everything reads one flat record list: [`src/data/projects.ts`](src/data/projects.ts).
Adding a project is appending one object — there is no per-project layout work.

```ts
{
  id: "my-project",
  title: "My Project",
  blurb: "One sentence. It is read beside every other blurb, so make it earn its place.",
  stack: ["TypeScript", "Postgres"],
  domain: "systems",   // ai | security | graphics | systems | ml
  layer: 0.4,          // 1 = interface, 0 = infrastructure
  scope: 2,            // 1 focused · 2 one quarter · 3 multi-quarter
  featured: false,
  links: { repo: "https://…", live: null, writeup: null },
}
```

**When you deploy something, set `links.live`.** Missing links render greyed-out
rather than hidden — showing what isn't published yet is deliberate.

## The performance contract

Enforced in the code, not just aspirational:

| Rule | How it is met |
| --- | --- |
| LCP not gated on 3D | Hero text is server-rendered; the canvas mounts 400ms later |
| Exactly one canvas | A single `<Canvas>`, mounted only in the hero |
| Pause when unseen | `IntersectionObserver` + `visibilitychange` set `frameloop="never"` |
| Degrade, never jank | 3 consecutive frames >20ms → dpr drops to 1, antialiasing off, no re-escalation |
| 3D payload | 0 bytes — geometry is procedural, the environment is a 128px runtime canvas |
| No-WebGL fallback | The CSS armillary that already shipped as first paint simply stays |
| Reduced motion | Rings hold at their scroll position; damping is disabled |

## Layout

The plot needs width to stay legible, so below `lg` the same records render as a
list instead. The axes do not pretend to work at 390px.

## Develop

```bash
npm run dev     # http://localhost:3000
npm run build
npx eslint src
```

## Design source

Art direction and full motion spec: `Portfolio Art Directions.dc.html` in the
Claude Design project. The prompt that produced it is in [DESIGN_PROMPT.md](DESIGN_PROMPT.md).
