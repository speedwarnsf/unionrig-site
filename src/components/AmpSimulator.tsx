"use client";

import { useState, useCallback } from "react";

const AMP_MODELS = [
  { id: "clean", name: "Crystal Clean", desc: "Fender-style clean", color: "#7ac9c9" },
  { id: "crunch", name: "British Crunch", desc: "Marshall-style breakup", color: "#c9b99a" },
  { id: "highgain", name: "High Gain", desc: "Mesa-style saturation", color: "#c97a7a" },
];

function AmpKnob({ label, value, onChange, size = 56 }: {
  label: string; value: number; onChange: (v: number) => void; size?: number;
}) {
  const angle = -135 + value * 270;
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const pa = (angle * Math.PI) / 180;
  const px = cx + (r - 10) * Math.cos(pa);
  const py = cy + (r - 10) * Math.sin(pa);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const el = e.currentTarget;
    const startY = e.clientY;
    const startVal = value;
    (el as HTMLElement).setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const dy = startY - ev.clientY;
      onChange(Math.max(0, Math.min(1, startVal + dy * 0.005)));
    };
    const up = () => {
      el.removeEventListener("pointermove", move as EventListener);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move as EventListener);
    el.addEventListener("pointerup", up);
  }, [value, onChange]);

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((-135 + i * 27) * Math.PI) / 180;
    return {
      x1: cx + (r - 2) * Math.cos(a), y1: cy + (r - 2) * Math.sin(a),
      x2: cx + (r + 2) * Math.cos(a), y2: cy + (r + 2) * Math.sin(a),
      active: i <= value * 10,
    };
  });

  return (
    <div style={{ textAlign: "center", cursor: "ns-resize", userSelect: "none", touchAction: "none" }}
      onPointerDown={handlePointer}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r - 2} fill="#1a1816" stroke="#2a2826" strokeWidth="1" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.active ? "#c9b99a" : "#2a2725"} strokeWidth="1" />
        ))}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#c9b99a" strokeWidth="2" strokeLinecap="square" />
        <circle cx={cx} cy={cy} r="2" fill="#c9b99a" />
      </svg>
      <p style={{
        fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase",
        color: "#8a8278", marginTop: 4, fontWeight: 500,
      }}>{label}</p>
    </div>
  );
}

export default function AmpSimulator() {
  const [model, setModel] = useState("crunch");
  const [gain, setGain] = useState(0.5);
  const [bass, setBass] = useState(0.5);
  const [mid, setMid] = useState(0.6);
  const [treble, setTreble] = useState(0.5);
  const [presence, setPresence] = useState(0.4);
  const [master, setMaster] = useState(0.7);

  const selected = AMP_MODELS.find(a => a.id === model)!;

  return (
    <div style={{
      background: "linear-gradient(180deg, #1e1c1a 0%, #161412 40%, #0e0d0c 100%)",
      backgroundImage: `
        linear-gradient(180deg, #1e1c1a 0%, #161412 40%, #0e0d0c 100%),
        repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 6px)
      `,
      border: "2px solid #2a2725",
      padding: "28px 24px 24px",
      maxWidth: 520,
      margin: "0 auto",
      position: "relative",
      boxShadow: "0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
    }}>
      {/* Corner screws */}
      {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => (
        <div key={i} style={{
          position: "absolute", width: 10, height: 10,
          background: "linear-gradient(135deg, #3a3836 0%, #252321 100%)",
          border: "1px solid #4a4745", ...pos,
        }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 6, height: 1, background: "#1a1816", transform: "translate(-50%, -50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 1, height: 6, background: "#1a1816", transform: "translate(-50%, -50%)" }} />
        </div>
      ))}

      {/* Header */}
      <div style={{
        fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
        color: "#5a5650", textAlign: "center", marginBottom: 20, fontWeight: 600,
      }}>AMP SIMULATOR</div>

      {/* Amp model selector */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 24,
        border: "1px solid #2a2725",
      }}>
        {AMP_MODELS.map(amp => (
          <button
            key={amp.id}
            onClick={() => setModel(amp.id)}
            style={{
              flex: 1,
              background: model === amp.id ? "rgba(201,185,154,0.1)" : "none",
              border: "none",
              borderRight: amp.id !== "highgain" ? "1px solid #2a2725" : "none",
              padding: "12px 8px",
              cursor: "pointer",
              textAlign: "center",
              borderRadius: 0,
            }}
          >
            {/* LED */}
            <div style={{
              width: 5, height: 5, margin: "0 auto 6px",
              background: model === amp.id ? amp.color : "#1a1816",
              boxShadow: model === amp.id ? `0 0 6px ${amp.color}` : "none",
              transition: "all 0.15s",
            }} />
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: model === amp.id ? amp.color : "#5a5650",
              transition: "color 0.15s",
            }}>{amp.name}</div>
            <div style={{ fontSize: 8, color: "#3a3735", marginTop: 2 }}>{amp.desc}</div>
          </button>
        ))}
      </div>

      {/* Tolex stripe */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${selected.color}22 50%, transparent 100%)`,
        marginBottom: 20,
      }} />

      {/* EQ Knobs */}
      <div style={{
        display: "flex", justifyContent: "space-between", gap: 8,
        flexWrap: "wrap",
      }}>
        <AmpKnob label="Gain" value={gain} onChange={setGain} />
        <AmpKnob label="Bass" value={bass} onChange={setBass} />
        <AmpKnob label="Mid" value={mid} onChange={setMid} />
        <AmpKnob label="Treble" value={treble} onChange={setTreble} />
        <AmpKnob label="Presence" value={presence} onChange={setPresence} />
        <AmpKnob label="Master" value={master} onChange={setMaster} />
      </div>

      {/* EQ curve visualization */}
      <div style={{ marginTop: 20 }}>
        <svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none" style={{
          display: "block", border: "1px solid #2a2725", background: "#0a0908",
        }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(y => (
            <line key={y} x1="0" y1={y * 48} x2="200" y2={y * 48} stroke="#1a1816" strokeWidth="0.5" />
          ))}
          {/* EQ curve */}
          <path
            d={`M 0 ${48 - bass * 40} Q 40 ${48 - bass * 44}, 70 ${48 - mid * 38} Q 100 ${48 - mid * 42}, 130 ${48 - treble * 36} Q 160 ${48 - treble * 40}, 180 ${48 - presence * 32} L 200 ${48 - presence * 28}`}
            fill="none" stroke={selected.color} strokeWidth="1.5" opacity="0.6"
          />
          {/* Freq labels */}
          <text x="20" y="46" fill="#3a3735" fontSize="6">100Hz</text>
          <text x="80" y="46" fill="#3a3735" fontSize="6">1kHz</text>
          <text x="160" y="46" fill="#3a3735" fontSize="6">10kHz</text>
        </svg>
      </div>

      {/* Channel info */}
      <div style={{
        marginTop: 12, display: "flex", justifyContent: "space-between",
        fontSize: 9, color: "#3a3735", letterSpacing: "0.1em",
      }}>
        <span>CH: {selected.name.toUpperCase()}</span>
        <span>GAIN: {Math.round(gain * 10)}</span>
        <span>VOL: {Math.round(master * 10)}</span>
      </div>
    </div>
  );
}
