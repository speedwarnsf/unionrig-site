"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface EffectNode {
  id: string;
  name: string;
  active: boolean;
  color: string;
  params: { label: string; value: number; min: number; max: number }[];
}

const DEFAULT_CHAIN: EffectNode[] = [
  { id: "comp", name: "Compressor", active: true, color: "#7a9ec9", params: [
    { label: "Threshold", value: -20, min: -40, max: 0 },
    { label: "Ratio", value: 3, min: 1, max: 8 },
    { label: "Mix", value: 0.6, min: 0, max: 1 },
  ]},
  { id: "drive", name: "Drive", active: true, color: "#c97a7a", params: [
    { label: "Gain", value: 12, min: 0, max: 36 },
    { label: "Tone", value: 0.5, min: 0, max: 1 },
    { label: "Mix", value: 0.7, min: 0, max: 1 },
  ]},
  { id: "chorus", name: "Chorus", active: false, color: "#9ac97a", params: [
    { label: "Rate", value: 0.4, min: 0.05, max: 4 },
    { label: "Depth", value: 0.3, min: 0, max: 1 },
    { label: "Mix", value: 0.35, min: 0, max: 1 },
  ]},
  { id: "delay", name: "Delay", active: true, color: "#c9b99a", params: [
    { label: "Time", value: 0.35, min: 0.05, max: 1 },
    { label: "Feedback", value: 0.3, min: 0, max: 0.9 },
    { label: "Mix", value: 0.3, min: 0, max: 1 },
  ]},
  { id: "reverb", name: "Reverb", active: true, color: "#9a7ac9", params: [
    { label: "Decay", value: 2.5, min: 0.2, max: 10 },
    { label: "Damping", value: 0.4, min: 0, max: 1 },
    { label: "Mix", value: 0.3, min: 0, max: 1 },
  ]},
];

// Simplified Web Audio chain builder
function buildPreviewChain(ctx: AudioContext, chain: EffectNode[]) {
  const nodes: { input: AudioNode; output: AudioNode }[] = [];

  for (const fx of chain) {
    if (!fx.active) continue;

    if (fx.id === "comp") {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = fx.params[0].value;
      comp.ratio.value = fx.params[1].value;
      comp.attack.value = 0.01;
      comp.release.value = 0.2;
      nodes.push({ input: comp, output: comp });
    } else if (fx.id === "drive") {
      const ws = ctx.createWaveShaper();
      const gain = fx.params[0].value;
      const N = 4096;
      const curve = new Float32Array(N);
      const lin = Math.pow(10, gain / 20);
      for (let i = 0; i < N; i++) {
        const x = ((i * 2) / N - 1) * lin;
        curve[i] = Math.tanh(x);
      }
      ws.curve = curve;
      ws.oversample = "2x";
      nodes.push({ input: ws, output: ws });
    } else if (fx.id === "chorus") {
      const delay = ctx.createDelay(0.05);
      delay.delayTime.value = 0.007;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = fx.params[0].value;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = fx.params[1].value * 0.003;
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start();
      nodes.push({ input: delay, output: delay });
    } else if (fx.id === "delay") {
      const delay = ctx.createDelay(2);
      delay.delayTime.value = fx.params[0].value;
      const fb = ctx.createGain();
      fb.gain.value = fx.params[1].value;
      const mix = ctx.createGain();
      mix.gain.value = fx.params[2].value;
      const dry = ctx.createGain();
      dry.gain.value = 1 - fx.params[2].value;
      const merge = ctx.createGain();
      // Feedback loop
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(mix);
      mix.connect(merge);
      // We'll wire dry path in the chain
      const splitter = ctx.createGain();
      splitter.connect(delay);
      splitter.connect(dry);
      dry.connect(merge);
      nodes.push({ input: splitter, output: merge });
    } else if (fx.id === "reverb") {
      const conv = ctx.createConvolver();
      const sr = ctx.sampleRate;
      const decay = fx.params[0].value;
      const damp = fx.params[1].value;
      const len = Math.ceil(sr * Math.min(decay * 1.2, 6));
      const buf = ctx.createBuffer(2, len, sr);
      const lpFreq = 12000 - damp * 10000;
      const rc = 1 / (2 * Math.PI * lpFreq);
      const dt = 1 / sr;
      const alpha = dt / (rc + dt);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        let prev = 0;
        for (let i = 0; i < len; i++) {
          const t = i / sr;
          const env = Math.exp(-3 * t / decay);
          const noise = Math.random() * 2 - 1;
          prev = prev + alpha * (noise - prev);
          data[i] = prev * env;
        }
      }
      conv.buffer = buf;
      const wet = ctx.createGain();
      wet.gain.value = fx.params[2].value;
      const dry = ctx.createGain();
      dry.gain.value = 1;
      const merge = ctx.createGain();
      conv.connect(wet);
      wet.connect(merge);
      const splitter = ctx.createGain();
      splitter.connect(conv);
      splitter.connect(dry);
      dry.connect(merge);
      nodes.push({ input: splitter, output: merge });
    }
  }

  return nodes;
}

