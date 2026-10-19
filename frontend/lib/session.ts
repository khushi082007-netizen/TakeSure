/**
 * The check flow spans three pages (check -> review -> results). State is kept in sessionStorage so a
 * refresh does not lose the user's confirmed entities. Nothing here is sensitive: only canonical ids and
 * the KB-derived result. Uploaded images are never stored client-side.
 */
import type { Candidate, EvaluateResponse, ExtractResponse } from "@/types/api";

export const KEY_EXTRACT = "takesure.extract";
export const KEY_RESULT = "takesure.result";
export const KEY_CONFIRMED = "takesure.confirmed";

function safeGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled: flow still works within the page */
  }
}

export interface ReviewState {
  candidates: Candidate[];
  unrecognised: string[];
  extraction?: ExtractResponse | null;
  mode: "ocr" | "manual" | "demo";
  demoTitle?: string;
}

export const session = {
  setReview: (s: ReviewState) => safeSet(KEY_EXTRACT, s),
  getReview: () => safeGet<ReviewState>(KEY_EXTRACT),
  setConfirmed: (c: { drug_ids: number[]; herb_ids: number[]; unrecognised: string[]; names: { drugs: string[]; herbs: string[] } }) => safeSet(KEY_CONFIRMED, c),
  getConfirmed: () => safeGet<{ drug_ids: number[]; herb_ids: number[]; unrecognised: string[]; names: { drugs: string[]; herbs: string[] } }>(KEY_CONFIRMED),
  setResult: (r: EvaluateResponse) => safeSet(KEY_RESULT, r),
  getResult: () => safeGet<EvaluateResponse>(KEY_RESULT),
  clear: () => {
    if (typeof window === "undefined") return;
    [KEY_EXTRACT, KEY_RESULT, KEY_CONFIRMED].forEach((k) => window.sessionStorage.removeItem(k));
  },
};
