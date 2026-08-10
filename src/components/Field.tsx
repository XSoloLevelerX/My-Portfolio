"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PROJECTS,
  DOMAINS,
  LAYER_BANDS,
  STACK_FILTERS,
  matchesStackFilter,
  type Project,
} from "@/data/projects";

/**
 * THE FIELD — every project plotted by domain and by layer of the stack.
 *
 * Bodies never move. Filtering dims rather than re-sorts, so the reader's
 * mental map survives narrowing; that is the entire reason to use a plot
 * instead of a grid. Hovering draws brass lines to every project sharing a
 * technology — the clusters are computed, not arranged.
 */

/** The plot area, in percentages. Left margin clears the layer band labels. */
const FIELD_LEFT = 14;
const FIELD_RIGHT = 98;
const COLUMN_WIDTH = (FIELD_RIGHT - FIELD_LEFT) / DOMAINS.length;

export function columnCentre(domainIndex: number) {
  return FIELD_LEFT + COLUMN_WIDTH * (domainIndex + 0.5);
}

/**
 * Deterministic position. Siblings in a column fan out horizontally so labels
 * never collide, but the fan is clamped well inside the column so a body is
 * always unambiguously in its own domain.
 */
function positionOf(project: Project, all: Project[]) {
  const domainIndex = DOMAINS.findIndex((d) => d.key === project.domain);
  const centre = columnCentre(domainIndex);

  const siblings = all.filter((p) => p.domain === project.domain);
  const i = siblings.findIndex((p) => p.id === project.id);
  // Cap the fan at 30% of the column half-width — enough to separate, never
  // enough to cross a gridline.
  const step = siblings.length > 1 ? (COLUMN_WIDTH * 0.3) / (siblings.length - 1) : 0;
  const spread = (i - (siblings.length - 1) / 2) * step * 2;

  // Vertical jitter separates same-layer siblings so their labels don't overlap.
  const jitter = siblings.length > 1 ? (i % 2 ? 3.4 : -3.4) : 0;

  return {
    x: centre + spread,
    y: Math.min(92, Math.max(8, 86 - project.layer * 70 + jitter)),
  };
}

function layerName(layer: number) {
  if (layer > 0.75) return "Interface";
  if (layer > 0.5) return "Platform";
  if (layer > 0.25) return "Services";
  return "Infrastructure";
}

const SCOPE_LABEL = ["focused build", "one quarter", "multi-quarter"];

