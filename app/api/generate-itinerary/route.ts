import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/services/groq-service";
import { conversationService } from "@/lib/appwrite/conversation-service";
import { QUESTIONS } from "@/lib/store/travel-store";

export const runtime = "edge";

/**
 * API route for generating travel itineraries
 * Handles both authenticated and guest users
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let answers;
    try {
      const body = await request.json();
      answers = body.answers;
    } catch {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate answers array
    if (
      !answers ||
      !Array.isArray(answers) ||
      answers.length !== QUESTIONS.length ||
      !answers[0] // At minimum, we need a destination
    ) {
      return NextResponse.json(
        {
          error: "Invalid travel details",
          details: "Please provide all required travel information",
        },
        { status: 400 }
      );
    }

    // Get destination from the first answer
    const destination = answers[0];

    // Check if user is authenticated
    const authCookie = request.cookies.get("auth-storage");
    let isAuthenticated = false;
    let userId = "";

    if (authCookie) {
      try {
        const authData = JSON.parse(decodeURIComponent(authCookie.value));
        isAuthenticated = authData?.state?.isAuthenticated === true;
        userId = authData?.state?.user?.id || "";
      } catch (e) {
        console.error("Error parsing auth cookie:", e);
      }
    }

    // Generate itinerary using Groq AI
    console.log(`Generating itinerary for ${destination}...`);
    const itinerary = await generateItinerary(answers);

    // Store conversation in Appwrite if applicable
    let conversationId;
    if (isAuthenticated && userId) {
      try {
        // Create conversation
        conversationId = await conversationService.create(destination, userId);
        console.log(`Created conversation: ${conversationId}`);

        // Store user preferences
        await conversationService.storePreferences(conversationId, {
          destination: answers[0],
          budget: answers[1],
          dates: answers[2],
          num_travelers: answers[3],
          interests: answers[4],
          accommodation_preference: answers[5],
          pace_preference: answers[6],
          transport_preference: answers[7],
          must_see_places: answers[8],
        });

        // Add AI message to the conversation
        await conversationService.addMessage(conversationId, itinerary, false);
        console.log(`Stored itinerary in conversation: ${conversationId}`);
      } catch (err) {
        console.error("Error saving to Appwrite:", err);
        // Continue with the response even if storage fails
        // For authenticated users, we'll provide a helpful message
        return NextResponse.json({
          success: true,
          itinerary,
          notice:
            "Your itinerary was generated but couldn't be saved to your account. You may want to download it to keep it.",
        });
      }
    }

    // Return success with itinerary
    return NextResponse.json({
      success: true,
      itinerary,
      conversationId,
      authenticated: isAuthenticated,
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);

    // Provide a helpful error message based on the error
    let status = 500;
    let errorMessage = "Failed to generate itinerary. Please try again later.";

    if (error instanceof Error) {
      // Check for specific error types
      if (
        error.message.includes("rate limit") ||
        error.message.includes("currently busy")
      ) {
        status = 429;
        errorMessage =
          "Our travel planning service is currently busy. Please try again in a minute.";
      } else if (error.message.includes("Missing GROQ_API_KEY")) {
        status = 503;
        errorMessage =
          "Travel planning service is not properly configured. Please contact support.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: (error as Error).message,
      },
      { status }
    );
  }
}
