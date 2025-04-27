import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Define routes that are always accessible regardless of auth state
const alwaysAccessibleRoutes = [
  "/",
  "/api/generate-itinerary",
  "/api/process-voice",
  "/api/search-images",
  "/api/validate",
  "/api/init-appwrite",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Skip middleware for non-page routes (static files, etc.)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Check if the route is public or always accessible
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAlwaysAccessible = alwaysAccessibleRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/")
  );

  // Get the authentication state from cookie
  const authStore = request.cookies.get("auth-storage")?.value;
  let isAuthenticated = false;
  let userId = "";

  if (authStore) {
    try {
      const parsedAuthStore = JSON.parse(decodeURIComponent(authStore));
      isAuthenticated =
        parsedAuthStore.state &&
        parsedAuthStore.state.isAuthenticated === true &&
        parsedAuthStore.state.user &&
        parsedAuthStore.state.user.$id;

      // Extract userId for profile redirection
      userId = parsedAuthStore.state?.user?.$id || "";
    } catch (e) {
      console.error("Error parsing auth store:", e);
    }
  }

  // If trying to access a public route while authenticated, redirect to home
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If trying to access a protected route while not authenticated, redirect to login with return URL
  if (!isPublicRoute && !isAlwaysAccessible && !isAuthenticated) {
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Special handling for /profile path - redirect to user's profile page
  if (pathname === "/profile" && isAuthenticated && userId) {
    return NextResponse.redirect(new URL(`/user/${userId}`, request.url));
  }

  return NextResponse.next();
}

// Define matcher to specify which routes the middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
