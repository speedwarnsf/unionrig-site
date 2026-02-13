"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import UnionLogo from "./UnionLogo";
import KnobGraphic from "./KnobGraphic";

// ============================================================
// CHAINCRAFT DSP ENGINE — ported from firmware chaincraft.h
// ============================================================

// --- Utilities (matching firmware) ---
function clampf(x: number, a: number, b: number) { return x < a ? a : x > b ? b : x; }
function lerpf(a: number, b: number, t: number) { return a + (b - a) * t; }
function dbToLin(db: number) { return Math.pow(10, db / 20); }

// --- OnePole smoother (firmware: 10ms time constant) ---
class OnePole {
  y = 0;
  a = 0.02;
  setTimeMs(ms: number, sr: number) {
    const tau = ms <= 0.1 ? 0.0001 : ms / 1000;
    this.a = 1 - Math.exp(-1 / (tau * sr));
  }
  process(x: number) {
    this.y += this.a * (x - this.y);
    return this.y;
  }
}

// --- Parameter structs (defaults = Scene A) ---
interface DynP { enable: boolean; thresh_db: number; ratio: number; attack_ms: number; release_ms: number; makeup_db: number; mix: number; }
interface DrvP { type: number; pre_gain_db: number; asym: number; tone_tilt: number; low_cut_hz: number; high_cut_hz: number; mix: number; level_db: number; }
interface ChrP { mode: number; rate_hz: number; depth: number; mix: number; tone: number; }
interface StpP { width: number; micro_delay_ms: number; }
interface SpcP { damp: number; wet: number; dry: number; decay_s: number; }
interface CabP { low_res_hz: number; high_roll_hz: number; air: number; }
interface OutP { level_db: number; lim_thresh_db: number; lim_release_ms: number; }
interface RigP { dyn: DynP; drv: DrvP; chr: ChrP; stp: StpP; spc: SpcP; cab: CabP; out: OutP; }

function defaultSceneA(): RigP {
  return {
    dyn: { enable: true, thresh_db: -22, ratio: 2.5, attack_ms: 18, release_ms: 220, makeup_db: 4, mix: 0.55 },
    drv: { type: 1, pre_gain_db: 9, asym: 0.25, tone_tilt: -0.15, low_cut_hz: 90, high_cut_hz: 8500, mix: 0.65, level_db: 0 },
    chr: { mode: 1, rate_hz: 0.45, depth: 0.25, mix: 0.30, tone: -0.10 },
    stp: { width: 0.55, micro_delay_ms: 6.5 },
    spc: { damp: 0.45, wet: 0.38, dry: 1.0, decay_s: 3.2 },
    cab: { low_res_hz: 110, high_roll_hz: 6800, air: 0.30 },
    out: { level_db: -3, lim_thresh_db: -6, lim_release_ms: 160 },
  };
}

// --- Macro mappings (EXACT copy from firmware ApplyMacroMaps) ---
interface Macros { touch: number; heat: number; motion: number; depth: number; body: number; }

