"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@/lib/hooks";
import { api } from "@/lib/api";
import { formatTimingGap, humanClass } from "@/lib/verdict";
import { ErrorPanel } from "@/components/ErrorPanel";
import { ArrowRight, GradeChip, SeverityChip, Spinner } from "@/components/ui";
import type { InteractionListResponse } from "@/types/api";

const PAGE = 24;
const QUICK = ["Ashwagandha", "Giloy", "Guggul", "Turmeric", "Mulethi", "Triphala", "warfarin", "levothyroxine", "metformin", "tacrolimus"];

export function KBExplorer() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [severity, setSeverity] = useState("");
  const [grade, setGrade] = useState("");
  const [offset, setOffset] = useState(0);
  const [dq, setDq] = useState(q);
  useEffect(() => {
    const h = setTimeout(() => setDq(q), 250);
    return () => clearTimeout(h);
  }, [q]);
  const key = JSON.stringify({ dq, severity, grade, offset });
  const { data: fresh, error, loading, retry } = useQuery<InteractionListResponse>(
    () => api.interactions({ q: dq || undefined, severity: severity || undefined, grade: grade || undefined, limit: PAGE, offset }),
    key,
  );
  const [last, setLast] = useState<InteractionListResponse | null>(null);
  if (fresh && fresh !== last) setLast(fresh);
  const data = fresh ?? last;

  return (
    <div>
      <div className="card p-4 grid gap-3 md:grid-cols-[1fr_190px_220px]">
        <label className="text-sm relative">
          <span className="sr-only">Search</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden>⌕</span>
          <input className="input pl-9" placeholder="Search: Ashwagandha, Thyronorm, warfarin, गिलोय…" value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} />
        </label>
        <select aria-label="Severity" className="input" value={severity} onChange={(e) => { setSeverity(e.target.value); setOffset(0); }}>
          <option value="">Any severity</option>
          <option value="major">Major</option>
          <option value="moderate">Moderate</option>
          <option value="minor">Minor</option>
        </select>
        <select aria-label="Evidence grade" className="input" value={grade} onChange={(e) => { setGrade(e.target.value); setOffset(0); }}>
          <option value="">Any evidence grade</option>
          <option value="A">A — RCT / systematic review</option>
          <option value="B">B — case reports / small trials</option>
          <option value="C">C — mechanistic / animal</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.map((x) => (
          <button key={x} type="button" className={`chip transition-colors hover:border-mint/50 hover:text-ink ${q === x ? "chip-mint" : ""}`} onClick={() => { setQ(x); setOffset(0); }}>
            {x}
          </button>
        ))}
        {q && <button type="button" className="chip hover:text-ink" onClick={() => setQ("")}>clear ×</button>}
      </div>

      <div className="mt-8">
        {error && <ErrorPanel error={error} onRetry={retry} />}
        {!error && loading && !data && <Spinner label="Loading interactions…" />}
        {data && (
          <>
            <p className="font-mono text-[11px] tracking-wider uppercase text-ink-3" aria-live="polite">
              {data.total} row{data.total === 1 ? "" : "s"} · knowledge base v{data.kb_version}{loading ? " · updating…" : ""}
            </p>
            {data.items.length === 0 ? (
              <div className="card p-10 text-center mt-4">
                <p className="display text-2xl text-ink">No rows match</p>
                <p className="mt-2 text-ink-2">Try a generic name, or check the spelling. If you believe an interaction is missing, use the feedback form on the About page.</p>
              </div>
            ) : (
              <motion.ul layout className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {data.items.map((i, k) => {
                    const tone = i.severity === "major" ? "red" : i.severity === "moderate" ? "amber" : "green";
                    return (
                      <motion.li key={i.code} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, delay: Math.min(k * 0.025, 0.3) }}>
                        <Link href={`/knowledge-base/${encodeURIComponent(i.code)}`} className={`tone-${tone} card card-hover block p-5 h-full group border-l-4`} style={{ borderLeftColor: "var(--tone)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-ink">
                              {i.herb} <span className="text-ink-3 font-normal text-sm">({i.herb_latin})</span>
                              <br />
                              <span className="text-ink-2">+ {i.drug ?? humanClass(i.drug_class)}</span>
                            </p>
                            <ArrowRight className="h-4 w-4 text-ink-3 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-mint" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <SeverityChip severity={i.severity} />
                            <GradeChip grade={i.evidence_grade} />
                            <span className="chip">{i.interaction_type}</span>
                            {i.timing_gap_hours != null && <span className="chip chip-mint">gap {formatTimingGap(i.timing_gap_hours)}</span>}
                          </div>
                          <p className="mt-3 font-mono text-[11px] tracking-wider text-ink-3">{i.code}{i.reviewed_on ? ` · ${i.reviewed_on}` : ""}</p>
                        </Link>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
            {data.total > PAGE && (
              <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
                <button type="button" className="btn btn-ghost btn-sm" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - PAGE))}>← Previous</button>
                <span className="font-mono text-xs text-ink-3">{offset + 1}–{Math.min(offset + PAGE, data.total)} of {data.total}</span>
                <button type="button" className="btn btn-ghost btn-sm" disabled={offset + PAGE >= data.total} onClick={() => setOffset((o) => o + PAGE)}>Next →</button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
