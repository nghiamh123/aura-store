import { NextResponse } from "next/server";
import { store } from "@/lib/store";

function requireUserId(url: URL) {
  const userId = url.searchParams.get("userId") || "demo-user";
  return userId;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const cart = store.getCart(userId);
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const body = await request.json();
  const { productId, quantity } = body as { productId: number; quantity?: number };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const q = Math.max(1, quantity ?? 1);

  const cart = store.getCart(userId);
  const existing = cart.items.find((it) => it.productId === productId);
  if (existing) existing.quantity += q; else cart.items.push({ productId, quantity: q });
  store.setCart(userId, cart);
  return NextResponse.json({ cart });
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const body = await request.json();
  const { productId, quantity } = body as { productId: number; quantity: number };
  if (!productId || typeof quantity !== "number") return NextResponse.json({ error: "productId and quantity required" }, { status: 400 });

  const cart = store.getCart(userId);
  const existing = cart.items.find((it) => it.productId === productId);
  if (!existing) return NextResponse.json({ error: "Item not in cart" }, { status: 404 });
  if (quantity <= 0) cart.items = cart.items.filter((it) => it.productId !== productId);
  else existing.quantity = quantity;
  store.setCart(userId, cart);
  return NextResponse.json({ cart });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const productId = Number(url.searchParams.get("productId"));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const cart = store.getCart(userId);
  cart.items = cart.items.filter((it) => it.productId !== productId);
  store.setCart(userId, cart);
  return NextResponse.json({ cart });
}
