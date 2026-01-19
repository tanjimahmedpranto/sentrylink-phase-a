import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ evidenceId: string }> }
) {
  const role = req.headers.get("x-role");
  const orgId = req.headers.get("x-org-id");
  if (!role) return bad("Missing x-role header");
  if (!orgId) return bad("Missing x-org-id header");

  const { evidenceId } = await ctx.params;

  const evidence = serverStore.getEvidenceById(evidenceId);
  if (!evidence) return bad("Evidence not found", 404);

  if (role === "factory") {
    return NextResponse.json({ evidence });
  }

  if (role === "buyer") {
    const allowed = serverStore.buyerAllowedVersionIds(orgId);
    const versions = evidence.versions.filter((v) => allowed.has(v.id));

    if (versions.length === 0) {
      return bad("Forbidden: no shared versions for this buyer", 403);
    }

    return NextResponse.json({
      evidence: {
        ...evidence,
        versions,
      },
    });
  }

  return bad("Invalid role", 400);
}
