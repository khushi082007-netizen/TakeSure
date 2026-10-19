/** Mirrors backend/app/schemas exactly. The frontend never computes a verdict; it only renders these. */

export type Verdict = "GREEN" | "AMBER" | "RED" | "GREY";
export type Severity = "minor" | "moderate" | "major";
export type EvidenceGrade = "A" | "B" | "C";
export type EntityKind = "drug" | "herb";
export type Language = "en" | "hi";

export interface ApiError {
  code:
    | "VALIDATION_FAILED"
    | "UNSUPPORTED_FILE"
    | "FILE_TOO_LARGE"
    | "UPLOAD_NOT_FOUND"
    | "OCR_UNAVAILABLE"
    | "OCR_FAILED"
    | "NO_TEXT_DETECTED"
    | "NOT_FOUND"
    | "RATE_LIMITED"
    | "PDF_GENERATION_FAILED"
    | "DATABASE_UNAVAILABLE"
    | "INTERNAL_ERROR"
    | "NETWORK_ERROR"
    | "TIMEOUT"
    | "INVALID_RESPONSE";
  message: string;
  detail?: Record<string, unknown> | null;
  retryable: boolean;
  status?: number;
}

export interface UploadResponse {
  upload_id: string;
  mime: string;
  size_bytes: number;
  expires_in_seconds: number;
}

export interface Candidate {
  kind: EntityKind;
  raw_text: string;
  canonical_id: number;
  canonical_name: string;
  display_name: string;
  matched_term: string;
  score: number;
  status: "accepted" | "needs_confirmation";
  via: "exact" | "synonym" | "brand" | "fuzzy" | string;
}

export interface DocumentExtraction {
  document: "prescription" | "product";
  engine: string;
  raw_text: string;
  candidates: Candidate[];
  warnings: string[];
}

export interface ExtractResponse {
  documents: DocumentExtraction[];
  drugs: Candidate[];
  herbs: Candidate[];
  unrecognised: string[];
  needs_confirmation: boolean;
}

export interface ResolveResponse {
  resolved: Candidate[];
  unrecognised: string[];
}

export interface EvaluateRequest {
  drug_ids: number[];
  herb_ids: number[];
  unrecognised: string[];
  language: Language;
  state?: string | null;
  source?: "web" | "demo";
}

export interface SourceOut {
  title: string;
  source_type: string;
  doi?: string | null;
  pmid?: string | null;
  url?: string | null;
  year?: number | null;
  verification_status: "needs_verification" | "verified" | "disputed" | string;
}

export interface EntityOut {
  id: number;
  name: string;
  detail?: string | null;
}

export interface MatchedInteraction {
  code: string;
  herb: EntityOut;
  drug: EntityOut;
  matched_by: "drug" | "drug_class";
  severity: Severity;
  verdict: Verdict;
  interaction_type: string;
  mechanism: string;
  effect: string;
  management: string;
  timing_gap_hours?: number | null;
  evidence_grade: EvidenceGrade;
  population_flags: string[];
  rule_applied: string;
  sources: SourceOut[];
  patient_summary_en?: string | null;
  patient_summary_hi?: string | null;
}

export interface PairStatus {
  herb: EntityOut;
  drug: EntityOut;
  verdict: Verdict;
  interaction_codes: string[];
}

export interface Explanation {
  summary_en: string;
  summary_hi: string;
  timing_gap?: string | null;
  doctor_questions: [string, string, string] | string[];
  origin: "llm" | "kb_fallback";
  llm_provider?: string | null;
  notice?: string | null;
}

export interface EvaluateResponse {
  query_id: number;
  verdict: Verdict;
  verdict_reason: string;
  kb_version: string;
  drugs: EntityOut[];
  herbs: EntityOut[];
  unrecognised: string[];
  pairs: PairStatus[];
  interactions: MatchedInteraction[];
  explanation: Explanation;
  disclaimer: string;
}

export interface InteractionListItem {
  code: string;
  herb: string;
  herb_latin: string;
  drug?: string | null;
  drug_class?: string | null;
  severity: Severity;
  evidence_grade: EvidenceGrade;
  interaction_type: string;
  timing_gap_hours?: number | null;
  reviewed_on?: string | null;
  kb_version: string;
}

export interface InteractionDetail extends InteractionListItem {
  mechanism: string;
  effect: string;
  management: string;
  population_flags: string[];
  reviewer?: string | null;
  patient_summary_en?: string | null;
  patient_summary_hi?: string | null;
  sources: SourceOut[];
}

export interface InteractionListResponse {
  total: number;
  kb_version: string;
  items: InteractionListItem[];
}

