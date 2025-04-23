import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to check and fix common Appwrite authentication issues
 * Call this when encountering authentication errors
 */
export const checkAndFixAuthIssues = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return false;

    // Check for stale or corrupted auth data
    const authStorage = localStorage.getItem("auth-storage");

    if (authStorage) {
      try {
        // Try parsing the auth storage data
        const parsedAuth = JSON.parse(authStorage);

        // If it's invalid or missing critical parts, remove it
        if (!parsedAuth || !parsedAuth.state || !parsedAuth.state.user) {
          console.log("Removing invalid auth storage data");
          localStorage.removeItem("auth-storage");
          return true;
        }
      } catch (e) {
        // If JSON parsing fails, storage is corrupted
        console.log("Removing corrupted auth storage data", e);
        localStorage.removeItem("auth-storage");
        return true;
      }
    }

    // Check for stale travel session data too
    const travelStorage = localStorage.getItem("travel-planner-storage");
    if (travelStorage && typeof travelStorage === "string") {
      try {
        // Attempt to parse it
        JSON.parse(travelStorage);
      } catch (e) {
        // If parsing fails, remove the corrupted data
        console.log("Removing corrupted travel planner storage data", e);
        localStorage.removeItem("travel-planner-storage");
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking auth issues:", error);
    return false;
  }
};
