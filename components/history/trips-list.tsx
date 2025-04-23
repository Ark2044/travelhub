"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faUserFriends,
  faEye,
  faGlobe,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Trip {
  id: string;
  destination: string;
  created_at: string;
  num_travelers: string;
  dates: string;
}

interface TripsListProps {
  trips: Trip[];
  isLoading: boolean;
  onTripSelect: (tripId: string) => void;
  searchTerm: string;
}

export default function TripsList({
  trips,
  isLoading,
  onTripSelect,
  searchTerm,
}: TripsListProps) {
  // Filter trips based on search term
  const filteredTrips = trips.filter((trip) => {
    if (!searchTerm.trim()) return true;
    return trip.destination?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-16 h-16">
          <svg
            className="animate-spin h-full w-full text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  if (filteredTrips.length === 0) {
    return (
      <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 p-6 mb-6">
            <FontAwesomeIcon
              icon={faGlobe}
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
            />
          </div>
          <h3 className="text-2xl font-medium mb-3">
            {searchTerm ? "No matching trips found" : "No travel history yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {searchTerm
              ? `Try a different search term to find your trips.`
              : `You haven't created any travel itineraries yet. Start planning your next adventure!`}
          </p>
          {!searchTerm && (
            <Link href="/">
              <Button className="px-8 py-2.5 h-auto bg-blue-600 hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Create Your First Itinerary
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTrips.map((trip) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
          className="h-full"
        >
          <Card
            className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg rounded-xl"
            onClick={() => onTripSelect(trip.id)}
          >
            <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-400 relative">
              <div className="absolute inset-0 opacity-20">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 L100,0 L100,100 L0,100 Z"
                    fill="url(#world-map)"
                  />
                </svg>
                <defs>
                  <pattern
                    id="world-map"
                    patternUnits="userSpaceOnUse"
                    width="100"
                    height="100"
                  >
                    <image
                      href="/globe.svg"
                      x="0"
                      y="0"
                      width="100"
                      height="100"
                    />
                  </pattern>
                </defs>
              </div>
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-end">
                  <div className="text-xs font-medium text-white bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-1.5 text-xs"
                    />
                    {trip.created_at
                      ? format(new Date(trip.created_at), "MMM d, yyyy")
                      : "Unknown date"}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {trip.destination}
                </h3>
              </div>
            </div>

            <CardContent className="pt-4 pb-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="inline-flex items-center text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                  <FontAwesomeIcon icon={faUserFriends} className="mr-1.5" />
                  {trip.num_travelers || "Unknown"} travelers
                </div>
                <div className="inline-flex items-center text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1.5" />
                  {trip.dates || "No dates"}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onTripSelect(trip.id);
                }}
              >
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                View Itinerary
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