export interface HerbOut {
  id: number;
  slug: string;
  english_name: string;
  latin_name: string;
  hindi_name?: string | null;
  sanskrit_name?: string | null;
  category?: string | null;
  synonyms: string[];
}

export interface DrugOut {
  id: number;
  slug: string;
  generic: string;
  drug_class: string;
  brands: string[];
}

export interface KBStats {
  kb_version: string;
  herbs: number;
  drugs: number;
  drug_classes: number;
  interactions: number;
  sources: number;
  sources_verified: number;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  expected_verdict: Verdict;
  drugs: string[];
  herbs: string[];
  unknown_terms: string[];
}

export interface DemoScenarioResolved extends DemoScenario {
  resolved: Candidate[];
  unrecognised: string[];
}

export interface ADRCreate {
  product: string;
  product_manufacturer?: string;
  product_batch?: string;
  drugs: string[];
  reaction: string;
  onset_date?: string;
  outcome: "recovered" | "recovering" | "not_recovered" | "recovered_with_sequelae" | "fatal" | "unknown";
  seriousness?: "not_serious" | "hospitalisation" | "life_threatening" | "disability" | "other_medically_important";
  patient_age_group?: "child" | "adult" | "elderly";
  patient_sex?: "female" | "male" | "other" | "undisclosed";
  reporter_type: "patient" | "caregiver" | "pharmacist" | "doctor_mbbs" | "doctor_bams" | "other";
  state?: string;
  consent_to_store: boolean;
}

export interface ADRResponse {
  id: number;
  reference: string;
  status: string;
  official_portal_url: string;
  note: string;
}

export interface FeedbackCreate {
  issue_type: "wrong_severity" | "wrong_source" | "missing_interaction" | "ocr_error" | "translation" | "other";
  description: string;
  interaction_code?: string;
  page?: string;
}

export interface HealthResponse {
  status: string;
  kb_version: string;
  database: string;
  ocr_engine: string;
  ocr_available?: boolean;
  ocr_detail?: { mode?: string; chain?: string[]; available?: boolean; tesseract_langs?: string | null; groq_vision?: boolean };
  llm_provider: string;
  llm_model?: string | null;
  interactions_active?: number | null;
  [k: string]: unknown;
}

/* ---- analytics (anonymised) ---- */
export interface VerdictCounts { GREEN: number; AMBER: number; RED: number; GREY: number }
export interface DailyPoint extends VerdictCounts { date: string; total: number }
export interface PairCount { herb: string; drug: string; count: number; worst_verdict: Verdict }
export interface NameCount { name: string; detail?: string | null; count: number }
export interface InteractionCount { code: string; herb: string; target: string; severity: Severity; evidence_grade: EvidenceGrade; count: number }
export interface StateCount { state: string; count: number }
export interface ADRSummaryItem { reference: string; ts: string; product: string; outcome: string; seriousness?: string | null; reporter_type: string; state?: string | null; drugs: string[] }
export interface FeedbackCount { issue_type: string; count: number }
export interface AnalyticsTotals {
  queries: number; queries_web: number; queries_demo: number; queries_period: number;
  adr_reports: number; adr_serious: number; feedback_total: number; feedback_open: number;
  kb_interactions: number; kb_sources: number; kb_sources_verified: number;
  curation_drafts_pending?: number; curation_drafts_mismatch?: number;
}
/* ---- evidence curation (TinyFish) ---- */
export type DraftKind = "verify" | "discover" | "product";
export type DraftStatus = "pending" | "approved" | "rejected" | "mismatch";
export interface CurationStatus {
  configured: boolean; provider: string; capabilities: string[];
  sources_total: number; sources_verified: number; sources_pending: number;
  drafts_pending: number; drafts_mismatch: number; drafts_approved: number; drafts_total: number; note: string;
}
export interface CurationDraft {
  id: number; ts: string; kind: DraftKind; status: DraftStatus; subject: string; source_url?: string | null; source_id?: number | null;
  extracted: Record<string, unknown>; score?: number | null; note?: string | null; tinyfish_run_id?: string | null; steps?: number | null; reviewed_by?: string | null;
}
export interface DraftList { total: number; items: CurationDraft[] }
export interface VerifyResult { checked: number; verified: number; mismatched: number; failed: number; drafts: CurationDraft[] }

export interface AnalyticsSummary {
  generated_at: string; kb_version: string; period_days: number;
  totals: AnalyticsTotals; verdicts: VerdictCounts; daily: DailyPoint[];
  top_pairs: PairCount[]; top_herbs: NameCount[]; top_drugs: NameCount[]; top_interactions: InteractionCount[];
  by_state: StateCount[]; adr_outcomes: Record<string, number>; recent_adr: ADRSummaryItem[]; feedback_by_type: FeedbackCount[];
}
