import Image from "next/image";

export default function UnionLogo({ width = 280, className = "" }: { width?: number; className?: string }) {
  return (
    <div className={className} style={{ width, position: "relative" }}>
      <Image
        src="/images/union-logo.png"
        alt="UNION"
        width={1600}
        height={360}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        priority
      />
      <p
        style={{
          fontSize: width * 0.092,
          letterSpacing: "0.28em",
          fontWeight: 500,
          color: "#fff",
          marginTop: 4,
          textAlign: "center",
        }}
      >
        RIG
      </p>
    </div>
  );
}
