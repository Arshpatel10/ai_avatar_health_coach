"use client";

import Avatar from "@/components/Avatar";
import { AvatarState } from "@/lib/avatarState";

const STATES: AvatarState[] = [
  "idle", "listening", "thinking", "speaking", "supportive", "warning",
];

export default function AvatarPreview() {
  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 32,
        padding: 32,
      }}
    >
      {STATES.map((s) => (
        <div key={s} style={{ textAlign: "center" }}>
          <Avatar state={s} />
          <p style={{ marginTop: 8, fontFamily: "monospace" }}>{s}</p>
        </div>
      ))}
    </main>
  );
}