"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ============================================================
// TYPES (mirrored from RigSimulator)
// ============================================================

interface DynP { enable: boolean; thresh_db: number; ratio: number; attack_ms: number; release_ms: number; makeup_db: number; mix: number; }
interface DrvP { type: number; pre_gain_db: number; asym: number; tone_tilt: number; low_cut_hz: number; high_cut_hz: number; mix: number; level_db: number; }
interface ChrP { mode: number; rate_hz: number; depth: number; mix: number; tone: number; }
interface StpP { width: number; micro_delay_ms: number; }
interface SpcP { damp: number; wet: number; dry: number; decay_s: number; }
interface CabP { low_res_hz: number; high_roll_hz: number; air: number; }
interface OutP { level_db: number; lim_thresh_db: number; lim_release_ms: number; }
interface RigP { dyn: DynP; drv: DrvP; chr: ChrP; stp: StpP; spc: SpcP; cab: CabP; out: OutP; }

interface SoundDef {
  name: string;
  sceneA: RigP;
  sceneB: RigP;
  subOctave?: number;
}

interface RigJsonScene {
  label: string;
  params: {
    dyn: Record<string, number | boolean>;
    drv: Record<string, number>;
    chr: Record<string, number>;
    stp: Record<string, number>;
    spc: Record<string, number>;
    cab: Record<string, number>;
    out: Record<string, number>;
  };
}

interface RigJson {
  rig_id: string;
  name: string;
  tags: string[];
  notes: string;
  scenes: { A: RigJsonScene; B: RigJsonScene };
}

interface PresetEntry {
  id: string;
  name: string;
  file: string;
  tags: string[];
  notes: string;
}

// ============================================================
// RESEARCH TYPES
// ============================================================

interface ResearchSound {
  id: string;
  name: string;
  description: string;
  reference: string;
  tags: string[];
  iteration: number;
  parentId: string | null;
  rating: number;
  notes: string;
  sceneA: RigP;
  sceneB: RigP;
  subOctave: number;
  createdAt: string;
  updatedAt: string;
}

interface SoundSet {
  id: string;
  name: string;
  description: string;
  soundIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DSP UTILITIES (from RigSimulator)
// ============================================================

function clampf(x: number, a: number, b: number) { return x < a ? a : x > b ? b : x; }
function dbToLin(db: number) { return Math.pow(10, db / 20); }
function lerpf(a: number, b: number, t: number) { return a + (b - a) * t; }

function makeRig(overrides: Partial<{
  dyn: Partial<DynP>; drv: Partial<DrvP>; chr: Partial<ChrP>;
  stp: Partial<StpP>; spc: Partial<SpcP>; cab: Partial<CabP>; out: Partial<OutP>;
}>): RigP {
  const base: RigP = {
    dyn: { enable: true, thresh_db: -22, ratio: 2.5, attack_ms: 18, release_ms: 220, makeup_db: 4, mix: 0.55 },
    drv: { type: 1, pre_gain_db: 9, asym: 0.25, tone_tilt: -0.15, low_cut_hz: 90, high_cut_hz: 8500, mix: 0.65, level_db: 0 },
    chr: { mode: 1, rate_hz: 0.45, depth: 0.25, mix: 0.30, tone: -0.10 },
    stp: { width: 0.55, micro_delay_ms: 6.5 },
    spc: { damp: 0.45, wet: 0.38, dry: 1.0, decay_s: 3.2 },
    cab: { low_res_hz: 110, high_roll_hz: 6800, air: 0.30 },
    out: { level_db: -3, lim_thresh_db: -6, lim_release_ms: 160 },
  };
  if (overrides.dyn) Object.assign(base.dyn, overrides.dyn);
  if (overrides.drv) Object.assign(base.drv, overrides.drv);
  if (overrides.chr) Object.assign(base.chr, overrides.chr);
  if (overrides.stp) Object.assign(base.stp, overrides.stp);
  if (overrides.spc) Object.assign(base.spc, overrides.spc);
  if (overrides.cab) Object.assign(base.cab, overrides.cab);
  if (overrides.out) Object.assign(base.out, overrides.out);
  return base;
}

function rigJsonSceneToRigP(scene: RigJsonScene): RigP {
  const p = scene.params;
  return {
    dyn: {
      enable: p.dyn.enable !== false,
      thresh_db: (p.dyn.thresh_db as number) ?? -22,
      ratio: (p.dyn.ratio as number) ?? 2.5,
      attack_ms: (p.dyn.attack_ms as number) ?? 18,
      release_ms: (p.dyn.release_ms as number) ?? 220,
      makeup_db: (p.dyn.makeup_db as number) ?? 4,
      mix: (p.dyn.mix as number) ?? 0.55,
    },
    drv: {
      type: p.drv.type ?? 1,
      pre_gain_db: p.drv.pre_gain_db ?? 9,
      asym: p.drv.asym ?? 0.25,
      tone_tilt: p.drv.tone_tilt ?? -0.15,
      low_cut_hz: p.drv.low_cut_hz ?? 90,
      high_cut_hz: p.drv.high_cut_hz ?? 8500,
      mix: p.drv.mix ?? 0.65,
      level_db: p.drv.level_db ?? 0,
    },
    chr: {
      mode: p.chr.mode ?? 1,
      rate_hz: p.chr.rate_hz ?? 0.45,
      depth: p.chr.depth ?? 0.25,
      mix: p.chr.mix ?? 0.30,
      tone: p.chr.tone ?? -0.10,
    },
    stp: {
      width: p.stp.width ?? 0.55,
      micro_delay_ms: p.stp.micro_delay_ms ?? 6.5,
    },
    spc: {
      decay_s: p.spc.decay_s ?? 3.2,
      damp: p.spc.damp ?? 0.45,
      wet: p.spc.wet ?? 0.38,
      dry: p.spc.dry ?? 1.0,
    },
    cab: {
      low_res_hz: p.cab.low_res_hz ?? 110,
      high_roll_hz: p.cab.high_roll_hz ?? 6800,
      air: p.cab.air ?? 0.30,
    },
    out: {
      level_db: p.out.level_db ?? -3,
      lim_thresh_db: p.out.lim_thresh_db ?? -6,
      lim_release_ms: p.out.lim_release_ms ?? 160,
    },
  };
}

function rigJsonToSoundDef(rj: RigJson): SoundDef {
  return {
    name: rj.name,
    sceneA: rigJsonSceneToRigP(rj.scenes.A),
    sceneB: rigJsonSceneToRigP(rj.scenes.B),
  };
}

// ============================================================
// AUDIO ENGINE (from RigSimulator)
// ============================================================

function generateReverbIR(ctx: AudioContext, decay: number, damp: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.ceil(sr * Math.min(decay * 1.5, 8));
  const buf = ctx.createBuffer(2, len, sr);
  const lpFreq = lerpf(12000, 2000, clampf(damp, 0, 1));
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
      const filtered = prev + alpha * (noise - prev);
      prev = filtered;
      data[i] = filtered * env;
    }
  }
  return buf;
}

function makeDriveCurve(type: number, asym: number, preGainLin: number, toneTilt: number): Float32Array {
  const N = 8192;
  const curve = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let x = ((i * 2) / N - 1);
    let y = x * preGainLin;
    y += asym * 0.15 * (y * y * y);
    let s = y;
    switch (type) {
      case 0: break;
      case 1: s = Math.tanh(y); break;
      case 2: s = clampf(y, -1, 1); break;
      case 3: s = Math.tanh(y * 1.2); s = clampf(s + 0.1 * y, -1.2, 1.2); break;
      case 4: { s = y; if (s > 1) s = 2 - s; if (s < -1) s = -2 - s; break; }
      case 5: { let f = y * 1.3; if (f > 1) f = 2 - f; if (f < -1) f = -2 - f; s = Math.tanh(f); break; }
      default: s = Math.tanh(y); break;
    }
    s = s * (1 - 0.15 * toneTilt);
    curve[i] = s;
  }
  return curve;
}

