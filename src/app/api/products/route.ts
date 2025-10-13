import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { productCreateSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ products: store.listProducts() });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = productCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = store.createProduct(parsed.data);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