function applyMacroMaps(p: RigP, m: Macros): RigP {
  // Deep clone
  const r: RigP = JSON.parse(JSON.stringify(p));

  const t = m.touch;
  r.dyn.thresh_db  += -6 * t;
  r.dyn.ratio      += 1.5 * (t * t);
  r.dyn.attack_ms  += 6 * t;
  r.dyn.release_ms += 60 * t;
  r.dyn.makeup_db  += 3 * t;
  r.dyn.mix        += 0.20 * t;

  const h = m.heat, h2 = h * h, h3 = h2 * h;
  r.drv.pre_gain_db += 18 * h;
  r.drv.asym        += 0.25 * (h - 0.5);
  r.drv.tone_tilt   += -0.25 * h2;
  r.drv.low_cut_hz  += 40 * h2;
  r.drv.high_cut_hz += -2000 * h3;
  r.drv.mix         += 0.10 * h;
  r.drv.level_db    += -3 * h;

  const mo = m.motion;
  r.chr.depth   += 0.45 * mo;
  r.chr.mix     += 0.35 * mo;
  r.chr.rate_hz += 0.15 * mo;
  r.chr.tone    += -0.20 * mo;

  const d = m.depth, d2 = d * d;
  r.spc.wet     += 0.55 * d;
  r.spc.decay_s += 3.5 * d2;
  r.spc.damp    += -0.20 * d;

  const b = m.body, b2 = b * b;
  r.cab.low_res_hz   += -20 * b;
  r.cab.high_roll_hz += -1400 * b2;
  r.cab.air          += 0.35 * b;
  r.out.level_db     += -1.5 * b;

  // Clamp (firmware ranges)
  r.dyn.thresh_db  = clampf(r.dyn.thresh_db, -40, 0);
  r.dyn.ratio      = clampf(r.dyn.ratio, 1, 8);
  r.dyn.attack_ms  = clampf(r.dyn.attack_ms, 1, 80);
  r.dyn.release_ms = clampf(r.dyn.release_ms, 20, 600);
  r.dyn.makeup_db  = clampf(r.dyn.makeup_db, 0, 18);
  r.dyn.mix        = clampf(r.dyn.mix, 0, 1);

  r.drv.pre_gain_db = clampf(r.drv.pre_gain_db, 0, 36);
  r.drv.low_cut_hz  = clampf(r.drv.low_cut_hz, 20, 300);
  r.drv.high_cut_hz = clampf(r.drv.high_cut_hz, 2000, 18000);
  r.drv.mix         = clampf(r.drv.mix, 0, 1);
  r.drv.level_db    = clampf(r.drv.level_db, -18, 18);

  r.chr.rate_hz = clampf(r.chr.rate_hz, 0.05, 8);
  r.chr.depth   = clampf(r.chr.depth, 0, 1);
  r.chr.mix     = clampf(r.chr.mix, 0, 1);

  r.stp.width          = clampf(r.stp.width, 0, 1);
  r.stp.micro_delay_ms = clampf(r.stp.micro_delay_ms, 0, 12);

  r.spc.decay_s = clampf(r.spc.decay_s, 0.2, 12);
  r.spc.damp    = clampf(r.spc.damp, 0, 1);
  r.spc.wet     = clampf(r.spc.wet, 0, 1);

  r.cab.low_res_hz   = clampf(r.cab.low_res_hz, 60, 180);
  r.cab.high_roll_hz = clampf(r.cab.high_roll_hz, 2500, 12000);
  r.cab.air          = clampf(r.cab.air, 0, 1);

  r.out.level_db       = clampf(r.out.level_db, -60, 6);
  r.out.lim_thresh_db  = clampf(r.out.lim_thresh_db, -18, 0);
  r.out.lim_release_ms = clampf(r.out.lim_release_ms, 20, 400);

  return r;
}

// ============================================================
// Web Audio DSP Chain
// ============================================================

// Generate reverb impulse response matching firmware SpaceBlock
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

// Generate waveshaper curve matching firmware DriveBlock
function makeDriveCurve(type: number, asym: number, preGainLin: number, toneTilt: number): Float32Array {
  const N = 8192;
  const curve = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let x = ((i * 2) / N - 1);
    // Pre-gain
    let y = x * preGainLin;
    // Asymmetry (firmware: y += asym * 0.15 * y^3)
    y += asym * 0.15 * (y * y * y);
    // Clipping type
    let s = y;
    switch (type) {
      case 0: break;
      case 1: s = Math.tanh(y); break;
      case 2: s = clampf(y, -1, 1); break;
      case 3: s = Math.tanh(y * 1.2); s = clampf(s + 0.1 * y, -1.2, 1.2); break;
      case 4: { // fold
        s = y;
        if (s > 1) s = 2 - s;
        if (s < -1) s = -2 - s;
        break;
      }
      case 5: {
        let f = y * 1.3;
        if (f > 1) f = 2 - f;
        if (f < -1) f = -2 - f;
        s = Math.tanh(f);
        break;
      }
      default: s = Math.tanh(y); break;
    }
    // Tone tilt (firmware: s = s * (1 - 0.15 * tone_tilt))
    s = s * (1 - 0.15 * toneTilt);
    curve[i] = s;
  }
  return curve;
}

