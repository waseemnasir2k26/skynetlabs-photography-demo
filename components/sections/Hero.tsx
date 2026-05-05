"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { renderItalic } from "@/lib/markdown-italic";

// ── Lazy R3F variants ─────────────────────────────────────────────────────────
const ToothMesh = dynamic(() => import("@/components/HeroR3F/Tooth"), { ssr: false });
const FilmCanister = dynamic(() => import("@/components/HeroR3F/FilmCanister"), { ssr: false });
const MarbleColumn = dynamic(() => import("@/components/HeroR3F/MarbleColumn"), { ssr: false });
const Floorplan = dynamic(() => import("@/components/HeroR3F/Floorplan"), { ssr: false });
const Mansion = dynamic(() => import("@/components/HeroR3F/Mansion"), { ssr: false });

// ── Legacy fallbacks (kept for backward compat) ───────────────────────────────
const HeroR3FLegacy = dynamic(() => import("./HeroR3F").then((m) => m.HeroR3F), { ssr: false });
const HeroMP4 = dynamic(() => import("./HeroMP4").then((m) => m.HeroMP4), { ssr: false });

export function Hero() {
  const { hero, hero_3d, theme, owner, copy } = siteConfig;
  const tel = `tel:${owner.contact_phone ?? ""}`;

  // Reduce-motion detection
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // v2 hero has h1/sub directly; v1 hero has headline/sub
  const h1Text = copy?.h1 ?? hero?.h1 ?? hero?.headline ?? siteConfig.brand.tagline;
  const subText = copy?.sub ?? hero?.sub ?? siteConfig.brand.tagline;
  const primaryCtaLabel = copy?.primary_cta ?? hero?.cta_primary?.label ?? "Get a free quote →";
  const stickyText = copy?.sticky_mobile_bar;

  // v2: hero.kind determines scene; v1: hero_3d.r3f_scene
  const heroKind = hero?.kind; // "r3f" | "photo" | "cinemagraph" | undefined
  const posterSrc = hero_3d?.poster_src ?? hero?.src ?? "/hero/poster.jpg";
  // Map v2 hero.kind + hero_3d fields → scene string used by renderBg
  let scene = hero_3d?.r3f_scene;
  if (!scene && heroKind === "r3f") {
    // map hero_3d.r3f_scene from the config's hero_3d block (dental has "r3f-tooth")
    scene = hero_3d?.r3f_scene ?? "r3f-tooth";
  } else if (!scene && heroKind === "cinemagraph") {
    scene = "cinemagraph";
  } else if (!scene && heroKind === "photo") {
    scene = "photo";
  }

  // ── Background layer ────────────────────────────────────────────────────────
  function renderBg() {
    if (reducedMotion) {
      return (
        <Image
          src={posterSrc}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="absolute inset-0 -z-10 object-cover"
        />
      );
    }

    switch (scene) {
      case "r3f-tooth":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <ToothMesh posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-film-canister":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <FilmCanister posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-marble-column":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <MarbleColumn posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-floorplan":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <Floorplan posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "r3f-mansion":
        return (
          <React.Suspense fallback={<StaticPoster src={posterSrc} />}>
            <Mansion posterSrc={posterSrc} />
          </React.Suspense>
        );
      case "cinemagraph":
        return (
          <HeroCinemagraph
            mp4Src={hero_3d?.mp4_src ?? hero?.src ?? ""}
            posterSrc={posterSrc}
          />
        );
      case "photo":
        return (
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="absolute inset-0 -z-10 object-cover"
          />
        );
      default:
        // legacy v1 paths
        if (hero_3d?.variant === "r3f-flagship") {
          return <HeroR3FLegacy primaryColor={theme?.primary ?? "#7A2E2A"} accentColor={theme?.accent ?? "#C8A35B"} />;
        }
        if (hero_3d?.mp4_src) {
          return <HeroMP4 src={hero_3d.mp4_src} poster={posterSrc} />;
        }
        return (
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="absolute inset-0 -z-10 object-cover"
          />
        );
    }
  }

  // Photography flagship: dark editorial mode triggers a brushed-brass primary
  // CTA + ghost secondary + technical-metadata strip beneath. Detect via the
  // top-level dark_mode flag in the parsed config (additive — keeps non-photo
  // demos using the underline-link primary).
  const cfgDark = (siteConfig as { dark_mode?: boolean }).dark_mode === true;
  const niche = (siteConfig as { niche?: string }).niche;
  const isPhotographyFlagship = cfgDark && niche === "photography";

  return (
    <section id="hero" className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
      {/* Sentinel at bottom of hero for StickyTelBar IntersectionObserver */}
      <div id="hero-sentinel" className="absolute bottom-0 left-0 h-1 w-full" aria-hidden />
      {renderBg()}

      <div className="container relative z-10 grid gap-10 py-24 md:grid-cols-12 md:py-36">
        <motion.div
          className="md:col-span-8 lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Eyebrow strip (photography only) — JetBrains Mono small-caps */}
          {isPhotographyFlagship && (
            <p
              className="mb-6 text-[11px] font-medium tracking-[0.18em] uppercase"
              style={{
                color: "var(--accent2, #B89968)",
                fontFamily: "var(--font-mono, ui-monospace)",
                opacity: 0.85,
              }}
            >
              ISO 400 / 35mm / KODAK PORTRA / BROOKLYN NY 11221
            </p>
          )}
          {/* H1 — display font with markdown-italic support */}
          <h1
            className="font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display, var(--font-heading))", color: "var(--ink, inherit)" }}
          >
            {renderItalic(h1Text)}
          </h1>

          {/* Sub */}
          <p
            className="mt-6 max-w-xl text-base md:text-lg"
            style={{ fontFamily: "var(--font-body-v2, var(--font-body))", color: "var(--ink, inherit)", opacity: 0.78 }}
          >
            {subText}
          </p>

          {/* CTAs */}
          {isPhotographyFlagship ? (
            <>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                {/* Primary brushed-brass — book a session */}
                <a
                  href={hero?.cta_primary?.href ?? "#contact"}
                  className="inline-flex w-full items-center justify-center rounded-md px-7 py-3.5 text-sm font-medium tracking-wider uppercase transition-all hover:translate-y-[-1px] sm:w-auto"
                  style={{
                    background: "var(--accent2, #B89968)",
                    color: "#0A0A0A",
                    fontFamily: "var(--font-body-v2, var(--font-body))",
                    boxShadow: "0 30px 80px -20px rgba(184,153,104,0.30), 0 8px 24px -4px rgba(184,153,104,0.18)",
                    letterSpacing: "0.08em",
                  }}
                >
                  Book a session
                </a>
                {/* Secondary ghost — view portfolio */}
                <a
                  href="#gallery"
                  className="inline-flex w-full items-center justify-center rounded-md border px-7 py-3.5 text-sm font-medium tracking-wider uppercase transition-all hover:opacity-80 sm:w-auto"
                  style={{
                    borderColor: "rgba(245,241,234,0.30)",
                    color: "var(--ink, #F5F1EA)",
                    background: "transparent",
                    fontFamily: "var(--font-body-v2, var(--font-body))",
                    letterSpacing: "0.08em",
                  }}
                >
                  View portfolio
                </a>
              </div>
              {/* Equipment spec callout */}
              <p
                className="mt-8 text-[10px] font-medium uppercase tracking-[0.20em]"
                style={{
                  color: "var(--ink, #F5F1EA)",
                  fontFamily: "var(--font-mono, ui-monospace)",
                  opacity: 0.55,
                }}
              >
                PROFOTO B10 · HASSELBLAD H6D · KODAK PORTRA 400 · APUTURE 600D
              </p>
            </>
          ) : (
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={hero?.cta_primary?.href ?? "#contact"}
                className="underline-link text-base font-medium underline underline-offset-4 decoration-1 hover:opacity-80 transition-opacity"
                style={{ color: "var(--accent2, var(--ink))", fontFamily: "var(--font-display, inherit)", fontStyle: "italic" }}
              >
                {primaryCtaLabel}
              </a>
              {owner.contact_phone && (
                <a
                  href={tel}
                  className="rounded-full border px-5 py-2.5 text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    borderColor: "var(--ink, #111)",
                    color: "var(--ink, #111)",
                    background: "transparent",
                  }}
                >
                  {stickyText ?? (hero?.cta_secondary?.label ?? `Call ${owner.contact_phone}`)}
                </a>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function StaticPoster({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      priority
      fetchPriority="high"
      className="absolute inset-0 -z-10 object-cover"
    />
  );
}

function HeroCinemagraph({ mp4Src, posterSrc }: { mp4Src: string; posterSrc: string }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        className="h-full w-full object-cover"
      >
        <source src={mp4Src} type="video/mp4" />
      </video>
    </div>
  );
}
