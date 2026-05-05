/**
 * Phase 4 Card primitive — DESIGN_SYSTEM "Card primitives" block.
 *
 *   default:  bg=surface, border=1px hairline, radius=lg, shadow=soft
 *             hover→shadow-medium + translate-y-[-2px], duration=normal
 *   featured: bg=surface, border=2px accent, radius=lg, shadow=medium
 *             hover→shadow-hard + accent-border-glow
 *   outlined: bg=transparent, border=1px ink/30, radius=md, no shadow
 *             hover→bg=surface
 *   dark:     bg=ink-elevated, border=1px ink/20, radius=lg, shadow=hero w/ niche-hue glow
 *             hover→border-accent-50
 *
 * Padding: 24px mobile, 32px desktop.
 * Headline: display font, clamp(20px, 2vw, 28px). Body: 15–16px.
 *
 * Adapted from shadcn-ui/apps/v4/ Card primitives + extended with the
 * cross-niche variant matrix.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  // base — padding, transition baseline
  "relative p-6 md:p-8 transition-all duration-normal ease-hover",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface,hsl(var(--card)))] text-[var(--ink,hsl(var(--card-foreground)))] " +
          "border border-[rgba(0,0,0,0.08)] rounded-rad-lg shadow-soft " +
          "hover:shadow-medium hover:-translate-y-0.5",
        featured:
          "bg-[var(--surface,hsl(var(--card)))] text-[var(--ink,hsl(var(--card-foreground)))] " +
          "border-2 border-[var(--accent2,hsl(var(--primary)))] rounded-rad-lg shadow-medium " +
          "hover:shadow-hard hover:ring-2 hover:ring-[var(--accent2,hsl(var(--primary)))]/30 " +
          "hover:-translate-y-0.5",
        outlined:
          "bg-transparent text-[var(--ink,hsl(var(--foreground)))] " +
          "border border-[rgba(0,0,0,0.30)] rounded-rad-md " +
          "hover:bg-[var(--surface,hsl(var(--muted)))]",
        dark:
          "bg-[#1A1A1A] text-white " +
          "border border-white/10 rounded-rad-lg shadow-hero " +
          "hover:border-[var(--accent2,hsl(var(--primary)))]/50",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    // clamp(20px, 2vw, 28px) per spec
    className={cn(
      "font-display font-semibold leading-tight tracking-tight text-[clamp(1.25rem,2vw,1.75rem)]",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[15px] leading-relaxed opacity-80 md:text-base", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-6 flex items-center gap-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { cardVariants };
