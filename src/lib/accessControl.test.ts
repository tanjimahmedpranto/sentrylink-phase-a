import { describe, expect, it } from "vitest";
import { serverStore } from "./serverStore";

describe("selective disclosure: buyer can only access shared versions", () => {
  it("buyer has no allowed versions before fulfill", () => {
    const allowed = serverStore.buyerAllowedVersionIds("buyer_org_no_share");
    expect(allowed.size).toBe(0);
  });

  it("fulfill shares a version for the buyer org", () => {
    const buyerOrgId = "buyer_org_share_test";

    const req = serverStore.createRequest({
      buyerOrgId,
      factoryOrgId: "factory_org_1",
      items: [{ docType: "Insurance", dueDate: "2026-02-01" }],
    });

    const res = serverStore.fulfillRequestItem({
      requestId: req.id,
      itemId: req.items[0].id,
      factoryOrgId: "factory_org_1",
      evidenceId: "ev_001",
      versionId: "ev_001_v1",
    });

    expect(res.ok).toBe(true);

    const allowed = serverStore.buyerAllowedVersionIds(buyerOrgId);
    expect(allowed.has("ev_001_v1")).toBe(true);
  });
});
