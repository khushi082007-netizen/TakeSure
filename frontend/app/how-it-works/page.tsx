import Link from "next/link";
import { Container, PageHeading, SectionLabel, UspBanner, VerdictPill } from "@/components/ui";
import { Item, Reveal, Stagger, fadeUp } from "@/components/motion";

export const metadata = { title: "How it works" };

const RULES = [
  { verdict: "GREEN" as const, rule: "R1 · R2", when: "No interaction row exists for the pair, or only a minor row (e.g. a timing gap of a few hours).", note: "Green means “nothing published”, not “proven safe”." },
  { verdict: "AMBER" as const, rule: "R3", when: "A moderate-severity row, or any non-timing row whose only evidence is grade C (mechanistic / animal).", note: "Discuss with your doctor; usually a monitoring or dose question." },
  { verdict: "RED" as const, rule: "R4 · R5", when: "A major-severity row; or a moderate row where the medicine is a high-risk class (anticoagulant, antiplatelet, immunosuppressant, cardiac glycoside).", note: "Talk to your doctor before taking them together." },
  { verdict: "GREY" as const, rule: "—", when: "A name could not be matched to the knowledge base, or the inputs did not form a herb–medicine pair.", note: "Unknown is never shown as Green." },
];

const STEPS = [
  { n: "01", title: "Scan — the photo is read on the server", body: "Photos of the prescription and the product label are converted to text with Tesseract running locally (English + Hindi), or with a vision model when a Groq key is configured. The file is deleted the moment extraction finishes. If reading fails you are told exactly why and offered manual entry." },
  { n: "02", title: "Match — names become database entities", body: "Dosage forms and strengths (“Tab.”, “50 mcg”, “1-0-0”) are stripped. Remaining words are matched against brands, generics, Sanskrit/Hindi/Latin synonyms and branded products using RapidFuzz. Score ≥85 is accepted, 70–85 asks you to confirm, below 70 is “not recognised”. Thyronorm → levothyroxine; Chyawanprash → its constituent herbs." },
  { n: "03", title: "Decide — rules over the knowledge base", body: "For every herb × medicine pair the engine looks up interaction rows, first by the exact medicine, then by its class. Rules convert severity and evidence grade into a per-row verdict; the overall verdict is the worst row. No model is involved, and the full trace is shown in “Why this verdict?”." },
  { n: "04", title: "Explain — AI translates, never decides", body: "The matched rows (and only those rows) are sent to a language model with instructions to rewrite them in plain Hindi and English and to propose three questions for the doctor. The output must be strict JSON and is validated: dosing instructions or “stop taking” language are rejected and the deterministic knowledge-base text is shown instead. If the model is unavailable, you still get the full verdict." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeading eyebrow="How it works" title={<>A verdict you can audit, <span className="text-gradient-mint">an explanation you can read.</span></>} lede="TakeSure separates two jobs that are usually blurred together: deciding, which is done by fixed rules over a cited database, and explaining, which is the only thing the AI does." />
      <Container className="py-12 pb-20 space-y-20">
        <section>
          <Reveal><UspBanner /></Reveal>
          <Stagger as="ol" className="mt-8 grid gap-4 md:grid-cols-2" delay={0.08}>
            {STEPS.map((s) => (
              <Item key={s.n} variants={fadeUp} className="card card-hover p-6">
                <p className="font-mono text-xs tracking-[0.2em] text-mint">{s.n}</p>
                <h3 className="mt-3 text-xl text-ink">{s.title}</h3>
                <p className="mt-3 text-ink-2 text-sm leading-relaxed">{s.body}</p>
              </Item>
            ))}
          </Stagger>
        </section>

        <section>
          <Reveal>
            <SectionLabel>Verdict rules</SectionLabel>
            <h2 className="mt-3 text-3xl text-ink">Five rules. No exceptions. No model.</h2>
          </Reveal>
          <Reveal className="mt-6 overflow-x-auto card" delay={0.1}>
            <table className="data">
              <thead><tr><th>Verdict</th><th>Rule</th><th>When</th><th>Meaning</th></tr></thead>
              <tbody>
                {RULES.map((r) => (
                  <tr key={r.verdict}>
                    <td><VerdictPill verdict={r.verdict} size="sm" /></td>
                    <td className="font-mono text-xs text-mint-bright">{r.rule}</td>
                    <td>{r.when}</td>
                    <td>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <Reveal className="mt-4" delay={0.15}>
            <ul className="text-sm text-ink-2 space-y-1.5">
              {["Red > Amber > Green. Nothing is averaged away: every matched row stays visible.", "Timing-gap hours are shown only when the knowledge-base row contains them.", "A medicine-specific row overrides a class-level row for the same herb.", "Wildcard rows (bulk laxatives vs any oral medicine) always apply in addition."].map((x) => (
                <li key={x} className="flex gap-2"><span className="text-mint">◆</span>{x}</li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section>
          <Reveal>
            <SectionLabel tone="saffron">Evidence grades</SectionLabel>
            <h2 className="mt-3 text-3xl text-ink">Weak evidence is shown as weak.</h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 md:grid-cols-3" delay={0.08}>
            <Item variants={fadeUp}><Grade g="A" t="Human RCT or systematic review" d="e.g. the placebo-controlled ashwagandha thyroid trials." /></Item>
            <Item variants={fadeUp}><Grade g="B" t="Case reports, case series, small trials" d="e.g. the 2021 Indian case series of giloy-associated liver injury." /></Item>
            <Item variants={fadeUp}><Grade g="C" t="Mechanistic, animal or in-vitro" d="Plausible, not demonstrated in people. Alone, grade C caps a non-timing row at Amber." /></Item>
          </Stagger>
        </section>

        <Reveal className="card p-8">
          <SectionLabel tone="muted">What TakeSure will not do</SectionLabel>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-ink-2">
            {["Tell you to stop, start or change the dose of anything.", "Produce a verdict for a combination that is not in the database.", "Submit a reaction report to the government on your behalf — it prepares the PDF and links you to the official Ayush Suraksha portal.", "Keep your photos, or store who checked what."].map((x) => (
              <li key={x} className="flex gap-2"><span className="text-red">✕</span>{x}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/about" className="btn btn-secondary">Methodology & limitations</Link>
            <Link href="/check" className="btn btn-primary">Try the checker</Link>
          </div>
        </Reveal>
      </Container>
    </>
  );
}

function Grade({ g, t, d }: { g: string; t: string; d: string }) {
  return (
    <div className="card p-6 h-full">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-primary-ink font-bold">{g}</span>
        <p className="font-semibold text-ink">{t}</p>
      </div>
      <p className="mt-3 text-sm text-ink-2">{d}</p>
    </div>
  );
}
