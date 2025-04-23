"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import AuthLoading from "./auth-loading";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Check auth status when component mounts
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    // Only redirect after we confirm it's client-side and authentication is checked
    if (isClient && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isClient, isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || !isClient) {
    return <AuthLoading />;
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // This will briefly show before the redirect happens
  return <AuthLoading />;
}
