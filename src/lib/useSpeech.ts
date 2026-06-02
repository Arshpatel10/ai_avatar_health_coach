"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SpeakOptions {
  onEnd?: () => void;
  voice?: SpeechSynthesisVoice;
  rate?: number;   // 0.1 to 10, default 1
  pitch?: number;  // 0 to 2, default 1
}

interface UseSpeechReturn {
  speak: (text: string, opts?: SpeakOptions) => void;
  cancel: () => void;
  speaking: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
}

function checkSpeechSynthesisSupport(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function useSpeech(): UseSpeechReturn {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const simulatedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  // Check support synchronously (safe because this is a client component)
  const supported = checkSpeechSynthesisSupport();

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Auto-select a neutral English voice if none selected
      if (!selectedVoice && availableVoices.length > 0) {
        // Prefer voices with "Google" or "Natural" in name, or English voices
        const preferredVoice = availableVoices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
        ) || availableVoices.find((v) => v.lang.startsWith("en")) || availableVoices[0];

        setSelectedVoice(preferredVoice);
      }
    };

    // Load voices immediately (may be empty on first call)
    loadVoices();

    // Chrome loads voices asynchronously
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [selectedVoice]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      // Clear any simulated timeout
      if (simulatedTimeoutRef.current) {
        clearTimeout(simulatedTimeoutRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    // Cancel real speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Clear simulated timeout
    if (simulatedTimeoutRef.current) {
      clearTimeout(simulatedTimeoutRef.current);
      simulatedTimeoutRef.current = null;
    }

    utteranceRef.current = null;
    onEndCallbackRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, opts?: SpeakOptions) => {
      // Cancel any current utterance first
      cancel();

      // Store the onEnd callback
      onEndCallbackRef.current = opts?.onEnd || null;

      if (supported && typeof window !== "undefined" && "speechSynthesis" in window) {
        // Use real speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Apply voice settings
        const voiceToUse = opts?.voice || selectedVoice;
        if (voiceToUse) {
          utterance.voice = voiceToUse;
        }
        if (opts?.rate !== undefined) {
          utterance.rate = opts.rate;
        }
        if (opts?.pitch !== undefined) {
          utterance.pitch = opts.pitch;
        }

        utterance.onstart = () => {
          setSpeaking(true);
        };

        utterance.onend = () => {
          setSpeaking(false);
          utteranceRef.current = null;
          onEndCallbackRef.current?.();
          onEndCallbackRef.current = null;
        };

        utterance.onerror = () => {
          setSpeaking(false);
          utteranceRef.current = null;
          onEndCallbackRef.current?.();
          onEndCallbackRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Simulate speech with delay based on text length
        // 60ms per character, clamped between 2000ms and 8000ms
        const duration = Math.min(8000, Math.max(2000, text.length * 60));

        setSpeaking(true);

        simulatedTimeoutRef.current = setTimeout(() => {
          setSpeaking(false);
          simulatedTimeoutRef.current = null;
          onEndCallbackRef.current?.();
          onEndCallbackRef.current = null;
        }, duration);
      }
    },
    [supported, cancel, selectedVoice]
  );

  return {
    speak,
    cancel,
    speaking,
    supported,
    voices,
    selectedVoice,
    setSelectedVoice,
  };
}
