"use client";

import { useState } from "react";
import { Feedback } from "@/lib/types";

const STORAGE_KEY = "coach_feedback";

const LIKERT_OPTIONS = [
  { value: 1, label: "1", description: "Strongly disagree" },
  { value: 2, label: "2", description: "Disagree" },
  { value: 3, label: "3", description: "Neutral" },
  { value: 4, label: "4", description: "Agree" },
  { value: 5, label: "5", description: "Strongly agree" },
];

const QUESTIONS = [
  { key: "easeOfUse", label: "The interface was easy to use" },
  { key: "avatarClarity", label: "The avatar felt clear and helpful" },
  { key: "responseClarity", label: "The response was easy to understand" },
  { key: "trust", label: "I trusted the response" },
] as const;

type RatingKey = (typeof QUESTIONS)[number]["key"];

interface Ratings {
  easeOfUse: number | null;
  avatarClarity: number | null;
  responseClarity: number | null;
  trust: number | null;
}

export default function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState<Ratings>({
    easeOfUse: null,
    avatarClarity: null,
    responseClarity: null,
    trust: null,
  });
  const [comments, setComments] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRatingChange = (key: RatingKey, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all ratings are selected
    const missingRatings = QUESTIONS.filter((q) => ratings[q.key] === null);
    if (missingRatings.length > 0) {
      setValidationError("Please answer all questions before submitting.");
      return;
    }

    // Build feedback object
    const feedback: Feedback = {
      easeOfUse: ratings.easeOfUse as number,
      avatarClarity: ratings.avatarClarity as number,
      responseClarity: ratings.responseClarity as number,
      trust: ratings.trust as number,
      comments: comments.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const feedbackArray: Feedback[] = existing ? JSON.parse(existing) : [];
      feedbackArray.push(feedback);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackArray));
    } catch (err) {
      console.error("Failed to save feedback to localStorage:", err);
    }

    // Log to console
    console.log("Feedback submitted:", feedback);

    // Show confirmation
    setSubmitted(true);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (submitted) {
      // Reset form if reopening after submission
      setSubmitted(false);
      setRatings({
        easeOfUse: null,
        avatarClarity: null,
        responseClarity: null,
        trust: null,
      });
      setComments("");
      setValidationError(null);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Thank you confirmation - aria-live region */}
      <div aria-live="polite" className="mb-2">
        {submitted && !isOpen && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 shadow-md">
            Thank you for your feedback! Your response has been recorded.
          </p>
        )}
      </div>

      {/* Collapsible form - opens upward */}
      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-2 w-80 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Research Feedback
          </h2>

          {/* Likert scale legend */}
          <p className="mb-4 text-xs text-gray-500">
            1 = Strongly disagree, 5 = Strongly agree
          </p>

          {/* Validation error */}
          {validationError && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {validationError}
            </p>
          )}

          {/* Likert questions */}
          <div className="space-y-5">
            {QUESTIONS.map((question) => (
              <fieldset key={question.key} className="space-y-2">
                <legend className="text-sm font-medium text-gray-900">
                  {question.label}
                </legend>
                <div className="flex gap-2">
                  {LIKERT_OPTIONS.map((option) => {
                    const inputId = `${question.key}-${option.value}`;
                    const isSelected = ratings[question.key] === option.value;

                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className={`
                          flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 text-sm font-medium transition-colors
                          ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }
                          focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                        `}
                        title={option.description}
                      >
                        <input
                          type="radio"
                          id={inputId}
                          name={question.key}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => handleRatingChange(question.key, option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {/* Comments textarea */}
          <div className="mt-6">
            <label
              htmlFor="feedback-comments"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Any comments or suggestions?
            </label>
            <textarea
              id="feedback-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit button */}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit feedback
            </button>
          </div>
        </form>
      )}

      {/* Toggle button - fixed at bottom */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {isOpen ? "Close" : "Give feedback"}
      </button>
    </div>
  );
}