interface AudioEngine {
  ctx: AudioContext;
  source: AudioBufferSourceNode;
  compressor: DynamicsCompressorNode;
  compMakeupGain: GainNode;
  compDryGain: GainNode;
  compWetGain: GainNode;
  compMerge: GainNode;
  driveHP: BiquadFilterNode;
  driveLP: BiquadFilterNode;
  waveshaper: WaveShaperNode;
  driveDryGain: GainNode;
  driveWetGain: GainNode;
  driveLevelGain: GainNode;
  driveMerge: GainNode;
  chorusDelay: DelayNode;
  chorusLFO: OscillatorNode;
  chorusLFOGain: GainNode;
  chorusDryGain: GainNode;
  chorusWetGain: GainNode;
  chorusMerge: GainNode;
  merger: ChannelMergerNode;
  delayL: DelayNode;
  delayR: DelayNode;
  stereoLDry: GainNode;
  stereoRDry: GainNode;
  stereoLWet: GainNode;
  stereoRWet: GainNode;
  convolver: ConvolverNode;
  reverbDryGain: GainNode;
  reverbWetGain: GainNode;
  cabLowRes: BiquadFilterNode;
  cabHighRoll: BiquadFilterNode;
  cabAirShelf: BiquadFilterNode;
  outputGain: GainNode;
  limiter: DynamicsCompressorNode;
  analyser: AnalyserNode;
}

function buildEngine(): AudioEngine {
  const ctx = new AudioContext({ sampleRate: 48000 });
  const source = ctx.createBufferSource();
  source.loop = true;
  const inputGain = ctx.createGain(); inputGain.gain.value = 1;
  source.connect(inputGain);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -22; compressor.ratio.value = 2.5;
  compressor.attack.value = 0.018; compressor.release.value = 0.22; compressor.knee.value = 6;
  const compMakeupGain = ctx.createGain(); compMakeupGain.gain.value = dbToLin(4);
  const compWetGain = ctx.createGain(); compWetGain.gain.value = 0.55;
  const compDryGain = ctx.createGain(); compDryGain.gain.value = 0.45;
  const compMerge = ctx.createGain(); compMerge.gain.value = 1;

  const driveHP = ctx.createBiquadFilter(); driveHP.type = "highpass"; driveHP.frequency.value = 90; driveHP.Q.value = 0.5;
  const driveLP = ctx.createBiquadFilter(); driveLP.type = "lowpass"; driveLP.frequency.value = 8500; driveLP.Q.value = 0.5;
  const waveshaper = ctx.createWaveShaper();
  waveshaper.curve = makeDriveCurve(1, 0.25, dbToLin(9), -0.15) as Float32Array<ArrayBuffer>;
  waveshaper.oversample = "4x";
  const driveWetGain = ctx.createGain(); driveWetGain.gain.value = 0.65;
  const driveDryGain = ctx.createGain(); driveDryGain.gain.value = 0.35;
  const driveLevelGain = ctx.createGain(); driveLevelGain.gain.value = 1;
  const driveMerge = ctx.createGain(); driveMerge.gain.value = 1;

  const chorusDelay = ctx.createDelay(0.05); chorusDelay.delayTime.value = 0.007;
  const chorusLFO = ctx.createOscillator(); chorusLFO.type = "sine"; chorusLFO.frequency.value = 0.45;
  const chorusLFOGain = ctx.createGain(); chorusLFOGain.gain.value = 0.25 * 0.003;
  const chorusDryGain = ctx.createGain(); chorusDryGain.gain.value = 0.7;
  const chorusWetGain = ctx.createGain(); chorusWetGain.gain.value = 0.3;
  const chorusMerge = ctx.createGain(); chorusMerge.gain.value = 1;

  const merger = ctx.createChannelMerger(2);
  const delayL = ctx.createDelay(0.02); delayL.delayTime.value = 0.0065;
  const delayR = ctx.createDelay(0.02); delayR.delayTime.value = 0.0065 * 0.85;
  const stereoLDry = ctx.createGain(); stereoLDry.gain.value = 0.45;
  const stereoRDry = ctx.createGain(); stereoRDry.gain.value = 0.45;
  const stereoLWet = ctx.createGain(); stereoLWet.gain.value = 0.55;
  const stereoRWet = ctx.createGain(); stereoRWet.gain.value = 0.55;

  const convolver = ctx.createConvolver();
  convolver.buffer = generateReverbIR(ctx, 3.2, 0.45);
  const reverbDryGain = ctx.createGain(); reverbDryGain.gain.value = 1.0;
  const reverbWetGain = ctx.createGain(); reverbWetGain.gain.value = 0.38;

  const cabLowRes = ctx.createBiquadFilter(); cabLowRes.type = "lowshelf"; cabLowRes.frequency.value = 110; cabLowRes.gain.value = 4;
  const cabHighRoll = ctx.createBiquadFilter(); cabHighRoll.type = "lowpass"; cabHighRoll.frequency.value = 6800; cabHighRoll.Q.value = 0.7;
  const cabAirShelf = ctx.createBiquadFilter(); cabAirShelf.type = "highshelf"; cabAirShelf.frequency.value = 8000; cabAirShelf.gain.value = 0.3 * 6;

  const outputGain = ctx.createGain(); outputGain.gain.value = dbToLin(-3);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.16; limiter.knee.value = 0;

  const analyser = ctx.createAnalyser(); analyser.fftSize = 2048;

  // Routing
  inputGain.connect(compressor);
  compressor.connect(compMakeupGain);
  compMakeupGain.connect(compWetGain);
  compWetGain.connect(compMerge);
  inputGain.connect(compDryGain);
  compDryGain.connect(compMerge);

  compMerge.connect(driveHP);
  driveHP.connect(driveLP);
  driveLP.connect(waveshaper);
  waveshaper.connect(driveLevelGain);
  driveLevelGain.connect(driveWetGain);
  driveWetGain.connect(driveMerge);
  compMerge.connect(driveDryGain);
  driveDryGain.connect(driveMerge);

  driveMerge.connect(chorusDelay);
  chorusLFO.connect(chorusLFOGain);
  chorusLFOGain.connect(chorusDelay.delayTime);
  chorusDelay.connect(chorusWetGain);
  chorusWetGain.connect(chorusMerge);
  driveMerge.connect(chorusDryGain);
  chorusDryGain.connect(chorusMerge);

  chorusMerge.connect(delayL);
  delayL.connect(stereoLWet);
  chorusMerge.connect(stereoLDry);
  stereoLWet.connect(merger, 0, 0);
  stereoLDry.connect(merger, 0, 0);
  chorusMerge.connect(delayR);
  delayR.connect(stereoRWet);
  chorusMerge.connect(stereoRDry);
  stereoRWet.connect(merger, 0, 1);
  stereoRDry.connect(merger, 0, 1);

  const reverbMerge = ctx.createGain(); reverbMerge.gain.value = 1;
  merger.connect(convolver);
  convolver.connect(reverbWetGain);
  reverbWetGain.connect(reverbMerge);
  merger.connect(reverbDryGain);
  reverbDryGain.connect(reverbMerge);

  reverbMerge.connect(cabLowRes);
  cabLowRes.connect(cabHighRoll);
  cabHighRoll.connect(cabAirShelf);
  cabAirShelf.connect(outputGain);
  outputGain.connect(limiter);
  limiter.connect(analyser);
  analyser.connect(ctx.destination);

  chorusLFO.start();

  return {
    ctx, source, compressor, compMakeupGain, compDryGain, compWetGain, compMerge,
    driveHP, driveLP, waveshaper, driveDryGain, driveWetGain, driveLevelGain, driveMerge,
    chorusDelay, chorusLFO, chorusLFOGain, chorusDryGain, chorusWetGain, chorusMerge,
    merger, delayL, delayR, stereoLDry, stereoRDry, stereoLWet, stereoRWet,
    convolver, reverbDryGain, reverbWetGain,
    cabLowRes, cabHighRoll, cabAirShelf,
    outputGain, limiter, analyser,
  };
}

