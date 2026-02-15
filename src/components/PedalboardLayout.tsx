"use client";

import { useState, useRef, useCallback } from "react";

interface Pedal {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  knobs: { label: string; value: number }[];
}

const DEFAULT_PEDALS: Pedal[] = [
  { id: "comp", name: "COMP", color: "#7a9ec9", x: 20, y: 120, width: 100, height: 140, active: true, knobs: [{ label: "Level", value: 0.6 }, { label: "Tone", value: 0.5 }] },
  { id: "drive", name: "DRIVE", color: "#c97a7a", x: 140, y: 100, width: 100, height: 160, active: true, knobs: [{ label: "Gain", value: 0.7 }, { label: "Tone", value: 0.4 }, { label: "Vol", value: 0.5 }] },
  { id: "chorus", name: "CHORUS", color: "#9ac97a", x: 260, y: 110, width: 100, height: 150, active: false, knobs: [{ label: "Rate", value: 0.3 }, { label: "Depth", value: 0.5 }] },
  { id: "delay", name: "DELAY", color: "#c9b99a", x: 380, y: 90, width: 110, height: 170, active: true, knobs: [{ label: "Time", value: 0.4 }, { label: "Fback", value: 0.3 }, { label: "Mix", value: 0.35 }] },
  { id: "reverb", name: "REVERB", color: "#9a7ac9", x: 510, y: 105, width: 105, height: 155, active: true, knobs: [{ label: "Decay", value: 0.6 }, { label: "Damp", value: 0.4 }, { label: "Mix", value: 0.3 }] },
];

function MiniKnob({ value, size = 16 }: { value: number; size?: number }) {
  const angle = -135 + value * 270;
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const a = (angle * Math.PI) / 180;
  const px = cx + (r - 3) * Math.cos(a);
  const py = cy + (r - 3) * Math.sin(a);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="#1a1816" stroke="#3a3735" strokeWidth="1" />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="#c9b99a" strokeWidth="1" />
    </svg>
  );
}

export default function PedalboardLayout() {
  const [pedals, setPedals] = useState<Pedal[]>(DEFAULT_PEDALS);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  const boardW = 660;
  const boardH = 340;

  const handlePointerDown = useCallback((id: string, e: React.PointerEvent) => {
    e.preventDefault();
    const pedal = pedals.find(p => p.id === id);
    if (!pedal) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = {
      x: e.clientX - rect.left - pedal.x,
      y: e.clientY - rect.top - pedal.y,
    };
    setDragging(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pedals]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = boardW / rect.width;
    const scaleY = boardH / rect.height;
    const x = (e.clientX - rect.left) * scaleX - dragOffset.current.x * scaleX;
    const y = (e.clientY - rect.top) * scaleY - dragOffset.current.y * scaleY;
    setPedals(prev => prev.map(p =>
      p.id === dragging ? { ...p, x: Math.max(0, Math.min(boardW - p.width, x)), y: Math.max(0, Math.min(boardH - p.height, y)) } : p
    ));
  }, [dragging]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const togglePedal = useCallback((id: string) => {
    setPedals(prev => prev.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  }, []);

  // Draw cable path between pedals (sorted by x position)
  const sorted = [...pedals].sort((a, b) => a.x - b.x);

  return (
    <div style={{ marginTop: 48 }}>
      <p style={{
        fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 12, fontWeight: 600,
      }}>Pedalboard Layout</p>
      <p style={{
        color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
        maxWidth: 480, marginBottom: 24,
      }}>
        Top-down view of your board. Drag pedals to rearrange. Click the footswitch to bypass.
      </p>

      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: boardW,
          aspectRatio: `${boardW}/${boardH}`,
          margin: "0 auto",
          background: `
            linear-gradient(180deg, #1a1816 0%, #12100e 100%),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 6px)
          `,
          border: "2px solid #2a2725",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        {/* Velcro texture strips */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute",
            left: 0, right: 0,
            top: 60 + i * 100,
            height: 80,
            background: "repeating-linear-gradient(90deg, rgba(201,185,154,0.03) 0px, rgba(201,185,154,0.03) 1px, transparent 1px, transparent 3px)",
            pointerEvents: "none",
          }} />
        ))}

        {/* Cable SVG overlay */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox={`0 0 ${boardW} ${boardH}`} preserveAspectRatio="none">
          {sorted.map((pedal, i) => {
            if (i === 0) return null;
            const prev = sorted[i - 1];
            const x1 = prev.x + prev.width;
            const y1 = prev.y + prev.height * 0.8;
            const x2 = pedal.x;
            const y2 = pedal.y + pedal.height * 0.8;
            const midX = (x1 + x2) / 2;
            return (
              <path key={`cable-${i}`}
                d={`M${x1},${y1} C${midX},${y1 + 20} ${midX},${y2 + 20} ${x2},${y2}`}
                stroke="#3a3735" strokeWidth="3" fill="none" opacity={0.6}
              />
            );
          })}
        </svg>

        {/* Pedals */}
        {pedals.map(pedal => (
          <div
            key={pedal.id}
            onPointerDown={(e) => handlePointerDown(pedal.id, e)}
            style={{
              position: "absolute",
              left: `${(pedal.x / boardW) * 100}%`,
              top: `${(pedal.y / boardH) * 100}%`,
              width: `${(pedal.width / boardW) * 100}%`,
              height: `${(pedal.height / boardH) * 100}%`,
              background: pedal.active
                ? `linear-gradient(180deg, ${pedal.color}18 0%, #12100e 100%)`
                : "linear-gradient(180deg, #1a1816 0%, #0e0d0c 100%)",
              border: `1px solid ${pedal.active ? pedal.color + "60" : "#2a2725"}`,
              cursor: dragging === pedal.id ? "grabbing" : "grab",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 6px 6px",
              boxShadow: dragging === pedal.id
                ? "0 8px 24px rgba(0,0,0,0.6)"
                : "0 2px 8px rgba(0,0,0,0.4)",
              transition: dragging === pedal.id ? "none" : "box-shadow 0.2s",
              zIndex: dragging === pedal.id ? 10 : 1,
              userSelect: "none",
              touchAction: "none",
            }}
          >
            {/* LED */}
            <div style={{
              width: 4, height: 4,
              background: pedal.active ? pedal.color : "#2a2725",
              boxShadow: pedal.active ? `0 0 6px ${pedal.color}` : "none",
              marginBottom: 4,
            }} />

            {/* Knobs row */}
            <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
              {pedal.knobs.map((k, i) => (
                <MiniKnob key={i} value={k.value} size={18} />
              ))}
            </div>

            {/* Name */}
            <span style={{
              fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
              color: pedal.active ? pedal.color : "#5a5650",
              fontWeight: 600, marginTop: 4,
            }}>{pedal.name}</span>

            {/* Footswitch */}
            <button
              onClick={(e) => { e.stopPropagation(); togglePedal(pedal.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                width: 20, height: 20, marginTop: 4,
                background: "linear-gradient(180deg, #2a2826 0%, #1a1816 100%)",
                border: "1px solid #3a3735",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{
                width: 8, height: 8,
                border: `1px solid ${pedal.active ? pedal.color : "#3a3735"}`,
              }} />
            </button>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: 10, color: "#3a3735", marginTop: 12,
        textAlign: "center", fontFamily: "monospace",
      }}>Drag pedals to rearrange -- click footswitch to bypass</p>
    </div>
  );
}
