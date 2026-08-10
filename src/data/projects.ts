// One flat record list. Every part of the site reads THIS shape and nothing else.
// Adding a project = appending one object. There is no per-project layout work anywhere.
//
// TO ADD A DEPLOYED PROJECT: set `links.live` to the URL. Missing links are printed
// as unavailable rather than hidden — that honesty is part of the design.

/** Where the project sits in the stack. 1 = interface, 0 = infrastructure. */
export type Layer = number;

/** Rough ambition. 1 = focused build, 2 = one quarter, 3 = multi-quarter system. */
export type Scope = 1 | 2 | 3;

/**
 * Horizontal axis of the field. Chosen over "year" deliberately: nearly all of
 * this work lands in the same year, so a time axis collapses into a smear.
 * Domain spreads the field and makes the stronger argument — range.
 */
export type Domain = "ai" | "security" | "graphics" | "systems" | "ml";

export interface ProjectLinks {
  repo: string | null;
  live: string | null;
  writeup: string | null;
}

export interface Project {
  id: string;
  title: string;
  /** One sentence. It is read side by side with every other blurb, so make it earn its place. */
  blurb: string;
  stack: string[];
  domain: Domain;
  layer: Layer;
  scope: Scope;
  featured: boolean;
  links: ProjectLinks;
}

export const DOMAINS: { key: Domain; label: string }[] = [
  { key: "ai", label: "AI / AGENTS" },
  { key: "security", label: "SECURITY" },
  { key: "graphics", label: "3D / GRAPHICS" },
  { key: "systems", label: "SYSTEMS" },
  { key: "ml", label: "ML / VISION" },
];

/** Top of the field is what the user touches; the bottom is what holds it up. */
export const LAYER_BANDS = [
  { label: "INTERFACE", top: 0.02, height: 0.24 },
  { label: "PLATFORM", top: 0.26, height: 0.24 },
  { label: "SERVICES", top: 0.5, height: 0.24 },
  { label: "INFRASTRUCTURE", top: 0.74, height: 0.26 },
];

const GH = "https://github.com/XSoloLevelerX";

