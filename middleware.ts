import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSecret, getAdminSessionToken } from "@/lib/admin-auth";

const ADMIN_LOGIN_PATH = "/admin-login";

function isAdminApi(pathname: string) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

function isPublicAdminAuthPath(pathname: string) {
  return pathname === ADMIN_LOGIN_PATH || pathname === "/api/admin/login" || pathname === "/api/admin/logout";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicAdminAuthPath(pathname)) return NextResponse.next();

  const secret = getAdminSecret();
  if (!secret) {
    if (isAdminApi(pathname)) {
      return NextResponse.json({ error: "Admin auth is not configured" }, { status: 503 });
    }
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.searchParams.set("error", "missing-secret");
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const expectedToken = await getAdminSessionToken(secret);
  if (token === expectedToken) return NextResponse.next();

  if (isAdminApi(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = ADMIN_LOGIN_PATH;
  url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
