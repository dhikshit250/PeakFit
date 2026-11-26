import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { POST_AUTH_DEFAULT, sanitizeRedirectUrl } from "@/lib/auth/safe-redirect";

const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/v1/health",
  "/api/webhooks(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

function withPathnameHeader(request: Request, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;
  const { userId } = await auth();

  if (isAuthRoute(request) && userId) {
    const requested = request.nextUrl.searchParams.get("redirect_url");
    const destination = sanitizeRedirectUrl(requested, POST_AUTH_DEFAULT);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isPublicRoute(request)) {
    return withPathnameHeader(request, pathname);
  }

  if (isApiRoute(request)) {
    if (!userId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      );
    }
    return withPathnameHeader(request, pathname);
  }

  await auth.protect();
  return withPathnameHeader(request, pathname);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};