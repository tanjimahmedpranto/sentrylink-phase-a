import { EvidenceItem, EvidenceStatus, DocType } from "./types";

export type ExpiryFilter = "all" | "expired" | "expiringSoon";

export type EvidenceFilters = {
  docType?: DocType;
  status?: EvidenceStatus;
  expiry?: ExpiryFilter;
  q?: string;
  now?: string;
};

const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

function isExpired(expiryDateIso: string, now: Date) {
  const expiry = new Date(expiryDateIso);
  return expiry.getTime() < now.getTime();
}

function isExpiringSoon(expiryDateIso: string, now: Date) {
  const expiry = new Date(expiryDateIso).getTime();
  const t = now.getTime();
  return expiry >= t && expiry <= t + DAYS_30_MS;
}

export function filterEvidence(items: EvidenceItem[], filters: EvidenceFilters) {
  const nowDate = filters.now ? new Date(filters.now) : new Date();
  const q = (filters.q ?? "").trim().toLowerCase();

  return items.filter((item) => {
    if (filters.docType && item.docType !== filters.docType) return false;
    if (filters.status && item.status !== filters.status) return false;

    const expiryMode = filters.expiry ?? "all";
    if (expiryMode === "expired" && !isExpired(item.expiryDate, nowDate))
      return false;
    if (
      expiryMode === "expiringSoon" &&
      !isExpiringSoon(item.expiryDate, nowDate)
    )
      return false;

    if (q) {
      const hay = `${item.docName} ${item.docType} ${item.status}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

