import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ requestId: string; itemId: string }> }
) {
  const role = req.headers.get("x-role");
  const factoryOrgId = req.headers.get("x-org-id");

  if (role !== "factory") return bad("Only factory can fulfill", 403);
  if (!factoryOrgId) return bad("Missing x-org-id header", 400);

  const raw = await req.text();
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad("Invalid JSON");
  }

  const evidenceId = String(body.evidenceId ?? "");
  const versionId = String(body.versionId ?? "");
  if (!evidenceId) return bad("evidenceId is required");
  if (!versionId) return bad("versionId is required");

  const { requestId, itemId } = await ctx.params;

  const result = serverStore.fulfillRequestItem({
    requestId,
    itemId,
    factoryOrgId,
    evidenceId,
    versionId,
  });

  if (!result.ok) {
    const map: Record<string, number> = {
      not_found: 404,
      item_not_found: 404,
      evidence_not_found: 404,
      version_not_found: 404,
      forbidden_factory: 403,
    };
    return bad(result.error, map[result.error] ?? 400);
  }

  return NextResponse.json({
    request: result.request,
    item: result.item,
    sharedVersionId: result.item.fulfilledVersionId,
  });
}
