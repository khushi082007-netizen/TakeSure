"use client";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/motion";
import { Container, SectionLabel } from "@/components/ui";

const TODAY = ["Patient adds an Ayurvedic product", "Takes both for weeks", "Symptoms appear (palpitations, bleeding, jaundice)", "Emergency visit · nobody connects the two"];
const AFTER = ["Photo of prescription + label", "Names confirmed · KB lookup", "Verdict + timing gap + 3 doctor questions", "Doctor informed before the first dose"];

export function Compare() {
  const { t } = useLang();
  return (
    <section className="relative py-24 border-y border-line bg-bg-1/60">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
        <Reveal>
          <SectionLabel tone="saffron">{t("compare_label")}</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-5xl text-ink">
            {t("compare_title_a")} <span className="text-gradient-mint">{t("compare_title_b")}</span>
          </h2>
          <p className="mt-5 text-lg text-ink-2">{t("compare_sub")}</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.05}>
            <Column label={t("today")} steps={TODAY} tone="red" footer="Action occurs after the interaction has caused harm." />
          </Reveal>
          <Reveal delay={0.15}>
            <Column label={t("with_takesure")} steps={AFTER} tone="mint" footer="Discussion happens before anything is taken together." />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Column({ label, steps, tone, footer }: { label: string; steps: string[]; tone: "red" | "mint"; footer: string }) {
  const accent = tone === "red" ? "text-red" : "text-mint-bright";
  const border = tone === "red" ? "border-red/35" : "border-mint/40";
  const bg = tone === "red" ? "bg-red/[0.06]" : "bg-mint/[0.06]";
  return (
    <div className={`card p-6 h-full ${tone === "mint" ? "ring-glow" : ""}`}>
      <p className={`mono-label ${tone === "red" ? "" : ""}`} style={{ color: tone === "red" ? "var(--red)" : "var(--mint)" }}>{label}</p>
      <ol className="mt-5 space-y-2">
        {steps.map((s, k) => (
          <li key={s} className="flex flex-col items-center">
            <div className={`w-full rounded-xl border ${border} ${bg} px-4 py-3 text-sm text-center text-ink`}>{s}</div>
            {k < steps.length - 1 && <span className={`my-1 ${accent}`}>↓</span>}
          </li>
        ))}
      </ol>
      <p className={`mt-5 text-xs font-semibold ${accent}`}>{footer}</p>
    </div>
  );
}
