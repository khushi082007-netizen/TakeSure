import Link from "next/link";
import type { EvidenceGrade, Verdict } from "@/types/api";
import { GRADE_META, VERDICT_META } from "@/lib/verdict";

export function Container({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, tone = "mint", className = "" }: { children: React.ReactNode; tone?: "mint" | "saffron" | "muted"; className?: string }) {
  return (
    <p className={`mono-label ${tone === "saffron" ? "saffron" : tone === "muted" ? "muted" : ""} flex items-center gap-2 ${className}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${tone === "saffron" ? "bg-saffron" : tone === "muted" ? "bg-ink-3" : "bg-mint"}`} aria-hidden />
      {children}
    </p>
  );
}

export function PageHeading({ eyebrow, title, lede, tone = "mint", right }: { eyebrow?: string; title: React.ReactNode; lede?: string; tone?: "mint" | "saffron" | "muted"; right?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 grid-bg opacity-70" aria-hidden />
      <div className="absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-mint/10 blur-3xl" aria-hidden />
      <Container className="relative pt-12 pb-10 sm:pt-16 sm:pb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          {eyebrow && <SectionLabel tone={tone}>{eyebrow}</SectionLabel>}
          <h1 className="mt-3 text-3xl sm:text-5xl text-ink">{title}</h1>
          {lede && <p className="mt-4 text-base sm:text-lg text-ink-2 max-w-2xl">{lede}</p>}
        </div>
        {right}
      </Container>
    </div>
  );
}

export function VerdictPill({ verdict, lang = "en", size = "md" }: { verdict: Verdict; lang?: "en" | "hi"; size?: "sm" | "md" | "lg" }) {
  const m = VERDICT_META[verdict];
  const sz = size === "lg" ? "text-base px-4 py-1.5" : size === "sm" ? "text-[11px] px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`tone-${m.tone} verdict-pill inline-flex items-center gap-1.5 rounded-full font-bold tracking-wide ${sz}`}>
      <span aria-hidden>{m.glyph}</span>
      <span>{lang === "hi" ? m.labelHi : m.label}</span>
    </span>
  );
}

export function VerdictDot({ verdict, className = "" }: { verdict: Verdict; className?: string }) {
  const m = VERDICT_META[verdict];
  return <span aria-hidden className={`tone-${m.tone} inline-block h-2.5 w-2.5 rounded-full ${className}`} style={{ background: "var(--tone)", boxShadow: "0 0 10px rgba(var(--tone-rgb), .8)" }} />;
}

export function SeverityChip({ severity }: { severity: string }) {
  const tone = severity === "major" ? "red" : severity === "moderate" ? "amber" : "green";
  return <span className={`tone-${tone} chip tone-chip`}>severity: {severity}</span>;
}

export function GradeChip({ grade, withTitle = false }: { grade: EvidenceGrade; withTitle?: boolean }) {
  const g = GRADE_META[grade];
  return (
    <span className="chip" title={g.description}>
      <span aria-hidden className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-mint text-primary-ink text-[10px] font-bold">
        {grade}
      </span>
      {withTitle ? g.description : `Evidence ${g.title}`}
    </span>
  );
}

export function VerificationChip({ status }: { status: string }) {
  if (status === "verified") return <span className="tone-green chip tone-chip">✓ source verified by team</span>;
  if (status === "disputed") return <span className="tone-red chip tone-chip">disputed</span>;
  return (
    <span className="chip" title="Citation entered from the literature review; not yet opened and confirmed by a team member.">
      needs verification
    </span>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-3 text-ink-2 text-sm">
      <span aria-hidden className="h-5 w-5 rounded-full border-2 border-line-2 border-t-mint animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function UspBanner({ compact = false, text }: { compact?: boolean; text?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 text-mint-bright font-semibold ${compact ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5"}`}>
      <span aria-hidden className="pulse-dot" /> {text ?? "Verdict from published data; AI only explains."}
    </p>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="card p-10 text-center">
      <p className="display text-2xl text-ink">{title}</p>
      <p className="mt-2 text-ink-2">{body}</p>
      {action && (
        <Link href={action.href} className="btn btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatTile({ label, value, sub, tone = "mint" }: { label: string; value: React.ReactNode; sub?: string; tone?: "mint" | "saffron" | "green" | "amber" | "red" | "grey" }) {
  const color = { mint: "text-mint-bright", saffron: "text-saffron-bright", green: "text-green", amber: "text-amber", red: "text-red", grey: "text-grey" }[tone];
  return (
    <div className="card p-5">
      <p className="mono-label muted">{label}</p>
      <p className={`display mt-2 text-3xl sm:text-4xl ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-3">{sub}</p>}
    </div>
  );
}

export function Num({ n, className = "" }: { n: string | number; className?: string }) {
  return <span className={`font-mono text-[11px] tracking-[0.2em] text-ink-3 ${className}`}>{String(n).padStart(2, "0")}</span>;
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
