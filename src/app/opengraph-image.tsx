import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Union Rig -- Trust what works.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 300,
            color: "#e8e4df",
            letterSpacing: "-0.03em",
            marginBottom: 24,
          }}
        >
          Union Rig
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 300,
            color: "#c9b99a",
            letterSpacing: "0.02em",
          }}
        >
          Trust what works.
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#8a8680",
            marginTop: 48,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Mono-in, stereo-out guitar instrument -- $849 -- 2027
        </div>
      </div>
    ),
    { ...size }
  );
}
