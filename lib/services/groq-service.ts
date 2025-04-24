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

  // Create a more concise prompt to save tokens
  let prompt = "Create a travel itinerary based on these preferences:\n\n";

  // Add the user's answers to the prompt with clear labeling
  for (let i = 0; i < questions.length; i++) {
    prompt += `${questions[i]} ${answers[i]}\n\n`;
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

  // Create a more structured but token-efficient prompt
  prompt += `
Create a ${durationDays}-day travel itinerary for ${answers[0]} with budget ${answers[1]}.
Include these sections:
1. OVERVIEW: Brief intro to the destination and highlights
2. TRAVEL METHOD: Transportation options to and around ${answers[0]}
3. ACCOMMODATION: 2-3 ${answers[5]} options that match their ${answers[1]} budget
4. DAY-BY-DAY ITINERARY: For each of the ${durationDays} days, include morning, afternoon, and evening activities
5. DINING RECOMMENDATIONS: 4-6 specific restaurants
6. LOCAL EXPERIENCES: Based on their interest in ${answers[4]}
7. TRAVEL TIPS: Practical advice for ${answers[0]}
8. LOCAL GUIDE CONTACT (Use: "Your guide is Alex Rivera. Contact: alex.rivera@travelhub.local")

Format with clear section headings and be specific with venue names and activities.
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

    // Try primary model first with reduced token count
    try {
      const completion = await groq.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800, // Reduced token limit to prevent exhaustion
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

      // Fall back to alternative model with even smaller token limit
      const fallbackCompletion = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600, // Further reduced for fallback model
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
        max_tokens: 800, // Reduced to prevent token exhaustion
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
        max_tokens: 600, // Further reduced for fallback
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
