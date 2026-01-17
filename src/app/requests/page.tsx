"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useEvidenceStore } from "@/app/providers";
import { DataTable, Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { RequestStatusChip } from "@/components/RequestStatusChip";

import { computeRequestStatus } from "@/lib/requesting";
import { BuyerRequestItem } from "@/lib/requestTypes";
import { DocType, EvidenceItem } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

type FulfillMode = "existing" | "new";

export default function BuyerRequestsPage() {
  const { evidence, requests, fulfillRequest, createEvidence } =
    useEvidenceStore();

  const rows = useMemo(() => {
    const now = new Date();
    return requests.map((r) => ({
      ...r,
      status: computeRequestStatus(r.dueDate, r.fulfilledAt, now),
    }));
  }, [requests]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<
    (BuyerRequestItem & { status: string }) | null
  >(null);

  const [mode, setMode] = useState<FulfillMode>("existing");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>("");

  const [newDocName, setNewDocName] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [errors, setErrors] = useState<{
    docName?: string;
    expiry?: string;
    notes?: string;
    evidenceId?: string;
  }>({});

  const openFulfill = (r: any) => {
    setActive(r);
    setMode("existing");
    setSelectedEvidenceId("");
    setNewDocName("");
    setNewExpiry("");
    setNewNotes("");
    setErrors({});
    setOpen(true);
  };

  const evidenceOptions = useMemo(() => {
    if (!active) return [];
    return evidence.filter((e) => e.docType === active.docType);
  }, [evidence, active]);

  const onConfirm = () => {
    if (!active) return;

    if (mode === "existing") {
      if (!selectedEvidenceId) {
        setErrors({ evidenceId: "Choose an evidence item." });
        return;
      }
      fulfillRequest(active.id, selectedEvidenceId);
      setOpen(false);
      return;
    }

    const nextErrors: typeof errors = {};
    if (!newDocName.trim()) nextErrors.docName = "Doc name is required.";
    if (!newExpiry) nextErrors.expiry = "Expiry date is required.";
    if (!newNotes.trim()) nextErrors.notes = "Notes are required.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const newId = createEvidence({
      docName: newDocName,
      docType: active.docType as DocType,
      expiryDate: newExpiry,
      notes: newNotes,
    });

    fulfillRequest(active.id, newId);
    setOpen(false);
  };

  const columns: Column<any>[] = [
    { key: "docType", header: "Doc Type", cell: (r) => r.docType },
    { key: "dueDate", header: "Due Date", cell: (r) => formatDate(r.dueDate) },
    {
      key: "status",
      header: "Status",
      cell: (r) => <RequestStatusChip status={r.status} />,
    },
    {
      key: "linked",
      header: "Linked Evidence",
      cell: (r) =>
        r.fulfilledEvidenceId ? (
          <Link
            className="text-blue-600 hover:underline"
            href={`/evidence/${r.fulfilledEvidenceId}`}
          >
            View evidence
          </Link>
        ) : (
          <span className="text-gray-500">None</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) =>
        r.fulfilledAt ? (
          <span className="text-gray-600">Completed</span>
        ) : (
          <button
            type="button"
            className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white"
            onClick={() => openFulfill(r)}
          >
            Fulfill
          </button>
        ),
    },
  ];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Buyer Request To Do</h1>
          <p className="text-sm text-gray-600">
            Fulfill requests using existing evidence or create new.
          </p>
        </div>
        <Link className="text-blue-600 hover:underline" href="/evidence">
          Go to Evidence Vault
        </Link>
      </div>

      <DataTable rows={rows as any} columns={columns} selectable={false} />

      <Modal
        title="Fulfill Request"
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        {!active ? null : (
          <div className="space-y-4">
            <div className="rounded-md border bg-gray-50 p-3 text-sm">
              <div>
                <span className="font-medium">Doc Type:</span> {active.docType}
              </div>
              <div>
                <span className="font-medium">Due Date:</span>{" "}
                {formatDate(active.dueDate)}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "existing"}
                  onChange={() => {
                    setMode("existing");
                    setErrors({});
                  }}
                />
                Use existing evidence
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "new"}
                  onChange={() => {
                    setMode("new");
                    setErrors({});
                  }}
                />
                Create new evidence
              </label>
            </div>

            {mode === "existing" ? (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Choose evidence
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={selectedEvidenceId}
                  onChange={(e) => {
                    setSelectedEvidenceId(e.target.value);
                    setErrors({});
                  }}
                >
                  <option value="">Select</option>
                  {evidenceOptions.map((e: EvidenceItem) => (
                    <option key={e.id} value={e.id}>
                      {e.docName} ({e.status})
                    </option>
                  ))}
                </select>
                {evidenceOptions.length === 0 ? (
                  <p className="text-xs text-gray-600">
                    No evidence found for this doc type. Choose Create new
                    evidence.
                  </p>
                ) : null}
                {errors.evidenceId ? (
                  <p className="text-xs text-red-600">{errors.evidenceId}</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Doc name
                  </label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder={`New ${active.docType} evidence`}
                  />
                  {errors.docName ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.docName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                  />
                  {errors.expiry ? (
                    <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="What is included in this evidence?"
                  />
                  {errors.notes ? (
                    <p className="mt-1 text-xs text-red-600">{errors.notes}</p>
                  ) : null}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                onClick={onConfirm}
              >
                Mark fulfilled
              </button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
