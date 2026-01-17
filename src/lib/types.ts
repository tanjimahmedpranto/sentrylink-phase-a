export type DocType = "Insurance" | "License" | "Audit" | "Certification";

export type EvidenceStatus = "valid" | "pending" | "rejected" | "expired";

export type EvidenceVersion = {
  id: string;
  versionLabel: string; // v1, v2, v3
  uploadedAt: string; // ISO date
  uploader: string;
  notes: string;
  fileSizeBytes: number;
  expiryDate: string; // ISO date
};

export type EvidenceItem = {
  id: string;
  docName: string;
  docType: DocType;
  status: EvidenceStatus;
  expiryDate: string; // ISO date
  lastUpdated: string; // ISO date
  versions: EvidenceVersion[];
};
