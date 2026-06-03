"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore } from "react";

// SSR-safe way to check if we're on the client
function subscribe() {
  return () => {};
}

function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,  // Client: return true
    () => false  // Server: return false
  );
}

// Web Speech API type declarations
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

interface PushToTalkProps {
  onRecordingStart: () => void;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Fallback transcripts when speech recognition is unavailable
const SAMPLE_TRANSCRIPTS = [
  "How can I lower my cholesterol?",
  "How much water should I drink each day?",
  "I'm having chest pain and my left arm feels numb",
  "What is a healthy amount of sleep?",
];

function getSpeechRecognition(): ISpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const win = window as typeof window & {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  };

  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export default function PushToTalk({
  onRecordingStart,
  onTranscript,
  disabled = false,
}: PushToTalkProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [forcedSimulatedMode, setForcedSimulatedMode] = useState(false);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptIndexRef = useRef(0);
  const finalTranscriptRef = useRef("");

  // SSR-safe mount check to avoid hydration mismatch
  const hasMounted = useHasMounted();

  // Check if speech recognition is available (only after mount to avoid hydration mismatch)
  const speechSupported = hasMounted && getSpeechRecognition() !== null;

  // Simulated mode if not supported OR forced due to permission error
  // Only show simulated mode notice after mount
  const simulatedMode = hasMounted && (!speechSupported || forcedSimulatedMode);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const getNextTranscript = useCallback(() => {
    const transcript = SAMPLE_TRANSCRIPTS[transcriptIndexRef.current];
    transcriptIndexRef.current =
      (transcriptIndexRef.current + 1) % SAMPLE_TRANSCRIPTS.length;
    return transcript;
  }, []);

  const startTimer = useCallback(() => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    stopTimer();
    setInterimTranscript("");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // The onend/onresult handlers will call onTranscript
    } else if (simulatedMode) {
      // Simulated mode - use predetermined transcript
      setIsRecording(false);
      const transcript = getNextTranscript();
      onTranscript(transcript);
    }
  }, [stopTimer, simulatedMode, getNextTranscript, onTranscript]);

  const startRecording = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();

    if (SpeechRecognitionClass && !simulatedMode) {
      // Use real speech recognition
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      finalTranscriptRef.current = "";

      recognition.onstart = () => {
        setIsRecording(true);
        startTimer();
        onRecordingStart();
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) {
          finalTranscriptRef.current += final;
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          // Mic permission denied - switch to simulated mode
          setForcedSimulatedMode(true);
        }

        stopTimer();
        setIsRecording(false);
        setInterimTranscript("");
        recognitionRef.current = null;

        // If we got some transcript before the error, use it
        if (finalTranscriptRef.current.trim()) {
          onTranscript(finalTranscriptRef.current.trim());
        }
      };

      recognition.onend = () => {
        stopTimer();
        setIsRecording(false);
        setInterimTranscript("");
        recognitionRef.current = null;

        // Send the final transcript
        const transcript = finalTranscriptRef.current.trim();
        if (transcript) {
          onTranscript(transcript);
        }
      };

      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setForcedSimulatedMode(true);
        setIsRecording(true);
        startTimer();
        onRecordingStart();
      }
    } else {
      // Simulated mode
      setIsRecording(true);
      startTimer();
      onRecordingStart();
    }
  }, [simulatedMode, startTimer, stopTimer, onRecordingStart, onTranscript]);

  const handleToggle = useCallback(() => {
    if (disabled) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [disabled, isRecording, stopRecording, startRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Simulated mode notice */}
      {simulatedMode && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          Speech recognition unavailable — using simulated voice input
        </p>
      )}

      {/* Recording status - aria-live region */}
      <div
        aria-live="polite"
        className="flex flex-col items-center gap-1 min-h-[3rem]"
      >
        {isRecording && (
          <>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-red-600">
                Recording… {formatTime(elapsedSeconds)}
              </span>
            </div>
            {/* Show interim transcript while recording */}
            {interimTranscript && (
              <p className="text-sm text-gray-500 italic max-w-xs text-center">
                {interimTranscript}
              </p>
            )}
          </>
        )}
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
        className={`
          flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium
          transition-all focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            isRecording
              ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              : "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {/* Microphone icon */}
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          {isRecording ? (
            // Stop icon (square)
            <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" />
          ) : (
            // Microphone icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 10v2a7 7 0 01-14 0v-2m7 9v3m-4 0h8m-4-14a3 3 0 00-3 3v4a3 3 0 006 0V8a3 3 0 00-3-3z"
            />
          )}
        </svg>
        {isRecording ? "Stop" : "Push to Talk"}
      </button>
    </div>
  );
}
