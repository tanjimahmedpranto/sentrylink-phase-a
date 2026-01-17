"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEvidenceStore } from "@/app/providers";
import { filterEvidence } from "@/lib/evidenceFilters";
import type { EvidenceStatus, DocType, EvidenceItem } from "@/lib/types";

import { DataTable, type Column } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";

type ExpiryFilter = "all" | "expired" | "expiringSoon";
type StatusFilter = "all" | EvidenceStatus;
type DocTypeFilter = "all" | DocType;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toDocType(v: string | null): DocTypeFilter {
  if (
    v === "Insurance" ||
    v === "License" ||
    v === "Audit" ||
    v === "Certification"
  )
    return v;
  return "all";
}

function toStatus(v: string | null): StatusFilter {
  if (v === "valid" || v === "pending" || v === "rejected" || v === "expired")
    return v;
  return "all";
}

function toExpiry(v: string | null): ExpiryFilter {
  if (v === "expired" || v === "expiringSoon") return v;
  return "all";
}

export default function EvidenceVaultClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const { evidence } = useEvidenceStore();

  const docType = toDocType(sp.get("docType"));
  const status = toStatus(sp.get("status"));
  const expiry = toExpiry(sp.get("expiry"));
  const q = sp.get("q") ?? "";

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState(q);

  useEffect(() => {
    setSearchText(q);
  }, [q]);

  const updateUrl = (
    patch: Partial<{
      docType: DocTypeFilter;
      status: StatusFilter;
      expiry: ExpiryFilter;
      q: string;
    }>
  ) => {
    const params = new URLSearchParams(sp.toString());

    const setOrDelete = (key: string, value: string | undefined) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    };

    if ("docType" in patch) setOrDelete("docType", patch.docType);
    if ("status" in patch) setOrDelete("status", patch.status);
    if ("expiry" in patch) setOrDelete("expiry", patch.expiry);
    if ("q" in patch) setOrDelete("q", patch.q?.trim() ? patch.q : undefined);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearFilters = () => {
    router.replace(pathname);
  };

  const rows = useMemo(() => {
    return filterEvidence(evidence, {
      docType: docType === "all" ? undefined : docType,
      status: status === "all" ? undefined : status,
      expiry: expiry === "all" ? "all" : expiry,
      q,
      now: todayIso(),
    });
  }, [evidence, docType, status, expiry, q]);

  useEffect(() => {
    setSelectedIds(
      (prev) => new Set([...prev].filter((id) => rows.some((r) => r.id === id)))
    );
  }, [rows]);

  const onToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onToggleAll = () => {
    setSelectedIds((prev) => {
      const allIds = rows.map((r) => r.id);
      const allSelected =
        allIds.length > 0 && allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  };

  const columns: Column<EvidenceItem>[] = [
    { key: "docName", header: "Doc Name", cell: (r) => r.docName },
    { key: "docType", header: "Doc Type", cell: (r) => r.docType },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusChip status={r.status} />,
    },
    {
      key: "expiryDate",
      header: "Expiry",
      cell: (r) => new Date(r.expiryDate).toLocaleDateString(),
    },
    { key: "versions", header: "Versions", cell: (r) => r.versions.length },
    {
      key: "lastUpdated",
      header: "Last Updated",
      cell: (r) => new Date(r.lastUpdated).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <Link
          className="text-blue-600 hover:underline"
          href={`/evidence/${r.id}`}
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Evidence Vault</h1>
          <p className="text-sm text-gray-600">
            Mock data, local state, URL backed filters.
          </p>
        </div>

        <button
          type="button"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          onClick={() => alert(`Add to Pack: ${selectedIds.size} selected`)}
          disabled={selectedIds.size === 0}
        >
          Add to Pack ({selectedIds.size})
        </button>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Doc Type
          </label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={docType}
            onChange={(e) => updateUrl({ docType: toDocType(e.target.value) })}
          >
            <option value="all">All</option>
            <option value="Insurance">Insurance</option>
            <option value="License">License</option>
            <option value="Audit">Audit</option>
            <option value="Certification">Certification</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Status
          </label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={status}
            onChange={(e) => updateUrl({ status: toStatus(e.target.value) })}
          >
            <option value="all">All</option>
            <option value="valid">Valid</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Expiry
          </label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={expiry}
            onChange={(e) => updateUrl({ expiry: toExpiry(e.target.value) })}
          >
            <option value="all">All</option>
            <option value="expired">Expired</option>
            <option value="expiringSoon">Expiring soon</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Search
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Name, type, status"
            value={searchText}
            onChange={(e) => {
              const v = e.target.value;
              setSearchText(v);
              updateUrl({ q: v });
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        selectedIds={selectedIds}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
      />
    </main>
  );
}
