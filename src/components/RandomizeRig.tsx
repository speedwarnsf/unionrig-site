"use client";

import { useState, useCallback } from "react";

const SOUND_NAMES = [
  "Midnight Velvet", "Rust & Honey", "Neon Ghost", "Analog Drift",
  "Voltage Bloom", "Smoke Signal", "Iron Cathedral", "Paper Moon",
  "Broken Halo", "Static Ocean", "Copper Wire", "Desert Chrome",
  "Shadow Frequency", "Cold Fusion", "Warm Transistor", "Glass Highway",
];

const DRIVE_TYPES = ["Clean", "Soft Clip", "Hard Clip", "Tube", "Fold-back", "Fuzz"];
const AMP_MODELS = ["Crystal Clean", "British Crunch", "High Gain"];

interface RandomRig {
  name: string;
  amp: string;
  drive: string;
  settings: {
    touch: number;
    heat: number;
    body: number;
    motion: number;
    depth: number;
    gain: number;
  };
}

function generateRandom(): RandomRig {
  const r = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * 100) / 100;

  // Weighted randomization for more interesting combos
  const heat = r(0, 1);
  const isHighGain = heat > 0.7;
  const isClean = heat < 0.2;

  return {
    name: SOUND_NAMES[Math.floor(Math.random() * SOUND_NAMES.length)],
    amp: isHighGain ? "High Gain" : isClean ? "Crystal Clean" : AMP_MODELS[Math.floor(Math.random() * AMP_MODELS.length)],
    drive: isHighGain ? DRIVE_TYPES[3 + Math.floor(Math.random() * 3)] : DRIVE_TYPES[Math.floor(Math.random() * (isClean ? 2 : DRIVE_TYPES.length))],
    settings: {
      touch: r(0.2, 0.8),
      heat,
      body: r(0.2, 0.9),
      motion: isClean ? r(0, 0.4) : r(0.1, 0.8),
      depth: r(0.1, isHighGain ? 0.5 : 0.9),
      gain: r(isClean ? 0.1 : 0.3, isHighGain ? 1 : 0.7),
    },
  };
}

export default function RandomizeRig() {
  const [rig, setRig] = useState<RandomRig | null>(null);
  const [spinning, setSpinning] = useState(false);

  const randomize = useCallback(() => {
    setSpinning(true);
    // Quick flash effect
    let count = 0;
    const interval = setInterval(() => {
      setRig(generateRandom());
      count++;
      if (count >= 6) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80);
  }, []);

  return (
    <div style={{
      border: "1px solid #2a2725",
      padding: "20px 24px",
      maxWidth: 480,
      margin: "0 auto",
      background: "var(--surface, #141210)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: rig ? 16 : 0,
      }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#5a5650", fontWeight: 600,
        }}>RANDOMIZE RIG</div>

        <button
          onClick={randomize}
          disabled={spinning}
          style={{
            background: spinning ? "var(--accent, #c9b99a)" : "none",
            border: "1px solid var(--accent, #c9b99a)",
            color: spinning ? "#0a0a0a" : "var(--accent, #c9b99a)",
            padding: "8px 20px",
            fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: spinning ? "default" : "pointer",
            fontWeight: 600, borderRadius: 0,
            transition: "all 0.15s",
          }}
        >{spinning ? "..." : "Roll"}</button>
      </div>

      {rig && (
        <div style={{
          opacity: spinning ? 0.4 : 1,
          transition: "opacity 0.15s",
        }}>
          {/* Rig name */}
          <div style={{
            fontSize: 18, fontWeight: 400, color: "var(--fg, #e8e4dc)",
            marginBottom: 4,
          }}>{rig.name}</div>
          <div style={{
            fontSize: 10, color: "#5a5650", marginBottom: 16,
          }}>{rig.amp} / {rig.drive}</div>

          {/* Settings bars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
            {Object.entries(rig.settings).map(([key, val]) => (
              <div key={key}>
                <div style={{
                  display: "flex", justifyContent: "space-between", marginBottom: 2,
                }}>
                  <span style={{
                    fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#5a5650",
                  }}>{key}</span>
                  <span style={{ fontSize: 8, color: "#3a3735", fontFamily: "monospace" }}>
                    {Math.round(val * 100)}
                  </span>
                </div>
                <div style={{
                  height: 4, background: "#1a1816", border: "1px solid #2a2725",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, bottom: 0,
                    width: `${val * 100}%`,
                    background: "var(--accent, #c9b99a)",
                    transition: "width 0.15s",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
