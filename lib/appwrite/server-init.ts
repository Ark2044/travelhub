import { initializeAppwrite } from "./init";

let isInitialized = false;

/**
 * Server-side initialization function for Appwrite resources
 *
 * This function ensures database initialization happens only once during server startup
 * Use in server components or server-side API routes
 */
export const ensureAppwriteInitialized = async () => {
  // Skip if already initialized or not in development mode
  if (isInitialized) {
    return true;
  }

  // Only auto-initialize in development
  if (process.env.NODE_ENV === "development") {
    console.log("Auto-initializing Appwrite resources in development mode...");
    const result = await initializeAppwrite();

    if (result) {
      isInitialized = true;
    }

    return result;
  }

  return false;
};

// Execute initialization when this module is imported in development
if (process.env.NODE_ENV === "development") {
  ensureAppwriteInitialized()
    .then(() =>
      console.log(
        "Development environment: Appwrite auto-initialization complete"
      )
    )
    .catch((err) =>
      console.error(
        "Development environment: Failed to auto-initialize Appwrite:",
        err
      )
    );
}
