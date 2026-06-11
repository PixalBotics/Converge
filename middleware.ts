import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH } from "@/lib/auth/auth-cookie-names";
import { AUTH_PATHS } from "@/lib/auth/auth-paths";

function hasSessionCookie(request: NextRequest): boolean {
  const access = request.cookies.get(AUTH_COOKIE_ACCESS)?.value?.trim();
  const refresh = request.cookies.get(AUTH_COOKIE_REFRESH)?.value?.trim();
  return Boolean(access) || Boolean(refresh);
}

export function middleware(request: NextRequest) {
  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }
  const login = new URL(AUTH_PATHS.login, request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  login.searchParams.set("next", returnTo);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
