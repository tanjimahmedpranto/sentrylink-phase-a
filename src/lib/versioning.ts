import { EvidenceVersion } from "./types";

export function nextVersionLabel(versions: EvidenceVersion[]) {
  const nums = versions
    .map((v) => Number(v.versionLabel.replace("v", "")))
    .filter((n) => Number.isFinite(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `v${max + 1}`;
}
