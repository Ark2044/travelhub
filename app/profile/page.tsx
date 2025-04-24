"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
import AuthLoading from "@/components/auth/auth-loading";
import { getCurrentUser } from "@/lib/appwrite/auth-service";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { checkAuthStatus } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Access auth state directly
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Function to manually check auth from cookie and localStorage
    const checkManualAuthState = () => {
      // Try to get auth state from localStorage first
      try {
        const localStorageAuth = localStorage.getItem("auth-storage");
        if (localStorageAuth) {
          const parsedAuth = JSON.parse(localStorageAuth);
          if (
            parsedAuth.state?.isAuthenticated &&
            parsedAuth.state?.user?.$id
          ) {
            console.log(
              "Found auth in localStorage:",
              parsedAuth.state.user.$id
            );
            return {
              isAuthenticated: true,
              user: parsedAuth.state.user,
            };
          }
        }
      } catch (e) {
        console.error("Error parsing localStorage auth:", e);
      }

      // Try to get auth state from cookies
      try {
        const cookieString = document.cookie;
        const cookies = cookieString.split(";");
        const authCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("auth-storage=")
        );

        if (authCookie) {
          const authValue = decodeURIComponent(authCookie.split("=")[1]);
          const parsedCookieAuth = JSON.parse(authValue);

          if (
            parsedCookieAuth.state?.isAuthenticated &&
            parsedCookieAuth.state?.user?.$id
          ) {
            console.log(
              "Found auth in cookie:",
              parsedCookieAuth.state.user.$id
            );
            return {
              isAuthenticated: true,
              user: parsedCookieAuth.state.user,
            };
          }
        }
      } catch (e) {
        console.error("Error parsing cookie auth:", e);
      }

      // No valid auth state found
      return { isAuthenticated: false, user: null };
    };

    const redirectToUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Initial auth state from store:", {
          isAuthenticated,
          userId: user?.$id,
        });

        // Set a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          setLoading(false);
          setError("Authentication check timed out");
          toast.error("Authentication timed out. Please try logging in again.");
          router.replace("/login");
        }, 5000);

        // First, check if we already have auth state in our store
        if (isAuthenticated && user && user.$id) {
          clearTimeout(timeoutId);
          console.log(
            "Auth state available in store, redirecting to user profile:",
            user.$id
          );
          router.replace(`/user/${user.$id}`);
          return;
        }

        // If not, check for auth state in localStorage/cookies
        const manualAuthState = checkManualAuthState();
        if (manualAuthState.isAuthenticated && manualAuthState.user) {
          clearTimeout(timeoutId);
          console.log(
            "Auth found in storage, redirecting to user profile:",
            manualAuthState.user.$id
          );
          router.replace(`/user/${manualAuthState.user.$id}`);
          return;
        }

        // As a last resort, directly query Appwrite for the current user
        try {
          const directUser = await getCurrentUser();
          if (directUser && directUser.$id) {
            clearTimeout(timeoutId);
            console.log(
              "Direct API check successful, user found:",
              directUser.$id
            );

            // Update our store with this user
            useAuthStore.setState({
              user: directUser,
              isAuthenticated: true,
              isLoading: false,
            });

            // Redirect to profile
            router.replace(`/user/${directUser.$id}`);
            return;
          }
        } catch (directError) {
          console.error("Error in direct user check:", directError);
        }

        // If we still don't have a user, try the checkAuthStatus method
        console.log(
          "No user found in direct checks, refreshing auth status..."
        );
        const authResult = await checkAuthStatus();
        clearTimeout(timeoutId);

        console.log("Auth check result:", authResult);

        // Get the latest state after the check
        const currentUser = useAuthStore.getState().user;
        const currentAuthStatus = useAuthStore.getState().isAuthenticated;

        if (currentAuthStatus && currentUser && currentUser.$id) {
          console.log(
            "Auth check successful, redirecting to profile:",
            currentUser.$id
          );
          router.replace(`/user/${currentUser.$id}`);
        } else {
          console.log("Auth check failed, redirecting to login");
          setError("Not authenticated");
          toast.error("Please log in to view your profile");
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error during profile redirect:", error);
        setError("An unexpected error occurred");
        toast.error("Something went wrong. Please try again.");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    redirectToUserProfile();
  }, [router, checkAuthStatus, isAuthenticated, user]);

  // Show loading state while determining redirect
  if (loading) {
    return <AuthLoading />;
  }

  // Show error state if there's an error
  if (error) {
    return <div className="p-4 text-center">Redirecting to login page...</div>;
  }

  return null;
}
