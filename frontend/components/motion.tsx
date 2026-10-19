"use client";
/**
 * Motion primitives shared across the site. Everything respects prefers-reduced-motion through Framer Motion's
 * MotionConfig and the global CSS fallback.
 */
import { AnimatePresence, motion, MotionConfig, useInView, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
export const stagger = (delay = 0.08, delayChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren } },
});

/** Reveal children when they scroll into view (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  as = "div",
  amount = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  as?: "div" | "section" | "li" | "article" | "span" | "p" | "h1" | "h2" | "h3";
  amount?: number;
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount }} variants={variants} transition={{ delay }}>
      {children}
    </Comp>
  );
}

/** Container that staggers its motion children. */
export function Stagger({ children, className, delay = 0.08, as = "div", amount = 0.2 }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "ul" | "ol" | "section"; amount?: number }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount }} variants={stagger(delay)}>
      {children}
    </Comp>
  );
}

export const Item = motion.div;
export const MotionLi = motion.li;

/** Animated number that counts up when visible. */
export function Counter({ to, duration = 1.6, suffix = "", prefix = "", decimals = 0, className }: { to: number; duration?: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const text = useTransform(spring, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);
  const [display, setDisplay] = useState(`${prefix}${(0).toFixed(decimals)}${suffix}`);
  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);
  useEffect(() => text.on("change", (v) => setDisplay(v)), [text]);
  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      {display}
    </span>
  );
}

/** Soft fade/slide between routes. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

/** Subtle 3D tilt that follows the pointer — used on hero/preview cards. */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 1000 }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Animated gradient blobs for section backgrounds. */
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`aurora ${className}`} aria-hidden>
      <span className="a1" />
      <span className="a2" />
      <span className="a3" />
    </div>
  );
}

export { motion, AnimatePresence };