export default function Field() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const matches = useCallback(
    (p: Project) => {
      const q = query.trim().toLowerCase();
      const okQuery =
        !q ||
        `${p.title} ${p.blurb} ${p.stack.join(" ")} ${p.domain}`
          .toLowerCase()
          .includes(q);
      const okFilter =
        filters.length === 0 ||
        filters.some((f) => matchesStackFilter(p, f));
      return okQuery && okFilter;
    },
    [query, filters],
  );

  // Chronological-ish travel order: by domain column, then up the stack.
  const ordered = useMemo(() => {
    const domainRank = (p: Project) =>
      DOMAINS.findIndex((d) => d.key === p.domain);
    return PROJECTS.filter(matches).sort(
      (a, b) => domainRank(a) - domainRank(b) || a.layer - b.layer,
    );
  }, [matches]);

  const focusId = open ?? hover;
  const focusRecord = useMemo(
    () => PROJECTS.find((p) => p.id === focusId) ?? null,
    [focusId],
  );

  // Stack kinship, computed from the data rather than hand-grouped.
  const kin = useMemo(() => {
    if (!focusRecord) return [] as Project[];
    return PROJECTS.filter(
      (p) =>
        p.id !== focusRecord.id &&
        p.stack.some((s) => focusRecord.stack.includes(s)),
    );
  }, [focusRecord]);

  const kinIds = useMemo(() => new Set(kin.map((k) => k.id)), [kin]);

  const openRecord = useMemo(
    () => PROJECTS.find((p) => p.id === open) ?? null,
    [open],
  );

  // Keyboard: left/right travel the domains, up/down travel the stack.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && /input|textarea/i.test(target.tagName);

      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        setOpen(null);
        searchRef.current?.blur();
        return;
      }
      if (typing || ordered.length === 0) return;

      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const forward = e.key === "ArrowRight" || e.key === "ArrowUp";
        const byLayer = e.key === "ArrowUp" || e.key === "ArrowDown";
        const list = byLayer
          ? [...ordered].sort((a, b) => a.layer - b.layer)
          : ordered;
        const current = list.findIndex((p) => p.id === (hover ?? list[0].id));
        const next =
          list[
            Math.min(
              list.length - 1,
              Math.max(0, current + (forward ? 1 : -1)),
            )
          ];
        setHover(next.id);
        return;
      }
      if (e.key === "Enter" && hover) setOpen(hover);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ordered, hover]);

  const visibleCount = PROJECTS.filter(matches).length;
  const isEmpty = visibleCount === 0;

  const tipRecord = !open && hover ? focusRecord : null;
  const tipPos = tipRecord ? positionOf(tipRecord, PROJECTS) : { x: 0, y: 0 };

  return (
    <section
      id="work"
      className="border-t border-[color:var(--line)]"
      aria-label="Project field"
    >
      <div className="mx-auto w-full max-w-[var(--maxw)] px-6 pb-16 pt-16 md:px-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(30px,4vw,40px)] leading-none">
            The Field
          </h2>
          <p className="font-[family-name:var(--font-plex-mono)] text-[11px] tracking-[0.04em] text-[color:var(--text-3)]">
            every project plotted by domain and layer of the stack — nothing
            here is decorative
          </p>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border-b border-[color:var(--line)] px-1 py-1">
            <span className="font-[family-name:var(--font-plex-mono)] text-[11px] text-[color:var(--brass)]">
              /
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter the field"
              aria-label="Filter projects"
              className="w-[150px] bg-transparent font-[family-name:var(--font-plex-mono)] text-[12px] text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-3)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STACK_FILTERS.map((f) => {
              const on = filters.includes(f);
              return (
                <button
                  key={f}
                  onClick={() =>
                    setFilters((prev) =>
                      on ? prev.filter((x) => x !== f) : [...prev, f],
                    )
                  }
                  aria-pressed={on}
                  className="rounded-full border px-3 py-1 font-[family-name:var(--font-plex-mono)] text-[11px] transition-colors duration-[var(--t-data)]"
                  style={{
                    borderColor: on ? "var(--brass)" : "var(--line)",
                    background: on ? "var(--brass)" : "transparent",
                    color: on ? "var(--bg)" : "var(--text-2)",
                  }}
                >
                  {f.toLowerCase()}
                </button>
              );
            })}
          </div>
          <div className="ml-auto font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.08em] text-[color:var(--text-3)]">
            ←→ travel · ↵ open · esc back
          </div>
        </div>

        {/* A scatter plot needs width to stay legible. Below lg the same records
            render as a list instead — the data and the metaphor survive, the
            axes do not pretend to work at 390px. */}
        <ol className="mt-5 flex flex-col border border-[color:var(--line)] lg:hidden">
          {ordered.map((p) => (
            <li
              key={p.id}
              className="border-b border-[color:var(--line)] p-4 last:border-b-0"
            >
              <button
                onClick={() => setOpen(p.id)}
                className="w-full text-left"
                aria-label={`${p.title}, ${layerName(p.layer)} layer`}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{
                      background: p.featured
                        ? "var(--brass)"
                        : "var(--field-node-dim)",
                    }}
                  />
                  <span className="font-[family-name:var(--font-instrument-serif)] text-[20px]">
                    {p.title}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-[color:var(--text-2)] text-pretty">
                  {p.blurb}
                </p>
                <div className="mt-2 font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.06em] text-[color:var(--text-3)]">
                  {layerName(p.layer).toUpperCase()} · {p.stack.join(" · ")}
                </div>
              </button>
            </li>
          ))}
          {isEmpty && (
            <li className="p-8 text-center">
              <div className="font-[family-name:var(--font-instrument-serif)] text-[22px]">
                Nothing in that region
              </div>
              <p className="mt-2 text-[13px] leading-[1.6] text-[color:var(--text-2)]">
                Chips are inclusive — clear one to widen the field.
              </p>
            </li>
          )}
        </ol>

        {/* The plot */}
        <div
          className="relative mt-5 hidden border border-[color:var(--line)] lg:block"
          style={{ height: "min(70vh, 620px)" }}
        >
          <div
            className="absolute inset-0 transition-opacity duration-[var(--t-scrim)]"
            style={{ opacity: open ? 0.35 : 1 }}
          >
            {/* Layer bands — the vertical axis, labelled in place */}
            {LAYER_BANDS.map((band) => (
              <div
                key={band.label}
                className="absolute left-0 right-0 border-t border-[color:var(--line)]"
                style={{
                  top: `${band.top * 100}%`,
                  height: `${band.height * 100}%`,
                }}
              >
                <div className="px-4 pt-1.5 font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.16em] text-[color:var(--text-3)] opacity-70">
                  {band.label}
                </div>
              </div>
            ))}

            {/* Domain columns — the horizontal axis */}
            {DOMAINS.map((d, i) => {
              const centre = columnCentre(i);
              return (
                <div key={d.key}>
                  <div
                    className="absolute bottom-0 top-0 border-l border-dashed border-[color:var(--line)] opacity-60"
                    style={{ left: `${centre - COLUMN_WIDTH / 2}%` }}
                  />
                  <div
                    className="absolute bottom-2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.06em] text-[color:var(--text-3)]"
                    style={{ left: `${centre}%` }}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
            {/* Close the last column */}
            <div
              className="absolute bottom-0 top-0 border-l border-dashed border-[color:var(--line)] opacity-60"
              style={{ left: `${FIELD_RIGHT}%` }}
            />

            {/* Kinship lines, drawn only for the focused body */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {focusRecord &&
                kin.map((k) => {
                  const a = positionOf(focusRecord, PROJECTS);
                  const b = positionOf(k, PROJECTS);
                  return (
                    <line
                      key={k.id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="var(--brass)"
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
            </svg>

            {/* Bodies */}
            {PROJECTS.map((p) => {
              const { x, y } = positionOf(p, PROJECTS);
              const on = matches(p);
              const isFocus = focusId === p.id;
              const isKin = kinIds.has(p.id);
              const d = p.scope === 3 ? 20 : p.scope === 2 ? 14 : 10;

              return (
                <button
                  key={p.id}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() =>
                    setHover((h) => (h === p.id ? null : h))
                  }
                  onFocus={() => setHover(p.id)}
                  onClick={() => setOpen(p.id)}
                  aria-label={`${p.title}, ${layerName(p.layer)} layer, ${p.domain}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-opacity duration-300"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    opacity: on ? (focusId && !isFocus && !isKin ? 0.3 : 1) : 0.08,
                    zIndex: isFocus ? 50 : isKin ? 40 : 10,
                  }}
                >
                  <span
                    className="block rounded-full border transition-transform duration-[280ms] ease-[var(--ease-out-expo)]"
                    style={{
                      width: d,
                      height: d,
                      background: p.featured
                        ? "var(--brass)"
                        : isFocus || isKin
                          ? "var(--verdigris)"
                          : "var(--field-node-dim)",
                      borderColor: isFocus
                        ? "var(--text)"
                        : p.featured
                          ? "var(--brass)"
                          : "var(--line)",
                      boxShadow: isFocus
                        ? "0 0 0 6px color-mix(in srgb, var(--brass) 18%, transparent)"
                        : isKin
                          ? "0 0 0 4px color-mix(in srgb, var(--verdigris) 14%, transparent)"
                          : "none",
                      transform: isFocus ? "scale(1.35)" : "scale(1)",
                    }}
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.05em] transition-colors duration-200"
                    style={{
                      top: d + 8,
                      color: isFocus
                        ? "var(--text)"
                        : isKin
                          ? "var(--text-2)"
                          : "var(--text-3)",
                    }}
                  >
                    {p.title}
                  </span>
                </button>
              );
            })}

            {/* Hover card — beside the body, never over it */}
            {tipRecord && (
              <div
                className="pointer-events-none absolute z-[60] w-[250px] border border-[color:var(--brass)] bg-[color:var(--surface)] p-3.5"
                style={{
                  left: `${tipPos.x}%`,
                  top: `${tipPos.y}%`,
                  // Flip to the other side past 60% of the field so the card
                  // never leaves the frame, and always clear the body itself.
                  transform:
                    tipPos.x > 60
                      ? "translate(calc(-100% - 22px), -50%)"
                      : "translate(22px, -50%)",
                }}
              >
                <div className="font-[family-name:var(--font-instrument-serif)] text-[19px] leading-tight">
                  {tipRecord.title}
                </div>
                <p className="mt-1.5 text-[12px] leading-[1.55] text-[color:var(--text-2)] text-pretty">
                  {tipRecord.blurb}
                </p>
                <div className="mt-2.5 font-[family-name:var(--font-plex-mono)] text-[10px] leading-[1.6] tracking-[0.06em] text-[color:var(--text-3)]">
                  <div>{tipRecord.stack.join(" · ")}</div>
                  <div className="mt-0.5 text-[color:var(--text-2)]">
                    {layerName(tipRecord.layer)}
                  </div>
                </div>
                <div className="mt-2 font-[family-name:var(--font-plex-mono)] text-[9.5px] tracking-[0.08em] text-[color:var(--brass)]">
                  {kin.length
                    ? `${kin.length} projects share this stack — lines drawn`
                    : "no stack kin in the field"}
                </div>
              </div>
            )}
          </div>

          {/* Empty state: the frame is the promise */}
          {isEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[color:var(--bg)] p-10 text-center">
              <div className="h-16 w-16 rounded-full border border-dashed border-[color:var(--line)]" />
              <div className="font-[family-name:var(--font-instrument-serif)] text-[26px]">
                Nothing in that region
              </div>
              <p className="max-w-[420px] text-[13px] leading-[1.65] text-[color:var(--text-2)] text-pretty">
                Chips are inclusive — any stack match keeps a body lit. Clear one
                to widen the field.
              </p>
            </div>
          )}

          {/* Scrim + detail card. Fixed rather than absolute so the same card
              serves the desktop plot and the mobile list. */}
          <div
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[70] transition-opacity duration-[var(--t-scrim)]"
            style={{
              background: "var(--scrim)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
            }}
          />
          <div
            role="dialog"
            aria-modal={!!open}
            aria-hidden={!open}
            className="fixed left-1/2 top-1/2 z-[80] max-h-[86vh] w-[520px] max-w-[88vw] overflow-y-auto border border-[color:var(--line)] bg-[color:var(--surface)] transition-[transform,opacity] duration-[var(--t-transition)] ease-[var(--ease-out-expo)]"
            style={{
              transform: open
                ? "translate(-50%,-50%) scale(1)"
                : "translate(-50%,-46%) scale(0.94)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
            }}
          >
            {openRecord && (
              <>
                <div className="flex items-start gap-3.5 border-b border-[color:var(--line)] p-5">
                  <span
                    className="mt-2 h-3.5 w-3.5 flex-none rounded-full"
                    style={{
                      background: openRecord.featured
                        ? "var(--brass)"
                        : "var(--verdigris)",
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-[family-name:var(--font-instrument-serif)] text-[30px] leading-tight">
                      {openRecord.title}
                    </h3>
                    <div className="mt-1 font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.1em] text-[color:var(--text-3)]">
                      {layerName(openRecord.layer).toUpperCase()} ·{" "}
                      {openRecord.stack.join(" / ").toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(null)}
                    aria-label="Close"
                    className="h-7 w-7 flex-none rounded-full border border-[color:var(--line)] text-[color:var(--text-2)] transition-colors hover:border-[color:var(--brass)] hover:text-[color:var(--text)]"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <p className="text-[14.5px] leading-[1.7] text-[color:var(--text-2)] text-pretty">
                    {openRecord.blurb}
                  </p>
                  <div className="flex flex-wrap gap-7">
                    {[
                      { k: "LAYER", v: layerName(openRecord.layer) },
                      { k: "SCOPE", v: SCOPE_LABEL[openRecord.scope - 1] },
                      { k: "STACK KIN", v: `${kin.length} projects` },
                    ].map((row) => (
                      <div key={row.k}>
                        <div className="font-[family-name:var(--font-plex-mono)] text-[9.5px] tracking-[0.14em] text-[color:var(--text-3)]">
                          {row.k}
                        </div>
                        <div className="mt-1 text-[13px]">{row.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Unavailable links are printed as unavailable, never hidden. */}
                  <div className="flex flex-wrap gap-2 border-t border-[color:var(--line)] pt-3">
                    {(
                      [
                        ["SOURCE", openRecord.links.repo],
                        ["LIVE", openRecord.links.live],
                        ["WRITE-UP", openRecord.links.writeup],
                      ] as const
                    ).map(([label, href]) =>
                      href ? (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-[color:var(--brass)] px-2.5 py-1 font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.12em] text-[color:var(--brass)] transition-colors hover:bg-[color:var(--brass)] hover:text-[color:var(--bg)]"
                        >
                          {label}
                        </a>
                      ) : (
                        <span
                          key={label}
                          className="border border-[color:var(--line)] px-2.5 py-1 font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.12em] text-[color:var(--text-3)] opacity-60"
                          title="Not published yet"
                        >
                          {label}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
