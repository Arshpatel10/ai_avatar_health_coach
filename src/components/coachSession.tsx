"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import Chat from "@/components/Chat";
import PushToTalk from "@/components/PushToTalk";
import { AvatarState, deriveAvatarState } from "@/lib/avatarState";
import { ChatMessage } from "@/lib/types";
import { getCoachResponse } from "@/lib/mockBackend";

export default function CoachSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isBusy, setIsBusy] = useState(false);

  async function handleSend(text: string) {
    if (!text.trim() || isBusy) return;
    setIsBusy(true);

    setMessages((m) => [...m, { role: "user", text }]);
    setAvatarState("thinking");

    const response = await getCoachResponse(text);

    setMessages((m) => [...m, { role: "assistant", response }]);
    setAvatarState(deriveAvatarState(response));

    
    setTimeout(() => setAvatarState("idle"), 4000);

    setIsBusy(false);
  }

  // push-to-talk: when recording starts, the avatar listens.
  // the transcript is sent through handleSend, which takes over the avatar flow.
  function handleRecordingStart() {
    setAvatarState("listening");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-6 p-4">
      <Avatar state={avatarState} />
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
    </main>
  );
}