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
        console.log("Auth initializer - Auth status:", isAuthenticated);

        // Get the latest state after the check
        const currentUser = useAuthStore.getState().user;

        // If we detect auth issues, show a helpful message
        if (!isAuthenticated && localStorage.getItem("auth-storage")) {
          // User had a previous session that's now invalid
          toast.error("Your session has expired. Please log in again.", {
            duration: 5000,
            id: "session-expired",
          });

          // Clear any stale auth data
          localStorage.removeItem("auth-storage");
          document.cookie =
            "auth-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } else if (isAuthenticated && currentUser) {
          // Ensure the auth cookie is updated with the latest state
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7);

          const authData = JSON.stringify({
            state: {
              user: currentUser,
              isAuthenticated: true,
            },
          });

          // Set both localStorage and cookie for redundancy
          localStorage.setItem("auth-storage", authData);

          document.cookie = `auth-storage=${encodeURIComponent(
            authData
          )}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;

          console.log("Auth cookie refreshed for user:", currentUser.$id);
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