interface ChaincraftAudioEngine {
  ctx: AudioContext;
  // Source
  source: OscillatorNode;
  harmonics: OscillatorNode[];
  sourceMix: GainNode;
  // Signal chain nodes
  inputGain: GainNode;
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
  // Character (chorus via modulated delay)
  chorusDelay: DelayNode;
  chorusLFO: OscillatorNode;
  chorusLFOGain: GainNode;
  chorusDryGain: GainNode;
  chorusWetGain: GainNode;
  chorusMerge: GainNode;
  // Stereo split
  splitter: ChannelSplitterNode;
  merger: ChannelMergerNode;
  delayL: DelayNode;
  delayR: DelayNode;
  stereoLDry: GainNode;
  stereoRDry: GainNode;
  stereoLWet: GainNode;
  stereoRWet: GainNode;
  // Space (reverb)
  convolver: ConvolverNode;
  reverbDryGain: GainNode;
  reverbWetGain: GainNode;
  // Cabinet
  cabLowRes: BiquadFilterNode;
  cabHighRoll: BiquadFilterNode;
  cabAirShelf: BiquadFilterNode;
  // Output
  outputGain: GainNode;
  limiter: DynamicsCompressorNode;
  // Bypass
  bypassGain: GainNode;
  effectGain: GainNode;
  // Analysis
  analyser: AnalyserNode;
  // State
  currentParams: RigP;
}

