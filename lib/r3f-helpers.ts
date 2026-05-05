"use client";
/**
 * Phase 4 R3F helpers — shared hooks for hero scenes (Tooth, FilmCanister,
 * MarbleColumn, Floorplan, Mansion). All hooks gracefully no-op when the
 * user prefers reduced motion. Camera drift uses the linear cadence per
 * DESIGN_SYSTEM ("R3F camera drift: linear, 60–90s loop").
 */

import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    // Safari fallback
    mq.addListener?.(handler);
    return () => mq.removeListener?.(handler);
  }, []);
  return reduced;
}

interface CameraDriftOptions {
  /** Max camera offset in world units. Defaults to 0.15. */
  amplitude?: number;
  /** Full loop period in seconds. Defaults to 75 (mid-range of 60–90s spec). */
  periodSeconds?: number;
  /** Disable drift entirely. */
  disabled?: boolean;
}

/**
 * Linear-cadence camera drift along the X axis. Apply at the top of an R3F
 * <Canvas> subtree (it grabs the active camera via useThree).
 */
export function useCameraDrift({
  amplitude = 0.15,
  periodSeconds = 75,
  disabled = false,
}: CameraDriftOptions = {}) {
  const reduced = useReducedMotion();
  const camera = useThree((s) => s.camera);
  const baseX = React.useRef<number | null>(null);

  useFrame((state) => {
    if (disabled || reduced) return;
    if (baseX.current === null) baseX.current = camera.position.x;
    const t = state.clock.elapsedTime;
    // sine wave gives smooth in/out at extremes; periodSeconds = 2π / ω
    const omega = (2 * Math.PI) / periodSeconds;
    camera.position.x = baseX.current + Math.sin(t * omega) * amplitude;
    camera.updateProjectionMatrix();
  });
}

interface MouseParallaxOptions {
  /** Strength multiplier in world units per fraction of viewport. Defaults to 0.05. */
  strength?: number;
  /** Smoothing factor 0–1 (0 = no smoothing, 1 = very slow lerp). Defaults to 0.08. */
  smoothing?: number;
  /** Disable parallax entirely. */
  disabled?: boolean;
}

/**
 * Mouse-parallax that nudges the camera based on cursor offset from the
 * viewport center. Disabled on prefers-reduced-motion and on touch devices
 * (no mousemove signal).
 */
export function useMouseParallax({
  strength = 0.05,
  smoothing = 0.08,
  disabled = false,
}: MouseParallaxOptions = {}) {
  const reduced = useReducedMotion();
  const camera = useThree((s) => s.camera);
  const baseX = React.useRef<number | null>(null);
  const baseY = React.useRef<number | null>(null);
  const target = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  React.useEffect(() => {
    if (disabled || reduced) return;
    if (typeof window === "undefined") return;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: nx, y: -ny };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [disabled, reduced]);

  useFrame(() => {
    if (disabled || reduced) return;
    if (baseX.current === null) baseX.current = camera.position.x;
    if (baseY.current === null) baseY.current = camera.position.y;
    const desiredX = baseX.current + target.current.x * strength;
    const desiredY = baseY.current + target.current.y * strength;
    camera.position.x += (desiredX - camera.position.x) * smoothing;
    camera.position.y += (desiredY - camera.position.y) * smoothing;
    camera.updateProjectionMatrix();
  });
}
