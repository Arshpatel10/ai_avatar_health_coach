import { CoachResponse } from "./types";

export type AvatarState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "supportive"
  | "warning";


export function deriveAvatarState(response: CoachResponse): AvatarState {
  if (response.guardrail_triggered) return "warning";
  if (response.emotion_state === "supportive") return "supportive";
  return "speaking"; 
}