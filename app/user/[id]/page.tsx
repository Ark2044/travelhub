"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import ProfileForm from "@/components/auth/profile-form";
import { toast } from "sonner";
import AuthLoading from "@/components/auth/auth-loading";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const userId = params.id as string;

  useEffect(() => {
    // Add a safety timeout to prevent getting stuck in loading state
    const loadingTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - forcing page to load");
      setPageLoading(false);
    }, 3000); // 3 seconds timeout

    const checkUserAuthorization = async () => {
      try {
        // Only log once when debugging
        if (process.env.NODE_ENV !== "production") {
          console.log("User profile page - Auth state:", {
            isAuthenticated,
            userId: user?.$id,
            paramUserId: userId,
            isLoading,
          });
        }

        // Force refresh of auth status to ensure we have current data
        await checkAuthStatus();

        // If user isn't authenticated, redirect to login
        if (!isAuthenticated || !user) {
          clearTimeout(loadingTimeout);
          toast.error("Please log in to view your profile");
          router.replace("/login");
          return;
        }

        // If the URL user ID doesn't match the authenticated user's ID, redirect
        if (userId !== user.$id) {
          clearTimeout(loadingTimeout);
          toast.info("Redirecting to your profile");
          router.replace(`/user/${user.$id}`);
          return;
        }

        // Auth check completed successfully
        clearTimeout(loadingTimeout);
        setPageLoading(false);
      } catch (error) {
        console.error("Profile authorization error:", error);
        clearTimeout(loadingTimeout);
        toast.error("Something went wrong. Please try again.");
        setPageLoading(false);
      }
    };

    checkUserAuthorization();

    return () => clearTimeout(loadingTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthenticated, user, router]);

  // Show loading state for a limited time only
  if (pageLoading) {
    return <AuthLoading />;
  }

  // Only the user can see their own profile
  if (user && user.$id === userId) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage your account and preferences
            </p>
          </div>
          <ProfileForm />
        </div>
      </div>
    );
  }

  // Fallback for any unexpected cases
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
