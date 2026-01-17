import { Suspense } from "react";
import EvidenceVaultClient from "./EvidenceVaultClient";

export default function EvidencePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading evidence vault...</div>}>
      <EvidenceVaultClient />
    </Suspense>
  );
}
