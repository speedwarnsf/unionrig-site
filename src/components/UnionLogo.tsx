export default function UnionLogo({ width = 280, className = "" }: { width?: number; className?: string }) {
  return (
    <svg
      width={width}
      height={width * 0.28}
      viewBox="0 0 280 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Union Rig"
    >
      {/* UNION */}
      <text
        x="0"
        y="42"
        fill="var(--fg)"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="52"
        fontWeight="200"
        letterSpacing="-0.03em"
      >
        UNION
      </text>
      {/* RIG */}
      <text
        x="0"
        y="72"
        fill="var(--accent)"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="500"
        letterSpacing="0.28em"
      >
        RIG
      </text>
      {/* Accent line */}
      <rect x="62" y="58" width="218" height="1" fill="var(--border)" />
    </svg>
  );
}
