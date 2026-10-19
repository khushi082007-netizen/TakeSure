/**
 * Typed client for the TakeSure FastAPI backend.
 * Every failure is normalised to an ApiError (code + message + retryable) so pages can render
 * specific, actionable error states instead of "something went wrong".
 */
import type {
  ADRCreate,
  AnalyticsSummary,
  CurationDraft,
  CurationStatus,
  DraftList,
  VerifyResult,
  ADRResponse,
  ApiError,
  DemoScenario,
  DemoScenarioResolved,
  DrugOut,
  EvaluateRequest,
  EvaluateResponse,
  Explanation,
  ExtractResponse,
  FeedbackCreate,
  HealthResponse,
  HerbOut,
  InteractionDetail,
  InteractionListResponse,
  KBStats,
  Language,
  ResolveResponse,
  UploadResponse,
} from "@/types/api";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

const DEFAULT_TIMEOUT_MS = 30_000;
const OCR_TIMEOUT_MS = 120_000; // Tesseract on a large photo, or the cloud vision reader, can take a while

export class ApiClientError extends Error implements ApiError {
  code: ApiError["code"];
  detail?: Record<string, unknown> | null;
  retryable: boolean;
  status?: number;
  constructor(e: ApiError) {
    super(e.message);
    this.name = "ApiClientError";
    this.code = e.code;
    this.detail = e.detail;
    this.retryable = e.retryable;
    this.status = e.status;
  }
}

export function isApiError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError;
}

/** Convert any thrown value into an ApiClientError without losing backend codes. */
export function toApiError(e: unknown): ApiClientError {
  if (isApiError(e)) return e;
  if (e instanceof DOMException && e.name === "AbortError") {
    return new ApiClientError({ code: "TIMEOUT", message: "The server took too long to respond.", retryable: true });
  }
  if (e instanceof TypeError) {
    return new ApiClientError({
      code: "NETWORK_ERROR",
      message: "Could not reach the TakeSure server. Check that the backend is running and reachable.",
      retryable: true,
    });
  }
  return new ApiClientError({ code: "INTERNAL_ERROR", message: e instanceof Error ? e.message : "Unexpected error.", retryable: false });
}

async function parseError(res: Response): Promise<ApiClientError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }
  const env = (body as { error?: Partial<ApiError> } | null)?.error;
  if (env && typeof env.code === "string" && typeof env.message === "string") {
    return new ApiClientError({
      code: env.code as ApiError["code"],
      message: env.message,
      detail: env.detail ?? null,
      retryable: Boolean(env.retryable),
      status: res.status,
    });
  }
  // FastAPI validation errors arrive as {detail: [...]}
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (res.status === 422) {
    return new ApiClientError({ code: "VALIDATION_FAILED", message: "The request was not valid.", detail: { detail }, retryable: false, status: 422 });
  }
  return new ApiClientError({
    code: res.status >= 500 ? "INTERNAL_ERROR" : "INVALID_RESPONSE",
    message: `Server responded with ${res.status}.`,
    retryable: res.status >= 500,
    status: res.status,
  });
}

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw await parseError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e) {
    throw toApiError(e);
  } finally {
    clearTimeout(timer);
  }
}

async function requestBlob(path: string, body: unknown, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<{ blob: Blob; filename: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw await parseError(res);
    const cd = res.headers.get("Content-Disposition") ?? "";
    const m = /filename="?([^";]+)"?/.exec(cd);
    return { blob: await res.blob(), filename: m?.[1] ?? "takesure.pdf" };
  } catch (e) {
    throw toApiError(e);
  } finally {
    clearTimeout(timer);
  }
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  health: () => request<HealthResponse>("/health"),

  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<UploadResponse>("/check/upload", { method: "POST", body: fd }, 60_000);
  },
  extract: (ids: { prescription_upload_id?: string; product_upload_id?: string }) =>
    request<ExtractResponse>("/check/extract", json(ids), OCR_TIMEOUT_MS),
  resolve: (entities: { kind: "drug" | "herb"; text: string }[]) =>
    request<ResolveResponse>("/check/resolve", json({ entities })),
  evaluate: (payload: EvaluateRequest) => request<EvaluateResponse>("/check/evaluate", json(payload)),
  explain: (result: EvaluateResponse, language: Language) =>
    request<Explanation>("/explain", json({ result, language })),

  interactions: (params: { q?: string; severity?: string; grade?: string; herb?: string; limit?: number; offset?: number } = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
    });
    const qs = sp.toString();
    return request<InteractionListResponse>(`/interactions${qs ? `?${qs}` : ""}`);
  },
  interaction: (code: string) => request<InteractionDetail>(`/interactions/${encodeURIComponent(code)}`),
  herbs: () => request<HerbOut[]>("/kb/herbs"),
  drugs: () => request<DrugOut[]>("/kb/drugs"),
  stats: () => request<KBStats>("/kb/stats"),

  analytics: (days = 30) => request<AnalyticsSummary>(`/analytics/summary?days=${days}`),

  // evidence curation (TinyFish) — offline from the verdict path
  curationStatus: () => request<CurationStatus>("/curation/status"),
  curationDrafts: (params: { status?: string; kind?: string; limit?: number } = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); });
    const qs = sp.toString();
    return request<DraftList>(`/curation/drafts${qs ? `?${qs}` : ""}`);
  },
  verifySources: (limit = 10) => request<VerifyResult>("/curation/verify-sources", json({ limit, only_unverified: true }), 600_000),
  discover: (herb: string, url?: string) => request<CurationDraft>("/curation/discover", json({ herb, url: url || undefined }), 660_000),
  mapProduct: (brand: string, url?: string) => request<CurationDraft>("/curation/map-product", json({ brand, url: url || undefined }), 660_000),
  reviewDraft: (id: number, approve: boolean, reviewer = "team", note?: string) =>
    request<CurationDraft>(`/curation/drafts/${id}/${approve ? "approve" : "reject"}`, json({ reviewer, note })),

  demoScenarios: () => request<DemoScenario[]>("/demo/scenarios"),
  demoScenario: (id: string) => request<DemoScenarioResolved>(`/demo/scenarios/${encodeURIComponent(id)}`),

  reportPdf: (result: EvaluateResponse) => requestBlob("/report/pdf", result),
  adr: (payload: ADRCreate) => request<ADRResponse>("/adr", json(payload)),
  adrPdf: (payload: ADRCreate) => requestBlob("/adr/pdf", payload),
  feedback: (payload: FeedbackCreate) => request<{ id: number; status: string }>("/feedback", json(payload)),
};

/** Trigger a browser download for a PDF blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
