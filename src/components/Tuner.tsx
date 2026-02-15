"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function frequencyToNote(freq: number): { note: string; octave: number; cents: number } {
  const A4 = 440;
  const semitones = 12 * Math.log2(freq / A4);
  const rounded = Math.round(semitones);
  const cents = Math.round((semitones - rounded) * 100);
  const noteIndex = ((rounded % 12) + 12 + 9) % 12; // A=0, so shift
  const octave = Math.floor((rounded + 9) / 12) + 4;
  return { note: NOTE_NAMES[noteIndex], octave, cents };
}

function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;
  const thresh = 0.2;
  for (let i = 0; i < SIZE / 2; i++) { if (Math.abs(buf[i]) < thresh) { r1 = i; break; } }
  for (let i = 1; i < SIZE / 2; i++) { if (Math.abs(buf[SIZE - i]) < thresh) { r2 = SIZE - i; break; } }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  const c = new Float32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] += buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }

  let T0 = maxpos;
  // Parabolic interpolation
  const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

export default function Tuner() {
  const [active, setActive] = useState(false);
  const [note, setNote] = useState("");
  const [octave, setOctave] = useState(4);
  const [cents, setCents] = useState(0);
  const [freq, setFreq] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);

      const buf = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        const f = autoCorrelate(buf, ctx.sampleRate);
        if (f > 0 && f < 2000) {
          const { note: n, octave: o, cents: c } = frequencyToNote(f);
          setNote(n);
          setOctave(o);
          setCents(c);
          setFreq(Math.round(f * 10) / 10);
        }
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      console.error("Microphone access denied");
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
    setActive(false);
    setNote("");
    setCents(0);
    setFreq(0);
  }, []);

  useEffect(() => () => { cancelAnimationFrame(animRef.current); }, []);

  const inTune = Math.abs(cents) <= 5;
  const centsColor = inTune ? "#4a9" : Math.abs(cents) <= 15 ? "#c9b99a" : "#c97a7a";

  return (
    <div style={{
      background: "linear-gradient(180deg, #1e1c1a 0%, #0e0d0c 100%)",
      border: "2px solid #2a2725",
      padding: "24px",
      maxWidth: 320,
      margin: "0 auto",
      position: "relative",
    }}>
      {/* Corner details */}
      <div style={{ position: "absolute", top: 6, left: 6, width: 8, height: 8, border: "1px solid #3a3735" }} />
      <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, border: "1px solid #3a3735" }} />

      <div style={{
        fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
        color: "#5a5650", textAlign: "center", marginBottom: 16, fontWeight: 600,
      }}>CHROMATIC TUNER</div>

      {/* Display */}
      <div style={{
        background: "#0a0908",
        border: "1px solid #2a2725",
        padding: "20px 16px",
        textAlign: "center",
        marginBottom: 16,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        {active && note ? (
          <>
            <div style={{ fontSize: 48, fontWeight: 300, color: centsColor, lineHeight: 1 }}>
              {note}<span style={{ fontSize: 18, color: "#5a5650" }}>{octave}</span>
            </div>
            <div style={{ fontSize: 11, color: "#5a5650", marginTop: 8 }}>{freq} Hz</div>

            {/* Cents meter */}
            <div style={{ margin: "12px auto 0", width: "100%", maxWidth: 200 }}>
              <div style={{ position: "relative", height: 8, background: "#1a1816", border: "1px solid #2a2725" }}>
                {/* Center line */}
                <div style={{
                  position: "absolute", left: "50%", top: 0, bottom: 0,
                  width: 1, background: "#3a3735",
                }} />
                {/* Indicator */}
                <div style={{
                  position: "absolute",
                  left: `${50 + cents / 2}%`,
                  top: 0, bottom: 0, width: 3,
                  background: centsColor,
                  transform: "translateX(-50%)",
                  transition: "left 0.08s",
                }} />
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 8, color: "#3a3735", marginTop: 2,
              }}>
                <span>-50</span>
                <span style={{ color: inTune ? "#4a9" : "#5a5650" }}>
                  {cents > 0 ? "+" : ""}{cents}c
                </span>
                <span>+50</span>
              </div>
            </div>
          </>
        ) : active ? (
          <div style={{ fontSize: 13, color: "#5a5650" }}>Listening...</div>
        ) : (
          <div style={{ fontSize: 13, color: "#3a3735" }}>Tap to start</div>
        )}
      </div>

      {/* LED indicator */}
      {active && (
        <div style={{
          width: 6, height: 6, margin: "0 auto 12px",
          background: inTune && note ? "#4a9" : "#c97a7a",
          boxShadow: inTune && note ? "0 0 8px #4a9" : "none",
          transition: "all 0.15s",
        }} />
      )}

      <button
        onClick={active ? stop : start}
        style={{
          display: "block", width: "100%",
          background: active ? "none" : "var(--accent, #c9b99a)",
          color: active ? "var(--accent, #c9b99a)" : "#0a0a0a",
          border: "1px solid var(--accent, #c9b99a)",
          padding: "8px 16px",
          fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
          cursor: "pointer", fontWeight: 600, borderRadius: 0,
        }}
      >{active ? "Stop Tuner" : "Start Tuner"}</button>
    </div>
  );
}