function buildEngine(): ChaincraftAudioEngine {
  const ctx = new AudioContext({ sampleRate: 48000 });

  // ====== DEMO TONE — swap with real audio input here ======
  const source = ctx.createOscillator();
  source.type = "sawtooth";
  source.frequency.value = 110;

  const h2 = ctx.createOscillator(); h2.type = "sine"; h2.frequency.value = 220;
  const h2g = ctx.createGain(); h2g.gain.value = 0.3;
  const h3 = ctx.createOscillator(); h3.type = "sine"; h3.frequency.value = 330;
  const h3g = ctx.createGain(); h3g.gain.value = 0.15;

  const sourceMix = ctx.createGain(); sourceMix.gain.value = 0.4;
  source.connect(sourceMix);
  h2.connect(h2g).connect(sourceMix);
  h3.connect(h3g).connect(sourceMix);
  // ====== END DEMO TONE ======

  const params = defaultSceneA();
  const p = applyMacroMaps(params, { touch: 0, heat: 0, motion: 0, depth: 0, body: 0 });

  // --- Input ---
  const inputGain = ctx.createGain();
  inputGain.gain.value = 1;

  // --- Dynamics Block (compressor with dry/wet mix) ---
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = p.dyn.thresh_db;
  compressor.ratio.value = p.dyn.ratio;
  compressor.attack.value = p.dyn.attack_ms / 1000;
  compressor.release.value = p.dyn.release_ms / 1000;
  compressor.knee.value = 6;

  const compMakeupGain = ctx.createGain();
  compMakeupGain.gain.value = dbToLin(p.dyn.makeup_db);
  const compWetGain = ctx.createGain();
  compWetGain.gain.value = p.dyn.mix;
  const compDryGain = ctx.createGain();
  compDryGain.gain.value = 1 - p.dyn.mix;
  const compMerge = ctx.createGain();
  compMerge.gain.value = 1;

  // --- Drive Block ---
  const driveHP = ctx.createBiquadFilter();
  driveHP.type = "highpass"; driveHP.frequency.value = p.drv.low_cut_hz; driveHP.Q.value = 0.5;
  const driveLP = ctx.createBiquadFilter();
  driveLP.type = "lowpass"; driveLP.frequency.value = p.drv.high_cut_hz; driveLP.Q.value = 0.5;

  const waveshaper = ctx.createWaveShaper();
  // @ts-expect-error Float32Array compatibility
  waveshaper.curve = makeDriveCurve(p.drv.type, p.drv.asym, dbToLin(p.drv.pre_gain_db), p.drv.tone_tilt);
  waveshaper.oversample = "4x";

  const driveWetGain = ctx.createGain();
  driveWetGain.gain.value = p.drv.mix;
  const driveDryGain = ctx.createGain();
  driveDryGain.gain.value = 1 - p.drv.mix;
  const driveLevelGain = ctx.createGain();
  driveLevelGain.gain.value = dbToLin(p.drv.level_db);
  const driveMerge = ctx.createGain();
  driveMerge.gain.value = 1;

  // --- Character Block (chorus via modulated delay) ---
  const chorusDelay = ctx.createDelay(0.05);
  chorusDelay.delayTime.value = 0.007; // 7ms base
  const chorusLFO = ctx.createOscillator();
  chorusLFO.type = "sine";
  chorusLFO.frequency.value = p.chr.rate_hz;
  const chorusLFOGain = ctx.createGain();
  chorusLFOGain.gain.value = p.chr.depth * 0.003; // depth modulates delay in seconds
  const chorusDryGain = ctx.createGain();
  chorusDryGain.gain.value = 1 - p.chr.mix;
  const chorusWetGain = ctx.createGain();
  chorusWetGain.gain.value = p.chr.mix;
  const chorusMerge = ctx.createGain();
  chorusMerge.gain.value = 1;

  // --- Stereo Split Block ---
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);
  const delayL = ctx.createDelay(0.02);
  delayL.delayTime.value = p.stp.micro_delay_ms / 1000;
  const delayR = ctx.createDelay(0.02);
  delayR.delayTime.value = (p.stp.micro_delay_ms * 0.85) / 1000;
  const stereoLDry = ctx.createGain();
  stereoLDry.gain.value = 1 - p.stp.width;
  const stereoRDry = ctx.createGain();
  stereoRDry.gain.value = 1 - p.stp.width;
  const stereoLWet = ctx.createGain();
  stereoLWet.gain.value = p.stp.width;
  const stereoRWet = ctx.createGain();
  stereoRWet.gain.value = p.stp.width;

  // --- Space Block (convolver reverb) ---
  const convolver = ctx.createConvolver();
  convolver.buffer = generateReverbIR(ctx, p.spc.decay_s, p.spc.damp);
  const reverbDryGain = ctx.createGain();
  reverbDryGain.gain.value = p.spc.dry;
  const reverbWetGain = ctx.createGain();
  reverbWetGain.gain.value = p.spc.wet;

  // --- Cabinet Block ---
  const cabLowRes = ctx.createBiquadFilter();
  cabLowRes.type = "lowshelf";
  cabLowRes.frequency.value = p.cab.low_res_hz;
  cabLowRes.gain.value = 4; // resonant boost

  const cabHighRoll = ctx.createBiquadFilter();
  cabHighRoll.type = "lowpass";
  cabHighRoll.frequency.value = p.cab.high_roll_hz;
  cabHighRoll.Q.value = 0.7;

  const cabAirShelf = ctx.createBiquadFilter();
  cabAirShelf.type = "highshelf";
  cabAirShelf.frequency.value = 8000;
  cabAirShelf.gain.value = p.cab.air * 6; // air shelf boost

  // --- Output ---
  const outputGain = ctx.createGain();
  outputGain.gain.value = dbToLin(p.out.level_db);

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = p.out.lim_thresh_db;
  limiter.ratio.value = 20; // brick wall
  limiter.attack.value = 0.001;
  limiter.release.value = p.out.lim_release_ms / 1000;
  limiter.knee.value = 0;

  // --- Bypass ---
  const bypassGain = ctx.createGain();
  bypassGain.gain.value = 0.0001;
  const effectGain = ctx.createGain();
  effectGain.gain.value = 1;

  // --- Analyser ---
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;

  // ====== ROUTING ======
  // Source -> Input
  sourceMix.connect(inputGain);

  // Input -> Dynamics (dry/wet)
  inputGain.connect(compressor);
  compressor.connect(compMakeupGain);
  compMakeupGain.connect(compWetGain);
  compWetGain.connect(compMerge);
  inputGain.connect(compDryGain);
  compDryGain.connect(compMerge);

  // Dynamics -> Drive (HP -> LP -> waveshaper with dry/wet)
  compMerge.connect(driveHP);
  driveHP.connect(driveLP);
  driveLP.connect(waveshaper);
  waveshaper.connect(driveLevelGain);
  driveLevelGain.connect(driveWetGain);
  driveWetGain.connect(driveMerge);
  compMerge.connect(driveDryGain);
  driveDryGain.connect(driveMerge);

  // Drive -> Character (chorus dry/wet)
  driveMerge.connect(chorusDelay);
  chorusLFO.connect(chorusLFOGain);
  chorusLFOGain.connect(chorusDelay.delayTime);
  chorusDelay.connect(chorusWetGain);
  chorusWetGain.connect(chorusMerge);
  driveMerge.connect(chorusDryGain);
  chorusDryGain.connect(chorusMerge);

  // Character -> Stereo Split (mono -> stereo via L/R delays)
  // L channel: dry + delayed
  chorusMerge.connect(delayL);
  delayL.connect(stereoLWet);
  chorusMerge.connect(stereoLDry);
  stereoLWet.connect(merger, 0, 0);
  stereoLDry.connect(merger, 0, 0);
  // R channel: dry + delayed (different time)
  chorusMerge.connect(delayR);
  delayR.connect(stereoRWet);
  chorusMerge.connect(stereoRDry);
  stereoRWet.connect(merger, 0, 1);
  stereoRDry.connect(merger, 0, 1);

  // Stereo -> Space (reverb dry/wet)
  const reverbMerge = ctx.createGain();
  reverbMerge.gain.value = 1;
  merger.connect(convolver);
  convolver.connect(reverbWetGain);
  reverbWetGain.connect(reverbMerge);
  merger.connect(reverbDryGain);
  reverbDryGain.connect(reverbMerge);

  // Space -> Cabinet -> Output -> Limiter
  reverbMerge.connect(cabLowRes);
  cabLowRes.connect(cabHighRoll);
  cabHighRoll.connect(cabAirShelf);
  cabAirShelf.connect(outputGain);
  outputGain.connect(limiter);
  limiter.connect(effectGain);

  // Bypass path
  sourceMix.connect(bypassGain);

  // Both -> analyser -> destination
  effectGain.connect(analyser);
  bypassGain.connect(analyser);
  analyser.connect(ctx.destination);

  // Start oscillators
  source.start();
  h2.start();
  h3.start();
  chorusLFO.start();

  return {
    ctx, source, harmonics: [h2, h3], sourceMix,
    inputGain, compressor, compMakeupGain, compDryGain, compWetGain, compMerge,
    driveHP, driveLP, waveshaper, driveDryGain, driveWetGain, driveLevelGain, driveMerge,
    chorusDelay, chorusLFO, chorusLFOGain, chorusDryGain, chorusWetGain, chorusMerge,
    splitter, merger, delayL, delayR, stereoLDry, stereoRDry, stereoLWet, stereoRWet,
    convolver, reverbDryGain, reverbWetGain,
    cabLowRes, cabHighRoll, cabAirShelf,
    outputGain, limiter,
    bypassGain, effectGain, analyser,
    currentParams: p,
  };
}

