"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { ChatMessage } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
}

export default function Chat({ messages, onSend, disabled = false, onTypingChange }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputId = "chat-input";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (value: string) => {
    const wasEmpty = input.trim() === "";
    const isEmpty = value.trim() === "";

    setInput(value);

    if (wasEmpty && !isEmpty) {
      onTypingChange?.(true);
    } else if (!wasEmpty && isEmpty) {
      onTypingChange?.(false);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onTypingChange?.(false);
      onSend(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full border border-gray-200 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
      {/* Message list - scrollable container */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-white"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet. Start a conversation!
          </p>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row - fixed at bottom */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4"
      >
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Message
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            aria-label="Send message"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
