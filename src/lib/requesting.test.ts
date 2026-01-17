import { describe, expect, it } from "vitest";
import { computeRequestStatus } from "./requesting";

describe("computeRequestStatus", () => {
  it("returns fulfilled when fulfilledAt exists", () => {
    expect(
      computeRequestStatus("2026-01-01", "2026-01-02", new Date("2026-01-10")),
    ).toBe("fulfilled");
  });

  it("returns overdue when dueDate is in the past", () => {
    expect(
      computeRequestStatus("2026-01-01", undefined, new Date("2026-01-10")),
    ).toBe("overdue");
  });

  it("returns open when dueDate is in the future", () => {
    expect(
      computeRequestStatus("2026-02-01", undefined, new Date("2026-01-10")),
    ).toBe("open");
  });
});
