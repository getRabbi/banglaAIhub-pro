import { ADMIN_SESSION_COOKIE, getAdminSecret, getAdminSessionToken } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Admin auth is not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.password !== secret) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, await getAdminSessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
