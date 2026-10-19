"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Counter, Reveal, Tilt } from "@/components/motion";
import { ArrowRight, Container, SectionLabel, VerdictDot } from "@/components/ui";
import type { AnalyticsSummary, Verdict } from "@/types/api";

export function DashboardPreview() {
  const { t } = useLang();
  const [a, setA] = useState<AnalyticsSummary | null>(null);
  useEffect(() => {
    api.analytics(30).then(setA).catch(() => null);
  }, []);
  const total = a?.totals.queries_period ?? 0;
  const v = a?.verdicts ?? { GREEN: 0, AMBER: 0, RED: 0, GREY: 0 };
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const daily = a?.daily.slice(-14) ?? [];
  const max = Math.max(1, ...daily.map((d) => d.total));

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-saffron/10 blur-3xl" aria-hidden />
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] items-center">
        <Reveal>
          <SectionLabel tone="saffron">{t("dash_label")}</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-5xl text-ink">
            {t("dash_title_a")} <span className="text-gradient-saffron">{t("dash_title_b")}</span>
          </h2>
          <p className="mt-5 text-lg text-ink-2">{t("dash_sub")}</p>
          <ul className="mt-6 space-y-2 text-sm text-ink-2">
            {["Anonymised: entity ids + verdict only", "Top herb × medicine pairs by state", "Suspected-ADR reports in Ministry format", "Knowledge-base coverage gaps for curation"].map((x) => (
              <li key={x} className="flex items-center gap-2"><span className="text-saffron">◉</span>{x}</li>
            ))}
          </ul>
          <Link href="/dashboard" className="btn btn-saffron mt-8">
            {t("dash_cta")} <ArrowRight />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Tilt max={4}>
            <div className="card card-solid overflow-hidden" style={{ boxShadow: "var(--shadow-saffron)" }}>
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="mono-label flex items-center gap-2"><span className="pulse-dot saffron" /> TAKESURE / PHARMACOVIGILANCE</p>
                <p className="text-[11px] font-mono text-ink-3">LAST {a?.period_days ?? 30} DAYS</p>
              </div>
              <div className="p-5">
                <p className="mono-label saffron">SIGNAL</p>
                <p className="mt-1 text-2xl font-bold text-ink">{v.RED} RED verdicts · {v.AMBER} AMBER</p>
                <p className="text-sm text-ink-3">Herb–medicine checks across India (anonymised, demo data)</p>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Kpi label="checks" value={total} />
                  <Kpi label="ADR reports" value={a?.totals.adr_reports ?? 0} tone="saffron" />
                  <Kpi label="KB rows" value={a?.totals.kb_interactions ?? 49} tone="mint" />
                </div>

                <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-3"><span>CHECKS / DAY</span><span>14 days</span></div>
                  <div className="mt-3 flex items-end gap-1 h-24">
                    {daily.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col justify-end gap-[2px]" title={`${d.date}: ${d.total}`}>
                        {(["GREEN", "GREY", "AMBER", "RED"] as Verdict[]).map((k) => d[k] > 0 && (
                          <div key={k} className={`tone-${k.toLowerCase()} rounded-[3px]`} style={{ height: `${(d[k] / max) * 100}%`, background: "var(--tone)", opacity: 0.9 }} />
                        ))}
                      </div>
                    ))}
                    {daily.length === 0 && <div className="flex-1 shimmer h-full rounded bg-white/5" />}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                  {(["RED", "AMBER", "GREEN", "GREY"] as Verdict[]).map((k) => (
                    <div key={k} className="rounded-lg border border-line px-3 py-2">
                      <p className="flex items-center gap-1.5 text-ink-3"><VerdictDot verdict={k} /> {k === "GREY" ? "N/A" : k}</p>
                      <p className="mt-0.5 text-base font-bold text-ink">{pct(v[k])}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </Container>
    </section>
  );
}

function Kpi({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "saffron" | "mint" }) {
  const c = tone === "saffron" ? "text-saffron-bright" : tone === "mint" ? "text-mint-bright" : "text-ink";
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] px-3 py-3">
      <p className={`display text-2xl ${c}`}><Counter to={value} /></p>
      <p className="text-[11px] font-mono uppercase tracking-widest text-ink-3">{label}</p>
    </div>
  );
}
