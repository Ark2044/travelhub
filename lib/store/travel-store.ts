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
  generateTravelPlan: () => Promise<void>;
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

          // You would implement the API call here
          // This is a placeholder implementation
          const response = await fetch("/api/search-images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ destination }),
          });

          if (!response.ok) throw new Error("Failed to fetch images");

          const data = await response.json();
          set((state) => {
            state.images = data.images || [];
            state.isSubmitting = false;
          });
        } catch (error) {
          console.error("Error fetching destination images:", error);
          set((state) => {
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

          // You would implement the API call here
          // This is a placeholder implementation
          const response = await fetch("/api/generate-itinerary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              destination: state.currentDestination,
              preferences: state.answers,
            }),
          });

          if (!response.ok) throw new Error("Failed to generate itinerary");

          const data = await response.json();
          set((state) => {
            state.generatedItinerary = data.itinerary || "";
            state.isGenerating = false;
          });
        } catch (error) {
          console.error("Error generating travel plan:", error);
          set((state) => {
            state.isGenerating = false;
          });
        }
      },
    })),
    {
      name: "travel-planner-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentConversationId: state.currentConversationId,
        currentDestination: state.currentDestination,
        answers: state.answers,
        currentQuestion: state.currentQuestion,
        isVoiceEnabled: state.isVoiceEnabled,
      }),
    }
  )
);
