import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { DocType } from "@/lib/types";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-role");
  const buyerOrgId = req.headers.get("x-org-id");

  if (role !== "buyer") return bad("Only buyer can create requests", 403);
  if (!buyerOrgId) return bad("Missing x-org-id header", 400);

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const factoryOrgId = String(body.factoryOrgId ?? "");
  const items = Array.isArray(body.items) ? body.items : [];

  if (!factoryOrgId) return bad("factoryOrgId is required");
  if (items.length === 0) return bad("items must be a non-empty array");

  const normalized = items.map((it: any) => ({
    docType: it.docType as DocType,
    dueDate: String(it.dueDate ?? ""),
  }));

  for (const it of normalized) {
    if (!it.docType) return bad("Each item.docType is required");
    if (!it.dueDate) return bad("Each item.dueDate is required");
  }

  const created = serverStore.createRequest({
    buyerOrgId,
    factoryOrgId,
    items: normalized,
  });

  return NextResponse.json(
    {
      request: created,
    },
    { status: 201 }
  );
}
