"use client";
import Link from "next/link";
import { api } from "@/lib/api";
import { useQuery } from "@/lib/hooks";
import { formatTimingGap, humanClass, sourceLink, GRADE_META } from "@/lib/verdict";
import { ErrorPanel } from "@/components/ErrorPanel";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Item, Reveal, Stagger, fadeUp } from "@/components/motion";
import { GradeChip, SectionLabel, SeverityChip, Spinner, VerificationChip } from "@/components/ui";

export function InteractionDetailView({ code }: { code: string }) {
  const { data: d, error, retry } = useQuery(() => api.interaction(code), code);

  if (error) return <ErrorPanel error={error} onRetry={retry} />;
  if (!d) return <Spinner label="Loading interaction…" />;
  const gap = formatTimingGap(d.timing_gap_hours);
  const tone = d.severity === "major" ? "red" : d.severity === "moderate" ? "amber" : "green";
  return (
    <article className="space-y-10">
      <Reveal>
        <Link href="/knowledge-base" className="text-sm text-ink-2 hover:text-mint-bright">← All interactions</Link>
        <p className="mt-5 font-mono text-xs tracking-[0.2em] text-mint">{d.code}</p>
        <h1 className="mt-2 text-3xl sm:text-5xl text-ink">
          {d.herb} <span className="text-ink-3 font-normal text-2xl sm:text-3xl">({d.herb_latin})</span>
          <br />
          <span className="text-ink-2 text-2xl sm:text-3xl">+ {d.drug ?? humanClass(d.drug_class)}</span>
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <SeverityChip severity={d.severity} />
          <GradeChip grade={d.evidence_grade} withTitle />
          <span className="chip">{d.interaction_type}</span>
          {d.drug_class && !d.drug && <span className="chip chip-saffron">applies to every medicine in class: {humanClass(d.drug_class)}</span>}
        </div>
      </Reveal>

      {(d.patient_summary_en || d.patient_summary_hi) && (
        <Reveal className={`tone-${tone} verdict-card rounded-2xl p-6 grid gap-5 md:grid-cols-2`}>
          {d.patient_summary_en && <div><p className="mono-label muted">PLAIN ENGLISH</p><p className="mt-2 text-ink text-lg">{d.patient_summary_en}</p></div>}
          {d.patient_summary_hi && <div lang="hi"><p className="mono-label muted">सरल हिन्दी</p><p className="mt-2 text-ink text-lg">{d.patient_summary_hi}</p></div>}
        </Reveal>
      )}

      <Stagger className="grid gap-4 md:grid-cols-3">
        <Item variants={fadeUp}><Box title="Mechanism">{d.mechanism}</Box></Item>
        <Item variants={fadeUp}><Box title="Clinical effect">{d.effect}</Box></Item>
        <Item variants={fadeUp}><Box title="Management reported in the literature">{d.management}</Box></Item>
      </Stagger>

      <Stagger className="grid gap-4 sm:grid-cols-2">
        <Item variants={fadeUp}><Box title="Timing gap">{gap ? `${gap} between the two, as stated in the knowledge base.` : "No timing-gap guidance in the source; TakeSure never invents one."}</Box></Item>
        <Item variants={fadeUp}><Box title="Populations needing extra care">{d.population_flags.length ? d.population_flags.join(", ") : "None flagged."}</Box></Item>
      </Stagger>

      <Reveal>
        <SectionLabel>Sources ({d.sources.length})</SectionLabel>
        <p className="text-sm text-ink-2 mt-2">{GRADE_META[d.evidence_grade].description}. “Needs verification” means the citation was captured during the literature review and has not yet been re-opened and confirmed by a second team member.</p>
        <ul className="mt-4 space-y-2">
          {d.sources.map((s, k) => {
            const href = sourceLink(s);
            return (
              <li key={k} className="card p-4">
                <p className="text-ink">{s.title}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                  <span className="chip">{s.source_type}</span>
                  {s.year && <span className="font-mono">{s.year}</span>}
                  {s.doi && <span className="font-mono">DOI {s.doi}</span>}
                  {s.pmid && <span className="font-mono">PMID {s.pmid}</span>}
                  <VerificationChip status={s.verification_status} />
                  {href && <a className="text-mint-bright hover:underline" href={href} target="_blank" rel="noopener noreferrer">open source ↗</a>}
                </p>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <p className="font-mono text-[11px] tracking-wider text-ink-3 uppercase">
        Knowledge base v{d.kb_version}{d.reviewed_on ? ` · reviewed ${d.reviewed_on}` : ""}{d.reviewer ? ` · ${d.reviewer}` : ""}
      </p>

      <FeedbackForm page="knowledge-base" interactionCodes={[d.code]} />
    </article>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 h-full">
      <p className="mono-label muted">{title}</p>
      <p className="mt-2 text-ink-2">{children}</p>
    </div>
  );
}
