import { initializeDatabase } from "./database-service";

/**
 * Initialize Appwrite resources
 * This should be called during app initialization to ensure all required
 * database resources are properly set up.
 */
export const initializeAppwrite = async () => {
  console.log("Initializing Appwrite resources...");

  try {
    // Initialize database and collections
    await initializeDatabase();

    console.log("Appwrite initialization complete");
    return true;
  } catch (error) {
    console.error("Failed to initialize Appwrite resources:", error);
    return false;
  }
};

// Export a function that can be called directly from server-side code
export default async function init() {
  return await initializeAppwrite();
}
