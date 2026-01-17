import { describe, expect, it } from "vitest";
import { filterEvidence } from "./evidenceFilters";
import { mockEvidence } from "./mockEvidence";

describe("filterEvidence", () => {
  it("filters by docType", () => {
const out = filterEvidence(
  mockEvidence,
  { docType: "License", now: "2026-01-11" }
);

    expect(out.every((x) => x.docType === "License")).toBe(true);
  });

  it("filters expired using now", () => {
const out = filterEvidence(
  mockEvidence,
  { expiry: "expired", now: "2026-01-11" }
);

    expect(out.length).toBe(1);
    expect(out[0].id).toBe("ev_002");
  });
});
