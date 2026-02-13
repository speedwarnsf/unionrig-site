"use client";

export default function EinkDisplayGraphic() {
  return (
    <div style={{ display: "inline-block" }}>
      <svg width="160" height="220" viewBox="0 0 160 220">
        {/* Outer bezel */}
        <rect x="0" y="0" width="160" height="220" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
        {/* Screen area */}
        <rect x="12" y="12" width="136" height="196" fill="#1a1816" stroke="var(--border)" strokeWidth="0.5" />
        {/* Sound name */}
        <text x="80" y="60" textAnchor="middle" fill="var(--fg)" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="400" letterSpacing="-0.02em">
          Velvet Static
        </text>
        {/* Divider */}
        <line x1="28" y1="76" x2="132" y2="76" stroke="var(--border)" strokeWidth="0.5" />
        {/* Scene indicator */}
        <text x="80" y="104" textAnchor="middle" fill="var(--accent)" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="300">
          A
        </text>
        {/* Divider */}
        <line x1="28" y1="120" x2="132" y2="120" stroke="var(--border)" strokeWidth="0.5" />
        {/* Sound number */}
        <text x="80" y="150" textAnchor="middle" fill="var(--fg-dim)" fontFamily="Inter, sans-serif" fontSize="11" letterSpacing="0.1em">
          SOUND 07 / 12
        </text>
        {/* Status */}
        <text x="80" y="185" textAnchor="middle" fill="var(--fg-dim)" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="0.08em">
          HEAT +12  BODY -8
        </text>
      </svg>
    </div>
  );
}
