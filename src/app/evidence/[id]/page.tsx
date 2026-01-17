"use client";

import Link from "next/link";
import { useState } from "react";
import { useEvidenceStore } from "@/app/providers";
import { StatusChip } from "@/components/StatusChip";
import { Modal } from "@/components/Modal";
import { useParams } from "next/navigation";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function EvidenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getById, addVersion } = useEvidenceStore();
  const item = getById(id);

  const [isOpen, setIsOpen] = useState(false);

  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ notes?: string; expiryDate?: string }>(
    {},
  );

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Evidence not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The requested evidence id does not exist.
        </p>
        <Link
          className="mt-4 inline-block text-blue-600 hover:underline"
          href="/evidence"
        >
          Back to Evidence Vault
        </Link>
      </main>
    );
  }

  const onSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!notes.trim()) nextErrors.notes = "Notes are required.";
    if (!expiryDate) nextErrors.expiryDate = "Expiry date is required.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const uploadedAt = new Date().toISOString().slice(0, 10);
    const fakeSize = file ? file.size : 250_000;

    addVersion(item.id, {
      uploadedAt,
      uploader: "Factory User",
      notes: notes.trim(),
      fileSizeBytes: fakeSize,
      expiryDate,
    });

    setIsOpen(false);
    setNotes("");
    setExpiryDate("");
    setFile(null);
    setErrors({});
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link className="text-blue-600 hover:underline" href="/evidence">
          Back
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{item.docName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <div>
              <span className="font-medium">Doc Type:</span> {item.docType}
            </div>
            <div>
              <span className="font-medium">Expiry:</span>{" "}
              {formatDate(item.expiryDate)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {formatDate(item.lastUpdated)}
            </div>
            <StatusChip status={item.status} />
          </div>
        </div>

        <button
          type="button"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          onClick={() => setIsOpen(true)}
        >
          Upload New Version
        </button>
      </div>

      <section className="rounded-lg border">
        <div className="border-b bg-gray-50 p-4">
          <h2 className="text-lg font-semibold">Versions</h2>
          <p className="text-sm text-gray-600">Latest first</p>
        </div>

        <div className="divide-y">
          {item.versions.map((v) => (
            <div key={v.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{v.versionLabel}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(v.uploadedAt)} | {v.uploader} |{" "}
                  {formatBytes(v.fileSizeBytes)}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-800">{v.notes}</div>
              <div className="mt-2 text-xs text-gray-600">
                Expiry: {formatDate(v.expiryDate)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal
        title="Upload New Version"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Notes
            </label>
            <textarea
              className="w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {errors.notes ? (
              <p className="mt-1 text-xs text-red-600">{errors.notes}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Expiry date
            </label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            {errors.expiryDate ? (
              <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              File (optional)
            </label>
            <input
              type="file"
              className="w-full rounded-md border px-3 py-2 text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-gray-600">
              File is optional. If omitted, we use a fake file size.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={onSubmit}
            >
              Upload
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
