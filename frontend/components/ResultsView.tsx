"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionJSON } from "@/lib/hooks";
import { api, downloadBlob, toApiError } from "@/lib/api";
import { session, KEY_RESULT } from "@/lib/session";
import { useLang } from "@/lib/i18n";
import { formatTimingGap, humanClass, sourceLink, GRADE_META, VERDICT_META } from "@/lib/verdict";
import { Disclaimer } from "@/components/Disclaimer";
import { ErrorPanel } from "@/components/ErrorPanel";
import { FeedbackForm } from "@/components/FeedbackForm";
import { StepBar } from "@/components/StepBar";
import { EASE, Item, Stagger, fadeUp } from "@/components/motion";
import { ArrowRight, EmptyState, GradeChip, SectionLabel, SeverityChip, Spinner, UspBanner, VerdictPill, VerificationChip } from "@/components/ui";
import type { ApiError, EvaluateResponse, Language, MatchedInteraction } from "@/types/api";

const T = {
  en: {
    heading: "Safety result",
    medicines: "Medicines",
    herbs: "Ayurvedic products / herbs",
    unrec: "Not in database",
    why: "Why this verdict?",
    summary: "What this means",
    timing: "Timing",
    questions: "Three questions to ask your doctor",
    matched: "Matched interactions",
    noMatched: "No interaction rows in the knowledge base match this combination.",
    pairs: "Every pair we checked",
    pdf: "Download PDF for your doctor",
    adr: "Had a reaction? Prepare a report",
    again: "Check another combination",
    explainedBy: "Explained by",
    fallback: "deterministic knowledge-base text",
    llm: "AI explainer",
    reviewedKb: "Knowledge base version",
  },
  hi: {
    heading: "सुरक्षा परिणाम",
    medicines: "दवाइयाँ",
    herbs: "आयुर्वेदिक उत्पाद / जड़ी-बूटियाँ",
    unrec: "डेटाबेस में नहीं",
    why: "यह परिणाम क्यों?",
    summary: "इसका क्या मतलब है",
    timing: "समय का अंतर",
    questions: "डॉक्टर से पूछने के लिए तीन सवाल",
    matched: "मिले हुए इंटरैक्शन",
    noMatched: "इस संयोजन के लिए ज्ञान-आधार में कोई इंटरैक्शन पंक्ति नहीं मिली।",
    pairs: "जांची गई हर जोड़ी",
    pdf: "डॉक्टर के लिए PDF डाउनलोड करें",
    adr: "कोई प्रतिक्रिया हुई? रिपोर्ट तैयार करें",
    again: "दूसरा संयोजन जांचें",
    explainedBy: "व्याख्या",
    fallback: "ज्ञान-आधार का निश्चित पाठ",
    llm: "AI व्याख्याकार",
    reviewedKb: "ज्ञान-आधार संस्करण",
  },
};

