"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import Chat from "@/components/Chat";
import PushToTalk from "@/components/PushToTalk";
import FeedbackForm from "@/components/FeedbackForm";
import { AvatarState, deriveAvatarState } from "@/lib/avatarState";
import { ChatMessage } from "@/lib/types";
import { useSpeech } from "@/lib/useSpeech";
import { getCoachResponse } from "@/lib/mockBackend";

export default function CoachSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isBusy, setIsBusy] = useState(false);
  const { speak, cancel } = useSpeech();

  async function handleSend(text: string) {
    if (!text.trim() || isBusy) return;
    setIsBusy(true);
    cancel(); // stop any speech still playing from a previous answer

    setMessages((m) => [...m, { role: "user", text }]);
    setAvatarState("thinking");

    const response = await getCoachResponse(text);

    setMessages((m) => [...m, { role: "assistant", response }]);

    // speak the answer; avatar holds the emotion state until speech ends
    const emotionState = deriveAvatarState(response);
    setAvatarState(emotionState);
    speak(response.answer, { onEnd: () => setAvatarState("idle") });

    setIsBusy(false);
  }

  // push-to-talk: when recording starts, the avatar listens.
  // the transcript is sent through handleSend, which takes over the avatar flow.
  function handleRecordingStart() {
    setAvatarState("listening");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-4 px-6">
      {/* Header */}
      <header className="w-full text-center">
        <h1 className="text-3xl font-bold text-teal-800">
          AI Avatar Health Coach
        </h1>
        <p className="mt-2 text-lg text-teal-600">
          Welcome to your personal health coach
        </p>
        <p className="mt-3 text-sm text-teal-700/70 max-w-md mx-auto leading-relaxed">
          Ask questions about your health by typing in the chat below or use the push-to-talk button to speak. Your coach will respond with helpful guidance.
        </p>
      </header>

      {/* Main content - Avatar left, Chat right */}
      <div className="flex flex-col md:flex-row gap-4 items-start w-full">
        {/* Avatar section */}
        <div className="flex-shrink-0 md:sticky md:top-4">
          <Avatar state={avatarState} />
        </div>

        {/* Chat section */}
        <div className="flex-1 w-full flex flex-col items-center gap-1">
          <Chat
            messages={messages}
            onSend={handleSend}
            disabled={isBusy}
            onTypingChange={(isTyping) => {
              if (!isBusy) {
                setAvatarState(isTyping ? "listening" : "idle");
              }
            }}
          />
          <PushToTalk
            onRecordingStart={handleRecordingStart}
            onTranscript={handleSend}
            disabled={isBusy}
          />
        </div>
      </div>

      <FeedbackForm />
    </main>
  );
}