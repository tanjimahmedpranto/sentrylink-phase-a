"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { EvidenceItem, EvidenceVersion, DocType } from "@/lib/types";
import { mockEvidence } from "@/lib/mockEvidence";
import { nextVersionLabel } from "@/lib/versioning";
import { mockRequests } from "@/lib/mockRequests";
import { BuyerRequestItem } from "@/lib/requestTypes";

type CreateEvidenceInput = {
  docName: string;
  docType: DocType;
  expiryDate: string;
  notes: string;
};

type EvidenceContextValue = {
  evidence: EvidenceItem[];
  requests: BuyerRequestItem[];
  getById: (id: string) => EvidenceItem | undefined;

  addVersion: (
    evidenceId: string,
    input: Omit<EvidenceVersion, "id" | "versionLabel">,
  ) => void;

  createEvidence: (input: CreateEvidenceInput) => string; // returns new evidenceId
  fulfillRequest: (requestId: string, evidenceId: string) => void;
};

const EvidenceContext = createContext<EvidenceContextValue | null>(null);

export function EvidenceProvider({ children }: { children: React.ReactNode }) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(mockEvidence);
  const [requests, setRequests] = useState<BuyerRequestItem[]>(mockRequests);

  const value = useMemo<EvidenceContextValue>(() => {
    return {
      evidence,
      requests,
      getById: (id) => evidence.find((e) => e.id === id),
      addVersion: (evidenceId, input) => {
        setEvidence((prev) =>
          prev.map((item) => {
            if (item.id !== evidenceId) return item;

            const versionLabel = nextVersionLabel(item.versions);
            const newId = `${evidenceId}_${versionLabel}`;

            const newVersion: EvidenceVersion = {
              id: newId,
              versionLabel,
              uploadedAt: input.uploadedAt,
              uploader: input.uploader,
              notes: input.notes,
              fileSizeBytes: input.fileSizeBytes,
              expiryDate: input.expiryDate,
            };

            return {
              ...item,
              versions: [newVersion, ...item.versions],
              expiryDate: input.expiryDate,
              lastUpdated: input.uploadedAt,
              status: "pending",
            };
          }),
        );
      },

      createEvidence: (input) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? `ev_${crypto.randomUUID()}`
            : `ev_${Math.random().toString(16).slice(2)}`;

        const today = new Date().toISOString().slice(0, 10);

        const v1: EvidenceVersion = {
          id: `${id}_v1`,
          versionLabel: "v1",
          uploadedAt: today,
          uploader: "Factory User",
          notes: input.notes.trim(),
          fileSizeBytes: 250_000,
          expiryDate: input.expiryDate,
        };

        const newItem: EvidenceItem = {
          id,
          docName: input.docName.trim(),
          docType: input.docType,
          status: "pending",
          expiryDate: input.expiryDate,
          lastUpdated: today,
          versions: [v1],
        };

        setEvidence((prev) => [newItem, ...prev]);
        return id;
      },

      fulfillRequest: (requestId, evidenceId) => {
        const today = new Date().toISOString().slice(0, 10);
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, fulfilledEvidenceId: evidenceId, fulfilledAt: today }
              : r,
          ),
        );
      },
    };
  }, [evidence, requests]);

  return (
    <EvidenceContext.Provider value={value}>
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidenceStore() {
  const ctx = useContext(EvidenceContext);
  if (!ctx)
    throw new Error("useEvidenceStore must be used within EvidenceProvider");
  return ctx;
}
