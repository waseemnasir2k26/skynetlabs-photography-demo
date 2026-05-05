import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // v2 palette tokens — driven by CSS variables injected in layout.tsx
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        accent2: "var(--accent2)",
        detail: "var(--detail)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-heading)", "ui-serif", "Georgia", "serif"],
        "body-v2": ["var(--font-body-v2)", "var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      spacing: {
        "section-tight": "4rem",
        "section-normal": "6rem",
        "section-generous": "9rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // v2 design-system rad-* tokens (additive — do not override existing lg/md/sm)
        "rad-sm": "6px",
        "rad-md": "12px",
        "rad-lg": "18px",
        "rad-xl": "28px",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        medium: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
        hard: "0 10px 24px -6px rgb(0 0 0 / 0.18), 0 4px 8px -2px rgb(0 0 0 / 0.10)",
        hero: "0 30px 80px -20px rgb(0 0 0 / 0.35), 0 8px 24px -4px rgb(0 0 0 / 0.18)",
      },
      transitionTimingFunction: {
        entry: "cubic-bezier(0.22, 1, 0.36, 1)",
        hover: "cubic-bezier(0.4, 0, 0.2, 1)",
        hero: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "200ms",
        normal: "350ms",
        slow: "600ms",
        hero: "1200ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 8s linear infinite",
        "fade-in-up": "fade-in-up 600ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
