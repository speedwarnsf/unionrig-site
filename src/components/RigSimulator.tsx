"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import UnionLogo from "./UnionLogo";
import KnobGraphic from "./KnobGraphic";

// ═══════ AUDIO ENGINE ═══════

function createWaveshaperCurve(intensity: number): Float32Array {
  const samples = 256;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    const k = intensity * 50 + 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

interface AudioEngine {
  ctx: AudioContext;
  source: OscillatorNode | AudioBufferSourceNode;
  harmonics: OscillatorNode[];
  gainNode: GainNode;
  waveshaper: WaveShaperNode;
  filter: BiquadFilterNode;
  delay: DelayNode;
  delayFeedback: GainNode;
  delayWet: GainNode;
  delayDry: GainNode;
  bypassGain: GainNode;
  effectGain: GainNode;
  analyser: AnalyserNode;
}

function buildAudioEngine(): AudioEngine {
  const ctx = new AudioContext();

  // ═══════ DEMO TONE — replace with real guitar loop later ═══════
  // Sawtooth + harmonics for guitar-like timbre
  const source = ctx.createOscillator();
  source.type = "sawtooth";
  source.frequency.value = 110; // A2

  const h2 = ctx.createOscillator();
  h2.type = "sine";
  h2.frequency.value = 220;
  const h2g = ctx.createGain();
  h2g.gain.value = 0.3;

  const h3 = ctx.createOscillator();
  h3.type = "sine";
  h3.frequency.value = 330;
  const h3g = ctx.createGain();
  h3g.gain.value = 0.15;

  const sourceMix = ctx.createGain();
  sourceMix.gain.value = 0.4;
  source.connect(sourceMix);
  h2.connect(h2g).connect(sourceMix);
  h3.connect(h3g).connect(sourceMix);
  // ═══════ END DEMO TONE ═══════

  // Touch — input gain
  const gainNode = ctx.createGain();
  gainNode.gain.value = 1.0;

  // Heat — waveshaper distortion
  const waveshaper = ctx.createWaveShaper();
  // @ts-expect-error Float32Array compatibility
  waveshaper.curve = createWaveshaperCurve(0);
  waveshaper.oversample = "4x";

  // Body — low-pass filter
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4000;
  filter.Q.value = 1;

  // Delay network (Depth/Motion/Tempo)
  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.3;
  const delayFeedback = ctx.createGain();
  delayFeedback.gain.value = 0.3;
  const delayWet = ctx.createGain();
  delayWet.gain.value = 0.3;
  const delayDry = ctx.createGain();
  delayDry.gain.value = 0.7;

  // Bypass routing
  const bypassGain = ctx.createGain();
  bypassGain.gain.value = 0;
  const effectGain = ctx.createGain();
  effectGain.gain.value = 1;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;

  // Chain: source → gain → waveshaper → filter → (dry + delay wet) → effectGain → analyser → output
  //        source → bypassGain → analyser → output
  const postFilter = ctx.createGain();
  postFilter.gain.value = 1;

  sourceMix.connect(gainNode);
  gainNode.connect(waveshaper);
  waveshaper.connect(filter);
  filter.connect(postFilter);

  // Dry path
  postFilter.connect(delayDry);

  // Delay path
  postFilter.connect(delay);
  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delay.connect(delayWet);

  // Mix dry+wet into effect chain
  const effectMix = ctx.createGain();
  effectMix.gain.value = 1;
  delayDry.connect(effectMix);
  delayWet.connect(effectMix);
  effectMix.connect(effectGain);

  // Bypass path (clean straight from source)
  sourceMix.connect(bypassGain);

  // Both paths merge into analyser → destination
  effectGain.connect(analyser);
  bypassGain.connect(analyser);
  analyser.connect(ctx.destination);

  source.start();
  h2.start();
  h3.start();

  return {
    ctx,
    source,
    harmonics: [h2, h3],
    gainNode,
    waveshaper,
    filter,
    delay,
    delayFeedback,
    delayWet,
    delayDry,
    bypassGain,
    effectGain,
    analyser,
  };
}

// ═══════ WAVEFORM VISUALIZER ═══════

function WaveformVisualizer({ analyser }: { analyser: AnalyserNode | null }) {
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

      ctx.strokeStyle = "#c9b99a";
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
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      style={{
        width: "100%",
        height: 60,
        display: "block",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    />
  );
}

// ═══════ MAIN COMPONENT ═══════

export default function RigSimulator() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [engaged, setEngaged] = useState(true);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const startAudio = useCallback(async () => {
    if (engineRef.current) return;
    const engine = buildAudioEngine();
    // Mobile Safari requires explicit resume from user gesture
    if (engine.ctx.state === "suspended") {
      await engine.ctx.resume();
    }
    engineRef.current = engine;
    setAnalyser(engine.analyser);
    setPlaying(true);
  }, []);

  const stopAudio = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.source.stop();
    engine.harmonics.forEach((h) => h.stop());
    engine.ctx.close();
    engineRef.current = null;
    setAnalyser(null);
    setPlaying(false);
  }, []);

  const toggleBypass = useCallback(() => {
    setEngaged((prev) => {
      const next = !prev;
      const engine = engineRef.current;
      if (engine) {
        const t = engine.ctx.currentTime;
        engine.effectGain.gain.exponentialRampToValueAtTime(next ? 1 : 0.0001, t + 0.05);
        engine.bypassGain.gain.exponentialRampToValueAtTime(next ? 0.0001 : 1, t + 0.05);
      }
      return next;
    });
  }, []);

  // Knob handlers
  const onTouch = useCallback((v: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const t = engine.ctx.currentTime;
    engine.gainNode.gain.exponentialRampToValueAtTime(Math.max(v * 2, 0.001), t + 0.05);
  }, []);

  const onHeat = useCallback((v: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    // @ts-expect-error Float32Array compatibility
    engine.waveshaper.curve = createWaveshaperCurve(v);
  }, []);

  const onBody = useCallback((v: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const t = engine.ctx.currentTime;
    const freq = 200 + v * 7800; // 200Hz - 8000Hz
    engine.filter.frequency.exponentialRampToValueAtTime(Math.max(freq, 200), t + 0.05);
  }, []);

  const onDepth = useCallback((v: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const t = engine.ctx.currentTime;
    engine.delayWet.gain.exponentialRampToValueAtTime(Math.max(v, 0.001), t + 0.05);
    engine.delayDry.gain.exponentialRampToValueAtTime(Math.max(1 - v, 0.001), t + 0.05);
  }, []);

  const onMotion = useCallback((v: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const t = engine.ctx.currentTime;
    engine.delayFeedback.gain.exponentialRampToValueAtTime(Math.max(v * 0.8, 0.001), t + 0.05);
  }, []);

  const onTempo = useCallback((v: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const t = engine.ctx.currentTime;
    const time = 0.05 + v * 0.75; // 50ms - 800ms
    engine.delay.delayTime.exponentialRampToValueAtTime(Math.max(time, 0.05), t + 0.05);
  }, []);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try {
          engineRef.current.source.stop();
          engineRef.current.harmonics.forEach((h) => h.stop());
        } catch {}
        engineRef.current.ctx.close();
      }
    };
  }, []);

  const knobSize = 72;

  return (
    <div>
      {/* Section heading */}
      <h2
        style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 300,
          letterSpacing: "-0.02em",
          marginBottom: 16,
        }}
      >
        Try the Rig
      </h2>
      <p
        style={{
          color: "var(--fg-dim)",
          fontSize: 15,
          lineHeight: 1.7,
          maxWidth: 560,
          marginBottom: 48,
        }}
      >
        Interactive pedal simulator. Turn the knobs and hear the difference in real-time.
      </p>

      {/* Pedal enclosure */}
      <div
        style={{
          background: "linear-gradient(180deg, #1a1816 0%, #121110 50%, #0e0d0c 100%)",
          border: "2px solid var(--border)",
          maxWidth: 380,
          margin: "0 auto",
          padding: "40px 32px 32px",
          position: "relative",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Screws */}
        {[
          { top: 10, left: 10 },
          { top: 10, right: 10 },
          { bottom: 10, left: 10 },
          { bottom: 10, right: 10 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: 8,
              height: 8,
              background: "#2a2725",
              border: "1px solid #3a3735",
            } as React.CSSProperties}
          />
        ))}

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <UnionLogo width={140} />
        </div>

        {/* TONE section */}
        <div style={{ marginBottom: 8 }}>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              textAlign: "center",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            Tone
          </p>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <KnobGraphic label="Touch" value={0.5} size={knobSize} onChange={onTouch} />
            <KnobGraphic label="Heat" value={0} size={knobSize} onChange={onHeat} />
            <KnobGraphic label="Body" value={0.5} size={knobSize} onChange={onBody} />
          </div>
        </div>

        {/* SPACE section */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              textAlign: "center",
              marginBottom: 12,
              marginTop: 20,
              fontWeight: 500,
            }}
          >
            Space
          </p>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <KnobGraphic label="Depth" value={0.3} size={knobSize} onChange={onDepth} />
            <KnobGraphic label="Motion" value={0.3} size={knobSize} onChange={onMotion} />
            <KnobGraphic label="Tempo" value={0.4} size={knobSize} onChange={onTempo} />
          </div>
        </div>

        {/* Waveform visualizer */}
        <div style={{ marginBottom: 24 }}>
          <WaveformVisualizer analyser={analyser} />
        </div>

        {/* Footswitch */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {/* LED */}
          <div
            style={{
              width: 8,
              height: 8,
              margin: "0 auto 12px",
              background: engaged && playing ? "#c9b99a" : "#2a2725",
              boxShadow: engaged && playing ? "0 0 8px #c9b99a" : "none",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
          />
          {/* Switch button */}
          <button
            onClick={toggleBypass}
            style={{
              width: 56,
              height: 56,
              background: "var(--surface)",
              border: "2px solid var(--border)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              borderRadius: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: `1px solid ${engaged ? "var(--accent)" : "var(--border)"}`,
                transition: "border-color 0.15s",
              }}
            />
          </button>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: engaged ? "var(--accent)" : "var(--fg-dim)",
              marginTop: 10,
              fontWeight: 600,
              transition: "color 0.15s",
            }}
          >
            {engaged ? "Rig Engaged" : "Bypassed"}
          </p>
        </div>
      </div>

      {/* Play/Stop button outside pedal */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={playing ? stopAudio : startAudio}
          style={{
            background: playing ? "none" : "var(--accent)",
            color: playing ? "var(--accent)" : "var(--bg)",
            border: `1px solid var(--accent)`,
            padding: "10px 32px",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: 600,
            borderRadius: 0,
          }}
        >
          {playing ? "Stop" : "Play Demo"}
        </button>
      </div>
    </div>
  );
}
