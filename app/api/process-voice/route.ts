import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import fs from "fs";
import os from "os";
import path from "path";

// Interface for Groq's verbose_json response format
interface VerboseTranscription {
  text: string;
  segments?: Array<{
    id: number;
    seek?: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  language?: string;
  task?: string;
  duration?: number;
}

// Initialize Groq client
const groqApiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: groqApiKey });

// Model definitions
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";
const CONTEXT_MODEL = "compound-beta-mini"; // For context validation and enhancement

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

// Other validators remain the same
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

// Function to enhance transcription with compound-beta processing
async function enhanceTranscription(
  text: string,
  questionIndex: number
): Promise<string> {
  try {
    // Get the context for this question
    let context = "Travel planning conversation.";
    switch (questionIndex) {
      case 0:
        context =
          "User is specifying a travel destination (city, country, or region).";
        break;
      case 1:
        context = "User is specifying their travel budget in dollars.";
        break;
      case 2:
        context = "User is specifying their travel dates and duration.";
        break;
      case 3:
        context = "User is specifying the number of travelers in their group.";
        break;
      case 4:
        context =
          "User is describing their travel interests and preferences (culture, food, adventure, relaxation, etc).";
        break;
      // Add other question contexts as needed
    }

    // Use compound-beta-mini for contextual understanding and correction
    const completion = await groq.chat.completions.create({
      model: CONTEXT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a travel planning assistant. The user is answering a travel planning questionnaire. 
          
Current question context: ${context}

Your task is to correct any potential speech-to-text errors and format the answer appropriately. 
For destinations, ensure proper capitalization of place names.
For budgets, ensure they're formatted numerically.
For dates, ensure they follow a clear format.
For number of travelers, convert text numbers to digits.

If the transcription is unclear or ambiguous relative to the expected answer type, use your web search tool to resolve ambiguities or verify information.

Respond ONLY with the corrected text, nothing else.`,
        },
        {
          role: "user",
          content: `Correct this transcription: "${text}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 150,
    });

    const enhancedText =
      completion.choices[0]?.message?.content?.trim() || text;

    // If there were tool calls, log it
    const executedTools = completion.choices[0]?.message?.executed_tools;
    if (executedTools && executedTools.length > 0) {
      console.log(
        `Tool calls used in transcription enhancement: ${executedTools.length}`
      );
    }

    return enhancedText;
  } catch (error) {
    console.warn("Failed to enhance transcription:", error);
    // Fall back to original text if enhancement fails
    return text;
  }
}

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

    // Save the audio file to a temporary location
    const audioBuffer = await audioFile.arrayBuffer();
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `recording_${Date.now()}.webm`);

    try {
      fs.writeFileSync(tempFilePath, Buffer.from(audioBuffer));
    } catch (err) {
      console.error("Error saving temporary file:", err);
      return NextResponse.json(
        { success: false, error: "Failed to process audio file" },
        { status: 500 }
      );
    }

    // Use Groq's Audio API for speech-to-text
    let transcribedText = "";
    try {
      if (!groqApiKey) {
        throw new Error("Missing GROQ_API_KEY in environment variables!");
      }

      // Use Groq's audio transcription capability with enhanced options
      const audioResponse = (await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: TRANSCRIPTION_MODEL,
        language: "en",
        prompt:
          "Travel planning conversation with destinations, budgets, dates, and number of travelers",
        response_format: "verbose_json",
        temperature: 0.0,
        timestamp_granularities: ["segment"],
      })) as unknown as VerboseTranscription;

      transcribedText = audioResponse.text || "";

      // Log transcription confidence metrics for debugging
      if (
        process.env.NODE_ENV === "development" &&
        audioResponse.segments &&
        audioResponse.segments.length > 0
      ) {
        console.log("Transcription quality metrics:", {
          avgLogprob: audioResponse.segments[0].avg_logprob,
          noSpeechProb: audioResponse.segments[0].no_speech_prob,
          compressionRatio: audioResponse.segments[0].compression_ratio,
        });
      }

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      if (!transcribedText) {
        throw new Error("Failed to transcribe audio");
      }

      // Enhance transcription with compound-beta if we have a question index
      if (questionIndex !== undefined && transcribedText) {
        try {
          console.log(`Raw transcription: "${transcribedText}"`);
          transcribedText = await enhanceTranscription(
            transcribedText,
            questionIndex
          );
          console.log(`Enhanced transcription: "${transcribedText}"`);
        } catch (enhanceError) {
          console.error("Error enhancing transcription:", enhanceError);
          // Continue with original transcription if enhancement fails
        }
      }
    } catch (groqError) {
      console.error("Groq transcription error:", groqError);

      // Clean up temp file if it exists
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      return NextResponse.json(
        { success: false, error: "Failed to transcribe audio with Groq" },
        { status: 500 }
      );
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
