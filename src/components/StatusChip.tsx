import { EvidenceStatus } from "@/lib/types";

const styles: Record<EvidenceStatus, string> = {
  valid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-200 text-gray-800",
};

const labels: Record<EvidenceStatus, string> = {
  valid: "Valid",
  pending: "Pending",
  rejected: "Rejected",
  expired: "Expired",
};

export function StatusChip({ status }: { status: EvidenceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