// Apply smoothed params to running engine (called on knob change)
function updateEngineParams(engine: ChaincraftAudioEngine, p: RigP) {
  const t = engine.ctx.currentTime;
  const ramp = 0.015; // 15ms ramp to avoid clicks (OnePole-like)

  // Dynamics
  engine.compressor.threshold.linearRampToValueAtTime(p.dyn.thresh_db, t + ramp);
  engine.compressor.ratio.linearRampToValueAtTime(p.dyn.ratio, t + ramp);
  engine.compressor.attack.linearRampToValueAtTime(p.dyn.attack_ms / 1000, t + ramp);
  engine.compressor.release.linearRampToValueAtTime(p.dyn.release_ms / 1000, t + ramp);
  engine.compMakeupGain.gain.linearRampToValueAtTime(dbToLin(p.dyn.makeup_db), t + ramp);
  engine.compWetGain.gain.linearRampToValueAtTime(p.dyn.mix, t + ramp);
  engine.compDryGain.gain.linearRampToValueAtTime(1 - p.dyn.mix, t + ramp);

  // Drive (rebuild curve)
  engine.driveHP.frequency.linearRampToValueAtTime(p.drv.low_cut_hz, t + ramp);
  engine.driveLP.frequency.linearRampToValueAtTime(p.drv.high_cut_hz, t + ramp);
  // @ts-expect-error Float32Array compatibility
  engine.waveshaper.curve = makeDriveCurve(p.drv.type, p.drv.asym, dbToLin(p.drv.pre_gain_db), p.drv.tone_tilt);
  engine.driveWetGain.gain.linearRampToValueAtTime(p.drv.mix, t + ramp);
  engine.driveDryGain.gain.linearRampToValueAtTime(1 - p.drv.mix, t + ramp);
  engine.driveLevelGain.gain.linearRampToValueAtTime(dbToLin(p.drv.level_db), t + ramp);

  // Character
  engine.chorusLFO.frequency.linearRampToValueAtTime(p.chr.rate_hz, t + ramp);
  engine.chorusLFOGain.gain.linearRampToValueAtTime(p.chr.depth * 0.003, t + ramp);
  engine.chorusWetGain.gain.linearRampToValueAtTime(p.chr.mix, t + ramp);
  engine.chorusDryGain.gain.linearRampToValueAtTime(1 - p.chr.mix, t + ramp);

  // Stereo Split
  engine.delayL.delayTime.linearRampToValueAtTime(p.stp.micro_delay_ms / 1000, t + ramp);
  engine.delayR.delayTime.linearRampToValueAtTime((p.stp.micro_delay_ms * 0.85) / 1000, t + ramp);
  engine.stereoLWet.gain.linearRampToValueAtTime(p.stp.width, t + ramp);
  engine.stereoRWet.gain.linearRampToValueAtTime(p.stp.width, t + ramp);
  engine.stereoLDry.gain.linearRampToValueAtTime(1 - p.stp.width, t + ramp);
  engine.stereoRDry.gain.linearRampToValueAtTime(1 - p.stp.width, t + ramp);

  // Space (regenerate IR only on significant change)
  engine.reverbDryGain.gain.linearRampToValueAtTime(p.spc.dry, t + ramp);
  engine.reverbWetGain.gain.linearRampToValueAtTime(p.spc.wet, t + ramp);

  // Cabinet
  engine.cabLowRes.frequency.linearRampToValueAtTime(p.cab.low_res_hz, t + ramp);
  engine.cabHighRoll.frequency.linearRampToValueAtTime(p.cab.high_roll_hz, t + ramp);
  engine.cabAirShelf.gain.linearRampToValueAtTime(p.cab.air * 6, t + ramp);

  // Output
  engine.outputGain.gain.linearRampToValueAtTime(dbToLin(p.out.level_db), t + ramp);
  engine.limiter.threshold.linearRampToValueAtTime(p.out.lim_thresh_db, t + ramp);
  engine.limiter.release.linearRampToValueAtTime(p.out.lim_release_ms / 1000, t + ramp);

  engine.currentParams = p;
}

