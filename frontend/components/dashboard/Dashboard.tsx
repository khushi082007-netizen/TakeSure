"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";
import { ErrorPanel } from "@/components/ErrorPanel";
import { Counter, Item, Stagger, fadeUp } from "@/components/motion";
import { SeverityChip, Spinner, VerdictDot, VerdictPill } from "@/components/ui";
import { DailyBars, Donut, HBars } from "@/components/dashboard/charts";
import { CurationPanel } from "@/components/dashboard/Curation";
import type { AnalyticsSummary, Verdict } from "@/types/api";

const SECTIONS = [
  { id: "overview", label: "Overview", group: "Operations" },
  { id: "trend", label: "Verdict trend", group: "Operations" },
  { id: "pairs", label: "Top combinations", group: "Analysis" },
  { id: "entities", label: "Herbs & medicines", group: "Analysis" },
  { id: "states", label: "By state", group: "Analysis" },
  { id: "adr", label: "ADR reports", group: "Pharmacovigilance" },
  { id: "feedback", label: "Feedback", group: "Pharmacovigilance" },
  { id: "curation", label: "Evidence curation", group: "System" },
  { id: "kb", label: "Knowledge-base status", group: "System" },
];

export function Dashboard() {
  const { t } = useLang();
  const [days, setDays] = useState(30);
  const { data, error, loading, retry } = useQuery(() => api.analytics(days), `analytics-${days}`);
  const [last, setLast] = useState<AnalyticsSummary | null>(null);
  if (data && data !== last) setLast(data);
  const a = data ?? last;

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] min-h-[80vh]">
      {/* sidebar */}
      <aside className="hidden lg:block border-r border-line bg-bg-1/70">
        <div className="sticky top-[68px] p-5">
          <p className="mono-label muted">TakeSure / Ministry view</p>
          {["Operations", "Analysis", "Pharmacovigilance", "System"].map((g) => (
            <div key={g} className="mt-5">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-3">{g}</p>
              <ul className="mt-2 space-y-0.5">
                {SECTIONS.filter((s) => s.group === g).map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-white/5 hover:text-ink transition-colors">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-6 rounded-xl border border-line bg-white/[0.03] p-3 text-xs text-ink-3">
            <p className="flex items-center gap-2"><span className="pulse-dot" /> Anonymised · no PII</p>
            <p className="mt-1">Entity ids, verdict and optional state only.</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* top bar */}
        <div className="border-b border-line glass sticky top-[68px] z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono-label saffron">{t("dash_label")}</p>
              <h1 className="text-lg sm:text-xl font-bold text-ink">{t("dashboard_title")}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip chip-mint"><span className="pulse-dot" /> OPERATIONAL</span>
              <div role="group" aria-label="Period" className="inline-flex rounded-xl border border-line bg-white/[0.03] p-1 text-xs">
                {[7, 30, 90].map((d) => (
                  <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={`relative px-3 py-1.5 rounded-lg font-semibold ${days === d ? "text-primary-ink" : "text-ink-2"}`}>
                    {days === d && <motion.span layoutId="days-pill" className="absolute inset-0 rounded-lg bg-mint" />}
                    <span className="relative z-10">{d}d</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <p className="text-sm text-ink-2 max-w-3xl">{t("dashboard_lede")}</p>
          {error && <ErrorPanel error={error} onRetry={retry} />}
          {!a && !error && <Spinner label="Loading analytics…" />}
          {a && <Body a={a} loading={loading} />}
        </div>
      </div>
    </div>
  );
}

function Body({ a, loading }: { a: AnalyticsSummary; loading: boolean }) {
  const v = a.verdicts;
  const total = a.totals.queries_period;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const redShare = pct(v.RED);
  const situation = redShare >= 25 ? { label: "High share of RED verdicts", tone: "red" } : redShare >= 10 ? { label: "Moderate share of RED verdicts", tone: "amber" } : { label: "Low share of RED verdicts", tone: "green" };

  return (
    <div className={`space-y-10 transition-opacity ${loading ? "opacity-60" : ""}`}>
      {/* overview */}
      <section id="overview" className="scroll-mt-36 space-y-4">
        <div className={`tone-${situation.tone} verdict-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <p className="mono-label muted">CURRENT SITUATION · LAST {a.period_days} DAYS</p>
            <p className="mt-1 text-xl font-bold tone-text">{situation.label}</p>
            <p className="text-sm text-ink-2">{v.RED} of {total} checks returned RED; {v.GREY} could not be verified (not in database).</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <span className="font-mono">GENERATED {a.generated_at.replace("T", " ").slice(0, 16)} UTC</span>
            <span className="chip">KB v{a.kb_version}</span>
            {a.totals.queries_demo > 0 && <span className="chip chip-saffron">includes {a.totals.queries_demo} demo queries</span>}
          </div>
        </div>
        <Stagger className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3" delay={0.05}>
          <Kpi label="Checks (period)" value={total} />
          <Kpi label="RED verdicts" value={v.RED} tone="red" sub={`${pct(v.RED)}%`} />
          <Kpi label="AMBER verdicts" value={v.AMBER} tone="amber" sub={`${pct(v.AMBER)}%`} />
          <Kpi label="Not in database" value={v.GREY} tone="grey" sub={`${pct(v.GREY)}%`} />
          <Kpi label="ADR reports" value={a.totals.adr_reports} tone="saffron" sub={`${a.totals.adr_serious} serious`} />
          <Kpi label="Open curation items" value={a.totals.feedback_open} tone="mint" />
        </Stagger>
      </section>

      {/* trend */}
      <section id="trend" className="scroll-mt-36 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Checks per day, by verdict" sub={`${a.period_days} days · stacked`}>
          <DailyBars data={a.daily} />
          <Legend />
        </Card>
        <Card title="Verdict split" sub="share of all checks in the period">
          <div className="flex items-center gap-6">
            <Donut parts={(["RED", "AMBER", "GREEN", "GREY"] as Verdict[]).map((k) => ({ key: k, value: v[k] }))} total={total} />
            <ul className="space-y-2 text-sm flex-1">
              {(["RED", "AMBER", "GREEN", "GREY"] as Verdict[]).map((k) => (
                <li key={k} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-ink-2"><VerdictDot verdict={k} /> {k === "GREY" ? "Not in DB" : k}</span>
                  <span className="font-mono text-ink">{v[k]} <span className="text-ink-3">· {pct(v[k])}%</span></span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      {/* pairs */}
      <section id="pairs" className="scroll-mt-36 grid gap-4 lg:grid-cols-2">
        <Card title="Most-checked herb × medicine pairs" sub="worst verdict seen for each pair">
          <div className="overflow-x-auto">
            <table className="data">
              <thead><tr><th>#</th><th>Herb / product</th><th>Medicine</th><th>Checks</th><th>Worst</th></tr></thead>
              <tbody>
                {a.top_pairs.map((p, k) => (
                  <tr key={`${p.herb}-${p.drug}`}>
                    <td className="font-mono text-xs">{String(k + 1).padStart(2, "0")}</td>
                    <td className="text-ink font-medium">{p.herb}</td>
                    <td className="text-ink">{p.drug}</td>
                    <td className="font-mono">{p.count}</td>
                    <td><VerdictPill verdict={p.worst_verdict} size="sm" /></td>
                  </tr>
                ))}
                {a.top_pairs.length === 0 && <tr><td colSpan={5}>No checks yet in this period.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Most-triggered knowledge-base rows" sub="interaction codes behind the verdicts">
          <ul className="space-y-2">
            {a.top_interactions.map((i) => (
              <li key={i.code} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
                <div className="min-w-0">
                  <Link href={`/knowledge-base/${encodeURIComponent(i.code)}`} className="font-mono text-xs text-mint-bright hover:underline">{i.code}</Link>
                  <p className="text-sm text-ink truncate">{i.herb} + {i.target}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityChip severity={i.severity} />
                  <span className="chip">grade {i.evidence_grade}</span>
                  <span className="font-mono text-ink">{i.count}</span>
                </div>
              </li>
            ))}
            {a.top_interactions.length === 0 && <li className="text-sm text-ink-3">No rows triggered yet.</li>}
          </ul>
        </Card>
      </section>

      {/* entities */}
      <section id="entities" className="scroll-mt-36 grid gap-4 lg:grid-cols-2">
        <Card title="Most-checked Ayurvedic herbs & products" sub="counts of checks mentioning each herb">
          <HBars items={a.top_herbs.map((h) => ({ label: h.name, sub: h.detail ?? undefined, value: h.count }))} tone="mint" />
        </Card>
        <Card title="Most-checked medicines" sub="generic name · class">
          <HBars items={a.top_drugs.map((d) => ({ label: d.name, sub: d.detail?.replace(/_/g, " "), value: d.count }))} tone="saffron" />
        </Card>
      </section>

      {/* states */}
      <section id="states" className="scroll-mt-36">
        <Card title="Checks by state / UT" sub="optional field supplied by the user · for Ministry analytics">
          {a.by_state.length === 0 ? (
            <p className="text-sm text-ink-3">No state information yet.</p>
          ) : (
            <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3" delay={0.04}>
              {a.by_state.map((s, k) => (
                <Item key={s.state} variants={fadeUp} className="rounded-xl border border-line bg-white/[0.02] p-3">
                  <p className="font-mono text-[10px] text-ink-3">{String(k + 1).padStart(2, "0")}</p>
                  <p className="text-sm font-semibold text-ink truncate">{s.state}</p>
                  <p className="display text-2xl text-mint-bright"><Counter to={s.count} /></p>
                </Item>
              ))}
            </Stagger>
          )}
        </Card>
      </section>

      {/* adr */}
      <section id="adr" className="scroll-mt-36 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Suspected adverse-reaction reports" sub="stored only with consent · no names, no contact details">
          <div className="overflow-x-auto">
            <table className="data">
              <thead><tr><th>Reference</th><th>Date</th><th>Product</th><th>Medicines</th><th>Outcome</th><th>Seriousness</th><th>Reporter</th><th>State</th></tr></thead>
              <tbody>
                {a.recent_adr.map((r) => (
                  <tr key={r.reference}>
                    <td className="font-mono text-xs text-saffron-bright">{r.reference}</td>
                    <td className="font-mono text-xs">{r.ts.slice(0, 10)}</td>
                    <td className="text-ink">{r.product}</td>
                    <td>{r.drugs.join(", ") || "—"}</td>
                    <td>{r.outcome.replace(/_/g, " ")}</td>
                    <td>{r.seriousness ? <span className={`chip ${r.seriousness === "not_serious" ? "" : "tone-red tone-chip"}`}>{r.seriousness.replace(/_/g, " ")}</span> : "—"}</td>
                    <td>{r.reporter_type.replace(/_/g, " ")}</td>
                    <td>{r.state ?? "—"}</td>
                  </tr>
                ))}
                {a.recent_adr.length === 0 && <tr><td colSpan={8}>No reports stored yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Outcomes" sub="across all stored reports">
          <HBars items={Object.entries(a.adr_outcomes).map(([k, n]) => ({ label: k.replace(/_/g, " "), value: n }))} tone="saffron" />
          <Link href="/adr" className="btn btn-secondary btn-sm mt-4">Prepare a report</Link>
        </Card>
      </section>

      {/* feedback */}
      <section id="feedback" className="scroll-mt-36">
        <Card title="User feedback" sub="“Report incorrect information” submissions, by type">
          <HBars items={a.feedback_by_type.map((f) => ({ label: f.issue_type.replace(/_/g, " "), value: f.count }))} tone="mint" />
        </Card>
      </section>

      {/* curation (TinyFish) */}
      <section id="curation" className="scroll-mt-36">
        <CurationPanel />
      </section>

      {/* kb */}
      <section id="kb" className="scroll-mt-36">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3" delay={0.05}>
          <Kpi label="Active KB rows" value={a.totals.kb_interactions} tone="mint" />
          <Kpi label="Cited sources" value={a.totals.kb_sources} tone="mint" />
          <Kpi label="Sources verified" value={a.totals.kb_sources_verified} tone="grey" sub={`${a.totals.kb_sources - a.totals.kb_sources_verified} need verification`} />
          <Kpi label="All-time checks" value={a.totals.queries} sub={`${a.totals.queries_web} web · ${a.totals.queries_demo} demo`} />
        </Stagger>
        <p className="mt-3 text-xs text-ink-3">
          Demo activity can be removed with <code className="font-mono">python scripts/seed_demo_activity.py --clear</code> in <code className="font-mono">backend/</code>.
        </p>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone = "default", sub }: { label: string; value: number; tone?: "default" | "red" | "amber" | "grey" | "saffron" | "mint"; sub?: string }) {
  const c = { default: "text-ink", red: "text-red", amber: "text-amber", grey: "text-grey", saffron: "text-saffron-bright", mint: "text-mint-bright" }[tone];
  return (
    <Item variants={fadeUp} className="card p-4">
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-3">{label}</p>
      <p className={`display mt-2 text-3xl ${c}`}><Counter to={value} /></p>
      {sub && <p className="mt-0.5 text-xs text-ink-3">{sub}</p>}
    </Item>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-ink">{title}</h2>
        {sub && <p className="font-mono text-[10px] tracking-wider uppercase text-ink-3">{sub}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Legend() {
  return (
    <ul className="mt-3 flex flex-wrap gap-4 text-xs text-ink-2">
      {(["RED", "AMBER", "GREEN", "GREY"] as Verdict[]).map((k) => (
        <li key={k} className="flex items-center gap-1.5"><VerdictDot verdict={k} /> {k === "GREY" ? "Not in DB" : k}</li>
      ))}
    </ul>
  );
}
