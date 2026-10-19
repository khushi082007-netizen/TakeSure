import { Container, PageHeading, SectionLabel, UspBanner } from "@/components/ui";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Item, Reveal, Stagger, fadeUp } from "@/components/motion";

export const metadata = { title: "About & methodology" };

const METHOD = [
  ["Scope", "Herbs and formulations with high use in India and documented interaction concern; medicine classes where interactions matter most (thyroid, antidiabetic, anticoagulant/antiplatelet, immunosuppressant, antihypertensive, CNS, cardiac)."],
  ["Sources", "Peer-reviewed trials and reviews (PubMed), NIH LiverTox, Memorial Sloan Kettering “About Herbs”, WHO monographs, Stockley’s Herbal Medicines Interactions, the Ayurvedic Pharmacopoeia of India, and Indian regulatory/pharmacovigilance publications."],
  ["One row, one claim", "Each interaction row names a herb, a medicine (or class), a severity, an interaction type, mechanism, effect, management reported in the literature, optional timing-gap hours and population flags — and at least one source. Rows without a source are rejected by the seed validator and never load."],
  ["Evidence grade", "A = human RCT or systematic review; B = case reports, case series or small trials; C = mechanistic, animal or in-vitro only. The grade is shown on every card and lowers the verdict ceiling for grade-C evidence."],
  ["Citation verification", "Every citation carries a status. “Needs verification” means it was captured during the review and has not yet been re-opened by a second person; “verified” is set only after that check, by hand, never by a model."],
  ["Versioning", "The knowledge base has a version number (shown on every result and PDF). Changes are made through reviewed seed files and SQL migrations, not in a live admin screen."],
];

const STAKEHOLDERS = [
  ["Patient / caregiver", "60-second verdict in Hindi/English, timing gap, questions to carry to the clinic, ADR reporting."],
  ["Allopathic doctor", "Printable one-page summary with sources; patients disclose more because the app asked first."],
  ["Ayurvedic vaidya", "The same knowledge base from the other direction: enter the classical formulation, see the modern-drug flags."],
  ["Pharmacist", "Counter-side web version; sells both systems’ products with a cross-check for the first time."],
  ["Ministry of Ayush / NPvCC", "Structured, pre-filled ICSRs; anonymised co-use analytics; signal detection for new interactions."],
  ["Ayurvedic industry", "A safety layer strengthens legitimate products after the liver-injury headlines of 2021."],
];

