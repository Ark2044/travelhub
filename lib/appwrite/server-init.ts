import { initializeAppwrite } from "./init";

let isInitialized = false;

/**
 * Server-side initialization function for Appwrite resources
 *
 * This function ensures database initialization happens only once during server startup
 * Use in server components or server-side API routes
 */
export const ensureAppwriteInitialized = async () => {
  // Skip if already initialized
  if (isInitialized) {
    return true;
  }

  console.log("Initializing Appwrite resources...");
  const result = await initializeAppwrite();

  if (result) {
    isInitialized = true;
    console.log("Appwrite initialization complete");
  } else {
    console.error("Failed to initialize Appwrite resources");
  }

  return result;
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
