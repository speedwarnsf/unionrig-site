"use client";

export default function FootswitchGraphic({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect
          x="4"
          y="4"
          width="32"
          height="32"
          fill={active ? "var(--accent)" : "var(--surface)"}
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <rect
          x="12"
          y="12"
          width="16"
          height="16"
          fill="none"
          stroke={active ? "var(--bg)" : "var(--border)"}
          strokeWidth="0.75"
        />
        {active && <circle cx="20" cy="6" r="2" fill="var(--accent)" />}
      </svg>
      <p
        style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: active ? "var(--accent)" : "var(--fg-dim)",
          marginTop: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
    </div>
  );
}
