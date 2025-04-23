import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define routes that don't need authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Define routes that are always accessible
const alwaysAccessibleRoutes = [
  "/",
  "/api/generate-itinerary",
  "/api/process-voice",
  "/api/search-images",
  "/api/validate",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public or always accessible
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAlwaysAccessible = alwaysAccessibleRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );

  // Get the authentication session
  const authSession = request.cookies.get("appwrite-session")?.value;
  const isAuthenticated = !!authSession;

  // If route is public and user is authenticated, redirect to home page
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If route requires authentication and user is not authenticated, redirect to login page
  if (!isPublicRoute && !isAlwaysAccessible && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Configure matcher for the middleware
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * 1. /api/auth routes (NextAuth.js)
     * 2. /_next (Next.js internals)
     * 3. /fonts, /icons, /images (static files)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (SEO files)
     */
    "/((?!_next/static|_next/image|fonts/|icons/|images/|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
