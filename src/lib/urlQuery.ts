import { EvidenceFilters, ExpiryFilter } from "./evidenceFilters";
import { EvidenceStatus, DocType } from "./types";

const DOC_TYPES: DocType[] = ["Insurance", "License", "Audit", "Certification"];
const STATUSES: EvidenceStatus[] = ["valid", "pending", "rejected", "expired"];
const EXPIRY: ExpiryFilter[] = ["all", "expired", "expiringSoon"];

function pickDocType(v: string | null): DocType | undefined {
  if (!v) return undefined;
  return (DOC_TYPES as string[]).includes(v) ? (v as DocType) : undefined;
}
function pickStatus(v: string | null): EvidenceStatus | undefined {
  if (!v) return undefined;
  return (STATUSES as string[]).includes(v) ? (v as EvidenceStatus) : undefined;
}
function pickExpiry(v: string | null): ExpiryFilter | undefined {
  if (!v) return undefined;
  return (EXPIRY as string[]).includes(v) ? (v as ExpiryFilter) : undefined;
}

export function filtersFromSearchParams(sp: URLSearchParams): EvidenceFilters {
  const q = sp.get("q") ?? "";
  return {
    docType: pickDocType(sp.get("docType")),
    status: pickStatus(sp.get("status")),
    expiry: pickExpiry(sp.get("expiry")) ?? "all",
    q: q || undefined,
  };
}

export function withUpdatedFilter(
  current: URLSearchParams,
  patch: Partial<EvidenceFilters>,
) {
  const next = new URLSearchParams(current);

  const setOrDelete = (key: string, value: string | undefined) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  };

  if ("docType" in patch) setOrDelete("docType", patch.docType);
  if ("status" in patch) setOrDelete("status", patch.status);
  if ("expiry" in patch) setOrDelete("expiry", patch.expiry);
  if ("q" in patch) setOrDelete("q", patch.q?.trim() ? patch.q : undefined);

  return next;
}
