"use client";

import { AvatarState } from "@/lib/avatarState";
import styles from "./Avatar.module.css";

interface AvatarProps {
  state: AvatarState;
}

export default function Avatar({ state }: AvatarProps) {
  const ariaLabel = `Health coach avatar, current state: ${state}`;

  const stateLabelClass = {
    idle: styles.stateLabelIdle,
    listening: styles.stateLabelListening,
    thinking: styles.stateLabelThinking,
    speaking: styles.stateLabelSpeaking,
    supportive: styles.stateLabelSupportive,
    warning: styles.stateLabelWarning,
  }[state];

  return (
    <div
      className={styles.avatarContainer}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        className={`${styles.avatar} ${styles[state]}`}
        viewBox="0 0 200 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Listening pulse rings */}
        {state === "listening" && (
          <>
            <circle
              className={styles.pulseRing}
              cx="100"
              cy="100"
              r="85"
            />
            <circle
              className={`${styles.pulseRing} ${styles.pulseRingInner}`}
              cx="100"
              cy="100"
              r="85"
            />
          </>
        )}

        {/* Supportive glow */}
        {state === "supportive" && (
          <circle
            className={styles.glow}
            cx="100"
            cy="100"
            r="90"
          />
        )}

        {/* Warning alert ring */}
        {state === "warning" && (
          <circle
            className={styles.alertRing}
            cx="100"
            cy="100"
            r="92"
          />
        )}

        {/* Head */}
        <circle
          className={styles.head}
          cx="100"
          cy="100"
          r="80"
        />

        {/* Left eye */}
        <ellipse
          className={styles.eyeWhite}
          cx="70"
          cy="85"
          rx={state === "listening" ? 14 : 12}
          ry={state === "listening" ? 16 : 14}
        />
        <circle
          className={styles.pupil}
          cx="70"
          cy="85"
          r="6"
          style={{ transformOrigin: "70px 85px" }}
        />

        {/* Right eye */}
        <ellipse
          className={styles.eyeWhite}
          cx="130"
          cy="85"
          rx={state === "listening" ? 14 : 12}
          ry={state === "listening" ? 16 : 14}
        />
        <circle
          className={styles.pupil}
          cx="130"
          cy="85"
          r="6"
          style={{ transformOrigin: "130px 85px" }}
        />

        {/* Eyebrows */}
        {state === "warning" ? (
          <>
            <path
              className={`${styles.eyebrow} ${styles.eyebrowLeft}`}
              d="M55 60 Q70 52 85 60"
            />
            <path
              className={`${styles.eyebrow} ${styles.eyebrowRight}`}
              d="M115 60 Q130 52 145 60"
            />
          </>
        ) : state === "thinking" ? (
          <>
            <path
              className={`${styles.eyebrow} ${styles.eyebrowLeft}`}
              d="M55 65 Q70 58 85 65"
            />
            <path
              className={styles.eyebrow}
              d="M115 65 Q130 58 145 65"
            />
          </>
        ) : (
          <>
            <path
              className={styles.eyebrow}
              d="M55 65 Q70 58 85 65"
            />
            <path
              className={styles.eyebrow}
              d="M115 65 Q130 58 145 65"
            />
          </>
        )}

        {/* Mouth - varies by state */}
        {state === "idle" && (
          <path
            className={styles.mouth}
            d="M75 130 Q100 140 125 130"
          />
        )}

        {state === "listening" && (
          <path
            className={styles.mouth}
            d="M80 128 Q100 132 120 128"
          />
        )}

        {state === "thinking" && (
          <>
            <path
              className={styles.mouth}
              d="M80 130 L120 130"
            />
            {/* Thinking dots - above head */}
            <circle
              className={`${styles.thinkingDot} ${styles.thinkingDot1}`}
              cx="85"
              cy="12"
              r="5"
              style={{ transformOrigin: "85px 12px" }}
            />
            <circle
              className={`${styles.thinkingDot} ${styles.thinkingDot2}`}
              cx="100"
              cy="12"
              r="5"
              style={{ transformOrigin: "100px 12px" }}
            />
            <circle
              className={`${styles.thinkingDot} ${styles.thinkingDot3}`}
              cx="115"
              cy="12"
              r="5"
              style={{ transformOrigin: "115px 12px" }}
            />
          </>
        )}

        {state === "speaking" && (
          <ellipse
            className={styles.mouthOpen}
            cx="100"
            cy="130"
            rx="15"
            ry="10"
            style={{ transformOrigin: "100px 130px" }}
          />
        )}

        {state === "supportive" && (
          <ellipse
            className={styles.mouthOpen}
            cx="100"
            cy="135"
            rx="15"
            ry="10"
            style={{ transformOrigin: "100px 135px" }}
          />
        )}

        {state === "warning" && (
          <ellipse
            className={styles.mouthOpen}
            cx="100"
            cy="130"
            rx="18"
            ry="12"
            style={{ transformOrigin: "100px 130px" }}
          />
        )}

        {/* Doctor Body - floating below head */}
        {/* Body/Torso - White doctor coat */}
        <path
          className={styles.doctorCoat}
          d="M30 320 L30 250 Q30 220 60 210 L80 205 Q100 210 120 205 L140 210 Q170 220 170 250 L170 320 Z"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Coat lapels/collar */}
        <path
          className={styles.coatLapel}
          d="M80 205 L70 240 L100 260 L130 240 L120 205"
          fill="#f0fdfa"
          stroke="#99f6e4"
          strokeWidth="1"
        />

        {/* Inner shirt/scrubs */}
        <path
          d="M75 215 Q100 225 125 215 L130 240 L100 260 L70 240 Z"
          fill="#5eead4"
        />

        {/* Stethoscope - hanging around neck */}
        {/* Left side - earpiece end */}
        <path
          d="M70 215 Q55 225 50 245"
          fill="none"
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Y-split for earpieces */}
        <path
          d="M50 245 Q45 255 40 265"
          fill="none"
          stroke="#374151"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M50 245 Q55 255 55 265"
          fill="none"
          stroke="#374151"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Earpiece tips */}
        <circle cx="40" cy="267" r="4" fill="#374151" />
        <circle cx="55" cy="267" r="4" fill="#374151" />

        {/* Right side - chest piece end */}
        <path
          d="M130 215 Q145 225 150 250"
          fill="none"
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Chest piece */}
        <circle cx="150" cy="258" r="10" fill="#374151" />
        <circle cx="150" cy="258" r="6" fill="#6b7280" />

        {/* Coat pocket */}
        <rect
          x="45"
          y="260"
          width="25"
          height="30"
          rx="3"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />

        {/* Pen in pocket */}
        <rect
          x="52"
          y="255"
          width="4"
          height="15"
          rx="1"
          fill="#3b82f6"
        />
        <rect
          x="52"
          y="253"
          width="4"
          height="4"
          rx="1"
          fill="#1e40af"
        />
      </svg>

      {/* Visible state label for accessibility */}
      <span className={`${styles.stateLabel} ${stateLabelClass}`}>
        {state}
      </span>
    </div>
  );
}