export function ResultsView() {
  const stored = useSessionJSON<EvaluateResponse>(KEY_RESULT);
  const { lang: uiLang } = useLang();
  const sp = useSearchParams();
  const demoId = sp.get("demo");
  const [override, setOverride] = useState<EvaluateResponse | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);
  // Deep link for demos / screenshots: /results?demo=guggul-warfarin&lang=hi runs the scenario through the real pipeline.
  useEffect(() => {
    if (!demoId || stored || override) return;
    let cancelled = false;
    (async () => {
      setDemoBusy(true);
      try {
        const sc = await api.demoScenario(demoId);
        const res = await api.evaluate({
          drug_ids: [...new Set(sc.resolved.filter((c) => c.kind === "drug").map((c) => c.canonical_id))],
          herb_ids: [...new Set(sc.resolved.filter((c) => c.kind === "herb").map((c) => c.canonical_id))],
          unrecognised: sc.unrecognised,
          language: (sp.get("lang") === "hi" ? "hi" : "en"),
          source: "demo",
        });
        if (!cancelled) {
          setOverride(res);
          session.setResult(res);
        }
      } catch {
        /* fall through to the empty state */
      } finally {
        if (!cancelled) setDemoBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoId, stored]);
  const result = override ?? stored;
  const [langOverride, setLangOverride] = useState<Language | null>(sp.get("lang") === "hi" ? "hi" : null);
  const lang: Language = langOverride ?? uiLang;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<ApiError | null>(null);
  const [explainBusy, setExplainBusy] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  if (result === undefined || (result === null && (demoBusy || (demoId && !override)))) return <Spinner label="Loading…" />;
  if (result === null) return <EmptyState title="No result to show" body="Run a check first — it only takes a minute." action={{ href: "/check", label: "Go to the safety checker" }} />;

  const t = T[lang];
  const meta = VERDICT_META[result.verdict];
  const ex = result.explanation;
  const summary = lang === "hi" ? ex.summary_hi : ex.summary_en;

  const switchLang = async (l: Language) => {
    setLangOverride(l);
    if (l === "hi" && !ex.summary_hi) {
      setExplainBusy(true);
      try {
        const e = await api.explain(result, "hi");
        const updated = { ...result, explanation: e };
        setOverride(updated);
        session.setResult(updated);
      } catch {
        /* keep English */
      } finally {
        setExplainBusy(false);
      }
    }
  };

  const pdf = async () => {
    setPdfBusy(true);
    setPdfError(null);
    try {
      const { blob, filename } = await api.reportPdf(result);
      downloadBlob(blob, filename);
    } catch (e) {
      setPdfError(toApiError(e));
    } finally {
      setPdfBusy(false);
    }
  };

  const adrHref = `/adr?product=${encodeURIComponent(result.herbs.map((h) => h.name).join(", "))}&drugs=${encodeURIComponent(result.drugs.map((d) => d.name).join(", "))}`;

  return (
    <div className="space-y-10" lang={lang}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <StepBar current={3} />
          <h1 className="mt-4 text-3xl sm:text-5xl text-ink">{t.heading}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <UspBanner compact />
          <div role="group" aria-label="Language" className="inline-flex rounded-xl border border-line bg-white/[0.03] p-1">
            {(["en", "hi"] as Language[]).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} className={`relative px-3 py-1.5 rounded-lg text-sm font-semibold ${lang === l ? "text-primary-ink" : "text-ink-2"}`} onClick={() => switchLang(l)}>
                {lang === l && <motion.span layoutId="result-lang" className="absolute inset-0 rounded-lg bg-mint" />}
                <span className="relative z-10">{l === "en" ? "English" : "हिन्दी"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verdict card */}
      <motion.section initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: EASE }} aria-labelledby="verdict" className={`tone-${meta.tone} verdict-card rounded-3xl p-6 sm:p-10 relative overflow-hidden`}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40" style={{ background: "var(--tone)" }} aria-hidden />
        <div className="relative flex flex-wrap items-center gap-4">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}>
            <VerdictPill verdict={result.verdict} lang={lang} size="lg" />
          </motion.div>
          <h2 id="verdict" className="text-2xl sm:text-4xl text-ink">{lang === "hi" ? meta.shortHi : meta.short}</h2>
        </div>
        <p className="relative mt-4 text-ink-2 max-w-3xl">{result.verdict_reason}</p>

        <Stagger className="relative mt-7 grid gap-4 sm:grid-cols-3" delay={0.08}>
          <Item variants={fadeUp}><Entities title={t.medicines} items={result.drugs.map((d) => `${d.name}${d.detail ? ` (${humanClass(d.detail)})` : ""}`)} /></Item>
          <Item variants={fadeUp}><Entities title={t.herbs} items={result.herbs.map((h) => `${h.name}${h.detail ? ` (${h.detail})` : ""}`)} /></Item>
          <Item variants={fadeUp}><Entities title={t.unrec} items={result.unrecognised} muted /></Item>
        </Stagger>

        <button type="button" className="relative mt-7 btn btn-ghost btn-sm" aria-expanded={whyOpen} aria-controls="why-panel" onClick={() => setWhyOpen((v) => !v)}>
          {t.why} <span className={`transition-transform ${whyOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>
        <AnimatePresence>
          {whyOpen && (
            <motion.div id="why-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="relative overflow-hidden">
              <div className="mt-4 card card-solid p-5 text-sm">
                <p className="mono-label">Decision trace</p>
                <ol className="mt-3 list-decimal pl-5 space-y-1.5 text-ink-2">
                  <li>Confirmed entities were looked up in knowledge base v{result.kb_version} — {result.pairs.length} herb–medicine pair{result.pairs.length === 1 ? "" : "s"}.</li>
                  <li>{result.interactions.length} interaction row{result.interactions.length === 1 ? "" : "s"} matched (by exact medicine, or by medicine class).</li>
                  {result.interactions.map((i) => (
                    <li key={i.code}>
                      <code className="font-mono text-xs text-mint-bright">{i.code}</code>: {i.rule_applied}
                    </li>
                  ))}
                  <li>Overall verdict = the most severe row verdict (RED &gt; AMBER &gt; GREEN).{result.unrecognised.length > 0 && " Unrecognised items block a GREEN result."}</li>
                  <li>The explanation below was then written from these rows only; it cannot add, remove or re-grade an interaction.</li>
                </ol>
                <p className="mt-3 font-mono text-[11px] tracking-wider text-ink-3">{t.reviewedKb.toUpperCase()}: {result.kb_version} · QUERY #{result.query_id}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Explanation */}
      <Stagger className="grid gap-5 lg:grid-cols-[1.3fr_1fr]" delay={0.1}>
        <Item variants={fadeUp} className="card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl text-ink">{t.summary}</h2>
            <span className={`chip ${ex.origin === "llm" ? "chip-saffron" : ""}`} title={ex.origin === "llm" ? `Provider: ${ex.llm_provider ?? "configured"}` : "The AI explainer was not used or did not return a valid, grounded answer."}>
              {t.explainedBy}: {ex.origin === "llm" ? `${t.llm} (${ex.llm_provider})` : t.fallback}
            </span>
          </div>
          {explainBusy ? <div className="mt-4"><Spinner label="Translating…" /></div> : <p className="mt-4 text-ink prose-safe text-lg leading-relaxed">{summary}</p>}
          {ex.notice && <p className="mt-3 text-sm text-ink-3">{ex.notice}</p>}
          {ex.timing_gap && (
            <p className="mt-5 rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 text-ink-2">
              <span className="font-semibold text-mint-bright">⏱ {t.timing}:</span> {ex.timing_gap}
            </p>
          )}
        </Item>
        <Item variants={fadeUp} className="card p-6 sm:p-7">
          <h2 className="text-xl text-ink">{t.questions}</h2>
          <ol className="mt-4 space-y-3 text-ink-2">
            {ex.doctor_questions.slice(0, 3).map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron/15 border border-saffron/40 font-mono text-xs text-saffron-bright">{i + 1}</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </Item>
      </Stagger>

      {/* Matched interactions */}
      <section>
        <SectionLabel>{t.matched}</SectionLabel>
        {result.interactions.length === 0 ? (
          <p className="mt-3 text-ink-2">{t.noMatched}</p>
        ) : (
          <Stagger as="ul" className="mt-4 space-y-4" delay={0.08}>
            {result.interactions.map((i) => (
              <Item key={i.code} variants={fadeUp}>
                <InteractionCard i={i} lang={lang} />
              </Item>
            ))}
          </Stagger>
        )}
      </section>

      {/* Pairs */}
      <section>
        <SectionLabel tone="muted">{t.pairs}</SectionLabel>
        <div className="mt-3 overflow-x-auto card">
          <table className="data">
            <thead>
              <tr>
                <th>Herb / product</th>
                <th>Medicine</th>
                <th>Result</th>
                <th>Rows</th>
              </tr>
            </thead>
            <tbody>
              {result.pairs.map((p, idx) => (
                <tr key={idx}>
                  <td className="text-ink font-medium">{p.herb.name}</td>
                  <td className="text-ink font-medium">{p.drug.name}</td>
                  <td><VerdictPill verdict={p.verdict} size="sm" /></td>
                  <td className="font-mono text-xs">{p.interaction_codes.length ? p.interaction_codes.join(", ") : "—"}</td>
                </tr>
              ))}
              {result.pairs.length === 0 && (
                <tr><td colSpan={4}>Both a medicine and a herb are needed to form a pair.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Disclaimer text={result.disclaimer} />

      <section className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" onClick={pdf} disabled={pdfBusy}>
          {pdfBusy ? "Preparing PDF…" : t.pdf}
        </button>
        <Link href={adrHref} className="btn btn-saffron">{t.adr}</Link>
        <Link href="/check" className="btn btn-ghost" onClick={() => session.clear()}>{t.again} <ArrowRight className="h-4 w-4" /></Link>
      </section>
      {pdfError && <ErrorPanel error={pdfError} onRetry={pdf} />}

      <FeedbackForm page="results" interactionCodes={result.interactions.map((i) => i.code)} />
    </div>
  );
}

function Entities({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-bg/60 p-4 h-full">
      <p className="mono-label muted">{title}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-ink-3">—</p>
      ) : (
        <ul className={`mt-2 text-sm space-y-0.5 ${muted ? "text-ink-2" : "text-ink font-medium"}`}>
          {items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InteractionCard({ i, lang }: { i: MatchedInteraction; lang: Language }) {
  const m = VERDICT_META[i.verdict];
  const patient = lang === "hi" ? i.patient_summary_hi : i.patient_summary_en;
  const gap = formatTimingGap(i.timing_gap_hours);
  return (
    <article className={`tone-${m.tone} verdict-card rounded-2xl p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <VerdictPill verdict={i.verdict} size="sm" />
        <h3 className="text-lg text-ink">
          {i.herb.name} + {i.drug.name}
        </h3>
        <Link href={`/knowledge-base/${encodeURIComponent(i.code)}`} className="font-mono text-xs text-ink-3 hover:text-mint-bright">· {i.code} ↗</Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SeverityChip severity={i.severity} />
        <GradeChip grade={i.evidence_grade} />
        <span className="chip">{i.interaction_type}</span>
        <span className="chip">matched by {i.matched_by === "drug" ? "exact medicine" : `class: ${humanClass(i.drug.detail)}`}</span>
      </div>
      {patient && <p className="mt-4 text-ink">{patient}</p>}
      <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-xl border border-line bg-bg/50 p-3"><dt className="mono-label muted">Why it happens</dt><dd className="text-ink-2 mt-1">{i.mechanism}</dd></div>
        <div className="rounded-xl border border-line bg-bg/50 p-3"><dt className="mono-label muted">What may happen</dt><dd className="text-ink-2 mt-1">{i.effect}</dd></div>
        <div className="rounded-xl border border-line bg-bg/50 p-3"><dt className="mono-label muted">What doctors usually do</dt><dd className="text-ink-2 mt-1">{i.management}</dd></div>
      </dl>
      {gap && <p className="mt-3 text-sm text-ink-2"><span className="font-semibold text-mint-bright">Timing gap in the knowledge base:</span> {gap}</p>}
      {i.population_flags.length > 0 && <p className="mt-2 text-sm text-ink-2"><span className="font-semibold text-saffron-bright">Extra care if:</span> {i.population_flags.join(", ")}</p>}
      <details className="mt-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-mint-bright inline-flex items-center gap-2">
          <span className="transition-transform group-open:rotate-90">▸</span> Evidence & sources ({i.sources.length}) — {GRADE_META[i.evidence_grade].description}
        </summary>
        <ul className="mt-3 space-y-2 text-sm">
          {i.sources.map((s, k) => {
            const href = sourceLink(s);
            return (
              <li key={k} className="rounded-xl border border-line bg-bg/50 p-3">
                <p className="text-ink">{s.title}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                  <span className="chip">{s.source_type}</span>
                  {s.year && <span className="font-mono">{s.year}</span>}
                  {s.doi && <span className="font-mono">DOI {s.doi}</span>}
                  {s.pmid && <span className="font-mono">PMID {s.pmid}</span>}
                  <VerificationChip status={s.verification_status} />
                  {href && (
                    <a className="text-mint-bright hover:underline" href={href} target="_blank" rel="noopener noreferrer">
                      open source ↗
                    </a>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </details>
    </article>
  );
}
