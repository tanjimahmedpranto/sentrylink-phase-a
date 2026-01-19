import { DocType, EvidenceItem, EvidenceVersion } from "@/lib/types";

export type Role = "buyer" | "factory";

export type BuyerRequestItem = {
  id: string;
  docType: DocType;
  dueDate: string;
  fulfilledAt?: string;
  fulfilledEvidenceId?: string;
  fulfilledVersionId?: string;
};

export type BuyerRequest = {
  id: string;
  buyerOrgId: string;
  factoryOrgId: string;
  createdAt: string;
  items: BuyerRequestItem[];
};

type StoreState = {
  evidence: EvidenceItem[];
  requests: BuyerRequest[];
  allowedVersionIdsByBuyerOrg: Record<string, Set<string>>;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : Math.random().toString(16).slice(2);
  return `${prefix}_${id}`;
}

const seedEvidence: EvidenceItem[] = [
  {
    id: "ev_001",
    docName: "Factory Insurance Certificate",
    docType: "Insurance",
    status: "valid",
    expiryDate: "2026-12-01",
    lastUpdated: "2026-01-01",
    versions: [
      {
        id: "ev_001_v1",
        versionLabel: "v1",
        uploadedAt: "2026-01-01",
        uploader: "Factory User",
        notes: "Initial upload",
        fileSizeBytes: 250_000,
        expiryDate: "2026-12-01",
      },
    ],
  },
  {
    id: "ev_002",
    docName: "Business License",
    docType: "License",
    status: "pending",
    expiryDate: "2026-06-15",
    lastUpdated: "2026-01-02",
    versions: [
      {
        id: "ev_002_v1",
        versionLabel: "v1",
        uploadedAt: "2026-01-02",
        uploader: "Factory User",
        notes: "Submitted for review",
        fileSizeBytes: 180_000,
        expiryDate: "2026-06-15",
      },
    ],
  },
];

const state: StoreState = {
  evidence: seedEvidence,
  requests: [],
  allowedVersionIdsByBuyerOrg: {},
};

export const serverStore = {
  getEvidence() {
    return state.evidence;
  },

  getEvidenceById(evidenceId: string) {
    return state.evidence.find((e) => e.id === evidenceId);
  },

  getVersionById(evidence: EvidenceItem, versionId: string) {
    return evidence.versions.find((v) => v.id === versionId);
  },

  createRequest(input: {
    buyerOrgId: string;
    factoryOrgId: string;
    items: Array<{ docType: DocType; dueDate: string }>;
  }): BuyerRequest {
    const req: BuyerRequest = {
      id: makeId("req"),
      buyerOrgId: input.buyerOrgId,
      factoryOrgId: input.factoryOrgId,
      createdAt: todayIso(),
      items: input.items.map((it) => ({
        id: makeId("item"),
        docType: it.docType,
        dueDate: it.dueDate,
      })),
    };
    state.requests.unshift(req);
    return req;
  },

  getRequestById(requestId: string) {
    return state.requests.find((r) => r.id === requestId);
  },

  fulfillRequestItem(input: {
    requestId: string;
    itemId: string;
    factoryOrgId: string;
    evidenceId: string;
    versionId: string;
  }) {
    const req = this.getRequestById(input.requestId);
    if (!req) return { ok: false as const, error: "not_found" as const };

    if (req.factoryOrgId !== input.factoryOrgId) {
      return { ok: false as const, error: "forbidden_factory" as const };
    }

    const item = req.items.find((i) => i.id === input.itemId);
    if (!item) return { ok: false as const, error: "item_not_found" as const };

    const evidence = this.getEvidenceById(input.evidenceId);
    if (!evidence) return { ok: false as const, error: "evidence_not_found" as const };

    const version = this.getVersionById(evidence, input.versionId);
    if (!version) return { ok: false as const, error: "version_not_found" as const };

    item.fulfilledAt = todayIso();
    item.fulfilledEvidenceId = evidence.id;
    item.fulfilledVersionId = version.id;

    if (!state.allowedVersionIdsByBuyerOrg[req.buyerOrgId]) {
      state.allowedVersionIdsByBuyerOrg[req.buyerOrgId] = new Set();
    }
    state.allowedVersionIdsByBuyerOrg[req.buyerOrgId].add(version.id);

    return { ok: true as const, request: req, item };
  },

  buyerAllowedVersionIds(buyerOrgId: string) {
    return state.allowedVersionIdsByBuyerOrg[buyerOrgId] ?? new Set<string>();
  },
};