export default function SignalPathPreview() {
  const [chain, setChain] = useState<EffectNode[]>(DEFAULT_CHAIN);
  const [playing, setPlaying] = useState(false);
  const [source, setSource] = useState<"oscillator" | "noise">("oscillator");
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const stopAudio = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    sourceRef.current = null;
    analyserRef.current = null;
    cancelAnimationFrame(animRef.current);
    setPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    stopAudio();
    const ctx = new AudioContext({ sampleRate: 48000 });
    ctxRef.current = ctx;

    // Source
    let src: AudioNode;
    if (source === "oscillator") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 196; // G3
      osc.start();
      src = osc;
    } else {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      noise.start();
      src = noise;
    }
    sourceRef.current = src;

    const inputGain = ctx.createGain();
    inputGain.gain.value = 0.3;
    src.connect(inputGain);

    // Build chain
    const nodes = buildPreviewChain(ctx, chain);
    let last: AudioNode = inputGain;
    for (const n of nodes) {
      last.connect(n.input);
      last = n.output;
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    last.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;

    setPlaying(true);
  }, [chain, source, stopAudio]);

  // Waveform drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser || !playing) return;

    const dc = canvas.getContext("2d");
    if (!dc) return;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      const w = canvas.width;
      const h = canvas.height;
      dc.clearRect(0, 0, w, h);

      // Grid
      dc.strokeStyle = "#1a1816";
      dc.lineWidth = 0.5;
      dc.beginPath();
      dc.moveTo(0, h / 2);
      dc.lineTo(w, h / 2);
      dc.stroke();

      // Waveform
      dc.strokeStyle = "#c9b99a";
      dc.lineWidth = 1.5;
      dc.beginPath();
      const sliceW = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128;
        const y = (v * h) / 2;
        if (i === 0) dc.moveTo(x, y);
        else dc.lineTo(x, y);
        x += sliceW;
      }
      dc.stroke();
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  useEffect(() => () => { stopAudio(); }, [stopAudio]);

  const toggleEffect = useCallback((id: string) => {
    setChain(prev => prev.map(fx =>
      fx.id === id ? { ...fx, active: !fx.active } : fx
    ));
  }, []);

  const updateParam = useCallback((fxId: string, paramIdx: number, value: number) => {
    setChain(prev => prev.map(fx =>
      fx.id === fxId ? {
        ...fx,
        params: fx.params.map((p, i) => i === paramIdx ? { ...p, value } : p)
      } : fx
    ));
  }, []);

  return (
    <div style={{ marginTop: 48 }}>
      <p style={{
        fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 12, fontWeight: 600,
      }}>Signal Path Audio Preview</p>
      <p style={{
        color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
        maxWidth: 480, marginBottom: 24,
      }}>
        Real Web Audio processing chain. Toggle effects, adjust parameters, hear the difference live.
      </p>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={playing ? stopAudio : startAudio}
            style={{
              background: playing ? "none" : "var(--accent)",
              color: playing ? "var(--accent)" : "var(--bg)",
              border: "1px solid var(--accent)",
              padding: "8px 24px",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >{playing ? "Stop" : "Play"}</button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setSource("oscillator"); if (playing) { stopAudio(); setTimeout(() => startAudio(), 50); } }}
              style={{
                background: source === "oscillator" ? "rgba(201,185,154,0.1)" : "none",
                border: `1px solid ${source === "oscillator" ? "var(--accent)" : "var(--border)"}`,
                color: "var(--fg-dim)",
                padding: "6px 12px",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >Sawtooth</button>
            <button
              onClick={() => { setSource("noise"); if (playing) { stopAudio(); setTimeout(() => startAudio(), 50); } }}
              style={{
                background: source === "noise" ? "rgba(201,185,154,0.1)" : "none",
                border: `1px solid ${source === "noise" ? "var(--accent)" : "var(--border)"}`,
                color: "var(--fg-dim)",
                padding: "6px 12px",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >Noise</button>
          </div>
        </div>

        {/* Waveform */}
        <canvas ref={canvasRef} width={560} height={60} style={{
          width: "100%", height: 60, display: "block",
          border: "1px solid #2a2725", background: "#0e0d0c",
          marginBottom: 20,
        }} />

        {/* Effect chain */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {chain.map(fx => (
            <div key={fx.id} style={{
              border: `1px solid ${fx.active ? fx.color + "40" : "var(--border)"}`,
              background: fx.active ? fx.color + "08" : "var(--surface)",
              padding: "12px 16px",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: fx.active ? 10 : 0 }}>
                {/* Toggle */}
                <button
                  onClick={() => toggleEffect(fx.id)}
                  style={{
                    width: 16, height: 16,
                    border: `1px solid ${fx.active ? fx.color : "#3a3735"}`,
                    background: fx.active ? fx.color + "20" : "none",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {fx.active && <div style={{ width: 6, height: 6, background: fx.color }} />}
                </button>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: fx.active ? "var(--fg)" : "var(--fg-dim)",
                  letterSpacing: "0.06em",
                  textDecoration: fx.active ? "none" : "line-through",
                }}>{fx.name}</span>
              </div>

              {/* Parameters */}
              {fx.active && (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {fx.params.map((p, i) => (
                    <div key={p.label} style={{ flex: "1 1 100px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase" }}>{p.label}</span>
                        <span style={{ fontSize: 9, color: "var(--fg-dim)", fontFamily: "monospace" }}>
                          {p.max <= 1 ? (p.value * 100).toFixed(0) + "%" : p.value.toFixed(1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={p.min}
                        max={p.max}
                        step={(p.max - p.min) / 100}
                        value={p.value}
                        onChange={(e) => updateParam(fx.id, i, parseFloat(e.target.value))}
                        style={{
                          width: "100%",
                          height: 4,
                          appearance: "none",
                          background: `linear-gradient(to right, ${fx.color}40, ${fx.color}40 ${((p.value - p.min) / (p.max - p.min)) * 100}%, #2a2725 ${((p.value - p.min) / (p.max - p.min)) * 100}%)`,
                          cursor: "pointer",
                          outline: "none",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 10, color: "#3a3735", marginTop: 12,
          textAlign: "center", fontFamily: "monospace",
        }}>Real-time Web Audio API processing -- toggle effects to hear the difference</p>
      </div>
    </div>
  );
}