export const PROJECTS: Project[] = [
  {
    id: "dentos",
    title: "DentOS",
    blurb:
      "A clinical operating system for dental practice. Twenty-seven modules in one deployable, where module boundaries are enforced by the compiler — the build fails before a reviewer has to catch a violation.",
    stack: ["Java 21", "Spring Boot", "Angular", "PostgreSQL"],
    domain: "systems",
    layer: 0.45,
    scope: 3,
    featured: true,
    links: { repo: `${GH}/dentos`, live: null, writeup: null },
  },
  {
    id: "glyphguard",
    title: "GlyphGuard",
    blurb:
      "A trust proxy for the Model Context Protocol. It reads every tool description before the model does and quarantines the ones carrying hidden instructions, closing a prompt-injection path most MCP users never see.",
    stack: ["Python", "MCP", "Docker"],
    domain: "security",
    layer: 0.15,
    scope: 3,
    featured: true,
    links: {
      repo: `${GH}/GlyphGuard---MCP-Tool-Poisoning-Trust-Proxy`,
      live: null,
      writeup: null,
    },
  },
  {
    id: "pitlane",
    title: "PitLane AI",
    blurb:
      "An F1 intelligence platform built on the APEX engine: live telemetry, cross-era statistical comparison, and 3D circuit visualisation behind an LLM race engineer that argues strategy with you.",
    stack: ["Next.js", "Three.js", "Anthropic", "Supabase"],
    domain: "ai",
    layer: 0.9,
    scope: 3,
    featured: true,
    links: { repo: `${GH}/PitLaneAI`, live: null, writeup: null },
  },
  {
    id: "envforge",
    title: "EnvForge",
    blurb:
      "Prompt to game-ready 3D environment in the browser. Twelve hand-built procedural modules, rules-driven scatter placement across three scale tiers, and a GLB export a game engine will actually accept.",
    stack: ["React Three Fiber", "Three.js", "Zustand", "TypeScript"],
    domain: "graphics",
    layer: 0.85,
    scope: 3,
    featured: true,
    links: { repo: null, live: null, writeup: null },
  },
  {
    id: "hermes",
    title: "Hermes",
    blurb:
      "A self-hosted coding agent that persists your identity across sessions. Personality, principles and coding style live in versioned files, so the agent stays recognisably yours instead of resetting each run.",
    stack: ["Python", "Ollama", "Claude", "RAG"],
    domain: "ai",
    layer: 0.55,
    scope: 2,
    featured: true,
    links: { repo: null, live: null, writeup: null },
  },
  {
    id: "contractcal",
    title: "ContractCal",
    blurb:
      "Self-hosted contract obligation tracking. Retrieval-augmented extraction pulls deadlines, renewals and liability dates out of contract text so a missed clause stops being a filing problem.",
    stack: ["RAG", "Supabase", "Docker", "TypeScript"],
    domain: "ai",
    layer: 0.4,
    scope: 2,
    featured: false,
    links: { repo: null, live: null, writeup: null },
  },
  {
    id: "grand-luxury",
    title: "Grand Luxury",
    blurb:
      "An AI concierge platform for hotels. Guests talk to an LLM that raises real service requests, staff pick the work up on mobile, and managers watch the whole queue move on a web dashboard.",
    stack: ["Python", "LLM", "React Native", "Postgres"],
    domain: "ai",
    layer: 0.35,
    scope: 3,
    featured: false,
    links: { repo: `${GH}/Call-Voice-Agent`, live: null, writeup: null },
  },
  {
    id: "saveyourlivestock",
    title: "SaveYourLivestock",
    blurb:
      "Real-time livestock intrusion detection on ordinary security cameras. A motion filter gates YOLOv8 so the classifier only runs when something moved, which is what makes it viable on farm hardware.",
    stack: ["Python", "YOLOv8", "OpenCV", "Flask"],
    domain: "ml",
    layer: 0.2,
    scope: 2,
    featured: true,
    links: { repo: null, live: null, writeup: null },
  },
  {
    id: "vibematch",
    title: "VibeMatch AI",
    blurb:
      "Music discovery by emotional arc rather than genre. An eight-stage pipeline models how a track evolves over time, then matches songs whose structure rises and falls the same way.",
    stack: ["Python", "ML", "Audio DSP"],
    domain: "ml",
    layer: 0.3,
    scope: 2,
    featured: false,
    links: { repo: null, live: null, writeup: null },
  },
  {
    id: "meccha",
    title: "MECCHA CHAMELEON",
    blurb:
      "A browser game built on a BVH-accelerated Three.js scene, with Supabase-backed state and Playwright driving the gameplay regression suite.",
    stack: ["Three.js", "three-mesh-bvh", "React", "Supabase"],
    domain: "graphics",
    layer: 0.95,
    scope: 2,
    featured: false,
    links: { repo: `${GH}/MECCHA-CHAMELEON`, live: null, writeup: null },
  },
  {
    id: "safemap",
    title: "SafeMap",
    blurb:
      "Safety-aware routing across four surfaces — Flutter app, Kotlin client, web UI and a microservice backend — sharing one incident dataset and one scoring model.",
    stack: ["Flutter", "Kotlin", "Microservices", "Supabase"],
    domain: "systems",
    layer: 0.25,
    scope: 3,
    featured: false,
    links: { repo: null, live: null, writeup: null },
  },
  {
    id: "hotel-management",
    title: "Hotel Management System",
    blurb:
      "Full-stack property management with a shared type layer between frontend and backend, Supabase persistence, and Playwright end-to-end coverage over the booking flow.",
    stack: ["TypeScript", "Supabase", "Playwright"],
    domain: "systems",
    layer: 0.6,
    scope: 2,
    featured: false,
    links: { repo: `${GH}/Hotel_Management_System`, live: null, writeup: null },
  },
];

/** Filter chips. Kept short on purpose — five is scannable, twelve is a wall. */
export const STACK_FILTERS = [
  "Python",
  "TypeScript",
  "Three.js",
  "Supabase",
  "AI",
];

/** A chip matches if any stack entry contains it, so "AI" catches LLM/RAG/ML work. */
export function matchesStackFilter(project: Project, filter: string): boolean {
  if (filter === "AI") {
    return project.stack.some((s) =>
      /llm|rag|anthropic|claude|ollama|ml|mcp/i.test(s),
    );
  }
  return project.stack.some((s) =>
    s.toLowerCase().includes(filter.toLowerCase()),
  );
}
