"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useTravelStore } from "@/lib/store/travel-store";
import { generatePDF } from "@/lib/services/utils-service";

interface ItineraryDisplayProps {
  onNewTripClick: () => void;
}

export default function ItineraryDisplay({
  onNewTripClick,
}: ItineraryDisplayProps) {
  const { answers, generatedItinerary, images, resetCurrentSession } =
    useTravelStore();

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Download PDF itinerary
  const downloadPDF = () => {
    if (!pdfBlob && generatedItinerary) {
      // Create PDF if it doesn't exist yet
      const pdfOptions = {
        destination: answers[0],
        dates: answers[2],
        itineraryText: generatedItinerary,
        preferences: answers,
        questions: [], // We can pass QUESTIONS here if needed
      };

      const blob = generatePDF(pdfOptions);
      setPdfBlob(blob);
      handleDownload(blob);
    } else if (pdfBlob) {
      handleDownload(pdfBlob);
    }
  };

  // Handle the actual download
  const handleDownload = (blob: Blob) => {
    const fileName = `itinerary_${answers[0].replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success("Itinerary downloaded successfully!");
  };

  // Start a new itinerary
  const startNewItinerary = () => {
    resetCurrentSession();
    onNewTripClick();
  };

  if (!generatedItinerary) {
    return (
      <Card className="border-0 shadow-xl rounded-xl overflow-hidden max-w-2xl mx-auto">
        <CardContent className="pt-10 pb-10">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 p-4 mb-6">
              <FontAwesomeIcon
                icon={faPlus}
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
              />
            </div>
            <h3 className="text-2xl font-medium mb-2">No itinerary yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Start by answering a few questions about your trip preferences and
              we&apos;ll create a personalized itinerary for you
            </p>
            <Button
              className="px-8 py-3 h-auto bg-blue-600 hover:bg-blue-700"
              onClick={onNewTripClick}
            >
              Create New Itinerary
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section with Destination Image */}
      <div className="relative w-full h-96 rounded-3xl overflow-hidden mb-8 shadow-xl">
        {images.length > 0 ? (
          <Image
            src={images[0].url}
            alt={`${answers[0]} skyline`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-full"></div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>

        {/* Floating info panel */}
        <div className="absolute bottom-0 w-full p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {answers[0]}
              </h1>
              <div className="flex flex-wrap gap-3 text-white">
                <span className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {answers[2]}
                </span>
                <span className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {answers[3]} travelers
                </span>
                <span className="bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {answers[1]}
                </span>
              </div>
            </div>

            <Button
              onClick={downloadPDF}
              className="mt-4 md:mt-0 bg-white hover:bg-gray-100 text-gray-900 px-6 py-2.5"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - itinerary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trip summary cards */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-gray-900 pb-3 border-b">
              <CardTitle>
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Your Travel Experience
                </h3>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Accommodation
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {answers[5]}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Pace
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {answers[6]}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Transportation
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {answers[7]}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Interests
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {answers[4]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed itinerary */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-gray-900 pb-3 border-b">
              <CardTitle>
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200">
                  Your Itinerary
                </h3>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                {generatedItinerary.split("\n\n").map((paragraph, idx) => (
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with destination images and information */}
        <div className="space-y-8">
          {/* Destination highlights */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-gray-900 pb-3 border-b">
              <CardTitle>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Destination Highlights
                </h3>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {images.slice(1, 7).map((image, idx) => (
                    <div
                      key={idx}
                      className="relative h-24 md:h-32 rounded-xl overflow-hidden shadow-sm"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || "Destination image"}
                        className="object-cover hover:scale-110 transition-transform duration-500"
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Must-see places */}
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-gray-900 pb-3 border-b">
              <CardTitle>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                  Must-See Places
                </h3>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-gray-700 dark:text-gray-300">
                <p>{answers[8] || "No specific must-see places specified."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={downloadPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 h-auto"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Download Itinerary PDF
            </Button>
            <Button
              onClick={startNewItinerary}
              variant="outline"
              className="w-full py-3 h-auto"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Plan Another Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
