"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faClock,
  faUser,
  faUtensils,
  faBed,
  faMapMarkerAlt,
  faArrowRight,
  faArrowLeft,
  faDollarSign,
  faCalendarAlt,
  faPlane,
  faLightbulb,
  faSpinner,
  faMicrophone,
  faKeyboard,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "@/components/voice-recorder";
import SpeechSynthesis from "@/components/speech-synthesis";
import { toast } from "sonner";
import { useTravelStore, QUESTIONS } from "@/lib/store/travel-store";

// Enhanced icons for better visual representation
const ICONS = [
  faGlobe, // Destination
  faDollarSign, // Budget
  faCalendarAlt, // Dates
  faUser, // Number of people
  faUtensils, // Interests
  faBed, // Accommodation
  faClock, // Pace
  faPlane, // Transportation
  faMapMarkerAlt, // Must-see places
];

// Helpful hints for each question
const HINTS = [
  "Enter a city, country, or region you'd like to visit",
  "Specify your budget (e.g., $1000, €2000, budget-friendly)",
  "When do you plan to travel? (e.g., June 2025, next month)",
  "How many people are traveling? Include adults and children",
  "What activities interest you? (e.g., hiking, museums, food)",
  "Preferred accommodation type (e.g., hotel, hostel, Airbnb)",
  "How do you like to travel? (relaxed, moderate, packed schedule)",
  "How will you get around? (e.g., public transit, rental car)",
  "Any specific attractions or places you don't want to miss?",
];

interface TripFormProps {
  onFormComplete: () => void;
}

