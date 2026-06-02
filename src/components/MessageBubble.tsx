"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2 text-white">
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  const { response } = message;
  const hasEvidence = response.evidence_used && response.evidence_used.length > 0;

  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] space-y-3">
        {response.guardrail_triggered ? (
          <div
            role="alert"
            className="rounded-lg border-2 border-red-600 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-red-800">Urgent</h3>
                <p className="mt-1 text-red-900">{response.answer}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2">
            <p className="text-gray-900">{response.answer}</p>
          </div>
        )}

        {hasEvidence && (
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              Sources
            </p>
            <ul className="space-y-1">
              {response.evidence_used.map((source) => {
                const sourceId = `${source.document_id}-${source.chunk_id}`;
                const isExpanded = expandedSource === sourceId;

                return (
                  <li key={sourceId}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSource(isExpanded ? null : sourceId)
                      }
                      className="group w-full text-left"
                      aria-expanded={isExpanded}
                    >
                      <span className="text-sm text-gray-600 underline decoration-gray-300 group-hover:text-gray-900 group-hover:decoration-gray-500">
                        {source.title || source.document_id}
                      </span>
                      {source.snippet && (
                        <span className="ml-1 text-xs text-gray-400">
                          {isExpanded ? "[-]" : "[+]"}
                        </span>
                      )}
                    </button>
                    {isExpanded && source.snippet && (
                      <p className="mt-1 pl-2 text-xs text-gray-500 border-l-2 border-gray-200">
                        {source.snippet}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
