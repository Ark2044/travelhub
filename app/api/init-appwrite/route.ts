import { NextResponse } from "next/server";
import { initializeAppwrite } from "@/lib/appwrite/init";

// This API route initializes Appwrite database and collections
// It should be called on app startup (server-side) or via an admin interface
export async function GET() {
  try {
    // Check for an admin secret to prevent unauthorized access
    // In a production environment, you should implement proper authentication
    // and authorization mechanisms

    // Initialize Appwrite resources
    const result = await initializeAppwrite();

    if (result) {
      return NextResponse.json({
        success: true,
        message: "Appwrite resources initialized successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to initialize Appwrite resources",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Error initializing Appwrite resources",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
