/**
 * Phase 4 motion tokens — single source of truth shared between
 *   - Tailwind transition-{duration,timing-function} extensions in tailwind.config.ts
 *   - Framer Motion variants in components (RevealSection, StickyCTA, ExitIntent, etc.)
 *
 * Numbers are kept in milliseconds; framer-motion expects seconds, so use
 * the FM_* exports (already converted) when building Motion variants.
 */

export const DURATION = {
  fast: 200,
  normal: 350,
  slow: 600,
  hero: 1200,
} as const;

export const EASE = {
  // ease-out cubic — entry / settle motion
  entry: [0.22, 1, 0.36, 1] as const,
  // ease-in-out — hover / focus / micro-interactions
  hover: [0.4, 0, 0.2, 1] as const,
  // long ease-out — hero choreography, premium feel
  hero: [0.16, 1, 0.3, 1] as const,
} as const;

// framer-motion expects seconds for `duration` prop
export const FM_DURATION = {
  fast: DURATION.fast / 1000,
  normal: DURATION.normal / 1000,
  slow: DURATION.slow / 1000,
  hero: DURATION.hero / 1000,
} as const;

export const STAGGER = {
  // 80ms between children — DESIGN_SYSTEM section reveal spec
  default: 0.08,
  tight: 0.05,
  loose: 0.12,
} as const;

/**
 * SSR-safe prefers-reduced-motion check.
 * Returns false on the server (motion enabled until hydration), then re-checks
 * in useEffect on the client. Components that need to react to changes should
 * subscribe via matchMedia('(prefers-reduced-motion: reduce)').addEventListener.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Standard reveal variants, ready to drop into <motion.div variants={...}>.
 * Pair with viewport={{ once: true, margin: "-10%" }} for spec-compliant scroll reveals.
 */
export const revealVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: FM_DURATION.slow, ease: EASE.entry },
  },
} as const;

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: STAGGER.default },
  },
} as const;
