import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a consistent storage configuration for Zustand persist middleware
 * @param trimFunction Optional function to trim data when storage is getting large
 */
export const createPersistStorage = (trimFunction?: (data: unknown) => unknown) => {
  return {
    getItem: (name: string) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          return null;
        }

        const value = localStorage.getItem(name);
        if (!value) return null;

        // Parse and check size
        const parsed = JSON.parse(value);
        const storageSizeMB = (value.length * 2) / (1024 * 1024);

        // Log size info to help with debugging (5MB is a common limit)
        if (storageSizeMB > 2) {
          console.warn(
            `TravelHub storage approaching ${storageSizeMB.toFixed(
              2
            )}MB (browser limit 5MB)`
          );
        }

        return parsed;
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return null;
      }
    },
    setItem: (name: string, value: unknown) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          return;
        }

        // Convert to string to check size
        const stringValue = JSON.stringify(
          trimFunction ? trimFunction(value) : value
        );
        const storageSizeMB = (stringValue.length * 2) / (1024 * 1024);

        // If we're approaching local storage limits (5MB), trim data
        if (storageSizeMB > 4 && !trimFunction) {
          console.warn(
            `TravelHub storage size (${storageSizeMB.toFixed(
              2
            )}MB) approaching browser limits`
          );
        }

        localStorage.setItem(name, stringValue);

        // Also sync to cookies for auth state (for middleware/server access)
        if (name.includes("auth")) {
          syncToCookies(name, value);
        }
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    removeItem: (name: string) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          return;
        }

        localStorage.removeItem(name);

        // Also remove from cookies if auth related
        if (name.includes("auth")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }
    },
  };
};

/**
 * Syncs state to cookies for server-side authentication in middleware
 */
export function syncToCookies(name: string, value: unknown) {
  if (typeof window === "undefined") return;

  // Set cookie expiration to 7 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  // Set the cookie with the authentication state
  document.cookie = `${name}=${encodeURIComponent(
    JSON.stringify(value)
  )}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
}
