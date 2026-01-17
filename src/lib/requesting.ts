import { RequestStatus } from "./requestTypes";

export function computeRequestStatus(
  dueDateIso: string,
  fulfilledAtIso?: string,
  now: Date = new Date(),
): RequestStatus {
  if (fulfilledAtIso) return "fulfilled";
  const due = new Date(dueDateIso).getTime();
  return due < now.getTime() ? "overdue" : "open";
}
