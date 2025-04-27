"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import AuthLoading from "./auth-loading";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, user } = useAuthStore();
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const [isClient, setIsClient] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Store the original path to redirect back after login
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isAuthenticated &&
      pathname !== "/login"
    ) {
      sessionStorage.setItem("redirectAfterLogin", pathname);
    }
  }, [pathname, isAuthenticated]);

  useEffect(() => {
    setIsClient(true);

    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        // Add timeout to prevent indefinite hanging
        timeoutId = setTimeout(() => {
          setAuthTimeout(true);
          toast.error(
            "Authentication check timed out. Please try logging in again."
          );
          router.push("/login");
        }, 5000); // 5 seconds timeout

        // Check auth status
        const status = await checkAuthStatus();
        setAuthChecked(true);
        clearTimeout(timeoutId);

        if (!status) {
          console.log(
            `Protected route: not authenticated, redirecting from ${pathname} to /login`
          );
          // If not authenticated after checking, redirect to login
          toast.error("Please log in to access this page");
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearTimeout(timeoutId);
        setAuthTimeout(true);
        router.push("/login");
      }
    };

    checkAuth();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkAuthStatus, router, pathname]);

  // Show loading state while checking authentication
  if ((isLoading && !authTimeout) || !isClient || !authChecked) {
    return <AuthLoading />;
  }

  // Only render children if authenticated
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Return loading while redirecting
  return <AuthLoading />;
}
