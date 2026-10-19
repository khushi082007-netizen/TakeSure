import type { EvidenceGrade, Verdict } from "@/types/api";

export interface VerdictMeta {
  label: string;
  labelHi: string;
  short: string;
  shortHi: string;
  /** Text glyph so meaning never depends on colour alone. */
  glyph: string;
  /** Tailwind classes (defined in globals.css as tokens). */
  tone: "green" | "amber" | "red" | "grey";
}

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  GREEN: { label: "GREEN", labelHi: "हरा", short: "No known interaction", shortHi: "कोई ज्ञात इंटरैक्शन नहीं", glyph: "✓", tone: "green" },
  AMBER: { label: "AMBER", labelHi: "पीला", short: "Caution — discuss with your doctor", shortHi: "सावधानी — अपने डॉक्टर से बात करें", glyph: "!", tone: "amber" },
  RED: { label: "RED", labelHi: "लाल", short: "Important — talk to your doctor before taking together", shortHi: "ज़रूरी — साथ लेने से पहले डॉक्टर से बात करें", glyph: "!!", tone: "red" },
  GREY: { label: "NOT IN DATABASE", labelHi: "डेटाबेस में नहीं", short: "We could not verify this combination", shortHi: "हम इस संयोजन की पुष्टि नहीं कर सके", glyph: "?", tone: "grey" },
};

export const GRADE_META: Record<EvidenceGrade, { title: string; description: string }> = {
  A: { title: "Grade A", description: "Human RCT or systematic review" },
  B: { title: "Grade B", description: "Case reports, case series or a small trial" },
  C: { title: "Grade C", description: "Mechanistic, animal or in-vitro only — plausible but unproven in humans" },
};

export const USP = "Verdict from published data; AI only explains.";

export function formatTimingGap(hours?: number | null): string | null {
  if (hours == null) return null;
  if (Number.isInteger(hours)) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hours`;
}

export function sourceLink(s: { doi?: string | null; pmid?: string | null; url?: string | null }): string | null {
  if (s.doi) return `https://doi.org/${s.doi}`;
  if (s.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`;
  if (s.url) return s.url;
  return null;
}

export function humanClass(cls?: string | null): string {
  if (!cls) return "";
  if (cls === "*") return "any oral medicine";
  return cls.replace(/_/g, " ");
}
