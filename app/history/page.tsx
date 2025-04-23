"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faMapMarkedAlt,
  faTimes,
  faSearchLocation,
} from "@fortawesome/free-solid-svg-icons";
import {
  conversationService,
  Conversation,
  Message,
  TravelPreference,
} from "@/lib/appwrite/conversation-service";
import { useTravelStore } from "@/lib/store/travel-store";

// Import our custom components
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Hero from "@/components/layout/hero";
import TripsList from "@/components/history/trips-list";
import TripDetail from "@/components/history/trip-detail";

// Define an interface for the selected conversation that includes all related data
interface ConversationWithDetails extends Conversation {
  messages: Message[];
  preferences: TravelPreference | null;
  itinerary: string;
}

// Define the Trip interface to match what TripsList component expects
interface Trip {
  id: string;
  destination: string;
  created_at: string;
  num_travelers: string;
  dates: string;
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const { setGeneratedItinerary } = useTravelStore();

  // Load conversations on page load
  useEffect(() => {
    loadConversations();
  }, []);

  // Load all conversations from Appwrite
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const conversations = await conversationService.listAll();
      setConversations(conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load your travel history");
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific conversation
  const loadConversation = async (id: string) => {
    setIsLoading(true);
    try {
      // Get conversation details
      const conversation = await conversationService.get(id);

      // Get messages for this conversation
      const messages = await conversationService.getMessages(id);

      // Get preferences for this conversation
      const preferences = await conversationService.getPreferences(id);

      if (!conversation || !messages.length || !preferences) {
        toast.error("Could not load this trip data");
        return;
      }

      // Find the itinerary message (non-user message)
      const itineraryMessage = messages.find((m) => !m.is_user);

      if (!itineraryMessage) {
        toast.error("Could not find itinerary data for this trip");
        return;
      }

      // Update the store with the itinerary content
      setGeneratedItinerary(itineraryMessage.content);

      // Set the selected conversation with all data
      setSelectedConversation({
        ...conversation,
        messages,
        preferences,
        itinerary: itineraryMessage.content,
      });

      // Switch to detail tab
      setActiveTab("detail");
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load trip details");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert conversations to trips format
  const conversationsToTrips = (conversations: Conversation[]): Trip[] => {
    return conversations.map((conversation) => ({
      id: conversation.id || "",
      destination: conversation.destination,
      created_at: conversation.created_at
        ? conversation.created_at.toString()
        : "",
      num_travelers: "Unknown", // Default values since these aren't in the Conversation type
      dates: "No dates",
    }));
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero section with navbar */}
      <div className="relative">
        <Navbar transparent={true} showBackButton={true} />

        <Hero
          title="Your Travel History"
          highlightedWord="Travel"
          subtitle="Access and manage all your past trips and itineraries"
          bgImage="https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          height="h-[50vh]"
          overlayOpacity="from-black/70 via-black/50 to-black/70"
        />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <Tabs
          defaultValue="list"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex items-center justify-between mb-8">
            <TabsList className="h-12">
              <TabsTrigger value="list" className="px-6 h-full">
                <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                All Itineraries
              </TabsTrigger>
              <TabsTrigger
                value="detail"
                disabled={!selectedConversation}
                className="px-6 h-full"
              >
                <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
                Itinerary Details
              </TabsTrigger>
            </TabsList>

            {activeTab === "list" && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FontAwesomeIcon
                  icon={searchTerm ? faTimes : faSearchLocation}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => (searchTerm ? setSearchTerm("") : null)}
                />
              </div>
            )}
          </div>

          <TabsContent value="list">
            <TripsList
              trips={conversationsToTrips(conversations)}
              isLoading={isLoading}
              onTripSelect={loadConversation}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value="detail">
            <TripDetail
              trip={selectedConversation}
              onBackClick={() => setActiveTab("list")}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
