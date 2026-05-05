"use client";
import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";

const PLACEHOLDERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
  (n) => `/gallery/${String(n).padStart(2, "0")}.jpg`,
);

// Editorial / Fashion / Portrait / Brand — categorized portfolio nav per brief.
// Each photo gets a category cycle so the filter UI is meaningful even when
// the upstream config only ships an 8-photo gallery.
const CATEGORIES = ["All", "Editorial", "Fashion", "Portrait", "Brand"] as const;
type Category = (typeof CATEGORIES)[number];

const CAPTIONS = [
  { treatment: "35mm · Kodak Portra 400", year: "2025", category: "Editorial" },
  { treatment: "Medium format · Pentax 67", year: "2025", category: "Fashion" },
  { treatment: "Digital · Sony A1", year: "2024", category: "Portrait" },
  { treatment: "120 · Hasselblad 503CW", year: "2025", category: "Brand" },
  { treatment: "35mm · Cinestill 800T", year: "2024", category: "Editorial" },
  { treatment: "Digital · Hasselblad X2D", year: "2025", category: "Fashion" },
  { treatment: "120 · Contax 645", year: "2024", category: "Portrait" },
  { treatment: "Profoto B10 · A1", year: "2025", category: "Brand" },
  { treatment: "35mm · Portra 800", year: "2024", category: "Editorial" },
  { treatment: "Medium format · Hasselblad 503CW", year: "2025", category: "Fashion" },
  { treatment: "Digital · Sony FX3", year: "2025", category: "Portrait" },
  { treatment: "120 · Pentax 67 · 105 f/2.4", year: "2024", category: "Brand" },
];

export function PhotoGallery() {
  const galleryFromConfig = siteConfig.photos?.gallery ?? [];
  // Pad to 12 entries so masonry has rhythm; reuse photos when fewer ship from config.
  const photos = React.useMemo(() => {
    const base = galleryFromConfig.length > 0 ? galleryFromConfig : PLACEHOLDERS;
    const out: string[] = [];
    for (let i = 0; i < 12; i++) out.push(base[i % base.length]);
    return out;
  }, [galleryFromConfig]);

  const [active, setActive] = React.useState<Category>("All");
  const filtered = photos
    .map((src, i) => ({ src, ...CAPTIONS[i % CAPTIONS.length], key: i }))
    .filter((p) => active === "All" || p.category === active);

  return (
    <section id="gallery" className="py-20 md:py-36" style={{ background: "var(--bg, #fff)" }}>
      <div className="container">
        <div className="mb-12 max-w-2xl">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{
              color: "var(--accent2, var(--accent))",
              fontFamily: "var(--font-mono, ui-monospace)",
            }}
          >
            Portfolio
          </p>
          <h2
            className="text-4xl font-normal leading-[1.1] md:text-5xl"
            style={{
              fontFamily: "var(--font-display, var(--font-heading))",
              color: "var(--ink, #111)",
            }}
          >
            Selected work, by category.
          </h2>
        </div>

        {/* Categorized nav — horizontal scroll-snap pills on mobile, inline on desktop */}
        <div
          className="mb-10 flex gap-1 overflow-x-auto pb-1 md:flex-wrap"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className="shrink-0 rounded-md border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-all"
                style={{
                  scrollSnapAlign: "start",
                  borderColor: isActive
                    ? "var(--accent2, #B89968)"
                    : "var(--hairline-mid, rgba(0,0,0,0.15))",
                  color: isActive
                    ? "var(--bg, #0A0A0A)"
                    : "var(--ink, #111)",
                  background: isActive ? "var(--accent2, #B89968)" : "transparent",
                  fontFamily: "var(--font-mono, ui-monospace)",
                  letterSpacing: "0.14em",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Masonry — 3 desktop / 2 tablet / 1 mobile, varied aspect ratios */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            // Vary aspect ratio so it reads as masonry, not flat grid.
            const aspects = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[5/6]"];
            const aspect = aspects[i % aspects.length];
            return (
              <motion.figure
                key={`${p.key}-${active}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden"
                style={{
                  borderRadius: "12px",
                  background: "var(--surface, #1A1A1A)",
                }}
              >
                <div className={`relative ${aspect}`}>
                  <Image
                    src={p.src}
                    alt={`${p.category} — ${siteConfig.location.city} ${p.year}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* Hover overlay caption */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0) 70%)",
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.18em]"
                        style={{
                          color: "var(--accent2, #B89968)",
                          fontFamily: "var(--font-mono, ui-monospace)",
                        }}
                      >
                        {p.category} · {p.year}
                      </p>
                      <p
                        className="mt-1 text-sm"
                        style={{
                          color: "#F5F1EA",
                          fontFamily: "var(--font-body-v2, var(--font-body))",
                        }}
                      >
                        {p.treatment}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
