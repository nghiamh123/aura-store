import { NextResponse } from "next/server";
import { store } from "@/lib/store";

function requireUserId(url: URL) {
  return url.searchParams.get("userId") || "demo-user";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const orders = store.listOrders(userId);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const body = await request.json();
  const { items } = body as { items: Array<{ productId: number; quantity: number }>; };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }
  const orderItems = items.map((it) => {
    const p = store.getProduct(it.productId);
    if (!p) throw new Error("Product not found");
    return { productId: p.id, quantity: it.quantity, price: p.price };
  });
  const order = store.createOrder(userId, orderItems);
  return NextResponse.json({ order }, { status: 201 });
}
