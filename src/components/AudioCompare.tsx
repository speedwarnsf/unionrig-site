"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface AudioCompareProps {
  cleanUrl?: string;
  affectedUrl?: string;
  cleanLabel?: string;
  affectedLabel?: string;
}

function WaveformCanvas({
  analyser,
  active,
  label,
}: {
  analyser: AnalyserNode | null;
  active: boolean;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = active
        ? getComputedStyle(canvas).getPropertyValue("--accent").trim() || "#fff"
        : getComputedStyle(canvas).getPropertyValue("--border").trim() || "#333";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const sliceWidth = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser, active]);

  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        padding: 16,
        opacity: active ? 1 : 0.4,
        transition: "opacity 0.3s, border-color 0.3s",
      }}
    >
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: active ? "var(--accent)" : "var(--fg-dim)",
          marginBottom: 12,
          fontWeight: 500,
          transition: "color 0.3s",
        }}
      >
        {label}
      </p>
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        style={{ width: "100%", height: 80, display: "block" }}
      />
    </div>
  );
}

export default function AudioCompare({
  cleanUrl,
  affectedUrl,
  cleanLabel = "Clean",
  affectedLabel = "Union Rig",
}: AudioCompareProps) {
  const [mode, setMode] = useState<"clean" | "affected">("clean");
  const [ready, setReady] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cleanSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const affectedSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const cleanGainRef = useRef<GainNode | null>(null);
  const affectedGainRef = useRef<GainNode | null>(null);
  const cleanAnalyserRef = useRef<AnalyserNode | null>(null);
  const affectedAnalyserRef = useRef<AnalyserNode | null>(null);
  const cleanAudioRef = useRef<HTMLAudioElement | null>(null);
  const affectedAudioRef = useRef<HTMLAudioElement | null>(null);

  const hasAudio = !!(cleanUrl && affectedUrl);

  const initAudio = useCallback(() => {
    if (!hasAudio || ready) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const cleanEl = new Audio(cleanUrl);
    const affectedEl = new Audio(affectedUrl);
    cleanEl.loop = true;
    affectedEl.loop = true;
    cleanEl.crossOrigin = "anonymous";
    affectedEl.crossOrigin = "anonymous";
    cleanAudioRef.current = cleanEl;
    affectedAudioRef.current = affectedEl;

    const cleanSrc = ctx.createMediaElementSource(cleanEl);
    const affectedSrc = ctx.createMediaElementSource(affectedEl);
    cleanSourceRef.current = cleanSrc;
    affectedSourceRef.current = affectedSrc;

    const cleanGain = ctx.createGain();
    const affectedGain = ctx.createGain();
    cleanGain.gain.value = 1;
    affectedGain.gain.value = 0;
    cleanGainRef.current = cleanGain;
    affectedGainRef.current = affectedGain;

    const cleanAnalyser = ctx.createAnalyser();
    const affectedAnalyser = ctx.createAnalyser();
    cleanAnalyser.fftSize = 2048;
    affectedAnalyser.fftSize = 2048;
    cleanAnalyserRef.current = cleanAnalyser;
    affectedAnalyserRef.current = affectedAnalyser;

    cleanSrc.connect(cleanGain).connect(cleanAnalyser).connect(ctx.destination);
    affectedSrc.connect(affectedGain).connect(affectedAnalyser).connect(ctx.destination);

    cleanEl.play();
    affectedEl.play();
    setReady(true);
  }, [hasAudio, ready, cleanUrl, affectedUrl]);

  const toggle = useCallback(() => {
    const next = mode === "clean" ? "affected" : "clean";
    setMode(next);
    if (!audioCtxRef.current) return;
    const t = audioCtxRef.current.currentTime;
    const fade = 0.15;
    if (cleanGainRef.current && affectedGainRef.current) {
      cleanGainRef.current.gain.linearRampToValueAtTime(next === "clean" ? 1 : 0, t + fade);
      affectedGainRef.current.gain.linearRampToValueAtTime(next === "affected" ? 1 : 0, t + fade);
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      cleanAudioRef.current?.pause();
      affectedAudioRef.current?.pause();
      audioCtxRef.current?.close();
    };
  }, []);

  // Placeholder state
  if (!hasAudio) {
    return (
      <div style={{ border: "1px solid var(--border)", padding: 48, textAlign: "center" }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 16,
          }}
        >
          A/B Audio Comparison
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 300,
              height: 80,
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {cleanLabel}
            </p>
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 300,
              height: 80,
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {affectedLabel}
            </p>
          </div>
        </div>
        <p style={{ color: "var(--fg-dim)", fontSize: 13 }}>Guitar demo coming soon</p>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--border)", padding: 32 }}>
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          marginBottom: 24,
        }}
      >
        A/B Audio Comparison
      </p>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <WaveformCanvas
          analyser={cleanAnalyserRef.current}
          active={mode === "clean"}
          label={cleanLabel}
        />
        <WaveformCanvas
          analyser={affectedAnalyserRef.current}
          active={mode === "affected"}
          label={affectedLabel}
        />
      </div>
      {!ready ? (
        <button
          onClick={initAudio}
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            padding: "10px 24px",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Play Demo
        </button>
      ) : (
        <button
          onClick={toggle}
          style={{
            background: "none",
            color: "var(--accent)",
            border: "1px solid var(--accent)",
            padding: "10px 24px",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Switch to {mode === "clean" ? affectedLabel : cleanLabel}
        </button>
      )}
    </div>
  );
}
