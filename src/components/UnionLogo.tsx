import Image from "next/image";

export default function UnionLogo({ width = 280, className = "" }: { width?: number; className?: string }) {
  return (
    <div className={className} style={{ width, position: "relative" }}>
      <Image
        src="/images/union-logo.jpg"
        alt="UNION"
        width={1400}
        height={400}
        style={{
          width: "100%",
          height: "auto",
          mixBlendMode: "screen",
          display: "block",
        }}
        priority
      />
      <p
        style={{
          fontSize: width * 0.08,
          letterSpacing: "0.28em",
          fontWeight: 500,
          color: "var(--accent)",
          marginTop: 4,
        }}
      >
        RIG
      </p>
    </div>
  );
}
