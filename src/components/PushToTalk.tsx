"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface PushToTalkProps {
  onRecordingStart: () => void;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const SAMPLE_TRANSCRIPTS = [
  "How can I lower my cholesterol?",
  "How much water should I drink each day?",
  "I'm having chest pain and my left arm feels numb",
  "What is a healthy amount of sleep?",
];

export default function PushToTalk({
  onRecordingStart,
  onTranscript,
  disabled = false,
}: PushToTalkProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [micChecked, setMicChecked] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptIndexRef = useRef(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);

    // Produce simulated transcript
    const transcript = getNextTranscript();
    onTranscript(transcript);
  }, [stopTimer, getNextTranscript, onTranscript]);

  const startRecording = useCallback(async () => {
    // If already checked and in simulated mode, use simulated flow
    if (micChecked && simulatedMode) {
      setIsRecording(true);
      startTimer();
      onRecordingStart();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setMicChecked(true);
      setIsRecording(true);
      startTimer();
      onRecordingStart();
    } catch {
      // Microphone unavailable or permission denied
      setSimulatedMode(true);
      setMicChecked(true);
      setIsRecording(true);
      startTimer();
      onRecordingStart();
    }
  }, [micChecked, simulatedMode, startTimer, onRecordingStart]);

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
          Microphone unavailable — using simulated voice input
        </p>
      )}

      {/* Recording status - aria-live region */}
      <div
        aria-live="polite"
        className="flex items-center gap-2 h-6"
      >
        {isRecording && (
          <>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
            <span className="text-sm font-medium text-red-600">
              Recording… {formatTime(elapsedSeconds)}
            </span>
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
