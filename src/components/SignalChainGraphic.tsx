"use client";

const blocks = [
  { label: "DYNAMICS", desc: "Pick response" },
  { label: "DRIVE", desc: "Saturation" },
  { label: "CHARACTER", desc: "Tone shaping" },
  { label: "STEREO", desc: "Width split" },
  { label: "SPACE", desc: "Delay + reverb" },
  { label: "OUTPUT", desc: "Final shape" },
];

export default function SignalChainGraphic() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflowX: "auto",
        padding: "24px 0",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {blocks.map((block, i) => (
        <div key={block.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div
            style={{
              border: "1px solid var(--border)",
              padding: "16px 20px",
              minWidth: 110,
              textAlign: "center",
              background: "var(--surface)",
              transition: "border-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              {block.label}
            </p>
            <p style={{ fontSize: 11, color: "var(--fg-dim)" }}>{block.desc}</p>
          </div>
          {i < blocks.length - 1 && (
            <svg width="24" height="12" viewBox="0 0 24 12" style={{ flexShrink: 0 }}>
              <line x1="0" y1="6" x2="18" y2="6" stroke="var(--fg-dim)" strokeWidth="1" />
              <polygon points="18,2 24,6 18,10" fill="var(--fg-dim)" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
