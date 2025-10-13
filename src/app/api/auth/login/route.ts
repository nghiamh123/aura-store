import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validators";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { username, password } = parsed.data;
    const admin = store.findAdmin(username);
    if (!admin || admin.passwordHash !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, user: { username } });
    res.cookies.set("adminAuth", "true", { httpOnly: false, path: "/", maxAge: 60 * 60 * 24 });
    res.cookies.set("adminUser", username, { httpOnly: false, path: "/", maxAge: 60 * 60 * 24 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
