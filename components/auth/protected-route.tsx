"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import AuthLoading from "./auth-loading";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

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
