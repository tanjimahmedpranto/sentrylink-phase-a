import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ requestId: string }> }
) {
  const role = req.headers.get("x-role");
  const orgId = req.headers.get("x-org-id");
  if (!role) return bad("Missing x-role header");
  if (!orgId) return bad("Missing x-org-id header");

  const { requestId } = await ctx.params;

  const found = serverStore.getRequestById(requestId);
  if (!found) return bad("Request not found", 404);

  if (role === "buyer" && found.buyerOrgId !== orgId) return bad("Forbidden", 403);
  if (role === "factory" && found.factoryOrgId !== orgId) return bad("Forbidden", 403);

  return NextResponse.json({ request: found });
}