function updateEngineParams(engine: AudioEngine, p: RigP) {
  const t = engine.ctx.currentTime;
  const ramp = 0.015;

  engine.compressor.threshold.linearRampToValueAtTime(p.dyn.thresh_db, t + ramp);
  engine.compressor.ratio.linearRampToValueAtTime(p.dyn.ratio, t + ramp);
  engine.compressor.attack.linearRampToValueAtTime(p.dyn.attack_ms / 1000, t + ramp);
  engine.compressor.release.linearRampToValueAtTime(p.dyn.release_ms / 1000, t + ramp);
  engine.compMakeupGain.gain.linearRampToValueAtTime(dbToLin(p.dyn.makeup_db), t + ramp);
  engine.compWetGain.gain.linearRampToValueAtTime(p.dyn.mix, t + ramp);
  engine.compDryGain.gain.linearRampToValueAtTime(1 - p.dyn.mix, t + ramp);

  engine.driveHP.frequency.linearRampToValueAtTime(p.drv.low_cut_hz, t + ramp);
  engine.driveLP.frequency.linearRampToValueAtTime(p.drv.high_cut_hz, t + ramp);
  engine.waveshaper.curve = makeDriveCurve(p.drv.type, p.drv.asym, dbToLin(p.drv.pre_gain_db), p.drv.tone_tilt) as Float32Array<ArrayBuffer>;
  engine.driveWetGain.gain.linearRampToValueAtTime(p.drv.mix, t + ramp);
  engine.driveDryGain.gain.linearRampToValueAtTime(1 - p.drv.mix, t + ramp);
  engine.driveLevelGain.gain.linearRampToValueAtTime(dbToLin(p.drv.level_db), t + ramp);

  engine.chorusLFO.frequency.linearRampToValueAtTime(p.chr.rate_hz, t + ramp);
  engine.chorusLFOGain.gain.linearRampToValueAtTime(p.chr.depth * 0.003, t + ramp);
  engine.chorusWetGain.gain.linearRampToValueAtTime(p.chr.mix, t + ramp);
  engine.chorusDryGain.gain.linearRampToValueAtTime(1 - p.chr.mix, t + ramp);

  engine.delayL.delayTime.linearRampToValueAtTime(p.stp.micro_delay_ms / 1000, t + ramp);
  engine.delayR.delayTime.linearRampToValueAtTime((p.stp.micro_delay_ms * 0.85) / 1000, t + ramp);
  engine.stereoLWet.gain.linearRampToValueAtTime(p.stp.width, t + ramp);
  engine.stereoRWet.gain.linearRampToValueAtTime(p.stp.width, t + ramp);
  engine.stereoLDry.gain.linearRampToValueAtTime(1 - p.stp.width, t + ramp);
  engine.stereoRDry.gain.linearRampToValueAtTime(1 - p.stp.width, t + ramp);

  engine.reverbDryGain.gain.linearRampToValueAtTime(p.spc.dry, t + ramp);
  engine.reverbWetGain.gain.linearRampToValueAtTime(p.spc.wet, t + ramp);

  engine.cabLowRes.frequency.linearRampToValueAtTime(p.cab.low_res_hz, t + ramp);
  engine.cabHighRoll.frequency.linearRampToValueAtTime(p.cab.high_roll_hz, t + ramp);
  engine.cabAirShelf.gain.linearRampToValueAtTime(p.cab.air * 6, t + ramp);

  engine.outputGain.gain.linearRampToValueAtTime(dbToLin(p.out.level_db), t + ramp);
  engine.limiter.threshold.linearRampToValueAtTime(p.out.lim_thresh_db, t + ramp);
  engine.limiter.release.linearRampToValueAtTime(p.out.lim_release_ms / 1000, t + ramp);
}

// ============================================================
// LOCALSTORAGE HELPERS
// ============================================================

const LS_SOUNDS_KEY = "unionrig-research-sounds";
const LS_SETS_KEY = "unionrig-research-sets";

function loadSounds(): ResearchSound[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_SOUNDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSounds(sounds: ResearchSound[]) {
  localStorage.setItem(LS_SOUNDS_KEY, JSON.stringify(sounds));
}

function loadSets(): SoundSet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_SETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSets(sets: SoundSet[]) {
  localStorage.setItem(LS_SETS_KEY, JSON.stringify(sets));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============================================================
// DRIVE TYPE NAMES
// ============================================================
const DRIVE_TYPES = ["Clean", "Soft Clip", "Hard Clip", "Tube", "Fold", "Fuzz"];
const CHORUS_MODES = ["Off", "Chorus", "Flanger", "Vibrato"];

// ============================================================
// PARAM FIELD COMPONENT
// ============================================================

function ParamField({ label, value, onChange, min, max, step, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <label style={{
        fontSize: 11, color: "#8a8278", width: 100, flexShrink: 0,
        fontFamily: "monospace", letterSpacing: "0.05em",
      }}>{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: "#c9b99a", height: 4, cursor: "pointer" }}
      />
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(clampf(v, min, max));
        }}
        style={{
          width: 64, background: "#1a1816", border: "1px solid #2a2725",
          color: "#e8e4dc", padding: "2px 6px", fontSize: 11,
          fontFamily: "monospace", textAlign: "right",
        }}
      />
      {unit && <span style={{ fontSize: 10, color: "#5a5650", width: 24, fontFamily: "monospace" }}>{unit}</span>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: number; onChange: (v: number) => void;
  options: string[];
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <label style={{
        fontSize: 11, color: "#8a8278", width: 100, flexShrink: 0,
        fontFamily: "monospace", letterSpacing: "0.05em",
      }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          flex: 1, background: "#1a1816", border: "1px solid #2a2725",
          color: "#e8e4dc", padding: "4px 6px", fontSize: 11,
          fontFamily: "monospace",
        }}
      >
        {options.map((opt, i) => <option key={i} value={i}>{opt}</option>)}
      </select>
    </div>
  );
}

// ============================================================
// STAR RATING
// ============================================================

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star === value ? 0 : star)}
          style={{
            background: "none", border: "none",
            color: star <= value ? "#c9b99a" : "#2a2725",
            fontSize: 18, cursor: readonly ? "default" : "pointer",
            padding: 0, lineHeight: 1,
          }}
        >*</button>
      ))}
    </div>
  );
}

// ============================================================
// WAVEFORM
// ============================================================

function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const dc = canvas.getContext("2d");
    if (!dc) return;
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    const draw = () => {
      analyser.getByteTimeDomainData(data);
      const w = canvas.width; const h = canvas.height;
      dc.clearRect(0, 0, w, h);
      dc.strokeStyle = "#c9b99a"; dc.lineWidth = 1.5;
      dc.beginPath();
      const sliceW = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128; const y = (v * h) / 2;
        if (i === 0) dc.moveTo(x, y); else dc.lineTo(x, y);
        x += sliceW;
      }
      dc.lineTo(w, h / 2); dc.stroke();
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser]);

  return (
    <canvas ref={canvasRef} width={600} height={60} style={{
      width: "100%", height: 60, display: "block",
      border: "1px solid #2a2725", background: "#0e0d0c",
    }} />
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16, borderBottom: "1px solid #2a2725", paddingBottom: 12 }}>
      <h3 style={{
        fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "#c9b99a", fontWeight: 600, margin: 0,
      }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: "#5a5650", margin: "4px 0 0", fontFamily: "monospace" }}>{subtitle}</p>}
    </div>
  );
}

// ============================================================
// PARAM GROUP
// ============================================================

function ParamGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      border: "1px solid #2a2725", marginBottom: 8,
      background: "rgba(26,24,22,0.5)",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%", background: "rgba(201,185,154,0.05)",
          border: "none", borderBottom: open ? "1px solid #2a2725" : "none",
          padding: "8px 12px", cursor: "pointer", color: "#c9b99a",
          fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        <span>{title}</span>
        <span style={{ color: "#5a5650", fontSize: 10 }}>{open ? "[-]" : "[+]"}</span>
      </button>
      {open && <div style={{ padding: "8px 12px" }}>{children}</div>}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

type Tab = "lab" | "library" | "sets" | "science";

