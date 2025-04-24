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
        model: "whisper-large-v3-turbo", // Using faster model with good price/performance
        language: "en", // Specify English to improve accuracy
        prompt:
          "Travel planning conversation with destinations, budgets, dates, and number of travelers", // Context improves accuracy
        response_format: "verbose_json", // Get detailed response with timestamps
        temperature: 0.0, // Use default temperature for best accuracy
        timestamp_granularities: ["segment"], // Get segment timestamps
      })) as unknown as VerboseTranscription;

      transcribedText = audioResponse.text || "";

      // Log transcription confidence metrics for debugging (optional)
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
