import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiClientError, toApiError } from "@/lib/api";

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("api client error normalisation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("maps the backend error envelope to ApiClientError", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(415, { error: { code: "UNSUPPORTED_FILE", message: "Only images", detail: null, retryable: false } })));
    await expect(api.health()).rejects.toMatchObject({ code: "UNSUPPORTED_FILE", message: "Only images", status: 415 });
  });

  it("maps FastAPI 422 bodies to VALIDATION_FAILED", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(422, { detail: [{ loc: ["body", "x"], msg: "required" }] })));
    await expect(api.evaluate({ drug_ids: [], herb_ids: [], unrecognised: [], language: "en" })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("maps network failures to NETWORK_ERROR (retryable)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    const e = await api.stats().catch((x) => x);
    expect(e).toBeInstanceOf(ApiClientError);
    expect(e.code).toBe("NETWORK_ERROR");
    expect(e.retryable).toBe(true);
  });

  it("passes through already-normalised errors", () => {
    const e = new ApiClientError({ code: "TIMEOUT", message: "slow", retryable: true });
    expect(toApiError(e)).toBe(e);
  });

  it("builds interaction query strings without empty params", async () => {
    const f = vi.fn(async () => jsonResponse(200, { total: 0, kb_version: "1.0.0", items: [] }));
    vi.stubGlobal("fetch", f);
    await api.interactions({ q: "", severity: "major", limit: 10 });
    const url = String((f.mock.calls[0] as unknown[])[0]);
    expect(url).toContain("severity=major");
    expect(url).toContain("limit=10");
    expect(url).not.toContain("q=");
  });
});
