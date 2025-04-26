import Groq from "groq-sdk";

// Define interfaces for error types
interface GroqErrorResponse {
  status?: number;
  message?: string;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
  headers?: Record<string, string>;
}

interface GroqStreamError extends GroqErrorResponse {
  isStreamError?: boolean;
}

type GroqApiError = Error & GroqErrorResponse;

const groqApiKey = process.env.GROQ_API_KEY;
// Use compound-beta for real-time information and standard models as fallbacks
const PRIMARY_MODEL = "compound-beta";
const SECONDARY_MODEL = "llama3-70b-8192";
const FALLBACK_MODEL = "gemma2-9b-it";

// Initialize Groq client
const groq = new Groq({ apiKey: groqApiKey });

// Add retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Sleep function for retry delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const destination = answers[0];
  const budget = answers[1];
  const travelDates = answers[2];
  const interests = answers[4];
  const accommodationType = answers[5];

  // Create a more structured prompt optimized for compound-beta
  prompt = `

Create a comprehensive ${durationDays}-day travel itinerary for ${destination} for travel dates ${travelDates} with budget ${budget}.

I need you to use your web search tool to gather current information about:
1. Weather forecasts for ${destination} during ${travelDates}
2. Current top-rated attractions in ${destination} and their opening hours/prices
3. Any travel advisories or local events happening in ${destination} during ${travelDates}
4. Current pricing and availability for ${accommodationType} options within ${budget} budget
5. Top-rated restaurants and local cuisine options

Based on this real-time information, please include these sections:
1. OVERVIEW: Brief intro to the destination and highlights, including current local events
2. WEATHER FORECAST: Expected conditions during the stay
3. TRAVEL METHOD: Up-to-date transportation options to and around ${destination}
4. ACCOMMODATION: 2-3 specific ${accommodationType} options that match their ${budget} budget with current pricing
5. DAY-BY-DAY ITINERARY: For each of the ${durationDays} days, include morning, afternoon, and evening activities with accurate operating hours
6. DINING RECOMMENDATIONS: 4-6 specific restaurants with current ratings and signature dishes
7. LOCAL EXPERIENCES: Current trending activities based on their interest in ${interests}
8. TRAVEL TIPS: Practical advice including current local customs, tipping practices, and safety information
9. BUDGET BREAKDOWN: Estimated costs based on current prices for the entire itinerary

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

    // Try compound-beta model first for real-time information
    try {
      console.log("Using compound-beta model with web search capabilities");

      // Add retry logic for transient server errors
      let lastError: GroqApiError | null = null;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            console.log(
              `Retry attempt ${attempt} for primary model after delay...`
            );
            await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
          }

          const completion = await groq.chat.completions.create({
            model: PRIMARY_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1200, // Increased for more comprehensive responses with real-time data
            stop: null,
          });

          const content = completion.choices[0]?.message?.content;
          const executedTools = completion.choices[0]?.message?.executed_tools;

          if (executedTools && executedTools.length > 0) {
            console.log(`Tool calls used: ${executedTools.length}`);
          }

          if (content && content.length > 100) {
            return content;
          } else {
            throw new Error("Generated content was too short or empty");
          }
        } catch (error) {
          lastError = error as GroqApiError;

          // Don't retry for non-server errors or if we've exhausted retries
          if (
            attempt >= MAX_RETRIES ||
            !(
              lastError.status === 503 ||
              lastError.status === 500 ||
              (lastError.message &&
                lastError.message.includes("Service Unavailable"))
            )
          ) {
            break;
          }
        }
      }

      // If we got here, all retries failed
      throw lastError;
    } catch (primaryModelError) {
      const typedError = primaryModelError as GroqApiError;
      // Log with more detailed error information
      console.warn(
        `Compound-beta model error, falling back to ${SECONDARY_MODEL}:`,
        typedError.status || typedError.message || typedError
      );

      // Fall back to standard model
      try {
        const secondaryCompletion = await groq.chat.completions.create({
          model: SECONDARY_MODEL,
          messages: [
            {
              role: "user",
              content:
                prompt +
                "\n\nNote: Generate this itinerary based on your existing knowledge.",
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
          stop: null,
        });

        const content = secondaryCompletion.choices[0]?.message?.content;
        if (content && content.length > 100) {
          return content;
        } else {
          throw new Error(
            "Generated content from secondary model was too short or empty"
          );
        }
      } catch (secondaryModelError) {
        const typedError = secondaryModelError as GroqApiError;
        console.warn(
          `Secondary model error, falling back to ${FALLBACK_MODEL}:`,
          typedError.status || typedError.message || typedError
        );

        // Final fallback
        const fallbackCompletion = await groq.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [
            {
              role: "user",
              content:
                prompt +
                "\n\nNote: Generate a simplified itinerary based on your existing knowledge.",
            },
          ],
          temperature: 0.7,
          max_tokens: 600, // Further reduced for fallback model
          stop: null,
        });

        return (
          fallbackCompletion.choices[0]?.message?.content ||
          "Failed to generate itinerary. Please try again with different preferences."
        );
      }
    }
  } catch (error) {
    const typedError = error as GroqApiError;
    console.error("Error generating itinerary:", typedError);
    // Provide more user-friendly error message
    if (
      typedError.status === 429 ||
      (typedError.message && typedError.message.includes("status code 429"))
    ) {
      throw new Error(
        "Our travel planning service is currently busy. Please try again in a minute."
      );
    } else if (
      typedError.status === 503 ||
      (typedError.message && typedError.message.includes("Service Unavailable"))
    ) {
      throw new Error(
        "Our travel planning service is temporarily unavailable. Please try again in a few minutes."
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
      console.log(
        "Using compound-beta model for streaming (note: tool calls may affect streaming performance)"
      );

      // Add retry logic for streaming
      let lastError: GroqStreamError | null = null;
      let streamSuccess = false;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            console.log(
              `Retry attempt ${attempt} for streaming after delay...`
            );
            await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
          }

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

          streamSuccess = true;
          onComplete(fullResponse);
          return fullResponse;
        } catch (error) {
          lastError = error as GroqStreamError;

          // Don't retry for non-server errors or if we've exhausted retries
          if (
            attempt >= MAX_RETRIES ||
            !(
              lastError.status === 503 ||
              lastError.status === 500 ||
              (lastError.message &&
                lastError.message.includes("Service Unavailable"))
            )
          ) {
            break;
          }
        }
      }

      // If we attempted streaming but failed all retries
      if (!streamSuccess) {
        throw lastError;
      }
    } catch (streamError) {
      const typedStreamError = streamError as GroqStreamError;
      console.warn(
        `Stream error with ${model}, falling back to non-streaming:`,
        typedStreamError.status || typedStreamError.message || typedStreamError
      );

      // Try non-streaming with primary model first
      try {
        // Try with retry logic for primary model
        let primarySuccess = false;
        let primaryLastError: GroqApiError | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            if (attempt > 0) {
              console.log(
                `Retry attempt ${attempt} for primary non-streaming after delay...`
              );
              await sleep(RETRY_DELAY_MS * attempt);
            }

            const completion = await groq.chat.completions.create({
              model: PRIMARY_MODEL,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 1200,
              stop: null,
            });

            const content = completion.choices[0]?.message?.content || "";
            primarySuccess = true;
            onComplete(content);
            return content;
          } catch (error) {
            primaryLastError = error as GroqApiError;

            if (
              attempt >= MAX_RETRIES ||
              !(
                primaryLastError.status === 503 ||
                primaryLastError.status === 500 ||
                (primaryLastError.message &&
                  primaryLastError.message.includes("Service Unavailable"))
              )
            ) {
              break;
            }
          }
        }

        if (!primarySuccess) {
          throw primaryLastError;
        }
      } catch (primaryError) {
        const typedPrimaryError = primaryError as GroqApiError;
        console.warn(
          `Error with primary model, falling back to ${SECONDARY_MODEL}:`,
          typedPrimaryError.status ||
            typedPrimaryError.message ||
            typedPrimaryError
        );

        // Try secondary model
        try {
          const secondaryCompletion = await groq.chat.completions.create({
            model: SECONDARY_MODEL,
            messages: [
              {
                role: "user",
                content:
                  prompt +
                  "\n\nNote: Generate this itinerary based on your existing knowledge.",
              },
            ],
            temperature: 0.7,
            max_tokens: 800,
            stop: null,
          });

          const content =
            secondaryCompletion.choices[0]?.message?.content || "";
          onComplete(content);
          return content;
        } catch (secondaryError) {
          // Fall back to final option
          const typedSecondaryError = secondaryError as GroqApiError;
          console.warn(
            `Secondary model failed, using final fallback:`,
            typedSecondaryError.status ||
              typedSecondaryError.message ||
              typedSecondaryError
          );
          model = FALLBACK_MODEL;
          const fallbackCompletion = await groq.chat.completions.create({
            model: model,
            messages: [
              {
                role: "user",
                content:
                  prompt +
                  "\n\nNote: Generate a simplified itinerary based on your existing knowledge.",
              },
            ],
            temperature: 0.7,
            max_tokens: 600,
            stop: null,
          });

          const content =
            fallbackCompletion.choices[0]?.message?.content ||
            "Failed to generate itinerary. Please try again.";
          onComplete(content);
          return content;
        }
      }
    }
  } catch (error) {
    const typedError = error as GroqApiError;
    console.error("Error generating itinerary stream:", typedError);
    const errorMessage =
      typedError.status === 503 ||
      (typedError.message && typedError.message.includes("Service Unavailable"))
        ? "Our travel planning service is temporarily unavailable. Please try again in a few minutes."
        : typedError.status === 429 ||
          (typedError.message && typedError.message.includes("status code 429"))
        ? "Our travel planning service is currently busy. Please try again in a minute."
        : "We couldn't create your itinerary at this time. Please try again later.";

    onComplete(errorMessage);
    throw new Error(errorMessage);
  }
};