// ============================================================
// Waveform Visualizer
// ============================================================

function WaveformVisualizer({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const drawCtx = canvas.getContext("2d");
    if (!drawCtx) return;

    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);

    const draw = () => {
      analyser.getByteTimeDomainData(data);
      const w = canvas.width;
      const h = canvas.height;
      drawCtx.clearRect(0, 0, w, h);

      drawCtx.strokeStyle = "#c9b99a";
      drawCtx.lineWidth = 1.5;
      drawCtx.beginPath();

      const sliceWidth = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) drawCtx.moveTo(x, y);
        else drawCtx.lineTo(x, y);
        x += sliceWidth;
      }
      drawCtx.lineTo(w, h / 2);
      drawCtx.stroke();

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

// ============================================================
// Main Component
// ============================================================

export default function RigSimulator() {
  const engineRef = useRef<ChaincraftAudioEngine | null>(null);
  const macrosRef = useRef<Macros>({ touch: 0, heat: 0, motion: 0, depth: 0, body: 0 });
  const [playing, setPlaying] = useState(false);
  const [engaged, setEngaged] = useState(true);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const recomputeAndApply = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const base = defaultSceneA();
    const p = applyMacroMaps(base, macrosRef.current);
    updateEngineParams(engine, p);
  }, []);

  const startAudio = useCallback(async () => {
    if (engineRef.current) return;
    const engine = buildEngine();
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
    engine.chorusLFO.stop();
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

  // Macro knob handlers (0-1 range from KnobGraphic)
  const onTouch = useCallback((v: number) => {
    macrosRef.current.touch = v;
    recomputeAndApply();
  }, [recomputeAndApply]);

  const onHeat = useCallback((v: number) => {
    macrosRef.current.heat = v;
    recomputeAndApply();
  }, [recomputeAndApply]);

  const onBody = useCallback((v: number) => {
    macrosRef.current.body = v;
    recomputeAndApply();
  }, [recomputeAndApply]);

  const onDepth = useCallback((v: number) => {
    macrosRef.current.depth = v;
    recomputeAndApply();
  }, [recomputeAndApply]);

  const onMotion = useCallback((v: number) => {
    macrosRef.current.motion = v;
    recomputeAndApply();
  }, [recomputeAndApply]);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try {
          engineRef.current.source.stop();
          engineRef.current.harmonics.forEach((h) => h.stop());
          engineRef.current.chorusLFO.stop();
        } catch { /* noop */ }
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
            border: "1px solid var(--accent)",
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
