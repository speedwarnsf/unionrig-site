"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface CabinetIR {
  id: string;
  name: string;
  desc: string;
  // Frequency response curve data (simplified EQ profile)
  curve: number[]; // 32 frequency bins, values 0-1
  character: string;
}

const CABINETS: CabinetIR[] = [
  {
    id: "412-brit",
    name: "4x12 British",
    desc: "Classic closed-back 4x12 with Greenback speakers. Midrange push, smooth top-end rolloff.",
    character: "Warm, midrange-forward, classic rock",
    curve: [0.3,0.35,0.4,0.5,0.6,0.7,0.78,0.85,0.9,0.92,0.95,0.97,1.0,0.98,0.95,0.9,0.85,0.8,0.72,0.65,0.55,0.45,0.38,0.3,0.24,0.18,0.14,0.1,0.08,0.06,0.04,0.03],
  },
  {
    id: "212-american",
    name: "2x12 American",
    desc: "Open-back 2x12 combo with Jensen-style speakers. Sparkly top, scooped mids.",
    character: "Bright, scooped, clean country/blues",
    curve: [0.25,0.3,0.4,0.5,0.55,0.6,0.65,0.7,0.72,0.68,0.6,0.55,0.5,0.52,0.58,0.65,0.72,0.8,0.85,0.88,0.85,0.78,0.65,0.5,0.38,0.28,0.2,0.14,0.1,0.07,0.05,0.03],
  },
  {
    id: "112-studio",
    name: "1x12 Studio",
    desc: "Compact sealed 1x12 with a modern Creamback. Tight low end, balanced midrange.",
    character: "Tight, focused, modern",
    curve: [0.15,0.2,0.3,0.45,0.6,0.72,0.8,0.85,0.88,0.9,0.92,0.93,0.92,0.9,0.88,0.85,0.82,0.78,0.7,0.6,0.5,0.4,0.32,0.25,0.2,0.15,0.12,0.09,0.07,0.05,0.04,0.03],
  },
  {
    id: "410-bass",
    name: "4x10 Bass",
    desc: "Sealed 4x10 bass cab. Extended low frequency response, punchy midrange.",
    character: "Deep, punchy, articulate",
    curve: [0.5,0.65,0.78,0.88,0.95,1.0,0.98,0.92,0.85,0.8,0.75,0.72,0.7,0.68,0.65,0.6,0.55,0.48,0.4,0.32,0.25,0.2,0.15,0.12,0.1,0.08,0.06,0.05,0.04,0.03],
  },
  {
    id: "flat-di",
    name: "Flat / DI",
    desc: "No cabinet simulation. Flat frequency response for direct recording or FRFR monitoring.",
    character: "Transparent, uncolored",
    curve: Array(32).fill(0.85),
  },
  {
    id: "215-vintage",
    name: "2x15 Vintage",
    desc: "Open-back 2x15 with old-stock speakers. Massive low end, dark treble, lo-fi texture.",
    character: "Dark, boomy, vintage",
    curve: [0.6,0.72,0.82,0.9,0.95,0.98,1.0,0.95,0.88,0.8,0.7,0.62,0.55,0.48,0.42,0.38,0.34,0.3,0.26,0.22,0.18,0.15,0.12,0.1,0.08,0.06,0.05,0.04,0.03,0.02],
  },
];

const FREQ_LABELS = ["20", "50", "100", "200", "500", "1k", "2k", "5k", "10k", "20k"];
const FREQ_POSITIONS = [0, 3, 6, 10, 15, 19, 22, 26, 29, 31]; // Map to 32 bins

function FrequencyChart({ curve, color }: { curve: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 10, bottom: 24, left: 35, right: 10 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "#2a2725";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    // dB labels
    ctx.fillStyle = "#5a5650";
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    const dbLabels = ["+6", "0", "-6", "-12", "-18"];
    for (let i = 0; i < dbLabels.length; i++) {
      const y = pad.top + (plotH / 4) * i + 3;
      ctx.fillText(dbLabels[i], pad.left - 4, y);
    }

    // Frequency labels
    ctx.textAlign = "center";
    for (let i = 0; i < FREQ_LABELS.length; i++) {
      const x = pad.left + (FREQ_POSITIONS[i] / 31) * plotW;
      ctx.fillText(FREQ_LABELS[i], x, h - 4);
    }

    // Curve fill
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    for (let i = 0; i < curve.length; i++) {
      const x = pad.left + (i / (curve.length - 1)) * plotW;
      const y = pad.top + plotH * (1 - curve[i]);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w - pad.right, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = color + "15";
    ctx.fill();

    // Curve line
    ctx.beginPath();
    for (let i = 0; i < curve.length; i++) {
      const x = pad.left + (i / (curve.length - 1)) * plotW;
      const y = pad.top + plotH * (1 - curve[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [curve, color]);

  return (
    <canvas ref={canvasRef} width={400} height={180} style={{
      width: "100%", height: "auto", display: "block",
      border: "1px solid #2a2725", background: "#0e0d0c",
    }} />
  );
}

export default function IRLoader() {
  const [selected, setSelected] = useState<string>("412-brit");
  const [comparing, setComparing] = useState<string | null>(null);

  const cab = CABINETS.find(c => c.id === selected)!;
  const compareCab = comparing ? CABINETS.find(c => c.id === comparing) : null;

  return (
    <div style={{ marginTop: 48 }}>
      <p style={{
        fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 12, fontWeight: 600,
      }}>Cabinet IR Loader</p>
      <p style={{
        color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
        maxWidth: 480, marginBottom: 24,
      }}>
        Select a cabinet impulse response. The frequency response preview shows how each cab shapes your tone.
      </p>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Cabinet selector */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 8,
          marginBottom: 24,
        }}>
          {CABINETS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              style={{
                background: selected === c.id ? "rgba(201,185,154,0.1)" : "none",
                border: `1px solid ${selected === c.id ? "var(--accent)" : "var(--border)"}`,
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 600, color: selected === c.id ? "var(--fg)" : "var(--fg-dim)",
                display: "block", marginBottom: 2,
              }}>{c.name}</span>
              <span style={{
                fontSize: 9, color: "#5a5650", display: "block",
              }}>{c.character}</span>
            </button>
          ))}
        </div>

        {/* Frequency response chart */}
        <div style={{ marginBottom: 16 }}>
          <FrequencyChart curve={cab.curve} color="#c9b99a" />
          {compareCab && (
            <div style={{ marginTop: -1 }}>
              <FrequencyChart curve={compareCab.curve} color="#7a9ec9" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          border: "1px solid var(--border)",
          padding: "16px",
          background: "var(--surface)",
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)", marginBottom: 6 }}>{cab.name}</p>
          <p style={{ fontSize: 13, color: "var(--fg-dim)", lineHeight: 1.6 }}>{cab.desc}</p>
        </div>

        {/* Compare toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "var(--fg-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Compare:</span>
          <select
            value={comparing || ""}
            onChange={(e) => setComparing(e.target.value || null)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--fg-dim)",
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <option value="">None</option>
            {CABINETS.filter(c => c.id !== selected).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {comparing && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 2, background: "#c9b99a" }} />
              <span style={{ fontSize: 10, color: "#c9b99a" }}>{cab.name}</span>
              <div style={{ width: 12, height: 2, background: "#7a9ec9" }} />
              <span style={{ fontSize: 10, color: "#7a9ec9" }}>{compareCab?.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
