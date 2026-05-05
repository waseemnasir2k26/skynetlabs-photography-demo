"use client";
/**
 * Phase 4 TestimonialCarousel — 6-card carousel.
 *
 *   Each card: photo top-left + city + service tag + 5-star rating + quote.
 *   Drag-snap on desktop, swipe on mobile (Framer Motion drag x-axis).
 *   prefers-reduced-motion: degrade to static 3-up grid (or 1-up <md).
 *
 * NOTE: This is a NEW top-level component, in addition to the existing
 * components/sections/TestimonialCarousel.tsx (single-quote auto-rotate).
 * Existing sections/* consumers stay working; per-niche briefs in Phase 5
 * may opt into this 6-card variant via a section-level import.
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Card } from "@/components/Card";
import { FM_DURATION, EASE } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

type CarouselTestimonial = {
  quote: string;
  name: string;
  role?: string;
  city?: string;
  serviceTag?: string;
  photoUrl?: string;
  rating?: number;
};

interface TestimonialCarouselProps {
  testimonials?: CarouselTestimonial[];
  className?: string;
  variant?: "default" | "featured" | "outlined" | "dark";
}

function pickFromConfig(): CarouselTestimonial[] {
  // Prefer v2 testimonials_v2; fall back to v1 testimonials.
  const v2 = siteConfig.testimonials_v2;
  if (Array.isArray(v2) && v2.length > 0) {
    return v2.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      city: t.city,
      photoUrl: t.photo_url,
      rating: 5,
    }));
  }
  return (siteConfig.testimonials ?? []).map((t) => ({
    quote: t.quote,
    name: t.name,
    role: t.role,
    city: t.city,
    photoUrl: t.avatar_url,
    rating: 5,
  }));
}

export function TestimonialCarousel({
  testimonials,
  className,
  variant = "default",
}: TestimonialCarouselProps) {
  const reduced = useReducedMotion();
  const items = (testimonials && testimonials.length > 0
    ? testimonials
    : pickFromConfig()
  ).slice(0, 6);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [dragWidth, setDragWidth] = React.useState(0);

  React.useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      setDragWidth(Math.max(0, el.scrollWidth - el.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  if (items.length === 0) return null;

  if (reduced) {
    return (
      <section className={cn("py-section-normal", className)}>
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {items.slice(0, 3).map((t, i) => (
              <TestimonialCard key={i} t={t} variant={variant} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-section-normal overflow-hidden", className)}>
      <div className="container">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: -dragWidth, right: 0 }}
          dragElastic={0.08}
          dragSnapToOrigin={false}
          className="flex cursor-grab gap-5 active:cursor-grabbing select-none"
          transition={{ duration: FM_DURATION.normal, ease: EASE.entry }}
        >
          {items.map((t, i) => (
            <div
              key={i}
              className="w-[85%] shrink-0 sm:w-[60%] md:w-[40%] lg:w-[32%]"
            >
              <TestimonialCard t={t} variant={variant} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({
  t,
  variant,
}: {
  t: CarouselTestimonial;
  variant: "default" | "featured" | "outlined" | "dark";
}) {
  const stars = t.rating ?? 5;
  return (
    <Card variant={variant} className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        {t.photoUrl ? (
          <Image
            src={t.photoUrl}
            alt={t.name}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-base font-semibold uppercase"
            aria-hidden
          >
            {t.name.slice(0, 1)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold">{t.name}</span>
          {t.city && (
            <span className="text-xs opacity-70">{t.city}</span>
          )}
        </div>
      </div>
      {t.serviceTag && (
        <span className="mt-3 inline-flex w-fit rounded-rad-sm bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider opacity-80">
          {t.serviceTag}
        </span>
      )}
      <div className="mt-3 flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < stars ? "fill-current text-yellow-500" : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed md:text-base">
        “{t.quote}”
      </blockquote>
    </Card>
  );
}
