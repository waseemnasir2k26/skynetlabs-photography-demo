import type { Metadata, Viewport } from "next";
import {
  // Photography-only font set — other niches' fonts pruned for perf (LCP + font reqs)
  Inter,             // body fallback for legacy compat
  Manrope,           // body (config-driven)
  JetBrains_Mono,    // mono (technical metadata strip)
  Tenor_Sans,        // display (config-driven)
} from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkynetBadge } from "@/components/demo/SkynetBadge";
import { StickyTelBar } from "@/components/funnel/StickyTelBar";
import { StickyCTA } from "@/components/StickyCTA";
import dynamic from "next/dynamic";
const ExitIntentModal = dynamic(
  () => import("@/components/funnel/ExitIntentModal").then((m) => m.ExitIntentModal),
  { ssr: false },
);
import { siteConfig } from "@/lib/config";
import { hexToHsl } from "@/lib/theme";
import { buildLocalBusinessJsonLd, buildMetadata } from "@/lib/seo";
import "./globals.css";

// ── Photography font set (3 + 1 fallback) ─────────────────────────────────────
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const tenorSans = Tenor_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-tenor-sans",
  display: "swap",
});

// ── Font registry — photography-pruned (Tenor Sans / Manrope / JetBrains Mono) ─
const FONT_REGISTRY: Record<string, { variable: string; cssVar: string }> = {
  Inter: { variable: inter.variable, cssVar: "--font-inter" },
  Manrope: { variable: manrope.variable, cssVar: "--font-manrope" },
  "JetBrains Mono": { variable: jetbrainsMono.variable, cssVar: "--font-jetbrains-mono" },
  "Tenor Sans": { variable: tenorSans.variable, cssVar: "--font-tenor-sans" },
};

const ALL_FONT_VARS = [
  inter.variable,
  manrope.variable,
  jetbrainsMono.variable,
  tenorSans.variable,
].join(" ");

export const metadata: Metadata = buildMetadata({});

export const viewport: Viewport = {
  themeColor: siteConfig.theme?.primary ?? siteConfig.palette?.accent ?? "#7A2E2A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // v1: use theme.font_heading/font_body; v2: those fields are absent
  const legacyHeadingFont = siteConfig.theme?.font_heading ?? "Instrument Serif";
  const legacyBodyFont = siteConfig.theme?.font_body ?? "Inter";
  const headingEntry = FONT_REGISTRY[legacyHeadingFont] ?? FONT_REGISTRY.Inter;
  const bodyEntry = FONT_REGISTRY[legacyBodyFont] ?? FONT_REGISTRY.Inter;

  // v2: resolve display + body from fonts.display / fonts.body if present
  const v2Fonts = siteConfig.fonts;
  const displayEntry = v2Fonts
    ? (FONT_REGISTRY[v2Fonts.display] ?? FONT_REGISTRY.Inter)
    : headingEntry;
  const bodyV2Entry = v2Fonts
    ? (FONT_REGISTRY[v2Fonts.body] ?? FONT_REGISTRY.Inter)
    : bodyEntry;
  // mono: v2 configs send null explicitly; fall back to JetBrains Mono
  const monoEntry = (v2Fonts?.mono && v2Fonts.mono !== null)
    ? (FONT_REGISTRY[v2Fonts.mono] ?? FONT_REGISTRY["JetBrains Mono"])
    : FONT_REGISTRY["JetBrains Mono"];

  // v1 theme mode (optional in v2). v2 dark_mode flag forces dark.
  const v2Dark = (siteConfig as { dark_mode?: boolean }).dark_mode === true;
  const themeMode = v2Dark
    ? "dark"
    : siteConfig.theme?.mode === "auto"
      ? "system"
      : (siteConfig.theme?.mode ?? "light");
  const enableSystem = !v2Dark && siteConfig.theme?.mode === "auto";

  // v2 palette — use config.palette if present, else fallback to legacy theme colors
  const p = siteConfig.palette;
  const legacyBg = "#FFFFFF";
  const legacySurface = "#F9FAFB";
  const legacyInk = "#111827";

  // Hairline tokens — light vs dark mode pull from ink with low alpha so dividers
  // remain visible on both #FFF and #0A0A0A surfaces. Brief calls for cream/15
  // and cream/20 dividers in dark photography mode.
  const hairlineWeak = v2Dark ? "rgba(245,241,234,0.12)" : "rgba(0,0,0,0.08)";
  const hairlineMid = v2Dark ? "rgba(245,241,234,0.18)" : "rgba(0,0,0,0.10)";
  const hairlineStrong = v2Dark ? "rgba(245,241,234,0.30)" : "rgba(0,0,0,0.20)";

  const paletteVars = p
    ? `
  --bg: ${p.bg};
  --surface: ${p.surface};
  --ink: ${p.ink};
  --accent2: ${p.accent};
  --detail: ${p.detail};
  --hairline-weak: ${hairlineWeak};
  --hairline-mid: ${hairlineMid};
  --hairline-strong: ${hairlineStrong};`
    : `
  --bg: ${legacyBg};
  --surface: ${legacySurface};
  --ink: ${legacyInk};
  --accent2: ${siteConfig.theme?.accent ?? "#C8A35B"};
  --detail: ${siteConfig.theme?.secondary ?? "#EDE3D2"};
  --hairline-weak: ${hairlineWeak};
  --hairline-mid: ${hairlineMid};
  --hairline-strong: ${hairlineStrong};`;

  // Legacy HSL-based CSS vars (only when theme is present)
  const legacyThemeVars = siteConfig.theme
    ? `
      --primary: ${hexToHsl(siteConfig.theme.primary)};
      --accent: ${hexToHsl(siteConfig.theme.accent)};
      --secondary: ${hexToHsl(siteConfig.theme.secondary)};
      --ring: ${hexToHsl(siteConfig.theme.primary)};`
    : `
      --primary: ${hexToHsl(p?.accent ?? "#7A2E2A")};
      --accent: ${hexToHsl(p?.detail ?? "#C8A35B")};
      --secondary: ${hexToHsl(p?.surface ?? "#EDE3D2")};
      --ring: ${hexToHsl(p?.accent ?? "#7A2E2A")};`;

  const themeStyle = `
    :root {${legacyThemeVars}
      --font-heading: var(${headingEntry.cssVar});
      --font-body: var(${bodyEntry.cssVar});
      --font-display: var(${displayEntry.cssVar});
      --font-body-v2: var(${bodyV2Entry.cssVar});
      --font-mono: var(${monoEntry.cssVar});${paletteVars}
    }
  `;

  return (
    <html lang={siteConfig.location.country === "UK" ? "en-GB" : "en-US"} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
        <link rel="preconnect" href="https://api.web3forms.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessJsonLd()) }}
        />
      </head>
      <body className={ALL_FONT_VARS}>
        <ThemeProvider defaultTheme={themeMode as "light" | "dark" | "system"} enableSystem={enableSystem}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <SkynetBadge />
          {/* Editorial dark mode (photography): swap phone-first StickyTelBar for
              boutique single-CTA StickyCTA per DESIGN_SYSTEM mobile rule. */}
          {v2Dark ? (
            <StickyCTA href="#contact" label="Inquire — limited 2026 dates" />
          ) : (
            <StickyTelBar />
          )}
          <ExitIntentModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
