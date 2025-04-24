import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;
// Fall back to gemma2-9b-it if llama3-70b-8192 is unavailable
const PRIMARY_MODEL = "llama3-70b-8192";
const FALLBACK_MODEL = "gemma2-9b-it";

// Initialize Groq client
const groq = new Groq({ apiKey: groqApiKey });

// Build prompt for AI with improved instructions for better itineraries
export const buildPrompt = (answers: string[]) => {
  const questions = [
    "Hey there! Where are you planning to travel?",
    "Cool! What's your budget for this trip in dollars?",
    "When are you traveling, and how many days are you staying? (e.g., May 1-5, 2025)",
    "How many people are traveling with you?",
    "What are you into—culture, food, adventure, relaxation, or something else?",
    "Any preference for accommodation—like hotels, Airbnb, or budget stays?",
    "What kind of pace do you prefer—relaxed, balanced, or packed with activities?",
    "Would you like public transport, rental car, or private taxis during your stay?",
    "Do you have any must-visit places or experiences in mind?",
  ];

  let prompt =
    "You are a professional travel planner creating a personalized travel itinerary. Plan a detailed, realistic, and engaging trip based on these preferences:\n\n";

  // Add the user's answers to the prompt with clear labeling
  for (let i = 0; i < questions.length; i++) {
    prompt += `QUESTION: ${questions[i]}\nANSWER: ${answers[i]}\n\n`;
  }

  // Extract duration for day-by-day planning
  const dateInfo = answers[2]; // When are you traveling question
  let durationDays = 3; // Default duration if parsing fails

  // Try to detect duration from the date string (e.g., "May 1-5, 2025" → 5 days)
  try {
    const dateRangeMatch = dateInfo.match(/(\d+)[-–—to]+(\d+)/);
    if (dateRangeMatch) {
      const startDay = parseInt(dateRangeMatch[1]);
      const endDay = parseInt(dateRangeMatch[2]);
      if (!isNaN(startDay) && !isNaN(endDay)) {
        durationDays = endDay - startDay + 1;
      }
    }
  } catch (e) {
    console.log("Failed to parse duration from date string, using default", e);
  }

  // Create a more structured prompt with clear sections
  prompt += `
TASK:
Create a comprehensive ${durationDays}-day travel itinerary for ${
    answers[0]
  } that perfectly matches the traveler's preferences.
The budget is ${answers[1]}, and the trip is for ${
    answers[3]
  } travelers who enjoy ${answers[4]}.
They prefer ${answers[6]}-paced trips with ${
    answers[5]
  } accommodations and prefer to get around using ${answers[7]}.
${answers[8] ? `They specifically want to visit: ${answers[8]}` : ""}

Your itinerary must include these sections, formatted with UPPERCASE section titles:

OVERVIEW
A brief introduction to the destination and what makes this itinerary special. Mention the duration, traveler count, and key highlights.

TRAVEL METHOD
How to get to ${
    answers[0]
  } and the recommended transportation options around the destination.
Include specific transportation companies, estimated costs, and booking tips.

ACCOMMODATION
3-5 specific accommodations that match their ${answers[1]} budget and ${
    answers[5]
  } preference.
For each place, include:
- Name and brief description
- Location benefits
- Price range per night
- Unique features
- Booking recommendations

DAY-BY-DAY ITINERARY
Create a detailed plan for each of the ${durationDays} days with:
DAY X: [THEME FOR THE DAY]
MORNING: Specific activities, locations, opening hours, and tips
AFTERNOON: Continuation of the day's exploration with specific recommendations
EVENING: Dinner suggestions, nightlife or relaxation options with venue names

DINING RECOMMENDATIONS
8-10 specific dining options including:
- Restaurant/cafe name
- Location
- Signature dishes
- Price range
- Best time to visit
Mix high-end and budget-friendly options that match their interests in ${
    answers[4]
  }.

LOCAL EXPERIENCES
Authentic activities based on their interest in ${answers[4]}, including:
- Cultural events
- Hidden gems
- Unique experiences
- Shopping opportunities
- Entertainment options

TRAVEL TIPS
Practical advice specific to ${answers[0]} such as:
- Local customs
- Weather considerations
- Money-saving tips
- Safety information
- Essential apps or services

Format the response with clear sections, proper spacing, and engaging descriptions. Make it feel like a premium travel guide created just for them. Avoid generic advice and include specific names of places, attractions, and restaurants throughout.
`;

  return prompt;
};

// Generate itinerary using Groq with improved error handling and model fallback
export const generateItinerary = async (answers: string[]): Promise<string> => {
  try {
    if (!groqApiKey) {
      throw new Error("Missing GROQ_API_KEY in environment variables!");
    }

    const prompt = buildPrompt(answers);

    // Try primary model first
    try {
      const completion = await groq.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1200, // Increased token limit for more detailed itineraries
        stop: null,
      });

      const content = completion.choices[0]?.message?.content;

      if (content && content.length > 100) {
        return content;
      } else {
        throw new Error("Generated content was too short or empty");
      }
    } catch (primaryModelError) {
      console.warn(
        `Primary model error, falling back to ${FALLBACK_MODEL}:`,
        primaryModelError
      );

      // Fall back to alternative model
      const fallbackCompletion = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
        stop: null,
      });

      return (
        fallbackCompletion.choices[0]?.message?.content ||
        "Failed to generate itinerary. Please try again with different preferences."
      );
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    // Provide more user-friendly error message
    if (error instanceof Error && error.message.includes("status code 429")) {
      throw new Error(
        "Our travel planning service is currently busy. Please try again in a minute."
      );
    } else {
      throw new Error(
        `We couldn't create your itinerary at this time. Please try again later.`
      );
    }
  }
};

// Generate itinerary in stream mode with enhanced error handling
export const generateItineraryStream = async (
  answers: string[],
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void
) => {
  try {
    if (!groqApiKey) {
      throw new Error("Missing GROQ_API_KEY in environment variables!");
    }

    const prompt = buildPrompt(answers);
    let model = PRIMARY_MODEL;
    let fullResponse = "";

    try {
      const stream = await groq.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1200,
        stop: null,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        onChunk(content);
      }

      onComplete(fullResponse);
      return fullResponse;
    } catch (streamError) {
      console.warn(`Stream error with ${model}, falling back:`, streamError);

      // If streaming fails, try non-streaming with fallback model
      model = FALLBACK_MODEL;
      const fallbackCompletion = await groq.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
        stop: null,
      });

      const content =
        fallbackCompletion.choices[0]?.message?.content ||
        "Failed to generate itinerary. Please try again.";

      onComplete(content);
      return content;
    }
  } catch (error) {
    console.error("Error generating itinerary stream:", error);
    const errorMessage =
      error instanceof Error
        ? "We couldn't create your itinerary at this time. Please try again later."
        : "An unexpected error occurred while creating your itinerary.";

    onComplete(errorMessage);
    throw new Error(errorMessage);
  }
};
