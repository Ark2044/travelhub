"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTravelStore } from "@/lib/store/travel-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faPlus,
  faSuitcase,
  faHistory,
  faClock,
  faMapMarkedAlt,
  faCompass,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import our custom components
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Hero from "@/components/layout/hero";
import TripForm from "@/components/home/trip-form";
import ItineraryDisplay from "@/components/home/itinerary-display";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  // Access travel store state
  const {
    isGenerating,
    isVoiceEnabled,
    generatedItinerary,
    toggleVoice,
    fetchDestinationImages,
    generateTravelPlan,
  } = useTravelStore();

  const [activeTab, setActiveTab] = useState("new");

  // Handle form completion (when all questions are answered)
  const handleFormComplete = async () => {
    try {
      // Fetch destination images
      await fetchDestinationImages();

      // Generate the itinerary
      await generateTravelPlan();

      // Switch to result tab
      setActiveTab("result");
    } catch (error) {
      console.error("Error generating itinerary:", error);
      toast.error("An error occurred while generating your itinerary.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero section with navbar */}
      <div className="relative">
        <Navbar
          isVoiceEnabled={isVoiceEnabled}
          toggleVoice={() => toggleVoice(!isVoiceEnabled)}
          transparent={true}
        />

        <Hero
          title="Discover Your Perfect Journey"
          highlightedWord="Journey"
          subtitle="AI-powered itineraries customized to your travel style and preferences"
          bgImage="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb"
          actions={[
            {
              label: "Create Travel Plan",
              href: "#plan",
              icon: faSuitcase,
              onClick: () => setActiveTab("new"),
            },
            {
              label: "View Past Trips",
              href: "/history",
              icon: faHistory,
              variant: "outline",
            },
          ]}
        />
      </div>

      {/* Main content area below hero */}
      <div
        id="plan"
        className="container max-w-6xl mx-auto px-4 py-16 scroll-mt-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-emerald-600 dark:text-emerald-400">Plan</span>{" "}
            Your Next Adventure
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Let our AI help you create the perfect travel itinerary tailored to
            your preferences
          </p>
        </motion.div>

        <Tabs
          defaultValue="new"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 rounded-full p-1 bg-gray-100 dark:bg-gray-800/50">
            <TabsTrigger
              value="new"
              className="py-3 rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Trip
            </TabsTrigger>
            <TabsTrigger
              value="result"
              disabled={!generatedItinerary}
              className="py-3 rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              <FontAwesomeIcon icon={faGlobe} className="mr-2" />
              Your Itinerary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-800">
              {/* Trip form component */}
              <TripForm onFormComplete={handleFormComplete} />
            </div>
          </TabsContent>

          <TabsContent value="result">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="w-20 h-20 mb-8 text-emerald-600">
                  <svg
                    className="animate-spin h-full w-full"
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
                <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-200 text-center mb-3">
                  Creating your perfect travel experience
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  Our AI is crafting a personalized itinerary tailored just for
                  you...
                </p>
              </div>
            ) : (
              <ItineraryDisplay onNewTripClick={() => setActiveTab("new")} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Features section */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                TravelHub
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We leverage AI technology to create personalized travel
              experiences tailored to your preferences
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group hover:-translate-y-1 duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <FontAwesomeIcon
                  icon={faCompass}
                  className="text-emerald-600 dark:text-emerald-400 text-xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Personalized Itineraries
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get a custom travel plan built around your interests, budget,
                and travel style with recommendations tailored just for you
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group hover:-translate-y-1 duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-emerald-600 dark:text-emerald-400 text-xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Save Planning Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create detailed day-by-day itineraries in seconds instead of
                spending hours researching destinations and attractions
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 group hover:-translate-y-1 duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <FontAwesomeIcon
                  icon={faMapMarkedAlt}
                  className="text-emerald-600 dark:text-emerald-400 text-xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Discover Hidden Gems
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find lesser-known attractions and local favorites that most
                tourists miss for a more authentic travel experience
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* How it works section */}
      <div className="py-20 bg-white dark:bg-gray-950">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                It Works
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to plan your perfect trip
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-900 dark:via-emerald-700 dark:to-emerald-900 -translate-y-1/2" />

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative text-center z-10"
            >
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Share Your Preferences
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mx-auto max-w-xs">
                Tell us where you want to go, your interests, and your travel
                style
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative text-center z-10"
            >
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Generate Itinerary
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mx-auto max-w-xs">
                Our AI creates a personalized day-by-day travel plan just for
                you
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="relative text-center z-10"
            >
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Enjoy Your Trip
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mx-auto max-w-xs">
                Download your itinerary, make adjustments if needed, and start
                exploring
              </p>
            </motion.div>
          </div>

          <div className="flex justify-center mt-14">
            <Link href="#plan">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                Start Planning Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
