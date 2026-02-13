"use client";

export default function KnobGraphic({
  label,
  value = 0.6,
  size = 64,
}: {
  label: string;
  value?: number;
  size?: number;
}) {
  const angle = -135 + value * 270;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((-135 + i * 27) * Math.PI) / 180;
    return {
      x1: cx + (r - 4) * Math.cos(a),
      y1: cy + (r - 4) * Math.sin(a),
      x2: cx + (r + 1) * Math.cos(a),
      y2: cy + (r + 1) * Math.sin(a),
    };
  });

  const pointerAngle = (angle * Math.PI) / 180;
  const px = cx + (r - 12) * Math.cos(pointerAngle);
  const py = cy + (r - 12) * Math.sin(pointerAngle);

  return (
    <div style={{ textAlign: "center" }}>
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
            stroke={i <= value * 10 ? "var(--accent)" : "var(--border)"}
            strokeWidth="1"
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
