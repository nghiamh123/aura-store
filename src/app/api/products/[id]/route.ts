import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { productUpdateSchema } from "@/lib/validators";

function getIdFromUrl(req: Request): number {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const idStr = parts[parts.length - 1];
  return Number(idStr);
}

export async function GET(req: Request) {
  const id = getIdFromUrl(req);
  const product = store.getProduct(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request) {
  const id = getIdFromUrl(req);
  try {
    const json = await req.json();
    const parsed = productUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updated = store.updateProduct(id, parsed.data);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: updated });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const id = getIdFromUrl(req);
  const ok = store.deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
