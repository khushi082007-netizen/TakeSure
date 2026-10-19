"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { EASE, Reveal } from "@/components/motion";
import { Container, SectionLabel } from "@/components/ui";

const STAGES = [
  { n: "01", title: "Scan", sub: "Photo → text", body: "Photograph the prescription and the product label. Tesseract (local) or a vision model reads the text on the TakeSure server; the file is deleted the moment extraction finishes.", status: "OCR · LOCAL OR CLOUD", tone: "mint" },
  { n: "02", title: "Match", sub: "Names → entities", body: "Dosage noise is stripped; RapidFuzz matches brands, generics, Sanskrit/Hindi/Latin synonyms and branded products. Score ≥85 accepted, 70–85 you confirm, <70 not recognised. Thyronorm → levothyroxine.", status: "DETERMINISTIC · USER-CONFIRMED", tone: "mint" },
  { n: "03", title: "Decide", sub: "Rules over the KB", body: "For every herb × medicine pair the engine looks up interaction rows by medicine, then by class. Rules R1–R5 convert severity + evidence grade into a verdict. The worst row wins. No model is involved.", status: "RULE ENGINE · AUDITABLE", tone: "saffron" },
  { n: "04", title: "Explain", sub: "AI translates only", body: "The matched rows — and nothing else — go to a language model that rewrites them in plain Hindi/English and drafts three doctor questions. Output is schema-locked; directive language is rejected and the KB text is shown instead.", status: "SANDBOXED · FALLBACK ALWAYS ON", tone: "saffron" },
  { n: "05", title: "Report", sub: "PDF + ADR", body: "Download a one-page summary with sources for your doctor, or pre-fill a suspected-ADR report in the Ministry of Ayush field format and take it to the Ayush Suraksha portal.", status: "MINISTRY-ALIGNED · NO FAKE SUBMISSION", tone: "mint" },
];

export function Pipeline() {
  const { t } = useLang();
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 3600);
    return () => clearInterval(id);
  }, [paused]);
  const s = STAGES[active];

  return (
    <section className="relative py-24 border-y border-line bg-bg-1/60">
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <Container className="relative">
        <Reveal className="max-w-3xl">
          <SectionLabel>{t("pipeline_label")}</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-5xl text-ink">{t("pipeline_title_a")}</h2>
          <p className="mt-4 text-lg text-ink-2">{t("pipeline_sub")}</p>
        </Reveal>

        <Reveal className="mt-12" delay={0.1} amount={0.15}>
          <ol className="grid gap-3 md:grid-cols-5" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {STAGES.map((st, k) => {
              const on = k === active;
              return (
                <li key={st.n} className="relative">
                  <button
                    type="button"
                    onClick={() => setActive(k)}
                    aria-pressed={on}
                    className={`w-full text-left card p-5 h-full transition-all duration-300 ${on ? "border-mint/60 bg-mint/[0.07] shadow-[0_0_0_1px_rgba(52,211,153,.3),0_20px_50px_-25px_rgba(52,211,153,.6)]" : "hover:border-line-2"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs tracking-widest ${on ? "text-mint" : "text-ink-3"}`}>{st.n}</span>
                      {on && <span className="pulse-dot" />}
                    </div>
                    <p className={`mt-3 text-lg font-bold ${on ? "text-ink" : "text-ink-2"}`}>{st.title}</p>
                    <p className="text-xs text-ink-3">{st.sub}</p>
                    <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                      {on && !paused && <motion.div key={active} className="h-full bg-mint" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "linear" }} />}
                      {on && paused && <div className="h-full w-full bg-mint" />}
                    </div>
                  </button>
                  {k < STAGES.length - 1 && <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 flow-arrow z-10">→</span>}
                </li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal className="mt-6" delay={0.15} amount={0.2}>
          <div className="card card-solid p-6 sm:p-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.4, ease: EASE }}>
                <p className="mono-label muted">{t("active_stage")} / {s.n}</p>
                <h3 className="mt-2 text-2xl sm:text-3xl text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-2">{s.body}</p>
              </motion.div>
            </AnimatePresence>
            <div className="rounded-xl border border-line bg-white/[0.03] p-5 self-start">
              <p className="mono-label muted">{t("stage_status")}</p>
              <p className={`mt-2 font-mono text-sm tracking-wider ${s.tone === "saffron" ? "text-saffron-bright" : "text-mint-bright"}`}>{s.status}</p>
              <div className="mt-4 h-px bg-line" />
              <p className="mt-3 text-xs text-ink-3">
                {active === 3 ? "Turn the model off and the verdict is identical — only the wording changes." : active === 2 ? "Every decision trace is shown on the result page under “Why this verdict?”." : "Nothing is checked until you have confirmed the names we read."}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
