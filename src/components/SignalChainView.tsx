"use client";

import { useState, useRef, useCallback } from "react";

// Signal chain stages with detailed info
const STAGES = [
  { id: "dyn", label: "DYNAMICS", desc: "Pick response", detail: "Threshold, ratio, attack/release, makeup gain", color: "#7a9ec9" },
  { id: "drv", label: "DRIVE", desc: "Saturation", detail: "Soft/hard clip, tube, fuzz, fold-back distortion", color: "#c97a7a" },
  { id: "chr", label: "CHARACTER", desc: "Tone shaping", detail: "Chorus, flanger, vibrato modulation", color: "#9ac97a" },
  { id: "stp", label: "STEREO", desc: "Width split", detail: "Micro-delay stereo field generation", color: "#c9b99a" },
  { id: "spc", label: "SPACE", desc: "Reverb", detail: "Algorithmic reverb with decay and damping", color: "#9a7ac9" },
  { id: "cab", label: "CABINET", desc: "Final shape", detail: "Low resonance, high roll-off, air shelf", color: "#7ac9c9" },
];

interface SignalChainViewProps {
  order?: string[];
  onReorder?: (newOrder: string[]) => void;
  interactive?: boolean;
  compact?: boolean;
}

export default function SignalChainView({ order, onReorder, interactive = false, compact = false }: SignalChainViewProps) {
  const stageOrder = order || STAGES.map(s => s.id);
  const orderedStages = stageOrder.map(id => STAGES.find(s => s.id === id)!).filter(Boolean);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragStartRef = useRef<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    if (!interactive) return;
    setDragIdx(idx);
    dragStartRef.current = idx;
  }, [interactive]);

  const handleDragOver = useCallback((idx: number) => {
    if (dragIdx === null) return;
    setOverIdx(idx);
  }, [dragIdx]);

  const handleDrop = useCallback((idx: number) => {
    if (dragIdx === null || !onReorder) return;
    const newOrder = [...stageOrder];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    onReorder(newOrder);
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, stageOrder, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  // Touch drag support
  const touchStartRef = useRef<{ idx: number; y: number } | null>(null);
  const [touchDragIdx, setTouchDragIdx] = useState<number | null>(null);

  const handleTouchStart = useCallback((idx: number, e: React.TouchEvent) => {
    if (!interactive) return;
    touchStartRef.current = { idx, y: e.touches[0].clientY };
    setTouchDragIdx(idx);
  }, [interactive]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const elements = document.querySelectorAll("[data-chain-idx]");
    for (const el of elements) {
      const rect = (el as HTMLElement).getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const idx = parseInt((el as HTMLElement).dataset.chainIdx || "0");
        setOverIdx(idx);
        break;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartRef.current !== null && overIdx !== null && onReorder) {
      const fromIdx = touchStartRef.current.idx;
      const newOrder = [...stageOrder];
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(overIdx, 0, moved);
      onReorder(newOrder);
    }
    touchStartRef.current = null;
    setTouchDragIdx(null);
    setOverIdx(null);
  }, [overIdx, stageOrder, onReorder]);

  if (compact) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 0, overflowX: "auto",
        padding: "12px 0", width: "100%",
      }}>
        {/* Input jack */}
        <div style={{
          width: 8, height: 8, border: "1px solid #5a5650",
          background: "#1a1816", flexShrink: 0,
        }} />
        <svg width="16" height="2" viewBox="0 0 16 2" style={{ flexShrink: 0 }}>
          <line x1="0" y1="1" x2="16" y2="1" stroke="#5a5650" strokeWidth="1" />
        </svg>

        {orderedStages.map((stage, i) => (
          <div key={stage.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              padding: "6px 12px", border: "1px solid #2a2725",
              background: hoveredId === stage.id ? "rgba(201,185,154,0.08)" : "#111",
              transition: "all 0.15s", cursor: interactive ? "grab" : "default",
            }}
              onMouseEnter={() => setHoveredId(stage.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span style={{
                fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                color: stage.color, fontWeight: 600,
              }}>{stage.label}</span>
            </div>
            {i < orderedStages.length - 1 && (
              <svg width="20" height="8" viewBox="0 0 20 8" style={{ flexShrink: 0 }}>
                <line x1="0" y1="4" x2="14" y2="4" stroke="#5a5650" strokeWidth="1" />
                <polygon points="14,1 20,4 14,7" fill="#5a5650" />
              </svg>
            )}
          </div>
        ))}

        <svg width="16" height="2" viewBox="0 0 16 2" style={{ flexShrink: 0 }}>
          <line x1="0" y1="1" x2="16" y2="1" stroke="#5a5650" strokeWidth="1" />
        </svg>
        {/* Output jacks (stereo) */}
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, border: "1px solid #c9b99a", background: "#1a1816" }} />
          <div style={{ width: 8, height: 8, border: "1px solid #c9b99a", background: "#1a1816" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ padding: "24px 0" }}
    >
      {/* Signal flow header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
      }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "#5a5650", fontWeight: 600,
        }}>MONO IN</div>
        <div style={{ flex: 1, height: 1, background: "#2a2725" }} />
        <div style={{
          fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "#c9b99a", fontWeight: 600,
        }}>STEREO OUT</div>
      </div>

      {/* Chain blocks */}
      <div style={{
        display: "flex", alignItems: "stretch", gap: 0,
        overflowX: "auto", WebkitOverflowScrolling: "touch",
      }}>
        {/* Input indicator */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: "0 8px", flexShrink: 0,
        }}>
          <div style={{
            width: 12, height: 12, border: "2px solid #5a5650",
            background: "#1a1816",
          }} />
          <span style={{ fontSize: 8, color: "#5a5650", marginTop: 4, letterSpacing: "0.1em" }}>1/4"</span>
        </div>

        {orderedStages.map((stage, i) => {
          const isDragging = dragIdx === i || touchDragIdx === i;
          const isOver = overIdx === i && (dragIdx !== null || touchDragIdx !== null);

          return (
            <div key={stage.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              data-chain-idx={i}
            >
              {/* Arrow in */}
              <svg width="28" height="12" viewBox="0 0 28 12" style={{ flexShrink: 0 }}>
                <line x1="0" y1="6" x2="22" y2="6" stroke={stage.color} strokeWidth="1" strokeOpacity={0.4} />
                <polygon points="22,3 28,6 22,9" fill={stage.color} fillOpacity={0.4} />
              </svg>

              {/* Block */}
              <div
                draggable={interactive}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => { e.preventDefault(); handleDragOver(i); }}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(i, e)}
                onMouseEnter={() => setHoveredId(stage.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  border: `1px solid ${isOver ? "#c9b99a" : isDragging ? stage.color : "#2a2725"}`,
                  padding: "20px 24px",
                  minWidth: 130,
                  textAlign: "center",
                  background: isDragging ? "rgba(201,185,154,0.06)" : hoveredId === stage.id ? "rgba(201,185,154,0.03)" : "#111",
                  cursor: interactive ? "grab" : "default",
                  transition: "all 0.2s",
                  opacity: isDragging ? 0.7 : 1,
                  position: "relative",
                }}
              >
                {/* Stage number */}
                <div style={{
                  position: "absolute", top: 4, left: 8,
                  fontSize: 9, color: "#2a2725", fontFamily: "monospace",
                }}>{String(i + 1).padStart(2, "0")}</div>

                {interactive && (
                  <div style={{
                    position: "absolute", top: 4, right: 8,
                    fontSize: 9, color: "#3a3735", letterSpacing: "0.1em",
                  }}>::</div>
                )}

                <div style={{
                  width: 6, height: 6, background: stage.color,
                  margin: "0 auto 8px", opacity: 0.6,
                }} />
                <p style={{
                  fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: stage.color, marginBottom: 4, fontWeight: 600,
                }}>{stage.label}</p>
                <p style={{ fontSize: 11, color: "#8a8278", marginBottom: 6 }}>{stage.desc}</p>
                {hoveredId === stage.id && (
                  <p style={{
                    fontSize: 9, color: "#5a5650", lineHeight: 1.4,
                    fontFamily: "monospace", marginTop: 4,
                  }}>{stage.detail}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Final arrow + output */}
        <svg width="28" height="12" viewBox="0 0 28 12" style={{ flexShrink: 0, alignSelf: "center" }}>
          <line x1="0" y1="6" x2="22" y2="6" stroke="#c9b99a" strokeWidth="1" strokeOpacity={0.4} />
          <polygon points="22,3 28,6 22,9" fill="#c9b99a" fillOpacity={0.4} />
        </svg>

        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", padding: "0 8px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 12, height: 12, border: "2px solid #c9b99a", background: "#1a1816" }} />
            <div style={{ width: 12, height: 12, border: "2px solid #c9b99a", background: "#1a1816" }} />
          </div>
          <span style={{ fontSize: 8, color: "#c9b99a", marginTop: 4, letterSpacing: "0.1em" }}>L / R</span>
        </div>
      </div>

      {interactive && (
        <p style={{
          fontSize: 10, color: "#3a3735", marginTop: 12,
          textAlign: "center", fontFamily: "monospace",
        }}>Drag blocks to reorder the signal chain</p>
      )}
    </div>
  );
}
