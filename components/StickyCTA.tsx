"use client";
/**
 * Phase 4 StickyCTA — flexible bottom-fixed CTA bar.
 *
 *   - Reads label + tel from siteConfig.copy / siteConfig.funnel (existing pattern).
 *   - safe-area-inset-bottom respected (notched / home-indicator devices).
 *   - Scroll-aware: hides on scroll-up, reappears on scroll-down past 200px.
 *   - Dismissable (sessionStorage gate).
 *   - prefers-reduced-motion: instant transitions, no slide.
 *
 * NOTE: This is in addition to the existing components/funnel/StickyTelBar.tsx
 * which is the trade-vertical phone-first sticky bar mounted globally in
 * layout.tsx. <StickyCTA> can be rendered per-page when a single-CTA bar is
 * preferred (editorial niches, lead-magnet pages).
 */

import * as React from "react";
import { ArrowRight, X } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const SESSION_KEY = "skynetlabs-sticky-cta-dismissed";

interface StickyCTAProps {
  /** Optional label override; falls back to siteConfig.copy.sticky_mobile_bar. */
  label?: string;
  /** Optional href override; defaults to "#quote". */
  href?: string;
  /** When true, hide on desktop (md+). Defaults to true (mobile-only). */
  mobileOnly?: boolean;
  className?: string;
}

export function StickyCTA({
  label,
  href = "#quote",
  mobileOnly = true,
  className,
}: StickyCTAProps) {
  const [show, setShow] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      setDismissed(true);
      return;
    }
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      // hide on scroll-up; show on scroll-down past 200px
      if (y < 200) {
        setShow(false);
      } else if (delta > 0) {
        setShow(true);
      } else if (delta < -4) {
        // scroll-up — hide (skip if reduced motion: keep stable)
        if (!reduced) setShow(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  const ctaLabel =
    label ??
    siteConfig.copy?.sticky_mobile_bar ??
    siteConfig.copy?.primary_cta ??
    "Get a free quote";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 shadow-hard backdrop-blur transition-transform duration-normal ease-hover",
        show ? "translate-y-0" : "translate-y-full",
        mobileOnly ? "md:hidden" : "",
        className,
      )}
      style={{
        borderColor: "rgba(0,0,0,0.1)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
      role="region"
      aria-label="Primary call to action"
    >
      <div className="flex items-center gap-2 p-3">
        <a
          href={href}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-rad-md text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--accent2, var(--accent))",
            color: "#fff",
          }}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            sessionStorage.setItem(SESSION_KEY, "1");
            setDismissed(true);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-rad-md text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
