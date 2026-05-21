import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

function clearSession(res: NextResponse) {
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export function GET(req: NextRequest) {
  return clearSession(NextResponse.redirect(new URL("/admin-login", req.url)));
}

export function POST() {
  return clearSession(NextResponse.json({ ok: true }));
}