export default function ResearchPage() {
  const [tab, setTab] = useState<Tab>("lab");
  const [sounds, setSounds] = useState<ResearchSound[]>([]);
  const [sets, setSets] = useState<SoundSet[]>([]);
  const [activeSound, setActiveSound] = useState<ResearchSound | null>(null);
  const [presets, setPresets] = useState<PresetEntry[]>([]);
  const [playing, setPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [activeScene, setActiveScene] = useState<"A" | "B">("A");
  const engineRef = useRef<AudioEngine | null>(null);

  // Load from localStorage
  useEffect(() => {
    setSounds(loadSounds());
    setSets(loadSets());
    // Load presets index
    fetch("/rigs/index.json").then(r => r.json()).then(setPresets).catch(() => {});
  }, []);

  // Save on change
  useEffect(() => { if (sounds.length > 0) saveSounds(sounds); }, [sounds]);
  useEffect(() => { if (sets.length > 0) saveSets(sets); }, [sets]);

  // Current scene params
  const currentRig = activeSound ? (activeScene === "A" ? activeSound.sceneA : activeSound.sceneB) : null;

  // Create blank sound
  const createNewSound = useCallback(() => {
    const now = new Date().toISOString();
    const sound: ResearchSound = {
      id: genId(),
      name: "Untitled",
      description: "",
      reference: "",
      tags: [],
      iteration: 1,
      parentId: null,
      rating: 0,
      notes: "",
      sceneA: makeRig({}),
      sceneB: makeRig({}),
      subOctave: 0,
      createdAt: now,
      updatedAt: now,
    };
    setSounds(prev => [sound, ...prev]);
    setActiveSound(sound);
    setTab("lab");
  }, []);

  // Load preset into new research sound
  const loadPresetAsResearch = useCallback(async (entry: PresetEntry) => {
    try {
      const resp = await fetch(`/rigs/${entry.file}`);
      const rj: RigJson = await resp.json();
      const sd = rigJsonToSoundDef(rj);
      const now = new Date().toISOString();
      const sound: ResearchSound = {
        id: genId(),
        name: sd.name,
        description: rj.notes || "",
        reference: "",
        tags: rj.tags || [],
        iteration: 1,
        parentId: null,
        rating: 0,
        notes: `Loaded from preset: ${entry.name}`,
        sceneA: sd.sceneA,
        sceneB: sd.sceneB,
        subOctave: sd.subOctave || 0,
        createdAt: now,
        updatedAt: now,
      };
      setSounds(prev => [sound, ...prev]);
      setActiveSound(sound);
      setTab("lab");
    } catch (e) {
      console.error("Failed to load preset:", e);
    }
  }, []);

  // Fork sound
  const forkSound = useCallback(() => {
    if (!activeSound) return;
    const now = new Date().toISOString();
    const forked: ResearchSound = {
      ...JSON.parse(JSON.stringify(activeSound)),
      id: genId(),
      name: activeSound.name + " (fork)",
      iteration: activeSound.iteration + 1,
      parentId: activeSound.id,
      createdAt: now,
      updatedAt: now,
    };
    setSounds(prev => [forked, ...prev]);
    setActiveSound(forked);
  }, [activeSound]);

  // Update active sound params
  const updateActiveRig = useCallback((scene: "A" | "B", section: string, key: string, value: number | boolean) => {
    if (!activeSound) return;
    setActiveSound(prev => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev)) as ResearchSound;
      const rig = scene === "A" ? updated.sceneA : updated.sceneB;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rig as any)[section][key] = value;
      updated.updatedAt = new Date().toISOString();
      return updated;
    });
  }, [activeSound]);

  // Update active sound metadata
  const updateActiveMeta = useCallback((field: string, value: string | number | string[]) => {
    if (!activeSound) return;
    setActiveSound(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value, updatedAt: new Date().toISOString() };
      return updated;
    });
  }, [activeSound]);

  // Persist active sound back to list
  useEffect(() => {
    if (!activeSound) return;
    setSounds(prev => {
      const idx = prev.findIndex(s => s.id === activeSound.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = activeSound;
      return next;
    });
  }, [activeSound]);

  // Delete sound
  const deleteSound = useCallback((id: string) => {
    setSounds(prev => prev.filter(s => s.id !== id));
    if (activeSound?.id === id) setActiveSound(null);
  }, [activeSound]);

  // Audio preview
  const startAudio = useCallback(async () => {
    if (engineRef.current || !activeSound) return;
    const engine = buildEngine();
    if (engine.ctx.state === "suspended") await engine.ctx.resume();
    try {
      const resp = await fetch("/audio/guitar-loop.mp3");
      const arrayBuf = await resp.arrayBuffer();
      const audioBuffer = await engine.ctx.decodeAudioData(arrayBuf);
      engine.source.buffer = audioBuffer;
      engine.source.loop = true;
      engine.source.start();
    } catch (e) {
      console.error("Failed to load guitar loop:", e);
      return;
    }
    const rig = activeScene === "A" ? activeSound.sceneA : activeSound.sceneB;
    updateEngineParams(engine, rig);
    engineRef.current = engine;
    setAnalyser(engine.analyser);
    setPlaying(true);
  }, [activeSound, activeScene]);

  const stopAudio = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    try { engine.source.stop(); engine.chorusLFO.stop(); } catch { /* */ }
    engine.ctx.close();
    engineRef.current = null;
    setAnalyser(null);
    setPlaying(false);
  }, []);

  // Update engine when params change
  useEffect(() => {
    if (!engineRef.current || !activeSound) return;
    const rig = activeScene === "A" ? activeSound.sceneA : activeSound.sceneB;
    updateEngineParams(engineRef.current, rig);
  }, [activeSound, activeScene]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try { engineRef.current.source.stop(); engineRef.current.chorusLFO.stop(); } catch { /* */ }
        engineRef.current.ctx.close();
      }
    };
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  const tabStyle = (t: Tab) => ({
    background: tab === t ? "rgba(201,185,154,0.12)" : "none",
    border: "none",
    borderBottom: tab === t ? "2px solid #c9b99a" : "2px solid transparent",
    color: tab === t ? "#e8e4dc" : "#5a5650",
    padding: "12px 24px",
    fontSize: 12,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    fontWeight: tab === t ? 700 : 500,
  });

  const btnStyle = (accent?: boolean): React.CSSProperties => ({
    background: accent ? "#c9b99a" : "none",
    color: accent ? "#0e0d0c" : "#c9b99a",
    border: `1px solid ${accent ? "#c9b99a" : "#2a2725"}`,
    padding: "6px 16px",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontWeight: 600,
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0d0c",
      color: "#e8e4dc",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2a2725",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <div style={{
            fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "#5a5650", marginBottom: 4,
          }}>UNION RIG</div>
          <h1 style={{
            fontSize: 20, fontWeight: 300, letterSpacing: "-0.01em",
            color: "#c9b99a", margin: 0,
          }}>Research Workbench</h1>
        </div>
        <button onClick={createNewSound} style={btnStyle(true)}>New Sound</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #2a2725" }}>
        <button onClick={() => setTab("lab")} style={tabStyle("lab")}>Sound Lab</button>
        <button onClick={() => setTab("library")} style={tabStyle("library")}>Library ({sounds.length})</button>
        <button onClick={() => setTab("sets")} style={tabStyle("sets")}>Set Builder ({sets.length})</button>
        <button onClick={() => setTab("science")} style={tabStyle("science")}>Signal Chain Science</button>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ============================================================ */}
        {/* SOUND LAB TAB */}
        {/* ============================================================ */}
        {tab === "lab" && (
          <>
            {!activeSound ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ color: "#5a5650", fontSize: 14, marginBottom: 24, fontFamily: "monospace" }}>
                  No sound loaded. Create a new sound or load from library/preset.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={createNewSound} style={btnStyle(true)}>New Blank Sound</button>
                  {presets.length > 0 && (
                    <div style={{ position: "relative" }}>
                      <LoadPresetDropdown presets={presets} onLoad={loadPresetAsResearch} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
                {/* LEFT: Parameters */}
                <div>
                  {/* Sound name + controls row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap",
                  }}>
                    <input
                      type="text" value={activeSound.name}
                      onChange={(e) => updateActiveMeta("name", e.target.value)}
                      style={{
                        background: "none", border: "none", borderBottom: "1px solid #2a2725",
                        color: "#e8e4dc", fontSize: 20, fontWeight: 300, padding: "4px 0",
                        flex: 1, minWidth: 200,
                      }}
                    />
                    <button onClick={forkSound} style={btnStyle()}>Fork</button>
                    <button onClick={playing ? stopAudio : startAudio} style={btnStyle(true)}>
                      {playing ? "Stop" : "Preview"}
                    </button>
                    <LoadPresetDropdown presets={presets} onLoad={loadPresetAsResearch} />
                  </div>

                  {/* Waveform */}
                  <div style={{ marginBottom: 16 }}>
                    <Waveform analyser={analyser} />
                  </div>

                  {/* Scene toggle */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    {(["A", "B"] as const).map(s => (
                      <button key={s} onClick={() => setActiveScene(s)} style={{
                        ...btnStyle(activeScene === s),
                        padding: "8px 24px",
                        fontSize: 14,
                      }}>Scene {s}</button>
                    ))}
                    <button
                      onClick={() => {
                        if (!activeSound) return;
                        const updated = JSON.parse(JSON.stringify(activeSound)) as ResearchSound;
                        if (activeScene === "A") {
                          updated.sceneB = JSON.parse(JSON.stringify(updated.sceneA));
                        } else {
                          updated.sceneA = JSON.parse(JSON.stringify(updated.sceneB));
                        }
                        updated.updatedAt = new Date().toISOString();
                        setActiveSound(updated);
                      }}
                      style={{ ...btnStyle(), fontSize: 10 }}
                      title={`Copy Scene ${activeScene} to Scene ${activeScene === "A" ? "B" : "A"}`}
                    >Copy {activeScene} &gt; {activeScene === "A" ? "B" : "A"}</button>
                  </div>

                  {/* Parameter groups */}
                  {currentRig && (
                    <>
                      <ParamGroup title="Dynamics">
                        <ParamField label="Threshold" value={currentRig.dyn.thresh_db} onChange={(v) => updateActiveRig(activeScene, "dyn", "thresh_db", v)} min={-40} max={0} step={0.5} unit="dB" />
                        <ParamField label="Ratio" value={currentRig.dyn.ratio} onChange={(v) => updateActiveRig(activeScene, "dyn", "ratio", v)} min={1} max={8} step={0.1} />
                        <ParamField label="Attack" value={currentRig.dyn.attack_ms} onChange={(v) => updateActiveRig(activeScene, "dyn", "attack_ms", v)} min={1} max={80} step={1} unit="ms" />
                        <ParamField label="Release" value={currentRig.dyn.release_ms} onChange={(v) => updateActiveRig(activeScene, "dyn", "release_ms", v)} min={20} max={600} step={5} unit="ms" />
                        <ParamField label="Makeup" value={currentRig.dyn.makeup_db} onChange={(v) => updateActiveRig(activeScene, "dyn", "makeup_db", v)} min={0} max={18} step={0.5} unit="dB" />
                        <ParamField label="Mix" value={currentRig.dyn.mix} onChange={(v) => updateActiveRig(activeScene, "dyn", "mix", v)} min={0} max={1} step={0.01} />
                      </ParamGroup>

                      <ParamGroup title="Drive">
                        <SelectField label="Type" value={currentRig.drv.type} onChange={(v) => updateActiveRig(activeScene, "drv", "type", v)} options={DRIVE_TYPES} />
                        <ParamField label="Pre Gain" value={currentRig.drv.pre_gain_db} onChange={(v) => updateActiveRig(activeScene, "drv", "pre_gain_db", v)} min={0} max={36} step={0.5} unit="dB" />
                        <ParamField label="Asymmetry" value={currentRig.drv.asym} onChange={(v) => updateActiveRig(activeScene, "drv", "asym", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Tone Tilt" value={currentRig.drv.tone_tilt} onChange={(v) => updateActiveRig(activeScene, "drv", "tone_tilt", v)} min={-1} max={1} step={0.01} />
                        <ParamField label="Low Cut" value={currentRig.drv.low_cut_hz} onChange={(v) => updateActiveRig(activeScene, "drv", "low_cut_hz", v)} min={20} max={300} step={5} unit="Hz" />
                        <ParamField label="High Cut" value={currentRig.drv.high_cut_hz} onChange={(v) => updateActiveRig(activeScene, "drv", "high_cut_hz", v)} min={2000} max={18000} step={100} unit="Hz" />
                        <ParamField label="Mix" value={currentRig.drv.mix} onChange={(v) => updateActiveRig(activeScene, "drv", "mix", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Level" value={currentRig.drv.level_db} onChange={(v) => updateActiveRig(activeScene, "drv", "level_db", v)} min={-18} max={18} step={0.5} unit="dB" />
                      </ParamGroup>

                      <ParamGroup title="Character">
                        <SelectField label="Mode" value={currentRig.chr.mode} onChange={(v) => updateActiveRig(activeScene, "chr", "mode", v)} options={CHORUS_MODES} />
                        <ParamField label="Rate" value={currentRig.chr.rate_hz} onChange={(v) => updateActiveRig(activeScene, "chr", "rate_hz", v)} min={0.05} max={8} step={0.01} unit="Hz" />
                        <ParamField label="Depth" value={currentRig.chr.depth} onChange={(v) => updateActiveRig(activeScene, "chr", "depth", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Mix" value={currentRig.chr.mix} onChange={(v) => updateActiveRig(activeScene, "chr", "mix", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Tone" value={currentRig.chr.tone} onChange={(v) => updateActiveRig(activeScene, "chr", "tone", v)} min={-1} max={1} step={0.01} />
                      </ParamGroup>

                      <ParamGroup title="Stereo">
                        <ParamField label="Width" value={currentRig.stp.width} onChange={(v) => updateActiveRig(activeScene, "stp", "width", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Micro Delay" value={currentRig.stp.micro_delay_ms} onChange={(v) => updateActiveRig(activeScene, "stp", "micro_delay_ms", v)} min={0} max={12} step={0.5} unit="ms" />
                      </ParamGroup>

                      <ParamGroup title="Space">
                        <ParamField label="Decay" value={currentRig.spc.decay_s} onChange={(v) => updateActiveRig(activeScene, "spc", "decay_s", v)} min={0.2} max={12} step={0.1} unit="s" />
                        <ParamField label="Damping" value={currentRig.spc.damp} onChange={(v) => updateActiveRig(activeScene, "spc", "damp", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Wet" value={currentRig.spc.wet} onChange={(v) => updateActiveRig(activeScene, "spc", "wet", v)} min={0} max={1} step={0.01} />
                        <ParamField label="Dry" value={currentRig.spc.dry} onChange={(v) => updateActiveRig(activeScene, "spc", "dry", v)} min={0} max={1} step={0.01} />
                      </ParamGroup>

                      <ParamGroup title="Cabinet">
                        <ParamField label="Low Res" value={currentRig.cab.low_res_hz} onChange={(v) => updateActiveRig(activeScene, "cab", "low_res_hz", v)} min={60} max={180} step={5} unit="Hz" />
                        <ParamField label="High Roll" value={currentRig.cab.high_roll_hz} onChange={(v) => updateActiveRig(activeScene, "cab", "high_roll_hz", v)} min={2500} max={12000} step={100} unit="Hz" />
                        <ParamField label="Air" value={currentRig.cab.air} onChange={(v) => updateActiveRig(activeScene, "cab", "air", v)} min={0} max={1} step={0.01} />
                      </ParamGroup>

                      <ParamGroup title="Output">
                        <ParamField label="Level" value={currentRig.out.level_db} onChange={(v) => updateActiveRig(activeScene, "out", "level_db", v)} min={-60} max={6} step={0.5} unit="dB" />
                        <ParamField label="Limiter" value={currentRig.out.lim_thresh_db} onChange={(v) => updateActiveRig(activeScene, "out", "lim_thresh_db", v)} min={-18} max={0} step={0.5} unit="dB" />
                        <ParamField label="Lim Release" value={currentRig.out.lim_release_ms} onChange={(v) => updateActiveRig(activeScene, "out", "lim_release_ms", v)} min={20} max={400} step={5} unit="ms" />
                      </ParamGroup>
                    </>
                  )}
                </div>

                {/* RIGHT: Research Notes */}
                <div>
                  <SectionHeader title="Research Notes" />

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Rating</label>
                    <StarRating value={activeSound.rating} onChange={(v) => updateActiveMeta("rating", v)} />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Description</label>
                    <textarea
                      value={activeSound.description}
                      onChange={(e) => updateActiveMeta("description", e.target.value)}
                      rows={2}
                      style={{
                        width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                        color: "#e8e4dc", padding: "8px", fontSize: 12, fontFamily: "monospace",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Reference (song/artist)</label>
                    <input
                      type="text" value={activeSound.reference}
                      onChange={(e) => updateActiveMeta("reference", e.target.value)}
                      style={{
                        width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                        color: "#e8e4dc", padding: "6px 8px", fontSize: 12, fontFamily: "monospace",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Tags (comma separated)</label>
                    <input
                      type="text" value={activeSound.tags.join(", ")}
                      onChange={(e) => updateActiveMeta("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                      style={{
                        width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                        color: "#e8e4dc", padding: "6px 8px", fontSize: 12, fontFamily: "monospace",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                      Iteration: {activeSound.iteration} {activeSound.parentId && " (forked)"}
                    </label>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Notes / Journal</label>
                    <textarea
                      value={activeSound.notes}
                      onChange={(e) => updateActiveMeta("notes", e.target.value)}
                      rows={8}
                      placeholder="What changed? Why? What does it sound like?"
                      style={{
                        width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                        color: "#e8e4dc", padding: "8px", fontSize: 12, fontFamily: "monospace",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 10, color: "#3a3735", fontFamily: "monospace" }}>
                    <div>Created: {new Date(activeSound.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(activeSound.updatedAt).toLocaleString()}</div>
                    <div>ID: {activeSound.id}</div>
                  </div>

                  <div style={{ marginTop: 16, borderTop: "1px solid #2a2725", paddingTop: 16 }}>
                    <button
                      onClick={() => { if (confirm("Delete this sound?")) deleteSound(activeSound.id); }}
                      style={{ ...btnStyle(), color: "#883333", borderColor: "#883333", fontSize: 10 }}
                    >Delete Sound</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* LIBRARY TAB */}
        {/* ============================================================ */}
        {tab === "library" && (
          <LibraryView
            sounds={sounds}
            onSelect={(s) => { setActiveSound(s); setTab("lab"); }}
            onDelete={deleteSound}
          />
        )}

        {/* ============================================================ */}
        {/* SET BUILDER TAB */}
        {/* ============================================================ */}
        {tab === "sets" && (
          <SetBuilderView
            sounds={sounds}
            sets={sets}
            setSets={setSets}
          />
        )}

        {tab === "science" && (
          <SignalChainScience />
        )}
      </div>
    </div>
  );
}

// ============================================================
// SIGNAL CHAIN SCIENCE
// ============================================================

function SignalChainScience() {
  const sections = [
    {
      title: "Why Order Matters",
      content: `The signal chain in Union Rig follows a deliberate order: Dynamics, Drive, Character (modulation), Stereo, Space (reverb), Cabinet, Output. This is not arbitrary.

Compression before drive means the compressor evens out your picking dynamics before they hit the drive stage. The drive responds to a more consistent input, producing a more uniform distortion. If you reversed this -- drive before compression -- the compressor would try to even out an already-distorted signal, pumping and breathing in unmusical ways.

Modulation after drive means the chorus or flanger processes the already-distorted signal. This sounds more natural because the modulation varies the pitch of the harmonically-rich distorted tone. Modulation before drive would mean the drive stage is processing a pitch-wobbling signal, creating intermodulation distortion artifacts that sound harsh.

Reverb after modulation and stereo means the reverb captures the full spatial picture. Reverb before stereo widening would create a mono reverb tail that then gets artificially widened -- less convincing than reverbing an already-wide signal.

Cabinet last (before output) is how real amplifiers work. The speaker cabinet is the final acoustic filter. Placing EQ or effects after the cabinet simulation would add frequencies that a real speaker would never reproduce, breaking the illusion.`,
    },
    {
      title: "The Physics of Clipping",
      content: `When a guitar signal exceeds the voltage limits of a circuit, the waveform peaks are "clipped" -- flattened at the maximum value the circuit can handle. This is distortion, and it is the most important effect in rock music.

Soft clipping (tube-style) rounds the peaks gradually. As the signal approaches the limit, it compresses smoothly. This generates primarily odd-order harmonics (3rd, 5th, 7th) which the ear perceives as warm and musical. The transition from clean to distorted is gradual and responsive to pick dynamics.

Hard clipping chops the peaks abruptly at a fixed threshold. This generates both odd and even harmonics plus higher-order harmonics, creating a brighter, more aggressive sound. The transition from clean to clipped is more sudden -- there is less dynamic range in the distortion.

Asymmetric clipping treats the positive and negative halves of the waveform differently. One side clips harder than the other. This generates even-order harmonics (2nd, 4th, 6th) which the ear perceives as especially warm and pleasing -- similar to the natural harmonics of musical instruments. Many classic overdrive circuits (the Tube Screamer being the most famous) use asymmetric clipping.

Fuzz is extreme clipping -- the signal is squared off so aggressively that it approaches a square wave. The harmonic content is dense and the sustain is essentially infinite until the note decays below the noise floor. Gated fuzz circuits cut off abruptly when the signal drops, creating a sputtery, velcro-like decay.`,
    },
    {
      title: "Reverb: Simulating Physical Space",
      content: `Natural reverb is the sum of thousands of sound reflections bouncing off surfaces in a room. The first reflections arrive quickly and are distinct; later reflections blur together into a diffuse tail. The size of the space determines the time between reflections. The materials on the surfaces determine which frequencies are absorbed (damping).

Algorithmic reverb (what Union Rig uses) generates this mathematically. A network of delay lines with feedback and filtering creates a pattern of reflections that approximates a real space. The decay parameter controls how long the feedback loops sustain. The damping parameter applies a low-pass filter inside the feedback loop -- each time a reflection bounces, high frequencies are reduced, simulating absorption by soft surfaces.

The impulse response (IR) approach captures a real space by playing a known signal (an impulse or sweep) through it and recording the result. The recording becomes a fingerprint of that space's acoustics. Convolution reverb applies this fingerprint to your guitar signal. It is more realistic but less flexible -- you cannot easily adjust decay or damping independently.

Spring reverb, found in classic Fender amps, works by sending the signal through a physical spring. The vibrations travel through the coiled metal, creating a characteristic "boing" with dense, metallic reflections. It is technically primitive but musically distinctive -- surf rock and blues are defined by this sound.`,
    },
    {
      title: "Cabinet Simulation: The Hidden EQ",
      content: `A guitar speaker is not designed for flat frequency response. Unlike studio monitors, guitar speakers deliberately color the sound. A typical 12-inch guitar speaker rolls off sharply above 5-6 kHz, has a resonant bump around 80-120 Hz, and has a complex midrange response shaped by the cone material, magnet, and enclosure.

This roll-off is essential. Raw distortion contains frequencies up to 15-20 kHz that sound harsh and fizzy. The speaker acts as a natural low-pass filter, removing those frequencies and leaving only the musical content. This is why plugging a distortion pedal directly into a PA system sounds terrible -- there is no cabinet filtering.

Microphone placement adds another layer. A microphone pointed at the center of the speaker cone (on-axis) captures more high frequencies and a tighter sound. Moving the mic toward the edge of the cone (off-axis) rolls off highs and sounds warmer. The distance from the cone affects proximity effect (bass boost) and room reflections.

In Union Rig, the cabinet block models these characteristics with three controls: low resonance frequency (the bass bump), high roll-off frequency (where treble cuts), and air (a high-shelf boost that simulates close-miking brightness). These three parameters cover the range of tonal variation you would get from swapping cabinets and moving microphones in a studio.`,
    },
    {
      title: "Stereo from Mono: Micro-Delay Widening",
      content: `Union Rig takes a mono guitar input and produces stereo output. The stereo width is created using micro-delay techniques -- a psychoacoustic trick that exploits how the brain localizes sound.

When the same signal arrives at your left and right ears at slightly different times (1-15 milliseconds difference), the brain perceives a single sound source positioned to one side. By delaying the signal differently for left and right channels, Union Rig creates a sense of width without the comb-filtering artifacts that simple panning would cause.

The key constraint is mono compatibility. When the stereo output is summed to mono (as happens in many PA systems, phone speakers, and broadcast), the micro-delayed signals should combine constructively rather than canceling. Union Rig's stereo algorithm is designed to collapse cleanly to mono -- the width disappears but the tone is preserved.

The "width" control adjusts the balance between the direct (center) signal and the delayed (wide) signal. At zero width, output is mono. At maximum width, the stereo spread is at its widest. The "micro delay" parameter sets the actual delay time, which affects the perceived width and the tonal coloration when summed to mono.`,
    },
    {
      title: "Compression: The Invisible Effect",
      content: `Compression is the most misunderstood effect in guitar. When set correctly, you should not hear it working -- you should only notice that your guitar feels better to play.

The compressor watches the input level. When the signal exceeds the threshold, the compressor reduces the gain by an amount determined by the ratio. A 4:1 ratio means that for every 4 dB the signal exceeds the threshold, only 1 dB passes through. The attack time determines how quickly the compressor reacts. The release time determines how quickly it lets go.

For guitar, attack time is the most critical parameter. A slow attack (20-40ms) lets the initial pick transient through before the compressor kicks in. This preserves the percussive attack of each note while smoothing out the sustain. A fast attack (1-5ms) catches the transient and smooths everything -- good for sustained lead tones but it removes the rhythmic articulation of funk and country playing.

Parallel compression (using the mix/blend control) is the modern approach. Instead of processing 100% of the signal through the compressor, you blend the compressed signal with the original dry signal. This gives you the sustain and consistency of compression while preserving the natural dynamics and transients of the dry signal. It is more forgiving to set up and sounds more natural than series compression.

Makeup gain compensates for the volume reduction caused by compression. When the compressor reduces peaks by 6 dB, makeup gain brings the overall level back up by 6 dB. The result: peaks stay at the same level but quiet passages are louder. The dynamic range is reduced, and the average perceived loudness increases.`,
    },
  ];

  return (
    <div>
      <SectionHeader title="Signal Chain Science" subtitle="The physics and psychoacoustics behind guitar tone processing" />
      <p style={{ fontSize: 13, color: "#8a8278", marginBottom: 32, lineHeight: 1.7, maxWidth: 700 }}>
        Understanding why the signal chain works the way it does helps you make better
        decisions when designing sounds. This reference covers the technical foundations
        behind each processing stage in Union Rig.
      </p>

      {sections.map((section) => (
        <div key={section.title} style={{
          marginBottom: 32,
          paddingBottom: 32,
          borderBottom: "1px solid #2a2725",
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#c9b99a",
            marginBottom: 12,
            letterSpacing: "0.02em",
          }}>{section.title}</h3>
          {section.content.split("\n\n").map((paragraph, i) => (
            <p key={i} style={{
              fontSize: 13,
              color: "#e8e4dc",
              lineHeight: 1.75,
              marginBottom: 12,
            }}>{paragraph}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// LOAD PRESET DROPDOWN
// ============================================================

function LoadPresetDropdown({ presets, onLoad }: { presets: PresetEntry[]; onLoad: (entry: PresetEntry) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "1px solid #2a2725", color: "#8a8278",
        padding: "6px 16px", fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
      }}>Load Preset</button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, zIndex: 100,
          background: "#1a1816", border: "1px solid #2a2725",
          maxHeight: 300, overflowY: "auto", width: 280,
        }}>
          {presets.map(p => (
            <button key={p.id} onClick={() => { onLoad(p); setOpen(false); }} style={{
              display: "block", width: "100%", background: "none", border: "none",
              borderBottom: "1px solid #1e1c1a", padding: "10px 12px",
              textAlign: "left", cursor: "pointer", color: "#e8e4dc",
              fontSize: 12,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201,185,154,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <div style={{ fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: "#5a5650", marginTop: 2 }}>{p.tags.slice(0, 3).join(", ")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LIBRARY VIEW
// ============================================================

function LibraryView({ sounds, onSelect, onDelete }: {
  sounds: ResearchSound[];
  onSelect: (s: ResearchSound) => void;
  onDelete: (id: string) => void;
}) {
  const [filterTag, setFilterTag] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<"date" | "rating" | "name">("date");

  const allTags = Array.from(new Set(sounds.flatMap(s => s.tags))).sort();

  const filtered = sounds
    .filter(s => !filterTag || s.tags.includes(filterTag))
    .filter(s => s.rating >= filterRating)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <SectionHeader title="Sound Library" subtitle={`${sounds.length} sounds`} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label style={{ fontSize: 10, color: "#5a5650", display: "block", marginBottom: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Tag</label>
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} style={{
            background: "#1a1816", border: "1px solid #2a2725", color: "#e8e4dc",
            padding: "4px 8px", fontSize: 11, fontFamily: "monospace",
          }}>
            <option value="">All</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 10, color: "#5a5650", display: "block", marginBottom: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Min Rating</label>
          <StarRating value={filterRating} onChange={setFilterRating} />
        </div>
        <div>
          <label style={{ fontSize: 10, color: "#5a5650", display: "block", marginBottom: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sort</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "name")} style={{
            background: "#1a1816", border: "1px solid #2a2725", color: "#e8e4dc",
            padding: "4px 8px", fontSize: 11, fontFamily: "monospace",
          }}>
            <option value="date">Date</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Sound list */}
      {filtered.length === 0 ? (
        <p style={{ color: "#5a5650", fontFamily: "monospace", fontSize: 13 }}>No sounds match filters.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {filtered.map(s => (
            <div key={s.id} style={{
              border: "1px solid #2a2725", padding: "16px",
              background: "rgba(26,24,22,0.5)",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c9b99a"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2a2725"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div onClick={() => onSelect(s)} style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{s.name}</div>
                  <StarRating value={s.rating} readonly />
                  {s.description && <p style={{ fontSize: 11, color: "#8a8278", margin: "6px 0 0", lineHeight: 1.4 }}>{s.description}</p>}
                  {s.reference && <p style={{ fontSize: 10, color: "#5a5650", margin: "4px 0 0", fontStyle: "italic" }}>ref: {s.reference}</p>}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                    {s.tags.map(t => (
                      <span key={t} style={{
                        fontSize: 9, padding: "2px 6px", border: "1px solid #2a2725",
                        color: "#8a8278", letterSpacing: "0.05em",
                      }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: "#3a3735", marginTop: 8, fontFamily: "monospace" }}>
                    v{s.iteration} -- {new Date(s.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) onDelete(s.id); }}
                  style={{ background: "none", border: "none", color: "#3a3735", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>x</button>
              </div>
              {/* Compact param summary */}
              <div style={{ marginTop: 8, fontSize: 9, color: "#3a3735", fontFamily: "monospace", lineHeight: 1.6 }}>
                drv: {DRIVE_TYPES[s.sceneA.drv.type]} {s.sceneA.drv.pre_gain_db}dB | chr: {CHORUS_MODES[s.sceneA.chr.mode]} | spc: {s.sceneA.spc.decay_s}s wet:{s.sceneA.spc.wet}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SET BUILDER VIEW
// ============================================================

function SetBuilderView({ sounds, sets, setSets }: {
  sounds: ResearchSound[];
  sets: SoundSet[];
  setSets: React.Dispatch<React.SetStateAction<SoundSet[]>>;
}) {
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const activeSet = sets.find(s => s.id === activeSetId) || null;

  const createSet = () => {
    const now = new Date().toISOString();
    const newSet: SoundSet = {
      id: genId(),
      name: "Untitled Set",
      description: "",
      soundIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setSets(prev => [...prev, newSet]);
    setActiveSetId(newSet.id);
  };

  const updateSet = (field: string, value: string | string[]) => {
    setSets(prev => prev.map(s => s.id === activeSetId ? { ...s, [field]: value, updatedAt: new Date().toISOString() } : s));
  };

  const addSoundToSet = (soundId: string) => {
    if (!activeSet) return;
    if (activeSet.soundIds.length >= 12) return;
    if (activeSet.soundIds.includes(soundId)) return;
    updateSet("soundIds", [...activeSet.soundIds, soundId]);
  };

  const removeSoundFromSet = (soundId: string) => {
    if (!activeSet) return;
    updateSet("soundIds", activeSet.soundIds.filter(id => id !== soundId));
  };

  const deleteSet = (id: string) => {
    setSets(prev => prev.filter(s => s.id !== id));
    if (activeSetId === id) setActiveSetId(null);
  };

  // Export set as JSON
  const exportSetAsJson = () => {
    if (!activeSet) return;
    const setSounds = activeSet.soundIds.map(id => sounds.find(s => s.id === id)).filter(Boolean) as ResearchSound[];

    const rigFiles: { name: string; content: RigJson }[] = setSounds.map((s, i) => {
      const rigId = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+$/, "");
      const content: RigJson = {
        rig_id: rigId,
        name: s.name,
        tags: s.tags,
        notes: s.description || s.notes,
        scenes: {
          A: {
            label: "A",
            params: {
              dyn: { ...s.sceneA.dyn },
              drv: { ...s.sceneA.drv },
              chr: { ...s.sceneA.chr },
              stp: { ...s.sceneA.stp },
              spc: { ...s.sceneA.spc },
              cab: { ...s.sceneA.cab },
              out: { ...s.sceneA.out },
            },
          },
          B: {
            label: "B",
            params: {
              dyn: { ...s.sceneB.dyn },
              drv: { ...s.sceneB.drv },
              chr: { ...s.sceneB.chr },
              stp: { ...s.sceneB.stp },
              spc: { ...s.sceneB.spc },
              cab: { ...s.sceneB.cab },
              out: { ...s.sceneB.out },
            },
          },
        },
      };
      return { name: `${rigId}.rig.json`, content };
    });

    const indexJson: PresetEntry[] = rigFiles.map((f, i) => ({
      id: f.content.rig_id,
      name: f.content.name,
      file: f.name,
      tags: f.content.tags,
      notes: f.content.notes,
    }));

    // Download as a combined JSON blob
    const exportData = {
      setName: activeSet.name,
      description: activeSet.description,
      exportedAt: new Date().toISOString(),
      index: indexJson,
      rigs: rigFiles.map(f => f.content),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSet.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-set.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as user1 format (individual files in a zip-like structure via download)
  const exportAsUserSet = () => {
    if (!activeSet) return;
    const setSounds_list = activeSet.soundIds.map(id => sounds.find(s => s.id === id)).filter(Boolean) as ResearchSound[];

    const rigFiles: { name: string; content: RigJson }[] = setSounds_list.map((s) => {
      const rigId = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+$/, "");
      return {
        name: `${rigId}.rig.json`,
        content: {
          rig_id: rigId,
          name: s.name,
          tags: s.tags,
          notes: s.description || s.notes,
          scenes: {
            A: { label: "A", params: { dyn: { ...s.sceneA.dyn }, drv: { ...s.sceneA.drv }, chr: { ...s.sceneA.chr }, stp: { ...s.sceneA.stp }, spc: { ...s.sceneA.spc }, cab: { ...s.sceneA.cab }, out: { ...s.sceneA.out } } },
            B: { label: "B", params: { dyn: { ...s.sceneB.dyn }, drv: { ...s.sceneB.drv }, chr: { ...s.sceneB.chr }, stp: { ...s.sceneB.stp }, spc: { ...s.sceneB.spc }, cab: { ...s.sceneB.cab }, out: { ...s.sceneB.out } } },
          },
        },
      };
    });

    const indexJson: PresetEntry[] = rigFiles.map(f => ({
      id: f.content.rig_id,
      name: f.content.name,
      file: f.name,
      tags: f.content.tags,
      notes: f.content.notes,
    }));

    // Download index.json
    const indexBlob = new Blob([JSON.stringify(indexJson, null, 2)], { type: "application/json" });
    const indexUrl = URL.createObjectURL(indexBlob);
    const a1 = document.createElement("a");
    a1.href = indexUrl; a1.download = "index.json"; a1.click();
    URL.revokeObjectURL(indexUrl);

    // Download each rig file
    setTimeout(() => {
      rigFiles.forEach((f, i) => {
        setTimeout(() => {
          const blob = new Blob([JSON.stringify(f.content, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = f.name; a.click();
          URL.revokeObjectURL(url);
        }, i * 200);
      });
    }, 300);
  };

  return (
    <div>
      <SectionHeader title="Set Builder" subtitle="Create and export preset sets (max 12 sounds per set)" />

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Set list */}
        <div>
          <button onClick={createSet} style={{
            background: "#c9b99a", color: "#0e0d0c", border: "none",
            padding: "8px 16px", fontSize: 11, letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
            width: "100%", marginBottom: 12,
          }}>New Set</button>

          {sets.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveSetId(s.id)}
              style={{
                padding: "10px 12px", cursor: "pointer",
                border: `1px solid ${activeSetId === s.id ? "#c9b99a" : "#2a2725"}`,
                background: activeSetId === s.id ? "rgba(201,185,154,0.08)" : "none",
                marginBottom: 4,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: "#5a5650", fontFamily: "monospace" }}>{s.soundIds.length}/12 sounds</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete set?")) deleteSet(s.id); }}
                style={{ background: "none", border: "none", color: "#3a3735", cursor: "pointer", fontSize: 14 }}>x</button>
            </div>
          ))}
        </div>

        {/* Active set detail */}
        <div>
          {activeSet ? (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <input
                  type="text" value={activeSet.name}
                  onChange={(e) => updateSet("name", e.target.value)}
                  style={{
                    background: "none", border: "none", borderBottom: "1px solid #2a2725",
                    color: "#e8e4dc", fontSize: 18, fontWeight: 300, padding: "4px 0", flex: 1,
                  }}
                />
                <button onClick={exportSetAsJson} style={{
                  background: "none", border: "1px solid #c9b99a", color: "#c9b99a",
                  padding: "6px 12px", fontSize: 10, letterSpacing: "0.1em",
                  textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
                }}>Export JSON</button>
                <button onClick={exportAsUserSet} style={{
                  background: "#c9b99a", border: "1px solid #c9b99a", color: "#0e0d0c",
                  padding: "6px 12px", fontSize: 10, letterSpacing: "0.1em",
                  textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
                }}>Export to User Set 1</button>
              </div>

              <textarea
                value={activeSet.description}
                onChange={(e) => updateSet("description", e.target.value)}
                placeholder="Set description..."
                rows={2}
                style={{
                  width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                  color: "#e8e4dc", padding: "8px", fontSize: 12, fontFamily: "monospace",
                  resize: "vertical", marginBottom: 16,
                }}
              />

              {/* Sounds in set */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Sounds in Set ({activeSet.soundIds.length}/12)
                </div>
                {activeSet.soundIds.length === 0 ? (
                  <p style={{ color: "#3a3735", fontFamily: "monospace", fontSize: 12 }}>Click sounds below to add them.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {activeSet.soundIds.map((id, idx) => {
                      const s = sounds.find(snd => snd.id === id);
                      if (!s) return null;
                      return (
                        <div key={id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 10px", border: "1px solid #2a2725", background: "rgba(26,24,22,0.5)",
                        }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#5a5650", marginRight: 8 }}>{String(idx + 1).padStart(2, "0")}</span>
                          <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
                          <StarRating value={s.rating} readonly />
                          <button onClick={() => removeSoundFromSet(id)}
                            style={{ background: "none", border: "none", color: "#883333", cursor: "pointer", fontSize: 12, marginLeft: 8 }}>remove</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Available sounds */}
              <div>
                <div style={{ fontSize: 10, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Available Sounds
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
                  {sounds.filter(s => !activeSet.soundIds.includes(s.id)).map(s => (
                    <button
                      key={s.id}
                      onClick={() => addSoundToSet(s.id)}
                      disabled={activeSet.soundIds.length >= 12}
                      style={{
                        background: "none", border: "1px solid #2a2725", color: "#e8e4dc",
                        padding: "8px 10px", textAlign: "left", cursor: "pointer",
                        fontSize: 12, transition: "border-color 0.15s",
                        opacity: activeSet.soundIds.length >= 12 ? 0.3 : 1,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c9b99a"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2a2725"}
                    >
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: "#5a5650", fontFamily: "monospace" }}>
                        <StarRating value={s.rating} readonly /> v{s.iteration}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "#5a5650", fontFamily: "monospace", fontSize: 13, padding: "40px 0", textAlign: "center" }}>
              Select or create a set to begin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
