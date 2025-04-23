import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: groqApiKey });

// Build prompt for AI
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
    "Plan a personalized travel itinerary based on the following preferences:\n\n";

  // Add the user's answers to the prompt
  for (let i = 0; i < questions.length; i++) {
    prompt += `${questions[i]} ${answers[i]}\n`;
  }

  prompt += `
Please create a detailed travel itinerary with the following sections:

TRAVEL METHOD
Recommended transportation options to and around the destination.

ACCOMMODATION
Suggested places to stay based on preferences and budget.
Estimated cost value for each place

DAY-BY-DAY ITINERARY
For each day include:
Morning: Activities and recommendations
Afternoon: Plans and attractions
Evening: Activities and dining suggestions

DINING RECOMMENDATIONS
Must-try local restaurants
Popular local dishes
Dining experiences based on preferences
Estimated cost value for each place

LOCAL EXPERIENCES
Cultural activities
Entertainment options
Special experiences based on interests

Please format the response in clear sections with proper spacing, avoiding bullet points or asterisks. Make it engaging and easy to read.
`;

  return prompt;
};

// Generate itinerary using Groq
export const generateItinerary = async (answers: string[]): Promise<string> => {
  try {
    if (!groqApiKey) {
      throw new Error("Missing GROQ_API_KEY in environment variables!");
    }

    const prompt = buildPrompt(answers);

    const completion = await groq.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      stop: null,
    });

    return (
      completion.choices[0]?.message?.content || "Failed to generate itinerary."
    );
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error(
      `Failed to generate itinerary: ${(error as Error).message}`
    );
  }
};

// Generate itinerary in stream mode (for UI updates)
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

    const stream = await groq.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
      stop: null,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
      onChunk(content);
    }

    onComplete(fullResponse);
    return fullResponse;
  } catch (error) {
    console.error("Error generating itinerary stream:", error);
    throw new Error(
      `Failed to generate itinerary: ${(error as Error).message}`
    );
  }
};
