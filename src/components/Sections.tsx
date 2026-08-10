import { PROJECTS } from "@/data/projects";

/**
 * The positioning beat, the skills specimen, and the colophon.
 * All server-rendered — none of this needs to be interactive.
 */

export function PositioningBeat() {
  return (
    <section className="border-t border-[color:var(--line)]">
      <div className="mx-auto w-full max-w-[720px] px-6 py-24 text-center md:px-10">
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(28px,4.4vw,40px)] leading-[1.15] tracking-[-0.01em]">
          I work at the layer where the abstraction stops holding.
        </h2>
        <p className="mx-auto mt-5 max-w-[var(--measure)] text-[17px] leading-[1.7] text-[color:var(--text-2)] text-pretty">
          Twelve systems across AI infrastructure, security tooling, real-time
          graphics and full-stack platforms. I am most useful on the problems
          where the backend answer and the frontend answer are the same answer,
          and nobody wants to hold both.
        </p>
      </div>
    </section>
  );
}

/** A type specimen, not a logo wall. Size is proportional to how often you use it. */
export function Skills() {
  const counts = new Map<string, number>();
  for (const p of PROJECTS) {
    for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  const entries = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const max = Math.max(...entries.map(([, n]) => n));

  return (
    <section className="border-t border-[color:var(--line)]">
      <div className="mx-auto w-full max-w-[var(--maxw)] px-6 py-20 md:px-10">
        <div className="font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.18em] text-[color:var(--text-3)]">
          THE STACK — SIZED BY USE
        </div>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {entries.map(([name, n]) => {
            // 18px at one use, up to 46px at the most-used — set on a real ramp
            // so the block reads as a specimen sheet rather than a tag cloud.
            const size = 18 + (n / max) * 28;
            return (
              <span
                key={name}
                className="font-[family-name:var(--font-instrument-serif)] leading-none"
                style={{
                  fontSize: `${size}px`,
                  color: n >= max * 0.6 ? "var(--brass)" : "var(--text)",
                }}
                title={`${n} project${n > 1 ? "s" : ""}`}
              >
                {name}
                <sup className="ml-1 font-[family-name:var(--font-plex-mono)] text-[9px] align-super text-[color:var(--text-3)]">
                  {n}
                </sup>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Colophon() {
  return (
    <footer className="border-t border-[color:var(--line)]">
      <div className="mx-auto w-full max-w-[var(--maxw)] px-6 py-20 md:px-10">
        <div className="font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.18em] text-[color:var(--text-3)]">
          COLOPHON
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <p className="max-w-[var(--measure)] text-[15px] leading-[1.75] text-[color:var(--text-2)] text-pretty">
              Set in Instrument Serif and IBM Plex. Plotted with an armillary
              generated in code — three torus rings and a refractive core, none
              of it downloaded. Built with Next.js, React Three Fiber and rather
              fewer dependencies than usual.
            </p>
          </div>
          <div className="md:justify-self-end">
            <div className="inline-block border border-[color:var(--brass)] px-5 py-4">
              <div className="font-[family-name:var(--font-plex-mono)] text-[9.5px] tracking-[0.16em] text-[color:var(--text-3)]">
                WRITE TO
              </div>
              <a
                href="mailto:amartyapanigrahi@gmail.com"
                className="mt-1.5 block font-[family-name:var(--font-instrument-serif)] text-[22px] text-[color:var(--brass)] transition-opacity hover:opacity-80"
              >
                amartyapanigrahi@gmail.com
              </a>
              <a
                href="https://github.com/XSoloLevelerX"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.1em] text-[color:var(--text-2)] transition-colors hover:text-[color:var(--brass)]"
              >
                GITHUB — XSoloLevelerX ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
