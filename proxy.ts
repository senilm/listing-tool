import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { dashboardRoute, loginRoute } from "@/lib/routes";
import { REDIRECT_PARAM, getSafeRedirectPath } from "@/lib/redirect";

const AUTH_ROUTES = ["/login", "/register"];

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

// Optimistic gate: checks only for the presence of the session cookie, never
// the database (this runs on every non-excluded request, including prefetches).
// Real session validation still happens server-side in the auth instance.
const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  const onAuthRoute = isAuthRoute(pathname);

  if (!hasSession && !onAuthRoute) {
    const loginUrl = new URL(loginRoute(), request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set(
        REDIRECT_PARAM,
        `${pathname}${request.nextUrl.search}`,
      );
    }
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && onAuthRoute) {
    const target =
      getSafeRedirectPath(request.nextUrl.searchParams.get(REDIRECT_PARAM)) ??
      dashboardRoute();
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
};

export default proxy;

// Skip Next internals, the auth/API routes, and static files.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
