"use server";

import { ensureAppwriteInitialized } from "@/lib/appwrite/server-init";

/**
 * Server Component to initialize Appwrite resources on app startup
 * This runs on the server side and ensures database and collections exist
 */
export default async function AppwriteInitializer() {
  try {
    // This will run on the server when the component is rendered
    await ensureAppwriteInitialized();
    // Nothing to render - this is just for initialization
    return null;
  } catch (error) {
    console.error("Failed to initialize Appwrite:", error);
    return null;
  }
}