export default function AboutPage() {
  return (
    <>
      <PageHeading eyebrow="About & methodology" title={<>How the knowledge base is built — <span className="text-gradient-saffron">and what it cannot tell you.</span></>} lede="TakeSure addresses a quiet gap in Indian healthcare: Ayurvedic products are taken alongside allopathic medicines every day, and almost never disclosed." tone="saffron" />
      <Container className="py-12 pb-20 space-y-20">
        <Stagger className="grid gap-4 md:grid-cols-2" delay={0.1}>
          <Item variants={fadeUp} className="card p-7">
            <SectionLabel tone="saffron">The problem</SectionLabel>
            <p className="mt-3 text-ink-2">Patients on thyroid, diabetes, blood-thinning or transplant medicines routinely add Ashwagandha, Giloy, Guggul or Chyawanprash — often on a relative’s advice. Doctors rarely ask; patients rarely volunteer. Published case series describe over-replacement of thyroid hormone, INR swings on warfarin and immunosuppression conflicts linked to such combinations, and a pharmacovigilance system (Ayush Suraksha) exists but is under-used.</p>
          </Item>
          <Item variants={fadeUp} className="card p-7">
            <SectionLabel>Our position</SectionLabel>
            <div className="mt-3"><UspBanner compact /></div>
            <p className="mt-3 text-ink-2">Generative models are good at explaining and bad at being accountable. So the verdict is produced by transparent rules over a database every row of which cites its source, and the model is confined to rewriting those rows for a patient. If it fails validation or is offline, the verdict is unchanged.</p>
          </Item>
        </Stagger>

        <section>
          <Reveal>
            <SectionLabel>Methodology</SectionLabel>
            <h2 className="mt-3 text-3xl text-ink">Six rules for every row.</h2>
          </Reveal>
          <Stagger as="ol" className="mt-6 grid gap-3 md:grid-cols-2" delay={0.06}>
            {METHOD.map(([t, b], k) => (
              <Item key={t} variants={fadeUp} className="card card-hover p-5 flex gap-4">
                <span className="font-mono text-xs text-mint mt-1">0{k + 1}</span>
                <div>
                  <h3 className="font-semibold text-ink">{t}</h3>
                  <p className="mt-1 text-sm text-ink-2">{b}</p>
                </div>
              </Item>
            ))}
          </Stagger>
        </section>

        <section>
          <Reveal>
            <SectionLabel tone="saffron">Who it is for</SectionLabel>
            <h2 className="mt-3 text-3xl text-ink">Six stakeholders, one knowledge base.</h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" delay={0.06}>
            {STAKEHOLDERS.map(([t, b]) => (
              <Item key={t} variants={fadeUp} className="card p-5">
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-1 text-sm text-ink-2">{b}</p>
              </Item>
            ))}
          </Stagger>
        </section>

        <Reveal className="tone-amber verdict-card rounded-2xl p-7">
          <SectionLabel tone="saffron">Limitations — please read</SectionLabel>
          <ul className="mt-4 space-y-2 text-ink-2">
            {[
              ["Green is not proof of safety.", "It means no interaction is published for that pair in our database. Evidence for most herb–drug pairs is thin."],
              ["Coverage is small.", "The knowledge base holds a few dozen rows curated for a hackathon. It is a method demonstration, not a complete reference."],
              ["Citations are not yet all re-verified;", "the status is shown so you can check them yourself via the DOI/PMID links."],
              ["OCR makes mistakes,", "especially with handwriting. That is why you review every matched name before anything is checked."],
              ["Product composition varies.", "Branded products are mapped to typical constituents from the label; heavy-metal contamination of some products is a published concern this tool cannot detect."],
              ["Not a medical device.", "TakeSure is educational and has not been clinically validated or reviewed by a regulator."],
            ].map(([a, b]) => (
              <li key={a} className="flex gap-2"><span className="text-saffron">◆</span><span><strong className="text-ink">{a}</strong> {b}</span></li>
            ))}
          </ul>
        </Reveal>

        <section className="grid gap-4 md:grid-cols-2">
          <Reveal className="card p-7">
            <SectionLabel>Privacy & security</SectionLabel>
            <ul className="mt-4 space-y-2 text-sm text-ink-2">
              {["Uploaded photos are checked for type and size, stored under a random name in a temporary folder, read once, and deleted. A sweeper removes anything left over.", "No account, no tracking cookies. The check flow keeps state in your browser session only.", "Query logs hold entity ids and the verdict — never the photo, the text or anything identifying you.", "ADR reports are stored only with your consent and contain no name or contact details.", "API keys live on the server; the browser never sees them. Rate limiting and strict CORS are on by default."].map((x) => (
                <li key={x} className="flex gap-2"><span className="text-mint">◆</span>{x}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="card p-7" delay={0.1}>
            <SectionLabel tone="muted">Regulatory context</SectionLabel>
            <ul className="mt-4 space-y-2 text-sm text-ink-2">
              {["Pharmacovigilance Programme for ASU&H Drugs (Ministry of Ayush, AOGUSY scheme): NPvCC at AIIA New Delhi, 5 intermediary and 99 peripheral centres.", "Ayush Suraksha Portal (May 2025, after the Supreme Court order in WP(C) 645/2022): citizens and professionals can report ADRs. TakeSure feeds into it; it does not compete.", "Drugs and Cosmetics Act 1940, Chapter IVA governs ASU drugs.", "Future path: Ayush Grid / ABDM — attach an TakeSure verdict to the patient’s ABHA record."].map((x) => (
                <li key={x} className="flex gap-2"><span className="text-saffron">◆</span>{x}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-3">Built by Team Bug Hunters. Thanks to the maintainers of Tesseract, RapidFuzz, FastAPI, ReportLab, Next.js, LiverTox and MSKCC About Herbs, and to TinyFish for the web-agent tooling behind our evidence curation.</p>
          </Reveal>
        </section>

        <FeedbackForm page="about" />
      </Container>
    </>
  );
}
