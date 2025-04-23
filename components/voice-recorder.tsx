"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faSpinner,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  questionIndex?: number;
  isEnabled: boolean;
}

export default function VoiceRecorder({
  onTranscription,
  questionIndex,
  isEnabled,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check for browser support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Media devices not supported by this browser.");
    }
  }, []);

  const startRecording = async () => {
    if (!isEnabled) {
      toast.error("Voice recording is disabled.");
      return;
    }

    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto stop after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopRecording();
        }
      }, 10000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error(
        "Could not access your microphone. Please check permissions."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const processRecording = async () => {
    if (chunksRef.current.length === 0) {
      toast.error("No audio recorded.");
      return;
    }

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      // Create form data for API request
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      if (questionIndex !== undefined) {
        formData.append("question_index", questionIndex.toString());
      }

      // Send to server for processing
      const response = await fetch("/api/process-voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        onTranscription(result.text);
      } else {
        toast.error(result.error || "Failed to process voice recording.");
      }
    } catch (err) {
      console.error("Error processing audio:", err);
      toast.error("Error processing your voice recording.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Button
        type="button"
        size="icon"
        variant={isRecording ? "destructive" : "outline"}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || !isEnabled}
        className="rounded-full w-10 h-10"
      >
        {isProcessing ? (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
        ) : isRecording ? (
          <FontAwesomeIcon icon={faStop} />
        ) : (
          <FontAwesomeIcon icon={faMicrophone} />
        )}
      </Button>
    </div>
  );
}
