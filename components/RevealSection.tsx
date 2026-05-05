"use client";
/**
 * Phase 4 RevealSection — DESIGN_SYSTEM "Section reveal" spec.
 *
 *   viewport: -10% (start when 10% above viewport bottom)
 *   stagger:  80ms between children
 *   initial:  opacity-0 + translate-y-4
 *   final:    opacity-1 + translate-y-0
 *   duration: 600ms (slow), easing: cubic-bezier(0.22, 1, 0.36, 1)
 *
 * On `prefers-reduced-motion: reduce`, the wrapper degrades to a plain
 * <section> with children in their final state (no animation).
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { revealVariants, staggerContainer, FM_DURATION, EASE } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

interface RevealSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Disable stagger when wrapping a single hero element. Defaults to true. */
  stagger?: boolean;
  children?: React.ReactNode;
}

export function RevealSection({
  children,
  stagger = true,
  className,
  ...rest
}: RevealSectionProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <section className={className} {...rest}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      variants={stagger ? staggerContainer : revealVariants}
      {...(rest as Omit<React.HTMLAttributes<HTMLElement>, "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragEnd" | "onDragStart">)}
    >
      {children}
    </motion.section>
  );
}

/**
 * Direct child wrapper — pair with <RevealSection> when you want the
 * 80ms inter-child stagger applied. For solo reveals just put the
 * variants on the element directly.
 */
interface RevealItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function RevealItem({
  children,
  className,
  ...rest
}: RevealItemProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className} {...rest}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      transition={{ duration: FM_DURATION.slow, ease: EASE.entry }}
      {...(rest as Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragEnd" | "onDragStart">)}
    >
      {children}
    </motion.div>
  );
}
