"use client";
import { motion } from "framer-motion";

const STEPS = ["Scan or type", "Review names", "Safety result"];

export function StepBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-xs font-mono tracking-wider" aria-label="Progress">
      {STEPS.map((s, k) => {
        const n = k + 1;
        const done = n < current;
        const on = n === current;
        return (
          <li key={s} className="flex items-center gap-2">
            <span className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${on ? "border-mint text-primary-ink" : done ? "border-mint/50 text-mint" : "border-line-2 text-ink-3"}`}>
              {on && <motion.span layoutId="step-pill" className="absolute inset-0 rounded-full bg-mint" />}
              <span className="relative z-10">{done ? "✓" : n}</span>
            </span>
            <span className={`hidden sm:inline uppercase ${on ? "text-ink" : done ? "text-mint" : "text-ink-3"}`}>{s}</span>
            {k < STEPS.length - 1 && <span className={`mx-1 h-px w-8 sm:w-14 ${done ? "bg-mint/60" : "bg-line-2"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
