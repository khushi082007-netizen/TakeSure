"use client";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/motion";
import { Container, SectionLabel } from "@/components/ui";

function Box({ children, tone = "default", className = "" }: { children: React.ReactNode; tone?: "default" | "mint" | "saffron" | "engine"; className?: string }) {
  const cls =
    tone === "engine"
      ? "border-mint/50 bg-gradient-to-br from-mint/20 via-teal/10 to-saffron/10 text-ink shadow-[0_0_0_1px_rgba(52,211,153,.3),0_30px_80px_-30px_rgba(52,211,153,.6)]"
      : tone === "mint"
        ? "border-mint/35 bg-mint/[0.07] text-mint-bright"
        : tone === "saffron"
          ? "border-saffron/35 bg-saffron/[0.07] text-saffron-bright"
          : "border-line-2 bg-white/[0.03] text-ink";
  return <div className={`rounded-xl border px-4 py-3 text-sm font-semibold text-center ${cls} ${className}`}>{children}</div>;
}

export function Architecture() {
  const { t } = useLang();
  return (
    <section className="relative py-24 border-t border-line bg-bg-1/60">
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <Container className="relative">
        <Reveal className="max-w-3xl">
          <SectionLabel>{t("arch_label")}</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-5xl text-ink">
            {t("arch_title_a")} <span className="text-gradient-mint">{t("arch_title_b")}</span>
          </h2>
          <p className="mt-4 text-lg text-ink-2">{t("arch_sub")}</p>
        </Reveal>

        <Reveal className="mt-12 mx-auto max-w-4xl" delay={0.1} amount={0.15}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Box>Prescription photo</Box>
            <Box>Product label photo</Box>
            <Box>Typed names (fallback)</Box>
          </div>
          <p className="my-3 text-center text-mint">↓</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Box tone="mint">OCR · Tesseract (local) / vision model · file deleted after read</Box>
            <Box tone="mint">RapidFuzz matcher · brands → generics · products → herbs · you confirm</Box>
          </div>
          <p className="my-3 text-center text-mint">↓</p>
          <Box tone="engine" className="py-6">
            <p className="mono-label muted">DECISION LAYER</p>
            <p className="mt-1 text-xl sm:text-2xl">Deterministic rule engine over the cited knowledge base</p>
            <p className="mt-1 text-xs font-mono tracking-wider text-ink-2">SEVERITY · EVIDENCE GRADE · HIGH-RISK CLASS ESCALATION · TIMING · VERSIONED · LOGGED</p>
          </Box>
          <p className="my-3 text-center text-saffron">↓</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] items-center">
            <Box tone="saffron">Grounded explainer (LLM) · facts in, JSON out · cannot change the verdict</Box>
            <span className="hidden sm:block text-ink-3 text-xs font-mono">OR</span>
            <Box tone="saffron">Deterministic KB text (always available)</Box>
          </div>
          <p className="my-3 text-center text-saffron">↓</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Box>Result card · Hindi / English</Box>
            <Box>Doctor PDF with sources</Box>
            <Box>ADR report · Ministry of Ayush format</Box>
          </div>
          <p className="my-3 text-center text-ink-3">↓</p>
          <Box>Anonymised query log → pharmacovigilance dashboard → curation queue</Box>
        </Reveal>

        <Reveal className="mt-10 grid gap-4 sm:grid-cols-3" delay={0.15}>
          {[
            ["Next.js 16 · React 19 · Tailwind 4 · Framer Motion", "Frontend"],
            ["FastAPI · SQLAlchemy · RapidFuzz · ReportLab · pytesseract", "Backend"],
            ["SQLite locally · PostgreSQL / Supabase in production · open KB (JSON)", "Data"],
          ].map(([a, b]) => (
            <div key={b} className="card p-5">
              <p className="mono-label muted">{b}</p>
              <p className="mt-2 text-sm text-ink-2">{a}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
