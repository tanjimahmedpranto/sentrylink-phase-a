import { RequestStatus } from "@/lib/requestTypes";

const styles: Record<RequestStatus, string> = {
  open: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  fulfilled: "bg-green-100 text-green-800",
};

const labels: Record<RequestStatus, string> = {
  open: "Open",
  overdue: "Overdue",
  fulfilled: "Fulfilled",
};

export function RequestStatusChip({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
