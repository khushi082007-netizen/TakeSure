"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { Counter, Item, Reveal, Stagger, fadeUp } from "@/components/motion";
import { ArrowRight, Container, SectionLabel } from "@/components/ui";
import type { KBStats } from "@/types/api";

export function KBStatsStrip() {
  const { t } = useLang();
  const [stats, setStats] = useState<KBStats | null>(null);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    api.stats().then(setStats).catch(() => setOffline(true));
  }, []);
  const cells: { label: string; value: number | null }[] = [
    { label: t("kb_stat_rows"), value: stats?.interactions ?? null },
    { label: t("kb_stat_herbs"), value: stats?.herbs ?? null },
    { label: t("kb_stat_drugs"), value: stats?.drugs ?? null },
    { label: t("kb_stat_sources"), value: stats?.sources ?? null },
  ];
  return (
    <section className="relative py-24">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionLabel>{t("kb_label")} {stats ? `· v${stats.kb_version}` : ""}</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-5xl text-ink">
              {t("kb_title_a")} <span className="text-gradient-mint">{t("kb_title_b")}</span>
            </h2>
          </div>
          <Link href="/knowledge-base" className="btn btn-secondary">
            {t("kb_browse")} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <Stagger className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4" delay={0.08}>
          {cells.map((c) => (
            <Item key={c.label} variants={fadeUp} className="card card-hover p-6">
              <p className="mono-label muted">{c.label}</p>
              <p className="display mt-3 text-5xl text-mint-bright">{c.value == null ? <span className="text-ink-3">—</span> : <Counter to={c.value} />}</p>
            </Item>
          ))}
        </Stagger>
        {stats && (
          <Reveal className="mt-4" delay={0.1}>
            <p className="text-sm text-ink-3">
              <span className="font-mono text-saffron-bright mr-2">NOTE</span>
              {stats.sources_verified} of {stats.sources} citations have been independently re-opened and verified by the team; the rest are marked “needs verification” wherever they appear. No citation is invented.
            </p>
          </Reveal>
        )}
        {offline && <p className="mt-4 text-sm text-ink-3">Live statistics unavailable — the backend is not reachable right now.</p>}
      </Container>
    </section>
  );
}
