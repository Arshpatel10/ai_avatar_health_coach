import { CoachResponse } from "./types";
import { detectRisk } from "./guardrails";

const SAFETY_MESSAGES: Record<string, string> = {
  cardiac_stroke:
    "Your symptoms may require urgent medical attention. Please contact emergency services (911) immediately.",
  severe_acute:
    "This could be a medical emergency. Please contact emergency services (911) or get to an emergency room right away.",
  mental_health_crisis:
    "It sounds like you may be going through something serious. Please reach out to a trusted individual. You don't have to go through this alone.",
};

interface MockEntry {
  keywords: string[];
  response: CoachResponse;
}

const NORMAL_RESPONSES: MockEntry[] = [
  {
    keywords: ["cholesterol", "ldl", "fiber"],
    response: {
      answer:
        "Soluble fiber from foods like oats, beans, and apples can help lower LDL cholesterol. This is general educational information, please discuss treatment options with your doctor.",
      evidence_used: [
        {
          document_id: "doc_1",
          chunk_id: "chunk_2",
          title: "Dietary Fiber and Cardiovascular Health",
          snippet: "Soluble fiber binds bile acids in the gut, which can reduce circulating LDL cholesterol.",
        },
      ],
      guardrail_triggered: false,
      emotion_state: "supportive",
    },
  },
  {
    keywords: ["water", "hydration", "hydrate", "drink"],
    response: {
      answer:
        "General guidance suggests roughly 2 to 3 liters of total water per day for most adults, including water from food. Your needs vary with activity, climate, and health conditions.",
      evidence_used: [
        {
          document_id: "doc_2",
          chunk_id: "chunk_1",
          title: "Hydration Guidelines for Adults",
          snippet: "Total daily water intake includes fluids from beverages and food; individual needs vary.",
        },
      ],
      guardrail_triggered: false,
      emotion_state: "neutral",
    },
  },
  {
    keywords: ["sleep", "insomnia", "tired", "rest"],
    response: {
      answer:
        "Most adults do best with 7 to 9 hours of sleep per night. A consistent schedule and limiting screens before bed can help. If poor sleep persists, it's worth discussing with your clinician.",
      evidence_used: [
        {
          document_id: "doc_3",
          chunk_id: "chunk_4",
          title: "Sleep Duration Recommendations",
          snippet: "Adults are generally advised to get between 7 and 9 hours of sleep for optimal health.",
        },
      ],
      guardrail_triggered: false,
      emotion_state: "supportive",
    },
  },
  {
    keywords: ["blood pressure", "medication", "pills", "antihypertensive"],
    response: {
      answer:
        "Blood pressure medications work in different ways, and they should be taken as prescribed. Don't stop or change a dose without speaking to your clinician first. This is general educational information only.",
      evidence_used: [
        {
          document_id: "doc_4",
          chunk_id: "chunk_3",
          title: "Understanding Antihypertensive Medications",
          snippet: "Stopping blood pressure medication abruptly can cause adverse effects, changes should be supervised.",
        },
      ],
      guardrail_triggered: false,
      emotion_state: "neutral",
    },
  },
];

const DEFAULT_RESPONSE: CoachResponse = {
  answer:
    "This is general educational information. I don't have a specific source for that question, so please discuss it with your doctor for tailored advice.",
  evidence_used: [],
  guardrail_triggered: false,
  emotion_state: "neutral",
};

function matchNormalResponse(query: string): CoachResponse {
  const q = query.toLowerCase();
  const match = NORMAL_RESPONSES.find((e) => e.keywords.some((k) => q.includes(k)));
  return match ? match.response : DEFAULT_RESPONSE;
}

export async function getCoachResponse(query: string): Promise<CoachResponse> {
  await new Promise((r) => setTimeout(r, 1200)); 

  const risk = detectRisk(query);
  if (risk) {
    return {
      answer: SAFETY_MESSAGES[risk] ?? SAFETY_MESSAGES.cardiac_stroke,
      evidence_used: [],
      guardrail_triggered: true,
      emotion_state: "warning",
    };
  }
  return matchNormalResponse(query);
}