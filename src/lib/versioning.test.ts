import { describe, expect, it } from "vitest";
import { nextVersionLabel } from "./versioning";

describe("nextVersionLabel", () => {
  it("returns v1 when empty", () => {
    expect(nextVersionLabel([] as any)).toBe("v1");
  });

  it("increments from existing", () => {
    const versions = [{ versionLabel: "v3" }, { versionLabel: "v1" }] as any;
    expect(nextVersionLabel(versions)).toBe("v4");
  });
});
