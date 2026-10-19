import { describe, expect, it } from "vitest";
import { formatTimingGap, humanClass, sourceLink, USP, VERDICT_META } from "@/lib/verdict";

describe("verdict presentation", () => {
  it("every verdict has a text label and glyph (not colour-only)", () => {
    for (const v of ["GREEN", "AMBER", "RED", "GREY"] as const) {
      expect(VERDICT_META[v].label).toBeTruthy();
      expect(VERDICT_META[v].labelHi).toBeTruthy();
      expect(VERDICT_META[v].glyph).toBeTruthy();
    }
    expect(VERDICT_META.GREY.label).toMatch(/not in database/i);
  });
  it("USP text is the agreed sentence", () => {
    expect(USP).toBe("Verdict from published data; AI only explains.");
  });
  it("formats timing gaps from KB hours only", () => {
    expect(formatTimingGap(null)).toBeNull();
    expect(formatTimingGap(undefined)).toBeNull();
    expect(formatTimingGap(1)).toBe("1 hour");
    expect(formatTimingGap(4)).toBe("4 hours");
    expect(formatTimingGap(2.5)).toBe("2.5 hours");
  });
  it("prefers DOI, then PMID, then URL for source links", () => {
    expect(sourceLink({ doi: "10.1/x", pmid: "1", url: "https://e" })).toBe("https://doi.org/10.1/x");
    expect(sourceLink({ pmid: "123" })).toBe("https://pubmed.ncbi.nlm.nih.gov/123/");
    expect(sourceLink({ url: "https://e" })).toBe("https://e");
    expect(sourceLink({})).toBeNull();
  });
  it("humanises class names and the wildcard", () => {
    expect(humanClass("thyroid_hormone")).toBe("thyroid hormone");
    expect(humanClass("*")).toBe("any oral medicine");
  });
});
