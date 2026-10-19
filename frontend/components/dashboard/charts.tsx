"use client";
/**
 * Small, dependency-free SVG charts following the data-viz rules: thin marks, 2px gaps between stacked
 * segments, one axis, status colours reserved for verdicts, hover tooltips, text in text tokens.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import type { DailyPoint, Verdict } from "@/types/api";

const ORDER: Verdict[] = ["GREEN", "GREY", "AMBER", "RED"]; // bottom → top
const COLOR: Record<Verdict, string> = { GREEN: "var(--green)", AMBER: "var(--amber)", RED: "var(--red)", GREY: "var(--grey)" };

export function DailyBars({ data }: { data: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 200, padL = 28, padB = 22, gap = 2;
  const n = Math.max(1, data.length);
  const max = Math.max(1, ...data.map((d) => d.total));
  const bw = (W - padL) / n;
  const barW = Math.max(3, bw - Math.min(6, bw * 0.35));
  const ticks = [0, Math.ceil(max / 2), max];
  const show = data.filter((_, k) => n <= 14 || k % Math.ceil(n / 12) === 0);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Checks per day by verdict">
        {ticks.map((tk) => {
          const y = H - padB - (tk / max) * (H - padB - 8);
          return (
            <g key={tk}>
              <line x1={padL} x2={W} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-mono)">{tk}</text>
            </g>
          );
        })}
        {data.map((d, k) => {
          const x = padL + k * bw + (bw - barW) / 2;
          let yCursor = H - padB;
          return (
            <g key={d.date} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)}>
              <rect x={padL + k * bw} y={0} width={bw} height={H - padB} fill="transparent" />
              {ORDER.map((v) => {
                const val = d[v];
                if (!val) return null;
                const h = (val / max) * (H - padB - 8);
                yCursor -= h;
                const y = yCursor;
                yCursor -= gap;
                return <motion.rect key={v} x={x} width={barW} rx={2} initial={{ y: H - padB, height: 0 }} animate={{ y, height: Math.max(0, h - (v === ORDER[0] ? 0 : 0)) }} transition={{ duration: 0.6, delay: k * 0.015 }} fill={COLOR[v]} opacity={hover === null || hover === k ? 0.95 : 0.45} />;
              })}
            </g>
          );
        })}
        {show.map((d) => {
          const k = data.indexOf(d);
          return (
            <text key={d.date} x={padL + k * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--ink-3)" fontFamily="var(--font-mono)">
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-lg border border-line bg-surface-solid px-3 py-2 text-xs shadow-xl">
          <p className="font-mono text-ink-3">{data[hover].date}</p>
          <p className="text-ink font-semibold">{data[hover].total} checks</p>
          <p className="text-ink-2">RED {data[hover].RED} · AMBER {data[hover].AMBER} · GREEN {data[hover].GREEN} · N/A {data[hover].GREY}</p>
        </div>
      )}
    </div>
  );
}

export function Donut({ parts, total }: { parts: { key: Verdict; value: number }[]; total: number }) {
  const R = 44, C = 2 * Math.PI * R;
  const segments = parts.reduce<{ key: Verdict; frac: number; start: number }[]>((acc, p) => {
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].frac : 0;
    acc.push({ key: p.key, frac: total ? p.value / total : 0, start });
    return acc;
  }, []);
  return (
    <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" role="img" aria-label="Verdict split">
      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
      {segments.map((sg) => {
        const len = Math.max(0, sg.frac * C - 2);
        return (
          <motion.circle key={sg.key} cx="60" cy="60" r={R} fill="none" stroke={COLOR[sg.key]} strokeWidth="12" strokeLinecap="butt" strokeDasharray={`${len} ${C - len}`} initial={{ strokeDashoffset: C / 4 }} animate={{ strokeDashoffset: C / 4 - sg.start * C }} transition={{ duration: 0.8 }} />
        );
      })}
      <text x="60" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)">{total}</text>
      <text x="60" y="72" textAnchor="middle" fontSize="8" fill="var(--ink-3)" fontFamily="var(--font-mono)" letterSpacing="1.5">CHECKS</text>
    </svg>
  );
}

export function HBars({ items, tone = "mint" }: { items: { label: string; sub?: string; value: number }[]; tone?: "mint" | "saffron" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const color = tone === "mint" ? "linear-gradient(90deg, var(--mint-deep), var(--mint))" : "linear-gradient(90deg, var(--saffron-deep), var(--saffron-bright))";
  if (items.length === 0) return <p className="text-sm text-ink-3">No data yet.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((i, k) => (
        <li key={i.label} className="group">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink truncate">
              <span className="font-mono text-[10px] text-ink-3 mr-2">{String(k + 1).padStart(2, "0")}</span>
              {i.label} {i.sub && <span className="text-ink-3 text-xs">· {i.sub}</span>}
            </span>
            <span className="font-mono text-ink-2">{i.value}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} whileInView={{ width: `${(i.value / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: k * 0.05 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
