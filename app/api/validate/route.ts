import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/store/travel-store";

// Enhanced validators for different question types
const validateDestination = (text: string): [boolean, string] => {
  const cleanText = text.trim();
  if (cleanText.length < 2) {
    return [
      false,
      "Please enter a valid destination name (at least 2 characters).",
    ];
  }
  // Check for obviously non-place inputs
  if (/^(hi|hello|hey|test|asdf|123|none|no|yes)$/i.test(cleanText)) {
    return [
      false,
      "Please enter a destination name (city, country, or region) where you'd like to travel.",
    ];
  }
  // Check for excessive numbers
  if (/\d{4,}/.test(cleanText)) {
    return [
      false,
      "A destination name shouldn't contain long numbers. Please enter a valid city, country, or region name.",
    ];
  }
  return [true, ""];
};

const validateBudget = (text: string): [boolean, string] => {
  // Remove common currency symbols, commas, spaces, and normalize format
  const cleanText = text.replace(/[$€£¥,\s]/g, "").trim();

  // Check for budget ranges (e.g., "1000-1500")
  if (cleanText.includes("-")) {
    const parts = cleanText.split("-");
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);

    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || min > max) {
      return [
        false,
        "Please enter a valid budget range with positive numbers.",
      ];
    }
    return [true, ""];
  }

  // Check for descriptive budgets
  if (/budget|cheap|affordable|luxury|expensive|mid|moderate/i.test(text)) {
    return [true, ""];
  }

  // Try to parse as a number
  const amount = parseFloat(cleanText);
  if (isNaN(amount) || amount <= 0) {
    return [
      false,
      "Please enter a valid budget amount (e.g., $1000) or range.",
    ];
  }

  return [true, ""];
};

const validateDates = (text: string): [boolean, string] => {
  const cleanText = text.trim().toLowerCase();

  // Allow descriptive dates
  if (/(next|this) (week|month|year)|coming|upcoming|soon/i.test(cleanText)) {
    return [true, ""];
  }

  // Check for date ranges with numbers
  if (!/\d/.test(cleanText)) {
    return [
      false,
      "Please include specific dates or a timeframe in your response (e.g., May 1-5, 2025 or next month).",
    ];
  }

  // Check for obviously invalid dates
  if (/^(0|yesterday|last)/i.test(cleanText)) {
    return [false, "Please enter future dates for your planned trip."];
  }

  return [true, ""];
};

const validatePeople = (text: string): [boolean, string] => {
  // Try to extract a number, handling text like "2 people" or "family of 4"
  const matches = text.match(/\d+/);
  const num = matches ? parseInt(matches[0], 10) : NaN;

  if (isNaN(num) || num <= 0) {
    // Check for descriptive responses
    if (/\b(solo|alone|myself|me)\b/i.test(text)) {
      return [true, ""]; // Solo traveler
    }
    if (
      /\b(couple|with partner|with spouse|with wife|with husband)\b/i.test(text)
    ) {
      return [true, ""]; // Couple
    }
    if (/\b(family|group|friends)\b/i.test(text)) {
      return [true, ""]; // Group
    }

    return [
      false,
      "Please enter a valid number of travelers or describe your travel group (e.g., '2', 'solo', 'family of 4').",
    ];
  }

  // Cap at a reasonable maximum
  if (num > 100) {
    return [
      false,
      "For large groups over 100, please contact our customer service for specialized itineraries.",
    ];
  }

  return [true, ""];
};

const validateInterests = (text: string): [boolean, string] => {
  const cleanText = text.trim();

  if (cleanText.length < 3) {
    return [
      false,
      "Please share some of your travel interests to help us create a better itinerary.",
    ];
  }

  if (cleanText.split(/\s+/).length < 2) {
    return [
      false,
      "Please elaborate a bit more on your interests for a personalized experience.",
    ];
  }

  return [true, ""];
};

const validateAccommodation = (text: string): [boolean, string] => {
  const cleanText = text.trim().toLowerCase();
  const validOptions =
    /hotel|hostel|airbnb|resort|apartment|motel|cabin|cottage|villa|camp|glamping|bnb|budget|luxury/i;

  if (!validOptions.test(cleanText) && cleanText.length < 3) {
    return [
      false,
      "Please specify your accommodation preferences like hotel, Airbnb, hostel, etc.",
    ];
  }

  return [true, ""];
};

const validatePace = (text: string): [boolean, string] => {
  const cleanText = text.trim().toLowerCase();
  const validOptions =
    /relax|slow|moderate|medium|balanced|busy|packed|fast|leisurely|active/i;

  if (!validOptions.test(cleanText) && cleanText.length < 3) {
    return [
      false,
      "Please specify your preferred travel pace (relaxed, moderate, or packed with activities).",
    ];
  }

  return [true, ""];
};

const validateTransport = (text: string): [boolean, string] => {
  const cleanText = text.trim().toLowerCase();
  const validOptions =
    /public|transport|bus|train|subway|metro|car|rental|taxi|uber|lyft|walk|bike|scooter/i;

  if (!validOptions.test(cleanText) && cleanText.length < 3) {
    return [
      false,
      "Please specify your transportation preferences (public transit, rental car, taxi, etc.).",
    ];
  }

  return [true, ""];
};

// Generic validator for text inputs
const validateGenericText = (text: string): [boolean, string] => {
  if (text.trim().length < 2) {
    return [false, "Please provide more information to help plan your trip."];
  }
  return [true, ""];
};

// Map question indices to validators
const validators: Record<number, (text: string) => [boolean, string]> = {
  0: validateDestination,
  1: validateBudget,
  2: validateDates,
  3: validatePeople,
  4: validateInterests,
  5: validateAccommodation,
  6: validatePace,
  7: validateTransport,
  8: validateGenericText, // Must-see places - less strict validation
};

export async function POST(request: NextRequest) {
  try {
    // Parse request with error handling
    let questionIndex, answer;
    try {
      const body = await request.json();
      questionIndex = body.questionIndex;
      answer = body.answer;
    } catch (error) {
      return NextResponse.json(
        { valid: false, message: `Invalid request format, ${error}` },
        { status: 400 }
      );
    }

    // Validate inputs
    if (questionIndex === undefined || answer === undefined) {
      return NextResponse.json(
        { valid: false, message: "Missing questionIndex or answer" },
        { status: 400 }
      );
    }

    // Ensure questionIndex is within valid range
    if (questionIndex < 0 || questionIndex >= QUESTIONS.length) {
      return NextResponse.json(
        { valid: false, message: "Invalid question index" },
        { status: 400 }
      );
    }

    // Check if we have a validator for this question
    if (validators[questionIndex]) {
      const [valid, message] = validators[questionIndex](answer);
      return NextResponse.json({ valid, message });
    }

    // For questions without specific validation, use generic validation
    const [valid, message] = validateGenericText(answer);
    return NextResponse.json({ valid, message });
  } catch (error) {
    console.error("Error validating input:", error);
    // Always return a valid response even on error, but log it
    return NextResponse.json({
      valid: true,
      message: "",
      warning:
        "Validation service encountered an issue but your response was accepted.",
    });
  }
}
