"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CssArmillary from "./CssArmillary";

/**
 * The armillary is client-only and deliberately NOT part of first paint.
 * The CSS rings render immediately underneath in the same position; the WebGL
 * rings cross-fade over them once ready, so the swap is invisible and the LCP
 * element (the headline) is never gated on 3D.
 */
const Armillary = dynamic(() => import("./Armillary"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function Hero() {
  const [show3D, setShow3D] = useState(false);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!supportsWebGL()) return;
    // Let the text hero paint and settle before we mount a renderer.
    const t = window.setTimeout(() => setShow3D(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show3D) return;
    const t = window.setTimeout(() => setFaded(true), 60);
    return () => window.clearTimeout(t);
  }, [show3D]);

  return (
    <header className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden">
      {/* Below lg the instrument recentres and drops back, so the stacked type
          always wins; from lg up it takes the right half at full strength. */}
      <div className="absolute inset-0 opacity-30 lg:opacity-100">
        {/* The CSS rings cross-fade OUT as the WebGL rings come in. They are not
            pixel-aligned, so both must never be visible at full strength. */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: faded ? 0 : 1 }}
        >
          <CssArmillary />
        </div>
        {show3D && (
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: faded ? 1 : 0 }}
          >
            <Armillary />
          </div>
        )}
      </div>

      {/* Type sits left of centre so the instrument occupies its own space on the
          right rather than sitting behind the words. */}
      <div className="relative mx-auto w-full max-w-[var(--maxw)] px-6 py-24 md:px-10">
        <div className="max-w-[46ch] lg:max-w-[52%]">
          <p className="font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.22em] text-[color:var(--brass)]">
            FULL-STACK ENGINEER
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-instrument-serif)] text-[clamp(38px,5.6vw,68px)] leading-[1.06] tracking-[-0.015em]">
            Field notes on twelve systems I put into production.
          </h1>
          <p className="mt-4 max-w-[46ch] text-[clamp(14px,1.4vw,16px)] leading-[1.6] text-[color:var(--text-2)] text-pretty">
            Each one is plotted by the domain it belongs to and the layer of the
            stack it lives in. Nothing here is decoration.
          </p>
          <a
            href="#work"
            className="mt-8 inline-block border border-[color:var(--brass)] px-4 py-2 font-[family-name:var(--font-plex-mono)] text-[11px] tracking-[0.14em] text-[color:var(--brass)] transition-colors duration-[var(--t-data)] hover:bg-[color:var(--brass)] hover:text-[color:var(--bg)]"
          >
            ENTER THE FIELD
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-0 right-0 mx-auto max-w-[var(--maxw)] px-6 md:px-10">
        <div className="font-[family-name:var(--font-plex-mono)] text-[10px] tracking-[0.08em] text-[color:var(--text-3)]">
          PROCEDURAL — brass armillary · 3 torus + 1 core · 0 bytes downloaded
        </div>
      </div>
    </header>
  );
}
