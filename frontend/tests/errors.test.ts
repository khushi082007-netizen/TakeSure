import { describe, expect, it } from "vitest";
import { presentError } from "@/lib/errors";

describe("presentError", () => {
  it("offers manual entry for OCR failures", () => {
    const p = presentError({ code: "OCR_FAILED", message: "blurry", retryable: true });
    expect(p.offerManual).toBe(true);
    expect(p.retryable).toBe(true);
    expect(p.title).not.toMatch(/something went wrong/i);
  });
  it("never produces a bare generic message for known codes", () => {
    const codes = ["UNSUPPORTED_FILE", "FILE_TOO_LARGE", "UPLOAD_NOT_FOUND", "OCR_UNAVAILABLE", "NO_TEXT_DETECTED", "VALIDATION_FAILED", "RATE_LIMITED", "DATABASE_UNAVAILABLE", "PDF_GENERATION_FAILED", "NETWORK_ERROR", "TIMEOUT"] as const;
    for (const code of codes) {
      const p = presentError({ code, message: "x", retryable: false });
      expect(p.title.length).toBeGreaterThan(5);
      expect(p.suggestion ?? "").not.toBe("");
    }
  });
  it("falls back sensibly for unknown codes", () => {
    const p = presentError({ code: "INTERNAL_ERROR", message: "", retryable: true });
    expect(p.body.length).toBeGreaterThan(0);
  });
});
