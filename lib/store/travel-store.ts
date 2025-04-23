import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  Conversation,
  Message,
  TravelPreference,
} from "../appwrite/conversation-service";

// Define types for our questions
export const QUESTIONS = [
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

export interface TravelImage {
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  category: string;
}

export interface TravelState {
  // Current conversation
  currentConversationId: string | null;
  currentDestination: string;
  answers: string[];
  currentQuestion: number;
  isSubmitting: boolean;
  isGenerating: boolean;
  isVoiceEnabled: boolean;

  // Generated content
  generatedItinerary: string;
  pdfUrl: string | null;

  // Conversation history
  conversations: Conversation[];
  currentMessages: Message[];
  currentPreferences: TravelPreference | null;

  // Images
  images: TravelImage[];

  // Methods
  setCurrentQuestion: (index: number) => void;
  setAnswer: (index: number, answer: string) => void;
  setIsSubmitting: (value: boolean) => void;
  setIsGenerating: (value: boolean) => void;
  setGeneratedItinerary: (itinerary: string) => void;
  setPdfUrl: (url: string | null) => void;
  setCurrentConversation: (id: string | null) => void;
  setCurrentDestination: (destination: string) => void;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentMessages: (messages: Message[]) => void;
  setCurrentPreferences: (preferences: TravelPreference | null) => void;
  addMessage: (message: Message) => void;
  setImages: (images: TravelImage[]) => void;
  toggleVoice: (enabled: boolean) => void;
  resetCurrentSession: () => void;
  fetchDestinationImages: () => Promise<void>;
  generateTravelPlan: () => Promise<
    | {
        success: boolean;
        conversationId?: string | null;
        error?: string;
      }
    | undefined
  >;
}

// Create Zustand store with Immer and Persist middleware
export const useTravelStore = create<TravelState>()(
  persist(
    immer((set, get) => ({
      currentConversationId: null,
      currentDestination: "",
      answers: Array(QUESTIONS.length).fill(""),
      currentQuestion: 0,
      isSubmitting: false,
      isGenerating: false,
      isVoiceEnabled: true,

      generatedItinerary: "",
      pdfUrl: null,

      conversations: [],
      currentMessages: [],
      currentPreferences: null,

      images: [],

      setCurrentQuestion: (index) =>
        set((state) => {
          state.currentQuestion = index;
        }),

      setAnswer: (index, answer) =>
        set((state) => {
          state.answers[index] = answer;
          if (index === 0) state.currentDestination = answer;
        }),

      setIsSubmitting: (value) =>
        set((state) => {
          state.isSubmitting = value;
        }),

      setIsGenerating: (value) =>
        set((state) => {
          state.isGenerating = value;
        }),

      setGeneratedItinerary: (itinerary) =>
        set((state) => {
          state.generatedItinerary = itinerary;
        }),

      setPdfUrl: (url) =>
        set((state) => {
          state.pdfUrl = url;
        }),

      setCurrentConversation: (id) =>
        set((state) => {
          state.currentConversationId = id;
        }),

      setCurrentDestination: (destination) =>
        set((state) => {
          state.currentDestination = destination;
        }),

      setConversations: (conversations) =>
        set((state) => {
          state.conversations = conversations;
        }),

      setCurrentMessages: (messages) =>
        set((state) => {
          state.currentMessages = messages;
        }),

      setCurrentPreferences: (preferences) =>
        set((state) => {
          state.currentPreferences = preferences;
        }),

      addMessage: (message) =>
        set((state) => {
          state.currentMessages = [...state.currentMessages, message];
        }),

      setImages: (images) =>
        set((state) => {
          state.images = images;
        }),

      toggleVoice: (enabled) =>
        set((state) => {
          state.isVoiceEnabled = enabled;
        }),

      resetCurrentSession: () =>
        set((state) => {
          state.answers = Array(QUESTIONS.length).fill("");
          state.currentQuestion = 0;
          state.generatedItinerary = "";
          state.pdfUrl = null;
          state.currentConversationId = null;
          state.currentDestination = "";
          state.currentMessages = [];
          state.currentPreferences = null;
          state.images = [];
        }),

      fetchDestinationImages: async () => {
        const state = get();
        const destination = state.currentDestination;
        if (!destination) return;

        try {
          set((state) => {
            state.isSubmitting = true;
          });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch("/api/search-images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ destination }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Failed to fetch images (${response.status})`
            );
          }

          const data = await response.json();
          set((state) => {
            state.images = data.images || [];
            state.isSubmitting = false;
          });
        } catch (error) {
          console.error("Error fetching destination images:", error);
          // Return fallback image if possible
          set((state) => {
            // Only set empty images if there are none already (preserves previously fetched)
            if (state.images.length === 0) {
              state.images = [
                {
                  url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
                  thumb:
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200",
                  alt: "Travel destination",
                  credit: "Unsplash",
                  category: "landscape",
                },
              ];
            }
            state.isSubmitting = false;
          });
        }
      },

      generateTravelPlan: async () => {
        const state = get();
        if (state.answers.some((answer) => !answer)) return;

        try {
          set((state) => {
            state.isGenerating = true;
          });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for AI generation

          const response = await fetch("/api/generate-itinerary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              destination: state.currentDestination,
              answers: state.answers,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error ||
                errorData.details ||
                `Failed to generate itinerary (${response.status})`
            );
          }

          const data = await response.json();

          set((state) => {
            state.generatedItinerary = data.itinerary || "";
            if (data.conversationId) {
              state.currentConversationId = data.conversationId;
            }
            state.isGenerating = false;
          });

          return {
            success: true,
            conversationId: data.conversationId,
          };
        } catch (error) {
          console.error("Error generating travel plan:", error);

          // Show a more user-friendly error message while keeping the app usable
          const errorMessage =
            error instanceof Error
              ? error.message.includes("abort")
                ? "Request timed out. Please try again."
                : error.message
              : "Failed to generate itinerary";

          set((state) => {
            state.isGenerating = false;
          });

          return {
            success: false,
            error: errorMessage,
          };
        }
      },
    })),
    {
      name: "travel-planner-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
              return null;
            }

            const value = localStorage.getItem(name);
            if (!value) return null;

            // Parse and check size
            const parsed = JSON.parse(value);
            const storageSizeMB = (value.length * 2) / (1024 * 1024);

            // Log size info to help with debugging (5MB is a common limit)
            if (storageSizeMB > 2) {
              console.warn(
                `TravelHub storage reaching ${storageSizeMB.toFixed(
                  2
                )}MB (browser limit 5MB)`
              );
            }

            return parsed;
          } catch (error) {
            console.error("Error reading from localStorage:", error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
              return;
            }

            // Convert to string to check size
            const stringValue = JSON.stringify(value);
            const storageSizeMB = (stringValue.length * 2) / (1024 * 1024);

            // If we're approaching local storage limits (5MB), trim data
            if (storageSizeMB > 4) {
              // Create a trimmed version with essential data only
              // First convert to unknown, then to Record type to avoid direct string conversion error
              const valueObj = value as unknown as {
                generatedItinerary?: string;
                images?: { url: string; thumb: string; alt: string; credit: string; category: string }[];
              };
              const trimmedValue = {
                ...valueObj,
                // Keep only minimal data needed for user experience
                generatedItinerary:
                  typeof valueObj.generatedItinerary === "string"
                    ? valueObj.generatedItinerary.substring(0, 1000) +
                      "... (trimmed)"
                    : "",
                images: Array.isArray(valueObj.images)
                  ? valueObj.images.slice(0, 3)
                  : [],
              };
              localStorage.setItem(name, JSON.stringify(trimmedValue));
              console.warn(
                `TravelHub storage trimmed to prevent browser limits (${storageSizeMB.toFixed(
                  2
                )}MB)`
              );
              return;
            }

            localStorage.setItem(name, stringValue);
          } catch (error) {
            console.error("Error saving to localStorage:", error);
          }
        },
        removeItem: (name) => {
          try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
              return;
            }

            localStorage.removeItem(name);
          } catch (error) {
            console.error("Error removing from localStorage:", error);
          }
        },
      })),
      partialize: (state) => ({
        currentConversationId: state.currentConversationId,
        currentDestination: state.currentDestination,
        answers: state.answers,
        currentQuestion: state.currentQuestion,
        isVoiceEnabled: state.isVoiceEnabled,
        // Limit what we store in localStorage to prevent size issues
        generatedItinerary: state.generatedItinerary
          ? state.generatedItinerary.length > 5000
            ? state.generatedItinerary.substring(0, 5000) + "... (truncated)"
            : state.generatedItinerary
          : "",
      }),
    }
  )
);
