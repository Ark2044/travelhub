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
    const { questionIndex, answer } = await request.json();

    if (questionIndex === undefined || answer === undefined) {
      return NextResponse.json(
        { error: "Missing questionIndex or answer" },
        { status: 400 }
      );
    }

    // Check if we have a validator for this question
    if (validators[questionIndex]) {
      const [valid, message] = validators[questionIndex](answer);
      return NextResponse.json({ valid, message });
    }

    // For questions without specific validation, return valid
    return NextResponse.json({ valid: true, message: "" });
  } catch (error) {
    console.error("Error validating input:", error);
    return NextResponse.json(
      { error: "An error occurred during validation" },
      { status: 500 }
    );
  }
}
