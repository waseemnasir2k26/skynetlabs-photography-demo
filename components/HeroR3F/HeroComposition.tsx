"use client";
/**
 * Phase 4 Hero composition primitives — DESIGN_SYSTEM "Hero composition slots".
 *
 *   foreground         z-30   primary subject (R3F mesh / hero photo / cinemagraph)
 *   midground          z-20   supporting visual (particle field / SVG wave / HDRI)
 *   background         z-10   base canvas (gradient / solid / HDRI)
 *   overlay-gradient   z-25   accessibility gradient between mid and motion (WCAG AA)
 *   motion-layer       z-40   Framer Motion + GSAP layer (DOM-rendered headline + CTAs)
 *
 * This module is ADDITIVE — it does NOT replace components/sections/Hero.tsx.
 * The existing Hero already renders all three layers internally via `renderBg`
 * and the motion.div container. Phase 5 briefs that need explicit slot control
 * (e.g. R3F flagships using the Tunnel pattern from r3f-next-template) can
 * import these primitives directly:
 *
 *   <HeroFrame>
 *     <HeroBackground>...</HeroBackground>
 *     <HeroMidground>...</HeroMidground>
 *     <HeroOverlayGradient />
 *     <HeroForeground>...</HeroForeground>
 *     <HeroMotionLayer>headline + CTAs</HeroMotionLayer>
 *   </HeroFrame>
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface HeroFrameProps extends React.HTMLAttributes<HTMLElement> {
  minHeight?: string;
}

export function HeroFrame({
  children,
  className,
  minHeight = "88vh",
  ...rest
}: HeroFrameProps) {
  return (
    <section
      id="hero"
      className={cn("relative isolate flex items-center overflow-hidden", className)}
      style={{ minHeight }}
      {...rest}
    >
      <div id="hero-sentinel" className="absolute bottom-0 left-0 h-1 w-full" aria-hidden />
      {children}
    </section>
  );
}

export function HeroBackground({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("absolute inset-0 z-10", className)}
      data-hero-slot="background"
      {...rest}
    >
      {children}
    </div>
  );
}

export function HeroMidground({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-20", className)}
      data-hero-slot="midground"
      {...rest}
    >
      {children}
    </div>
  );
}

interface OverlayGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gradient direction. Defaults to "to top" (anchors copy at bottom-left). */
  direction?: string;
  /** Tint color — hex or CSS color. Defaults to black. */
  tint?: string;
  /** Opacity at the strong end of the gradient (0–1). Defaults to 0.6. */
  intensity?: number;
}

export function HeroOverlayGradient({
  direction = "to top",
  tint = "rgba(0,0,0,1)",
  intensity = 0.6,
  className,
  style,
  ...rest
}: OverlayGradientProps) {
  // Normalize a non-zero opacity at strong end. WCAG AA on photos = 0.35–0.60.
  const a0 = `rgba(0,0,0,0)`;
  const tintAtIntensity = tint.startsWith("rgba")
    ? tint.replace(/,\s*[01](?:\.\d+)?\s*\)$/, `, ${intensity})`)
    : tint;
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-[25]", className)}
      data-hero-slot="overlay-gradient"
      style={{
        background: `linear-gradient(${direction}, ${tintAtIntensity}, ${a0} 70%)`,
        ...style,
      }}
      {...rest}
    />
  );
}

export function HeroForeground({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("absolute inset-0 z-30", className)}
      data-hero-slot="foreground"
      {...rest}
    >
      {children}
    </div>
  );
}

export function HeroMotionLayer({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("container relative z-40", className)}
      data-hero-slot="motion-layer"
      {...rest}
    >
      {children}
    </div>
  );
}
