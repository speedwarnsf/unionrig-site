"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export default function KnobGraphic({
  label,
  value: initialValue = 0.6,
  size = 64,
  onChange,
}: {
  label: string;
  value?: number;
  size?: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const velocityRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const angle = -135 + value * 270;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  const clampValue = useCallback((v: number) => {
    if (v <= 0) return 0;
    if (v >= 1) return 1;
    return v;
  }, []);

  const applyDetent = useCallback((v: number, vel: number): [number, number] => {
    // Haptic detent at min/max — bounce back
    if (v <= 0 && vel < 0) return [0, -vel * 0.3];
    if (v >= 1 && vel > 0) return [1, -vel * 0.3];
    return [v, vel];
  }, []);

  const startPhysics = useCallback(() => {
    const tick = () => {
      if (draggingRef.current) return;
      const friction = 0.92;
      velocityRef.current *= friction;
      if (Math.abs(velocityRef.current) < 0.0005) {
        velocityRef.current = 0;
        return;
      }
      setValue((prev) => {
        const next = prev + velocityRef.current;
        const [clamped, newVel] = applyDetent(next, velocityRef.current);
        velocityRef.current = newVel;
        return clampValue(clamped);
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [applyDetent, clampValue]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    cancelAnimationFrame(animFrameRef.current);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dy = lastYRef.current - e.clientY; // up = positive
    const dt = performance.now() - lastTimeRef.current;
    const sensitivity = 0.004;
    const delta = dy * sensitivity;
    velocityRef.current = dt > 0 ? delta / (dt / 16) : 0;
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    setValue((prev) => clampValue(prev + delta));
  }, [clampValue]);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startPhysics();
  }, [startPhysics]);

  useEffect(() => {
    onChangeRef.current?.(value);
  }, [value]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Ticks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((-135 + i * 27) * Math.PI) / 180;
    return {
      x1: cx + (r - 4) * Math.cos(a),
      y1: cy + (r - 4) * Math.sin(a),
      x2: cx + (r + 1) * Math.cos(a),
      y2: cy + (r + 1) * Math.sin(a),
      active: i <= value * 10,
    };
  });

  const pointerAngle = (angle * Math.PI) / 180;
  const px = cx + (r - 12) * Math.cos(pointerAngle);
  const py = cy + (r - 12) * Math.sin(pointerAngle);

  return (
    <div
      ref={knobRef}
      style={{ textAlign: "center", cursor: "ns-resize", userSelect: "none", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="1.5" />
        {/* Inner fill */}
        <circle cx={cx} cy={cy} r={r - 8} fill="var(--surface)" stroke="var(--border)" strokeWidth="0.5" />
        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.active ? "var(--accent)" : "var(--border)"}
            strokeWidth="1"
            style={{ transition: "stroke 0.1s" }}
          />
        ))}
        {/* Pointer line */}
        <line
          x1={cx}
          y1={cy}
          x2={px}
          y2={py}
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2" fill="var(--accent)" />
      </svg>
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          marginTop: 8,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
    </div>
  );
}
