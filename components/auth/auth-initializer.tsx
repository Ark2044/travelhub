"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check auth status when component mounts
    const initializeAuth = async () => {
      try {
        // Attempt to check authentication status
        const isAuthenticated = await checkAuthStatus();

        // If we detect auth issues, show a helpful message
        if (!isAuthenticated && localStorage.getItem("auth-storage")) {
          // User had a previous session that's now invalid
          toast.error("Your session has expired. Please log in again.", {
            duration: 5000,
            id: "session-expired",
          });
          // Clear any stale auth data
          localStorage.removeItem("auth-storage");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  // Only render children when authentication check is complete
  if (!authChecked) {
    return <div>Checking authentication status...</div>;
  }

  return <>{children}</>;
}
