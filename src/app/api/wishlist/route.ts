import { NextResponse } from "next/server";
import { store } from "@/lib/store";

function requireUserId(url: URL) {
  const userId = url.searchParams.get("userId") || "demo-user";
  return userId;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const wl = store.getWishlist(userId);
  return NextResponse.json({ wishlist: wl });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const body = await request.json();
  const { productId } = body as { productId: number };
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const wl = store.getWishlist(userId);
  if (!wl.productIds.includes(productId)) wl.productIds.push(productId);
  store.setWishlist(userId, wl);
  return NextResponse.json({ wishlist: wl });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const userId = requireUserId(url);
  const productId = Number(url.searchParams.get("productId"));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const wl = store.getWishlist(userId);
  wl.productIds = wl.productIds.filter((id) => id !== productId);
  store.setWishlist(userId, wl);
  return NextResponse.json({ wishlist: wl });
}
