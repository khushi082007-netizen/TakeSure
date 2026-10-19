"use client";
import { useLang } from "@/lib/i18n";
import { Counter, Reveal, Stagger, Item, fadeUp } from "@/components/motion";
import { Container, SectionLabel } from "@/components/ui";

const CHAIN = ["Prescription", "Ayurvedic product", "No cross-check", "Co-use for weeks", "Silent interaction", "Reaction / ER visit"];

export function Problem() {
  const { t } = useLang();
  const stats: { v: number; suffix: string; label: string; tone: string }[] = [
    { v: 37, suffix: "%", label: t("stat1"), tone: "text-saffron-bright" },
    { v: 65, suffix: "%", label: t("stat2"), tone: "text-saffron-bright" },
    { v: 19, suffix: "%", label: t("stat3"), tone: "text-red" },
    { v: 0, suffix: "", label: t("stat4"), tone: "text-mint-bright" },
  ];
  return (
    <section className="relative py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <Reveal>
            <SectionLabel tone="saffron">{t("problem_label")}</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-5xl text-ink">
              {t("problem_title_a")} <span className="text-gradient-saffron">{t("problem_title_b")}</span>
            </h2>
            <p className="mt-5 text-ink-2 text-lg">{t("problem_body")}</p>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-4" delay={0.1}>
            {stats.map((s) => (
              <Item key={s.label} variants={fadeUp} className="card card-hover p-6">
                <p className={`display text-5xl sm:text-6xl ${s.tone}`}>
                  <Counter to={s.v} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-sm text-ink-2">{s.label}</p>
              </Item>
            ))}
          </Stagger>
        </div>

        <Reveal className="mt-16" delay={0.1}>
          <div className="card p-6 sm:p-8 overflow-x-auto">
            <ol className="flex items-center gap-3 min-w-max">
              {CHAIN.map((c, k) => (
                <li key={c} className="flex items-center gap-3">
                  <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${k >= 4 ? "border-red/40 bg-red/10 text-red" : k >= 2 ? "border-amber/40 bg-amber/10 text-saffron-bright" : "border-line-2 bg-white/[0.03] text-ink"}`}>
                    <span className="font-mono text-[10px] tracking-widest text-ink-3 mr-2">0{k + 1}</span>
                    {c}
                  </div>
                  {k < CHAIN.length - 1 && <span className="flow-arrow">→</span>}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-ink-3">
              <span className="font-mono text-mint mr-2">SYS</span>
              Existing checkers (Medscape, Drugs.com, 1mg) only know allopathic × allopathic pairs. TakeSure is the missing bridge table: Indian brands × herb synonyms × published evidence.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
