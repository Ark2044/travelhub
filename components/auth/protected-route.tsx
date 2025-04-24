"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import AuthLoading from "./auth-loading";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthStore();
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const [isClient, setIsClient] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    // Add timeout to prevent indefinite hanging
    const timeoutId = setTimeout(() => {
      setAuthTimeout(true);
      toast.error("Authentication timed out. Please try logging in again.");
      router.push("/login");
    }, 5000); // 5 seconds timeout

    // Check auth status when component mounts
    checkAuthStatus().catch(() => {
      setAuthTimeout(true);
    });

    return () => clearTimeout(timeoutId);
  }, [checkAuthStatus, router]);

  // Show loading state while checking authentication
  if ((isLoading && !authTimeout) || !isClient) {
    return <AuthLoading />;
  }

  // Render children regardless - the middleware will handle redirects if needed
  return <>{children}</>;
}
