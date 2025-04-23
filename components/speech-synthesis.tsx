"use client";

import { useEffect, useRef } from "react";

interface SpeechSynthesisProps {
  text: string;
  enabled: boolean;
  onSpeaking?: (isSpeaking: boolean) => void;
}

export default function SpeechSynthesis({
  text,
  enabled,
  onSpeaking,
}: SpeechSynthesisProps) {
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Clean up previous speech when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeakingRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle changes to the text prop
  useEffect(() => {
    // Don't do anything if speech is disabled or text is empty
    if (!enabled || !text.trim() || !window.speechSynthesis) {
      return;
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthRef.current = utterance;

    // Set voice preferences (female voice if available)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const femaleVoice = voices.find((voice) =>
        voice.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }

    // Set speech properties
    utterance.rate = 1.0; // Speed
    utterance.pitch = 1.0; // Pitch
    utterance.volume = 1.0; // Volume

    // Set up events
    utterance.onstart = () => {
      isSpeakingRef.current = true;
      onSpeaking?.(true);
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
      onSpeaking?.(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      isSpeakingRef.current = false;
      onSpeaking?.(false);
    };

    // Cancel any current speech
    window.speechSynthesis.cancel();

    // Start speaking
    window.speechSynthesis.speak(utterance);

    return () => {
      if (isSpeakingRef.current) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        onSpeaking?.(false);
      }
    };
  }, [text, enabled, onSpeaking]);

  // No visible UI - this is just a functional component
  return null;
}
