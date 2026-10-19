"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Aurora, EASE, Tilt } from "@/components/motion";
import { ArrowRight, Container, VerdictPill } from "@/components/ui";
import type { Verdict } from "@/types/api";

const FEED: { herb: string; drug: string; verdict: Verdict; code: string; note: string }[] = [
  { herb: "Ashwagandha", drug: "Levothyroxine (Thyronorm)", verdict: "AMBER", code: "INT-ASHWA-THYROID", note: "May raise T3/T4 · recheck TSH" },
  { herb: "Guggul", drug: "Warfarin (Warf 5)", verdict: "RED", code: "INT-GUGGUL-ANTICOAG", note: "Anticoagulant class → escalated" },
  { herb: "Triphala", drug: "Metformin (Glycomet)", verdict: "GREEN", code: "INT-TRIPHALA-TIMING", note: "Timing only · keep 2–3 h gap" },
  { herb: "Giloy", drug: "Tacrolimus (Pangraf)", verdict: "RED", code: "INT-GILOY-IMMUNO", note: "Immunostimulant vs transplant" },
  { herb: "Zandu Kesari Jivan", drug: "Metformin", verdict: "GREY", code: "—", note: "Not in database · never Green" },
  { herb: "Mulethi", drug: "Amlodipine (Amlong)", verdict: "AMBER", code: "INT-LICORICE-ANTIHTN", note: "Raises BP · lowers potassium" },
];

export function Hero() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % FEED.length), 3200);
    return () => clearInterval(id);
  }, []);
  const cur = FEED[i];

  return (
    <section className="relative overflow-hidden noise">
      <Aurora />
      <div className="absolute inset-0 grid-bg" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" aria-hidden />

      <Container className="relative pt-14 pb-20 sm:pt-20 sm:pb-28 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} className="flex flex-wrap items-center gap-2">
            <span className="chip chip-mint"><span className="pulse-dot" /> {t("hero_badge1")}</span>
            <span className="chip">{t("hero_badge2")}</span>
            <span className="chip chip-saffron">{t("hero_badge3")}</span>
          </motion.div>

          <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }} className="mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem] text-ink max-w-3xl">
            {t("hero_title_a")} <span className="text-gradient-mint">{t("hero_title_b")}</span> {t("hero_title_c")}
          </motion.h1>

          <motion.p variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }} className="mt-6 text-lg sm:text-xl font-semibold text-saffron-bright/95 max-w-2xl">
            {t("hero_quote")}
          </motion.p>

          <motion.p variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }} className="mt-4 text-base sm:text-lg text-ink-2 max-w-2xl">
            {t("hero_lede")}
          </motion.p>

          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="mono-label muted mr-1">{t("hero_regions")}</span>
            {["Thyroid", "Diabetes", "Blood thinners", "Transplant", "BP & heart", "Mental health", "Epilepsy"].map((x) => (
              <span key={x} className="chip">{x}</span>
            ))}
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} className="mt-8 flex flex-wrap gap-3">
            <Link href="/check" className="btn btn-saffron text-base px-7">
              {t("hero_cta")} <ArrowRight />
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost text-base">
              {t("hero_cta2")}
            </Link>
          </motion.div>
          <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8 } } }} className="mt-4 text-sm text-ink-3">
            {t("hero_privacy")}
          </motion.p>
        </motion.div>

        {/* Live feed card */}
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }}>
          <Tilt className="relative">
            <div className="card card-solid ring-glow overflow-hidden relative">
              <div className="scan-line" aria-hidden />
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="mono-label flex items-center gap-2"><span className="pulse-dot" /> {t("hero_card_title")}</p>
                <p className="text-[11px] text-ink-3 font-mono">KB v1.0.0</p>
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45, ease: EASE }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono tracking-widest uppercase text-ink-3">Ayurvedic product</p>
                        <p className="text-xl font-bold text-ink">{cur.herb}</p>
                        <p className="mt-2 text-xs font-mono tracking-widest uppercase text-ink-3">Medicine</p>
                        <p className="text-base font-semibold text-ink-2">{cur.drug}</p>
                      </div>
                      <VerdictPill verdict={cur.verdict} size="lg" />
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-xs">
                      <span className="text-ink-2">{cur.note}</span>
                      <span className="font-mono text-ink-3">{cur.code}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {(["GREEN", "AMBER", "RED", "GREY"] as Verdict[]).map((v) => (
                    <div key={v} className={`rounded-lg border border-line p-2 text-center transition-all ${cur.verdict === v ? "bg-white/[0.06] border-line-2" : "opacity-60"}`}>
                      <VerdictPill verdict={v} size="sm" />
                    </div>
                  ))}
                </div>

                <ul className="mt-5 space-y-2 text-[13px] text-ink-2">
                  <li className="flex gap-2"><span className="text-mint">◆</span><span><b className="text-ink">Verdict</b> — fixed rules over the knowledge base. Red beats Amber beats Green; unknown is never Green.</span></li>
                  <li className="flex gap-2"><span className="text-mint">◆</span><span><b className="text-ink">Evidence</b> — every row graded A/B/C with a DOI, PMID or monograph URL.</span></li>
                  <li className="flex gap-2"><span className="text-saffron">◆</span><span><b className="text-ink">Explanation</b> — plain Hindi/English plus three questions for your doctor.</span></li>
                </ul>
              </div>
              <div className="flex items-center justify-between border-t border-line px-5 py-2.5 text-[11px] text-ink-3">
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-green" /> {t("hero_card_sub")}</span>
                <span className="font-mono">{String(i + 1).padStart(2, "0")} / {String(FEED.length).padStart(2, "0")}</span>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </Container>

      {/* bottom feature strip */}
      <Container className="relative pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7, ease: EASE }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-line pt-8">
          {[
            ["Scan", "Prescription + label photo, read on your server"],
            ["Match", "Indian brands → generics, products → herbs"],
            ["Decide", "Rules over a cited, versioned knowledge base"],
            ["Report", "Doctor PDF + Ministry of Ayush ADR format"],
          ].map(([a, b], k) => (
            <div key={a} className="flex items-start gap-3">
              <span className="font-mono text-xs text-mint mt-1">0{k + 1}</span>
              <div>
                <p className="font-semibold text-ink">{a}</p>
                <p className="text-sm text-ink-3">{b}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
