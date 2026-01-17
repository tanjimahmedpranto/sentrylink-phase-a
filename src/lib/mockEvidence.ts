import { EvidenceItem } from "./types";

export const mockEvidence: EvidenceItem[] = [
  {
    id: "ev_001",
    docName: "Factory Liability Insurance",
    docType: "Insurance",
    status: "valid",
    expiryDate: "2026-06-30",
    lastUpdated: "2026-01-05",
    versions: [
      {
        id: "ev_001_v3",
        versionLabel: "v3",
        uploadedAt: "2026-01-05",
        uploader: "Ayesha",
        notes: "Updated policy period and issuer details.",
        fileSizeBytes: 342_120,
        expiryDate: "2026-06-30",
      },
      {
        id: "ev_001_v2",
        versionLabel: "v2",
        uploadedAt: "2025-09-12",
        uploader: "Imran",
        notes: "Added missing endorsement page.",
        fileSizeBytes: 310_044,
        expiryDate: "2026-06-30",
      },
      {
        id: "ev_001_v1",
        versionLabel: "v1",
        uploadedAt: "2025-07-01",
        uploader: "Imran",
        notes: "Initial upload.",
        fileSizeBytes: 298_510,
        expiryDate: "2026-06-30",
      },
    ],
  },
  {
    id: "ev_002",
    docName: "Fire Safety License",
    docType: "License",
    status: "expired",
    expiryDate: "2025-12-15",
    lastUpdated: "2025-12-10",
    versions: [
      {
        id: "ev_002_v1",
        versionLabel: "v1",
        uploadedAt: "2025-12-10",
        uploader: "Rafi",
        notes: "License document uploaded, renewal pending.",
        fileSizeBytes: 210_880,
        expiryDate: "2025-12-15",
      },
    ],
  },
  {
    id: "ev_003",
    docName: "Third Party Audit Report",
    docType: "Audit",
    status: "pending",
    expiryDate: "2026-02-10",
    lastUpdated: "2026-01-02",
    versions: [
      {
        id: "ev_003_v1",
        versionLabel: "v1",
        uploadedAt: "2026-01-02",
        uploader: "Nabila",
        notes: "Submitted for buyer review.",
        fileSizeBytes: 1_240_100,
        expiryDate: "2026-02-10",
      },
    ],
  },
];
