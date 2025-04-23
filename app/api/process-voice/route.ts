import { NextRequest, NextResponse } from "next/server";

// Validators for different question types
const validateDestination = (text: string): [boolean, string] => {
  if (text.length < 2) {
    return [
      false,
      "Please enter a valid destination name (at least 2 characters).",
    ];
  }
  if (/\d/.test(text)) {
    return [
      false,
      "A destination name shouldn't contain numbers. Please enter a valid city or country name.",
    ];
  }
  if (/^(hi|hello|hey)$/i.test(text)) {
    return [
      false,
      "Please enter a destination name instead of a greeting. Where would you like to travel?",
    ];
  }
  return [true, ""];
};

const validateBudget = (text: string): [boolean, string] => {
  // Remove common currency symbols and commas
  const cleanText = text.replace(/[$,]/g, "").trim();
  const amount = parseFloat(cleanText);

  if (isNaN(amount) || amount <= 0) {
    return [false, "Please enter a valid positive amount for your budget."];
  }
  return [true, ""];
};

const validateDates = (text: string): [boolean, string] => {
  if (!/\d/.test(text)) {
    return [
      false,
      "Please include dates in your response (e.g., May 1-5, 2025).",
    ];
  }
  return [true, ""];
};

const validatePeople = (text: string): [boolean, string] => {
  const num = parseInt(text.trim(), 10);
  if (isNaN(num) || num <= 0) {
    return [
      false,
      "Please enter a valid number of travelers (must be at least 1).",
    ];
  }
  return [true, ""];
};

const validators: Record<number, (text: string) => [boolean, string]> = {
  0: validateDestination,
  1: validateBudget,
  2: validateDates,
  3: validatePeople,
};

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from the request
    const formData = await request.formData();

    // Get the audio file
    const audioFile = formData.get("audio") as File | null;
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Get question index if provided
    const questionIndexStr = formData.get("question_index") as string | null;
    const questionIndex = questionIndexStr
      ? parseInt(questionIndexStr, 10)
      : undefined;

    // In a real-world application, we would use a speech-to-text service here
    // For now, we'll use a mock implementation that just returns a predefined response
    // based on the question index

    // Mock speech-to-text processing
    let transcribedText = "";

    // In a real implementation, you would send the audio to a service like:
    // - Google Cloud Speech-to-Text
    // - AWS Transcribe
    // - Azure Speech Service

    // For demo purposes, we're returning mock data based on question index
    switch (questionIndex) {
      case 0:
        transcribedText = "Paris, France";
        break;
      case 1:
        transcribedText = "$2500";
        break;
      case 2:
        transcribedText = "June 15-22, 2025";
        break;
      case 3:
        transcribedText = "2";
        break;
      case 4:
        transcribedText = "food, culture, and sightseeing";
        break;
      case 5:
        transcribedText = "boutique hotel";
        break;
      case 6:
        transcribedText = "balanced";
        break;
      case 7:
        transcribedText = "public transport";
        break;
      case 8:
        transcribedText = "Eiffel Tower, Louvre Museum";
        break;
      default:
        transcribedText = "Sorry, I didn't catch that.";
    }

    // Validate the transcribed text if we have a question index
    let shouldAutoSubmit = false;
    if (questionIndex !== undefined && validators[questionIndex]) {
      const [isValid] = validators[questionIndex](transcribedText);
      shouldAutoSubmit = isValid;
    }

    return NextResponse.json({
      success: true,
      text: transcribedText,
      auto_submit: shouldAutoSubmit,
    });
  } catch (error) {
    console.error("Error processing voice:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
