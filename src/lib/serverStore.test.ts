import { describe, expect, it } from "vitest";
import { serverStore } from "./serverStore";

describe("serverStore request workflow", () => {
  it("buyer creates request and factory fulfills it", () => {
    const req = serverStore.createRequest({
      buyerOrgId: "buyer_org_test",
      factoryOrgId: "factory_org_test",
      items: [{ docType: "Insurance", dueDate: "2026-02-01" }],
    });

    expect(req.items).toHaveLength(1);

    const fulfill = serverStore.fulfillRequestItem({
      requestId: req.id,
      itemId: req.items[0].id,
      factoryOrgId: "factory_org_test",
      evidenceId: "ev_001",
      versionId: "ev_001_v1",
    });

    expect(fulfill.ok).toBe(true);
    if (fulfill.ok) {
      const allowed = serverStore.buyerAllowedVersionIds("buyer_org_test");
      expect(allowed.has("ev_001_v1")).toBe(true);
    }
  });
});
