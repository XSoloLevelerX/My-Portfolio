"use client";

import {
  useMemo,
  useRef,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Subscribes to the OS setting the way React intends, with an SSR-safe default. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeDark(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Mirrors the CSS token switch so the 3D core matches the page it sits on. */
function usePrefersDark() {
  return useSyncExternalStore(
    subscribeDark,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

/**
 * The signature 3D moment: a brass armillary sphere, generated entirely in code.
 * Zero bytes of 3D assets download — three torus rings, an icosahedron core, and a
 * 128px runtime-canvas gradient standing in for an HDR environment.
 *
 * Scroll drives the outer ring one full turn across the document, so the sphere
 * doubles as a progress indicator that never needs a label.
 */

/** 128×128 vertical gradient as the environment map. Replaces a ~500KB HDR; on
 *  brass at this size the difference is not visible. */
function useGradientEnvironment(): THREE.Texture | null {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, "#fff6e2");
    g.addColorStop(0.45, "#c9a468");
    g.addColorStop(0.72, "#6b5730");
    g.addColorStop(1, "#191512");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

interface RingsProps {
  scrollRef: React.RefObject<number>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  onDegrade: () => void;
  degraded: boolean;
  dark: boolean;
}

function Rings({
  scrollRef,
  pointerRef,
  reducedMotion,
  onDegrade,
  degraded,
  dark,
}: RingsProps) {
  const group = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Mesh>(null);
  const mid = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const env = useGradientEnvironment();
  const { invalidate } = useThree();

  // Frame monitor: 3 consecutive frames over 20ms drops the expensive feature.
  // It never re-escalates within a session, per the performance contract.
  const slowFrames = useRef(0);

  // Materials are constructed with the environment already attached, so nothing
  // has to be mutated after the fact.
  const brass = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b98f3e"),
      metalness: 1,
      roughness: 0.28,
      envMap: env,
      envMapIntensity: 1.15,
    });
    // Engraved turning: darken along the ring's minor axis so the metal reads
    // as machined rather than chromed. ~30 lines, no post-processing stack.
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec2 vObjUv;`,
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
           float engrave = 0.5 + 0.5 * sin(vObjUv.y * 190.0);
           diffuseColor.rgb *= 0.82 + 0.18 * engrave;`,
        );
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec2 vObjUv;`,
        )
        .replace(
          "#include <uv_vertex>",
          `#include <uv_vertex>
           vObjUv = uv;`,
        );
    };
    return m;
  }, [env]);

  // Deliberately dim and metallic rather than bright glass: the headline sits
  // directly in front of the core, and a luminous sphere destroys its contrast.
  // The headline sits directly in front of the core, so the core must always
  // recede into the page rather than contrast against it: pale on paper,
  // dark on ink. Either way it never competes with the type.
  const core = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(dark ? "#38434b" : "#e8e2d2"),
        metalness: 0.7,
        roughness: dark ? 0.22 : 0.4,
        envMap: env,
        envMapIntensity: dark ? 0.45 : 0.25,
      }),
    [env, dark],
  );

  // Redraw once the environment-bearing materials exist.
  useEffect(() => {
    invalidate();
  }, [env, invalidate]);

  // Free GPU resources when the materials are replaced or the scene unmounts.
  useEffect(() => {
    const metal = brass;
    const glass = core;
    return () => {
      metal.dispose();
      glass.dispose();
    };
  }, [brass, core]);

  useEffect(() => {
    const tex = env;
    return () => tex?.dispose();
  }, [env]);

  useFrame((state, delta) => {
    if (!degraded) {
      if (delta > 0.02) {
        slowFrames.current += 1;
        if (slowFrames.current >= 3) onDegrade();
      } else {
        slowFrames.current = 0;
      }
    }

    const scroll = scrollRef.current ?? 0;
    const p = pointerRef.current ?? { x: 0, y: 0 };

    // Pointer parallax: ±3°, heavily damped. An instrument on a gimbal.
    if (group.current) {
      const targetX = p.y * 0.052;
      const targetY = p.x * 0.052;
      const damp = reducedMotion ? 1 : 0.05;
      group.current.rotation.x +=
        (targetX - group.current.rotation.x) * damp;
      group.current.rotation.y +=
        (targetY - group.current.rotation.y) * damp;
    }

    // Scroll is the mechanism: outer ring makes one full turn over the document.
    if (outer.current) outer.current.rotation.z = scroll * Math.PI * 2;
    if (mid.current) mid.current.rotation.x = scroll * Math.PI * 1.4 + 0.4;
    if (inner.current) inner.current.rotation.y = scroll * Math.PI * -1.1;

    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      if (mid.current) mid.current.rotation.z = Math.sin(t * 0.14) * 0.12;
    }
  });

  // 128 radial × 12 tubular segments — smooth silhouette, ~24k triangles total.
  return (
    <group ref={group}>
      <mesh ref={outer} material={brass} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.02, 12, 128]} />
      </mesh>
      <mesh ref={mid} material={brass} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.7, 0.02, 12, 128]} />
      </mesh>
      <mesh ref={inner} material={brass}>
        <torusGeometry args={[1.4, 0.02, 12, 128]} />
      </mesh>
      {/* Ecliptic band — a wider, flatter ring that reads as the instrument's scale */}
      <mesh material={brass} rotation={[Math.PI / 2.35, 0, 0.3]}>
        <torusGeometry args={[2.32, 0.008, 8, 128]} />
      </mesh>
      <mesh material={core}>
        <icosahedronGeometry args={[0.42, 3]} />
      </mesh>
    </group>
  );
}

export default function Armillary() {
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const reducedMotion = useReducedMotion();
  const dark = usePrefersDark();

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    const onPointer = (e: PointerEvent) => {
      pointerRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // Pause rendering entirely when offscreen or the tab is hidden.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    const onVis = () => setVisible(!document.hidden && !!wrapRef.current);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={degraded ? 1 : ([1, 1.75] as [number, number])}
        gl={{ antialias: !degraded, alpha: true }}
        // Offset left so the instrument sits in the right half of the hero,
        // clear of the type. On narrow screens it recentres (see wrapper).
        camera={{ position: [-2.1, -0.2, 9.4], fov: 42 }}
      >
        <directionalLight position={[-3, 4, 3]} intensity={2.4} color="#ffe6b8" />
        <directionalLight
          position={[3, -2, -2]}
          intensity={0.5}
          color="#9fc6d6"
        />
        <Rings
          scrollRef={scrollRef}
          pointerRef={pointerRef}
          reducedMotion={reducedMotion}
          degraded={degraded}
          dark={dark}
          onDegrade={() => setDegraded(true)}
        />
      </Canvas>
    </div>
  );
}
