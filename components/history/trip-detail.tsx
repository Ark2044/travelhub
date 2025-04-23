"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faArrowLeft,
  faDownload,
  faCalendarAlt,
  faUserFriends,
  faMoneyBill,
  faHotel,
  faRoad,
  faUtensils,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { generatePDF } from "@/lib/services/utils-service";
import { QUESTIONS } from "@/lib/store/travel-store";
import { Message } from "@/lib/appwrite/conversation-service";

// Define interfaces for the trip object structure
interface TravelPreferences {
  destination: string;
  budget: string;
  dates: string;
  num_travelers: string;
  interests: string;
  accommodation_preference: string;
  pace_preference: string;
  transport_preference: string;
  must_see_places?: string;
}

interface Trip {
  id: string;
  preferences: TravelPreferences;
  itinerary: string;
  created_at?: string | Date;
  messages?: Message[]; // Using the imported Message interface
}

interface TripDetailProps {
  trip: Trip | null; // The selected trip with all details
  onBackClick: () => void;
}

export default function TripDetail({ trip, onBackClick }: TripDetailProps) {
  if (!trip) {
    return (
      <Card className="border-0 shadow-xl rounded-xl overflow-hidden max-w-2xl mx-auto">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 p-6 mb-6">
            <FontAwesomeIcon
              icon={faGlobe}
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
            />
          </div>
          <h3 className="text-2xl font-medium mb-3">No itinerary selected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Select an itinerary from the list to view its details
          </p>
          <Button
            variant="outline"
            onClick={onBackClick}
            className="px-6 py-2.5 h-auto"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            View All Itineraries
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Download the itinerary as PDF
  const downloadItinerary = () => {
    try {
      const { preferences, itinerary } = trip;

      // Create PDF options with properly handled must_see_places field
      const pdfOptions = {
        destination: preferences.destination,
        dates: preferences.dates,
        itineraryText: itinerary,
        preferences: [
          preferences.destination,
          preferences.budget,
          preferences.dates,
          preferences.num_travelers,
          preferences.interests,
          preferences.accommodation_preference,
          preferences.pace_preference,
          preferences.transport_preference,
          // Ensure must_see_places is never undefined in the array
          preferences.must_see_places || "",
        ],
        questions: QUESTIONS,
      };

      // Generate PDF
      const blob = generatePDF(pdfOptions);

      // Create download link
      const url = URL.createObjectURL(blob);
      const fileName = `itinerary_${preferences.destination.replace(
        /\s+/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Itinerary downloaded!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download itinerary");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main itinerary content */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-xl rounded-xl overflow-hidden mb-8">
          {/* Header with destination details */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {trip.preferences.destination}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-white">
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="mr-1.5"
                      />
                      {trip.preferences.dates}
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                      <FontAwesomeIcon
                        icon={faUserFriends}
                        className="mr-1.5"
                      />
                      {trip.preferences.num_travelers} travelers
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                      <FontAwesomeIcon icon={faMoneyBill} className="mr-1.5" />
                      {trip.preferences.budget}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={downloadItinerary}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Itinerary content */}
          <CardContent className="pt-6">
            {/* Detailed itinerary */}
            <div>
              <h3 className="text-xl font-medium mb-4 flex items-center text-gray-800 dark:text-gray-200">
                <FontAwesomeIcon
                  icon={faMapMarkedAlt}
                  className="h-5 w-5 mr-2 text-blue-500"
                />
                Complete Itinerary
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                {trip.itinerary
                  .split("\n\n")
                  .map((paragraph: string, idx: number) => (
                    <div key={idx} className="mb-6">
                      {paragraph.trim() === paragraph.toUpperCase() ? (
                        <div className="flex items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-300 font-bold">
                              {idx + 1}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 m-0">
                            {paragraph}
                          </h3>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with trip details */}
      <div className="space-y-6">
        {/* Trip preferences */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-white dark:bg-gray-900 pb-3 border-b">
            <CardTitle className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                <FontAwesomeIcon
                  icon={faGlobe}
                  className="h-4 w-4 text-blue-600 dark:text-blue-400"
                />
              </span>
              Trip Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 px-5">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className="text-blue-500 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Budget
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {trip.preferences.budget}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <FontAwesomeIcon
                    icon={faUtensils}
                    className="text-blue-500 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Interests
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {trip.preferences.interests}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <FontAwesomeIcon
                    icon={faHotel}
                    className="text-blue-500 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Accommodation
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {trip.preferences.accommodation_preference}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                  <FontAwesomeIcon
                    icon={faRoad}
                    className="text-blue-500 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Transportation
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {trip.preferences.transport_preference}
                  </p>
                </div>
              </div>
            </div>

            {trip.preferences.must_see_places && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Must-See Places
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {trip.preferences.must_see_places}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={downloadItinerary}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 h-auto"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={onBackClick}
            className="w-full py-3 h-auto"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to All Itineraries
          </Button>
        </div>

        {/* Trip metadata */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          Created on{" "}
          {trip.created_at
            ? format(new Date(trip.created_at), "MMMM d, yyyy")
            : "Unknown date"}
        </div>
      </div>
    </div>
  );
}