export default function TripForm({ onFormComplete }: TripFormProps) {
  const {
    answers,
    currentQuestion,
    isSubmitting,
    isVoiceEnabled,
    setAnswer,
    setCurrentQuestion,
    setIsGenerating,
  } = useTravelStore();

  // Local state for the current input
  const [currentInput, setCurrentInput] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loadingState, setLoadingState] = useState<
    "idle" | "validating" | "submitting" | "processing"
  >("idle");
  const [networkError, setNetworkError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Validate input based on question type
  const validateInput = useCallback(
    async (input: string): Promise<boolean> => {
      setValidationMessage("");
      setNetworkError(null);
      setLoadingState("validating");

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("/api/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionIndex: currentQuestion,
            answer: input,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Validation request failed: ${errorText}`);
        }

        const { valid, message } = await response.json();

        if (!valid) {
          setValidationMessage(message);
          setLoadingState("idle");
          return false;
        }

        setLoadingState("idle");
        return true;
      } catch (error) {
        console.error("Error validating input:", error);
        if (error instanceof Error && error.name === "AbortError") {
          setNetworkError("Validation request timed out. Please try again.");
        } else {
          // For other errors, we'll continue but show a warning
          setNetworkError("Network issue with validation. Proceeding anyway.");
          toast.warning("Could not validate input, but you can continue.");
        }
        setLoadingState("idle");
        return true; // Allow to continue on error
      }
    },
    [currentQuestion]
  );

  // Handle form submission for each question
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Skip if empty
      if (!currentInput.trim()) {
        toast.error("Please provide an answer before continuing.");
        return;
      }

      // Validate input
      setIsTyping(true);
      setIsValidating(true);
      setLoadingState("submitting");
      const isValid = await validateInput(currentInput);
      setIsValidating(false);
      setIsTyping(false);

      if (!isValid) {
        setLoadingState("idle");
        return;
      }

      try {
        // Show different loading message based on current question
        if (currentQuestion < QUESTIONS.length - 1) {
          // Save answer and move to next question
          setAnswer(currentQuestion, currentInput);
          setCurrentQuestion(currentQuestion + 1);
        } else {
          // All questions answered, prepare to generate itinerary
          setAnswer(currentQuestion, currentInput);
          toast.success("Great! Generating your personalized itinerary...", {
            duration: 5000,
            id: "generating-itinerary",
          });
          setIsGenerating(true);
          setLoadingState("processing");

          // Small delay to ensure state is updated before proceeding
          setTimeout(() => {
            onFormComplete();
          }, 100);
        }
      } catch (error) {
        console.error("Error during submission:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setLoadingState("idle");
      }
    },
    [
      currentInput,
      validateInput,
      setAnswer,
      currentQuestion,
      setCurrentQuestion,
      setIsGenerating,
      onFormComplete,
    ]
  );

  // Initialize welcome message
  useEffect(() => {
    setWelcomeMessage(
      "Welcome to TravelHub! I'll help you create a personalized travel itinerary. Let's start planning your dream trip!"
    );
  }, []);

  // Clear input when moving between questions and focus the input field
  useEffect(() => {
    setCurrentInput(answers[currentQuestion] || "");
    setShowHint(false);

    // Focus the input field after a short delay to ensure the animation completes
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [currentQuestion, answers]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Right to go to next question
      if (
        e.altKey &&
        e.key === "ArrowRight" &&
        currentQuestion < QUESTIONS.length - 1
      ) {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }

      // Alt+Left to go to previous question
      if (e.altKey && e.key === "ArrowLeft" && currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, currentInput, handleSubmit, setCurrentQuestion]);

  // Handle voice recording result
  const handleTranscription = (text: string) => {
    if (text) {
      setCurrentInput(text);
      toast.success("Voice input received!");

      // Auto-submit for simple answers
      if (currentQuestion < 4) {
        setTimeout(() => {
          // Create a synthetic form event that is compatible with React's FormEvent type
          const syntheticEvent = {
            preventDefault: () => {},
          } as React.FormEvent;

          handleSubmit(syntheticEvent);
        }, 500);
      }
    }
  };

  return (
    <Card className="border-0 shadow-2xl rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: "url('/globe.svg')",
            backgroundSize: "600px",
            backgroundRepeat: "repeat",
          }}
        />

        <CardTitle className="text-3xl font-bold mb-2 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Plan Your Dream Trip
          </motion.span>
        </CardTitle>

        <CardDescription className="text-blue-100 text-lg relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Answer a few questions and our AI will create a personalized travel
            itinerary just for you
          </motion.span>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        {/* Welcome message and speech */}
        <SpeechSynthesis text={welcomeMessage} enabled={isVoiceEnabled} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-8">
                {/* Current question */}
                <div className="flex flex-col space-y-5">
                  <motion.div
                    className="flex items-center space-x-4"
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <FontAwesomeIcon
                        icon={ICONS[currentQuestion]}
                        className="h-7 w-7 text-white"
                      />
                    </div>
                    <motion.h3
                      className="text-2xl font-medium text-gray-800 dark:text-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {QUESTIONS[currentQuestion]}
                    </motion.h3>
                  </motion.div>

                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {/* Hint text */}
                    <div className="mb-3">
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: showHint ? "auto" : 0,
                          opacity: showHint ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                          <div className="flex gap-2 items-center">
                            <FontAwesomeIcon
                              icon={faLightbulb}
                              className="text-blue-500"
                            />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {HINTS[currentQuestion]}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Input field based on question type */}
                    <div className="relative">
                      {currentQuestion === 4 || currentQuestion === 8 ? (
                        <Textarea
                          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          placeholder={`Type your answer here... (e.g., ${HINTS[currentQuestion]})`}
                          className="w-full min-h-[120px] rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base p-4 pr-10 shadow-sm"
                        />
                      ) : (
                        <Input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="text"
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          placeholder={`Type your answer here... (e.g., ${HINTS[currentQuestion]})`}
                          className="w-full h-14 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base p-4 pr-10 shadow-sm"
                        />
                      )}

                      {/* Show/hide hint button */}
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={showHint ? "Hide hint" : "Show hint"}
                      >
                        <FontAwesomeIcon icon={faLightbulb} />
                      </button>
                    </div>

                    {/* Voice input with improved styling */}
                    <div className="flex justify-between mt-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <FontAwesomeIcon icon={faKeyboard} className="mr-1.5" />
                        <span>Alt + Arrow keys to navigate questions</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isVoiceEnabled && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full"
                          >
                            <FontAwesomeIcon
                              icon={faMicrophone}
                              className="text-blue-500"
                            />
                            <span>Tap to speak</span>
                          </motion.div>
                        )}
                        <VoiceRecorder
                          onTranscription={handleTranscription}
                          questionIndex={currentQuestion}
                          isEnabled={isVoiceEnabled}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {validationMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-red-500 text-sm px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                          {validationMessage}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enhanced progress indicator */}
                <div className="pt-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-semibold mr-2">
                        {currentQuestion + 1}/{QUESTIONS.length}
                      </span>
                      {currentQuestion < QUESTIONS.length - 1
                        ? "Almost there!"
                        : "Final question!"}
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {Math.round(
                        ((currentQuestion + 1) / QUESTIONS.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      initial={{
                        width: `${(currentQuestion / QUESTIONS.length) * 100}%`,
                      }}
                      animate={{
                        width: `${
                          ((currentQuestion + 1) / QUESTIONS.length) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      {/* Navigation buttons in their own CardFooter */}
      <CardFooter className="px-8 pb-8 pt-0">
        <div className="flex justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)
            }
            disabled={currentQuestion === 0}
            className="px-6 py-3 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-lg shadow-sm"
            aria-label="Go back to previous question"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </Button>

          <Button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={isSubmitting || isTyping || !currentInput.trim()}
            className={`px-6 py-3 ${
              currentQuestion < QUESTIONS.length - 1
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            } transition-all duration-200 rounded-lg shadow-md`}
            aria-label={
              currentQuestion < QUESTIONS.length - 1
                ? "Go to next question"
                : "Generate your travel itinerary"
            }
          >
            {isTyping ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="mr-2 animate-spin"
                />
                Validating...
              </>
            ) : currentQuestion < QUESTIONS.length - 1 ? (
              <>
                Next
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </>
            ) : (
              <>
                Generate Itinerary
                <FontAwesomeIcon icon={faGlobe} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
