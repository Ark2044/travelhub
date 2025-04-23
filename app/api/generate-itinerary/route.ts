import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/services/groq-service";
import { conversationService } from "@/lib/appwrite/conversation-service";
import { QUESTIONS } from "@/lib/store/travel-store";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { answers } = await request.json();

    if (
      !answers ||
      !Array.isArray(answers) ||
      answers.length !== QUESTIONS.length
    ) {
      return NextResponse.json(
        { error: "Missing or invalid answers array" },
        { status: 400 }
      );
    }

    // Get destination from the first answer
    const destination = answers[0];

    // Generate itinerary using Groq AI
    const itinerary = await generateItinerary(answers);

    // Store conversation in Appwrite
    let conversationId;
    try {
      // Create conversation
      conversationId = await conversationService.create(destination);

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
    } catch (err) {
      console.error("Error saving to Appwrite:", err);
      // Continue with the response even if storage fails
    }

    return NextResponse.json({
      success: true,
      itinerary,
      conversationId,
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate itinerary",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
