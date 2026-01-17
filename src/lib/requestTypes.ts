import { DocType } from "./types";

export type RequestStatus = "open" | "fulfilled" | "overdue";

export type BuyerRequestItem = {
  id: string;
  docType: DocType;
  dueDate: string; // ISO date
  fulfilledEvidenceId?: string;
  fulfilledAt?: string; // ISO date
};
