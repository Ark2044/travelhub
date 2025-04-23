"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useTravelStore } from "@/lib/store/travel-store";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { conversationService } from "@/lib/appwrite/conversation-service";

export default function ItinerarySavePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const {
    generatedItinerary,
    answers,
    currentDestination,
    currentConversationId,
    setCurrentConversation,
  } = useTravelStore();

  // Check if we should show the save prompt when login state changes
  useEffect(() => {
    // Only show the prompt if:
    // 1. User is authenticated
    // 2. There is a generated itinerary
    // 3. There is no associated conversation ID (meaning it was created as a guest)
    if (isAuthenticated && generatedItinerary && !currentConversationId) {
      setShowPrompt(true);
    }
  }, [isAuthenticated, generatedItinerary, currentConversationId]);

  const handleSaveItinerary = async () => {
    try {
      // Save itinerary to the user's account
      const conversationId = await conversationService.create(
        currentDestination
      );

      // Store preferences
      await conversationService.storePreferences(conversationId, {
        destination: answers[0],
        budget: answers[1],
        dates: answers[2],
        num_travelers: answers[3],
        interests: answers[4],
        accommodation_preference: answers[5],
        pace_preference: answers[6],
        transport_preference: answers[7],
        must_see_places: answers[8],
      });

      // Add the itinerary as a message
      await conversationService.addMessage(
        conversationId,
        generatedItinerary,
        false
      );

      // Update the store with the new conversation ID
      setCurrentConversation(conversationId);

      toast.success("Your itinerary was saved to your account!");
      setShowPrompt(false);
    } catch (error) {
      console.error("Error saving itinerary:", error);
      toast.error("Failed to save your itinerary. Please try again later.");
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          Save Your Itinerary
        </h3>
        <button
          onClick={dismissPrompt}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        Welcome {user?.name}! We noticed you've created an itinerary. Would you
        like to save it to your account to access it later?
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleSaveItinerary}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 px-4 text-center flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          Save Itinerary
        </button>
        <button
          onClick={dismissPrompt}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg py-2 px-4 text-center"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
