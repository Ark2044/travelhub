"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

interface HeroProps {
  title: string;
  highlightedWord?: string;
  subtitle: string;
  bgImage: string;
  height?: string;
  actions?: {
    label: string;
    href: string;
    icon?: IconDefinition;
    variant?: "default" | "outline";
    onClick?: () => void;
  }[];
  overlayOpacity?: string;
}

export default function Hero({
  title,
  highlightedWord,
  subtitle,
  bgImage,
  height = "h-[80vh]", // Increased height for more impact
  actions = [],
  overlayOpacity = "from-purple-900/70 via-blue-800/50 to-black/60", // Updated gradient for a modern look
}: HeroProps) {
  // Process title to highlight word if specified
  const titleParts = highlightedWord
    ? title.split(highlightedWord).map((part, i, arr) => {
        if (i === arr.length - 1) return part;
        return (
          <React.Fragment key={i}>
            {part}
            <span className="text-emerald-400 relative">
              {highlightedWord}
              <motion.span
                className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400 opacity-70"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </span>
          </React.Fragment>
        );
      })
    : [title];

  return (
    <div className={`relative ${height} w-full overflow-hidden`}>
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Hero background"
          fill
          priority
          className="object-cover transform scale-105 motion-safe:animate-subtle-zoom"
          sizes="100vw"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${overlayOpacity}`}
        ></div>
        <div className="absolute inset-0 bg-[url('/globe.svg')] bg-no-repeat bg-center opacity-10"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-10"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
            initial={{ letterSpacing: "0.1em" }}
            animate={{ letterSpacing: "0.01em" }}
            transition={{ duration: 1.2 }}
          >
            {titleParts}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {actions.length > 0 && (
          <motion.div
            className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={action.variant !== "outline" ? "w-full" : ""}
                onClick={(e) => {
                  if (action.onClick) {
                    e.preventDefault();
                    action.onClick();
                  }
                }}
              >
                <Button
                  size="lg"
                  variant={action.variant || "default"}
                  className={
                    action.variant === "outline"
                      ? "w-full backdrop-blur-md border-white/30 text-white hover:bg-white/20 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                  }
                >
                  {action.icon && (
                    <FontAwesomeIcon icon={action.icon} className="mr-2" />
                  )}
                  {action.label}
                </Button>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
