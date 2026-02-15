"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import SignalChainView from "@/components/SignalChainView";

// ============================================================
// CHAINCRAFT DSP ENGINE -- ported from firmware chaincraft.h
// ============================================================

function clampf(x: number, a: number, b: number) { return x < a ? a : x > b ? b : x; }
function lerpf(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(t: number) { t = clampf(t, 0, 1); return t * t * (3 - 2 * t); }
function dbToLin(db: number) { return Math.pow(10, db / 20); }

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

// --- Parameter structs ---
interface DynP { enable: boolean; thresh_db: number; ratio: number; attack_ms: number; release_ms: number; makeup_db: number; mix: number; }
interface DrvP { type: number; pre_gain_db: number; asym: number; tone_tilt: number; low_cut_hz: number; high_cut_hz: number; mix: number; level_db: number; }
interface ChrP { mode: number; rate_hz: number; depth: number; mix: number; tone: number; }
interface StpP { width: number; micro_delay_ms: number; }
interface SpcP { damp: number; wet: number; dry: number; decay_s: number; }
interface CabP { low_res_hz: number; high_roll_hz: number; air: number; }
interface OutP { level_db: number; lim_thresh_db: number; lim_release_ms: number; }
interface RigP { dyn: DynP; drv: DrvP; chr: ChrP; stp: StpP; spc: SpcP; cab: CabP; out: OutP; }
interface Macros { touch: number; heat: number; motion: number; depth: number; body: number; }

// --- 12-Sound Working Set ---
interface SoundDef {
  name: string;
  sceneA: RigP;
  sceneB: RigP;
  subOctave?: number; // 0-1 mix level for sub-octave generator
}

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

const SOUNDS: SoundDef[] = [
  {
    name: "Velvet Static",
    sceneA: makeRig({}),
    sceneB: makeRig({
      dyn: { thresh_db: -24, ratio: 3.2, attack_ms: 22, release_ms: 260, makeup_db: 5.5, mix: 0.65 },
      drv: { type: 3, pre_gain_db: 14, asym: 0.55, tone_tilt: -0.05, low_cut_hz: 100, high_cut_hz: 7800, mix: 0.75, level_db: 1.5 },
      chr: { rate_hz: 0.38, depth: 0.35, mix: 0.38, tone: -0.05 },
      stp: { width: 0.75, micro_delay_ms: 9.0 },
      spc: { decay_s: 6.8, damp: 0.35, wet: 0.52, dry: 1.0 },
      cab: { low_res_hz: 120, high_roll_hz: 6400, air: 0.45 },
      out: { level_db: -2, lim_thresh_db: -6, lim_release_ms: 200 },
    }),
  },
  {
    name: "Octdown",
    subOctave: 0.45,
    sceneA: makeRig({
      dyn: { thresh_db: -18, ratio: 3.8, attack_ms: 12, release_ms: 180, makeup_db: 5, mix: 0.60 },
      drv: { type: 1, pre_gain_db: 7, asym: 0.35, tone_tilt: -0.25, low_cut_hz: 70, high_cut_hz: 7200, mix: 0.55, level_db: -1 },
      chr: { mode: 1, rate_hz: 0.28, depth: 0.18, mix: 0.22, tone: -0.18 },
      stp: { width: 0.82, micro_delay_ms: 11.0 },
      spc: { decay_s: 1.8, damp: 0.52, wet: 0.28, dry: 1.0 },
      cab: { low_res_hz: 95, high_roll_hz: 7400, air: 0.38 },
      out: { level_db: -3, lim_thresh_db: -5, lim_release_ms: 140 },
    }),
    sceneB: makeRig({
      dyn: { thresh_db: -24, ratio: 4.5, attack_ms: 8, release_ms: 240, makeup_db: 6.5, mix: 0.70 },
      drv: { type: 3, pre_gain_db: 16, asym: 0.48, tone_tilt: -0.18, low_cut_hz: 75, high_cut_hz: 6400, mix: 0.72, level_db: 1 },
      chr: { mode: 1, rate_hz: 0.32, depth: 0.30, mix: 0.28, tone: -0.12 },
      stp: { width: 0.88, micro_delay_ms: 11.5 },
      spc: { decay_s: 2.4, damp: 0.42, wet: 0.35, dry: 1.0 },
      cab: { low_res_hz: 88, high_roll_hz: 6800, air: 0.42 },
      out: { level_db: -2, lim_thresh_db: -5, lim_release_ms: 180 },
    }),
  },
  {
    name: "Glass Clean",
    sceneA: makeRig({
      dyn: { thresh_db: -18, ratio: 1.8, attack_ms: 12, release_ms: 180, makeup_db: 2, mix: 0.4 },
      drv: { type: 0, pre_gain_db: 3, asym: 0.1, tone_tilt: 0.1, mix: 0.2, level_db: 0 },
      chr: { mode: 1, rate_hz: 0.3, depth: 0.15, mix: 0.2, tone: 0.05 },
      spc: { decay_s: 2.0, damp: 0.5, wet: 0.25, dry: 1.0 },
    }),
    sceneB: makeRig({
      dyn: { thresh_db: -20, ratio: 2.2, attack_ms: 15, release_ms: 200, makeup_db: 3, mix: 0.5 },
      drv: { type: 1, pre_gain_db: 6, asym: 0.15, tone_tilt: 0.0, mix: 0.4, level_db: 0 },
      chr: { mode: 1, rate_hz: 0.5, depth: 0.3, mix: 0.35, tone: 0.0 },
      spc: { decay_s: 3.5, damp: 0.4, wet: 0.4, dry: 1.0 },
      stp: { width: 0.65, micro_delay_ms: 8 },
    }),
  },
  {
    name: "Edge Crunch",
    sceneA: makeRig({
      drv: { type: 1, pre_gain_db: 14, asym: 0.3, tone_tilt: -0.1, mix: 0.7, level_db: -1 },
      spc: { decay_s: 1.8, wet: 0.2 },
    }),
    sceneB: makeRig({
      drv: { type: 2, pre_gain_db: 20, asym: 0.45, tone_tilt: -0.2, mix: 0.85, level_db: -2 },
      spc: { decay_s: 2.5, wet: 0.3 },
      stp: { width: 0.7, micro_delay_ms: 8 },
    }),
  },
  {
    name: "Thick Lead",
    sceneA: makeRig({
      dyn: { thresh_db: -26, ratio: 3.5, makeup_db: 6, mix: 0.7 },
      drv: { type: 3, pre_gain_db: 22, asym: 0.5, tone_tilt: -0.2, mix: 0.9, level_db: 1 },
      chr: { mode: 0, depth: 0, mix: 0 },
      spc: { decay_s: 2.0, wet: 0.25 },
    }),
    sceneB: makeRig({
      dyn: { thresh_db: -28, ratio: 4.0, makeup_db: 7, mix: 0.75 },
      drv: { type: 3, pre_gain_db: 26, asym: 0.6, tone_tilt: -0.25, mix: 0.95, level_db: 2 },
      chr: { mode: 1, rate_hz: 0.2, depth: 0.15, mix: 0.2 },
      spc: { decay_s: 4.0, wet: 0.4, damp: 0.3 },
      stp: { width: 0.8, micro_delay_ms: 10 },
    }),
  },
  {
    name: "Ambient Wash",
    sceneA: makeRig({
      drv: { type: 1, pre_gain_db: 5, mix: 0.3, level_db: 0 },
      chr: { mode: 1, rate_hz: 0.2, depth: 0.4, mix: 0.5, tone: -0.15 },
      spc: { decay_s: 8.0, damp: 0.3, wet: 0.65, dry: 0.8 },
      stp: { width: 0.85, micro_delay_ms: 10 },
    }),
    sceneB: makeRig({
      drv: { type: 1, pre_gain_db: 8, mix: 0.45, level_db: 0 },
      chr: { mode: 1, rate_hz: 0.15, depth: 0.55, mix: 0.6, tone: -0.2 },
      spc: { decay_s: 11.0, damp: 0.2, wet: 0.8, dry: 0.6 },
      stp: { width: 0.95, micro_delay_ms: 11 },
    }),
  },
  {
    name: "Warm Overdrive",
    sceneA: makeRig({
      drv: { type: 1, pre_gain_db: 16, asym: 0.35, tone_tilt: -0.2, low_cut_hz: 100, high_cut_hz: 7000, mix: 0.75, level_db: -1 },
      cab: { low_res_hz: 100, high_roll_hz: 5800, air: 0.2 },
      spc: { decay_s: 1.5, wet: 0.18 },
    }),
    sceneB: makeRig({
      drv: { type: 3, pre_gain_db: 21, asym: 0.5, tone_tilt: -0.15, low_cut_hz: 110, high_cut_hz: 7500, mix: 0.85, level_db: 0 },
      cab: { low_res_hz: 105, high_roll_hz: 6200, air: 0.35 },
      spc: { decay_s: 3.0, wet: 0.35 },
      stp: { width: 0.6, micro_delay_ms: 7 },
    }),
  },
  {
    name: "Tape Wobble",
    sceneA: makeRig({
      drv: { type: 1, pre_gain_db: 7, mix: 0.5 },
      chr: { mode: 3, rate_hz: 2.5, depth: 0.3, mix: 0.35, tone: -0.1 },
      spc: { decay_s: 2.2, wet: 0.3 },
    }),
    sceneB: makeRig({
      drv: { type: 1, pre_gain_db: 10, mix: 0.6 },
      chr: { mode: 3, rate_hz: 4.0, depth: 0.5, mix: 0.55, tone: -0.15 },
      spc: { decay_s: 3.5, wet: 0.45 },
      stp: { width: 0.7, micro_delay_ms: 8 },
    }),
  },
  {
    name: "Fuzz Wall",
    sceneA: makeRig({
      dyn: { thresh_db: -30, ratio: 5, makeup_db: 8, mix: 0.8 },
      drv: { type: 4, pre_gain_db: 28, asym: 0.7, tone_tilt: -0.3, mix: 0.95, level_db: -2 },
      spc: { decay_s: 1.5, wet: 0.15 },
    }),
    sceneB: makeRig({
      dyn: { thresh_db: -32, ratio: 6, makeup_db: 9, mix: 0.85 },
      drv: { type: 5, pre_gain_db: 32, asym: 0.8, tone_tilt: -0.35, mix: 1.0, level_db: -1 },
      spc: { decay_s: 5.0, wet: 0.5, damp: 0.25 },
      stp: { width: 0.9, micro_delay_ms: 11 },
    }),
  },
  {
    name: "Shimmer Pad",
    sceneA: makeRig({
      drv: { type: 0, pre_gain_db: 2, mix: 0.1 },
      chr: { mode: 1, rate_hz: 0.25, depth: 0.5, mix: 0.6, tone: 0.1 },
      spc: { decay_s: 9.0, damp: 0.25, wet: 0.7, dry: 0.7 },
      stp: { width: 0.9, micro_delay_ms: 11 },
      cab: { air: 0.5 },
    }),
    sceneB: makeRig({
      drv: { type: 1, pre_gain_db: 6, mix: 0.3 },
      chr: { mode: 1, rate_hz: 0.18, depth: 0.65, mix: 0.7, tone: 0.15 },
      spc: { decay_s: 12.0, damp: 0.15, wet: 0.85, dry: 0.5 },
      stp: { width: 1.0, micro_delay_ms: 12 },
      cab: { air: 0.65 },
    }),
  },
  {
    name: "Tight Funk",
    sceneA: makeRig({
      dyn: { thresh_db: -16, ratio: 4, attack_ms: 8, release_ms: 120, makeup_db: 5, mix: 0.8 },
      drv: { type: 2, pre_gain_db: 10, mix: 0.5, level_db: 0 },
      chr: { mode: 0, depth: 0, mix: 0 },
      spc: { decay_s: 0.8, wet: 0.1 },
    }),
    sceneB: makeRig({
      dyn: { thresh_db: -18, ratio: 3.5, attack_ms: 10, release_ms: 150, makeup_db: 4, mix: 0.7 },
      drv: { type: 1, pre_gain_db: 13, mix: 0.6, level_db: 0 },
      chr: { mode: 3, rate_hz: 3.0, depth: 0.2, mix: 0.25 },
      spc: { decay_s: 1.5, wet: 0.2 },
    }),
  },
  {
    name: "Dark Swell",
    sceneA: makeRig({
      drv: { type: 1, pre_gain_db: 8, tone_tilt: -0.3, mix: 0.55 },
      chr: { mode: 1, rate_hz: 0.1, depth: 0.3, mix: 0.4, tone: -0.25 },
      spc: { decay_s: 5.5, damp: 0.6, wet: 0.5, dry: 0.9 },
      cab: { high_roll_hz: 5000, air: 0.15 },
    }),
    sceneB: makeRig({
      drv: { type: 3, pre_gain_db: 15, tone_tilt: -0.25, mix: 0.7 },
      chr: { mode: 1, rate_hz: 0.08, depth: 0.45, mix: 0.55, tone: -0.3 },
      spc: { decay_s: 9.0, damp: 0.5, wet: 0.7, dry: 0.7 },
      cab: { high_roll_hz: 4500, air: 0.25 },
      stp: { width: 0.8, micro_delay_ms: 10 },
    }),
  },
  {
    name: "Bright Jangle",
    sceneA: makeRig({
      dyn: { thresh_db: -20, ratio: 2, attack_ms: 14, release_ms: 180, makeup_db: 3, mix: 0.45 },
      drv: { type: 1, pre_gain_db: 6, tone_tilt: 0.15, high_cut_hz: 12000, mix: 0.4 },
      chr: { mode: 1, rate_hz: 0.6, depth: 0.2, mix: 0.25, tone: 0.1 },
      spc: { decay_s: 2.5, damp: 0.35, wet: 0.3 },
      cab: { high_roll_hz: 9000, air: 0.45 },
    }),
    sceneB: makeRig({
      dyn: { thresh_db: -22, ratio: 2.5, attack_ms: 16, release_ms: 200, makeup_db: 4, mix: 0.55 },
      drv: { type: 1, pre_gain_db: 11, tone_tilt: 0.1, high_cut_hz: 11000, mix: 0.55 },
      chr: { mode: 1, rate_hz: 0.5, depth: 0.3, mix: 0.35, tone: 0.05 },
      spc: { decay_s: 4.0, damp: 0.3, wet: 0.45 },
      cab: { high_roll_hz: 8500, air: 0.55 },
      stp: { width: 0.7, micro_delay_ms: 8 },
    }),
  },
];

// --- Firmware LerpRig ---
function lerpRig(A: RigP, B: RigP, t: number): RigP {
  return {
    dyn: {
      enable: A.dyn.enable,
      thresh_db: lerpf(A.dyn.thresh_db, B.dyn.thresh_db, t),
      ratio: lerpf(A.dyn.ratio, B.dyn.ratio, t),
      attack_ms: lerpf(A.dyn.attack_ms, B.dyn.attack_ms, t),
      release_ms: lerpf(A.dyn.release_ms, B.dyn.release_ms, t),
      makeup_db: lerpf(A.dyn.makeup_db, B.dyn.makeup_db, t),
      mix: lerpf(A.dyn.mix, B.dyn.mix, t),
    },
    drv: {
      type: t < 0.5 ? A.drv.type : B.drv.type,
      pre_gain_db: lerpf(A.drv.pre_gain_db, B.drv.pre_gain_db, t),
      asym: lerpf(A.drv.asym, B.drv.asym, t),
      tone_tilt: lerpf(A.drv.tone_tilt, B.drv.tone_tilt, t),
      low_cut_hz: lerpf(A.drv.low_cut_hz, B.drv.low_cut_hz, t),
      high_cut_hz: lerpf(A.drv.high_cut_hz, B.drv.high_cut_hz, t),
      mix: lerpf(A.drv.mix, B.drv.mix, t),
      level_db: lerpf(A.drv.level_db, B.drv.level_db, t),
    },
    chr: {
      mode: t < 0.5 ? A.chr.mode : B.chr.mode,
      rate_hz: lerpf(A.chr.rate_hz, B.chr.rate_hz, t),
      depth: lerpf(A.chr.depth, B.chr.depth, t),
      mix: lerpf(A.chr.mix, B.chr.mix, t),
      tone: lerpf(A.chr.tone, B.chr.tone, t),
    },
    stp: {
      width: lerpf(A.stp.width, B.stp.width, t),
      micro_delay_ms: lerpf(A.stp.micro_delay_ms, B.stp.micro_delay_ms, t),
    },
    spc: {
      decay_s: lerpf(A.spc.decay_s, B.spc.decay_s, t),
      damp: lerpf(A.spc.damp, B.spc.damp, t),
      wet: lerpf(A.spc.wet, B.spc.wet, t),
      dry: lerpf(A.spc.dry, B.spc.dry, t),
    },
    cab: {
      low_res_hz: lerpf(A.cab.low_res_hz, B.cab.low_res_hz, t),
      high_roll_hz: lerpf(A.cab.high_roll_hz, B.cab.high_roll_hz, t),
      air: lerpf(A.cab.air, B.cab.air, t),
    },
    out: {
      level_db: lerpf(A.out.level_db, B.out.level_db, t),
      lim_thresh_db: lerpf(A.out.lim_thresh_db, B.out.lim_thresh_db, t),
      lim_release_ms: lerpf(A.out.lim_release_ms, B.out.lim_release_ms, t),
    },
  };
}

// --- Firmware ApplyMacroMaps ---
function applyMacroMaps(p: RigP, m: Macros): RigP {
  const r: RigP = JSON.parse(JSON.stringify(p));

  const t = m.touch;
  r.dyn.thresh_db += -6 * t;
  r.dyn.ratio += 1.5 * (t * t);
  r.dyn.attack_ms += 6 * t;
  r.dyn.release_ms += 60 * t;
  r.dyn.makeup_db += 3 * t;
  r.dyn.mix += 0.20 * t;

  const h = m.heat, h2 = h * h, h3 = h2 * h;
  r.drv.pre_gain_db += 18 * h;
  r.drv.asym += 0.25 * (h - 0.5);
  r.drv.tone_tilt += -0.25 * h2;
  r.drv.low_cut_hz += 40 * h2;
  r.drv.high_cut_hz += -2000 * h3;
  r.drv.mix += 0.10 * h;
  r.drv.level_db += -3 * h;

  const mo = m.motion;
  r.chr.depth += 0.45 * mo;
  r.chr.mix += 0.35 * mo;
  r.chr.rate_hz += 0.15 * mo;
  r.chr.tone += -0.20 * mo;

  const d = m.depth, d2 = d * d;
  r.spc.wet += 0.55 * d;
  r.spc.decay_s += 3.5 * d2;
  r.spc.damp += -0.20 * d;

  const b = m.body, b2 = b * b;
  r.cab.low_res_hz += -20 * b;
  r.cab.high_roll_hz += -1400 * b2;
  r.cab.air += 0.35 * b;
  r.out.level_db += -1.5 * b;

  r.dyn.thresh_db = clampf(r.dyn.thresh_db, -40, 0);
  r.dyn.ratio = clampf(r.dyn.ratio, 1, 8);
  r.dyn.attack_ms = clampf(r.dyn.attack_ms, 1, 80);
  r.dyn.release_ms = clampf(r.dyn.release_ms, 20, 600);
  r.dyn.makeup_db = clampf(r.dyn.makeup_db, 0, 18);
  r.dyn.mix = clampf(r.dyn.mix, 0, 1);
  r.drv.pre_gain_db = clampf(r.drv.pre_gain_db, 0, 36);
  r.drv.low_cut_hz = clampf(r.drv.low_cut_hz, 20, 300);
  r.drv.high_cut_hz = clampf(r.drv.high_cut_hz, 2000, 18000);
  r.drv.mix = clampf(r.drv.mix, 0, 1);
  r.drv.level_db = clampf(r.drv.level_db, -18, 18);
  r.chr.rate_hz = clampf(r.chr.rate_hz, 0.05, 8);
  r.chr.depth = clampf(r.chr.depth, 0, 1);
  r.chr.mix = clampf(r.chr.mix, 0, 1);
  r.stp.width = clampf(r.stp.width, 0, 1);
  r.stp.micro_delay_ms = clampf(r.stp.micro_delay_ms, 0, 12);
  r.spc.decay_s = clampf(r.spc.decay_s, 0.2, 12);
  r.spc.damp = clampf(r.spc.damp, 0, 1);
  r.spc.wet = clampf(r.spc.wet, 0, 1);
  r.cab.low_res_hz = clampf(r.cab.low_res_hz, 60, 180);
  r.cab.high_roll_hz = clampf(r.cab.high_roll_hz, 2500, 12000);
  r.cab.air = clampf(r.cab.air, 0, 1);
  r.out.level_db = clampf(r.out.level_db, -60, 6);
  r.out.lim_thresh_db = clampf(r.out.lim_thresh_db, -18, 0);
  r.out.lim_release_ms = clampf(r.out.lim_release_ms, 20, 400);

  return r;
}

// ============================================================
// Web Audio DSP Chain
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
  subOctaveProcessor: ScriptProcessorNode;
  subOctaveGain: GainNode;
  audioBuffer: AudioBuffer;
  sourceMix: GainNode;
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
  bypassGain: GainNode;
  effectGain: GainNode;
  analyser: AnalyserNode;
  // Looper nodes
  looperInput: GainNode;
  looperOutput: GainNode;
}

function buildEngine(): AudioEngine {
  const ctx = new AudioContext({ sampleRate: 48000 });

  // ====== GUITAR LOOP SOURCE ======
  const source = ctx.createBufferSource();
  source.loop = true;
  const sourceMix = ctx.createGain(); sourceMix.gain.value = 1.0;
  source.connect(sourceMix);

  // Sub-octave generator: Boss OC-2 style flip-flop frequency divider via AudioWorklet
  // Uses ScriptProcessorNode as fallback for zero-crossing flip-flop
  const subOctaveGain = ctx.createGain(); subOctaveGain.gain.value = 0; // off by default
  const subOctaveFilter = ctx.createBiquadFilter();
  subOctaveFilter.type = "lowpass"; subOctaveFilter.frequency.value = 600; subOctaveFilter.Q.value = 0.7;
  const subOctaveFilter2 = ctx.createBiquadFilter();
  subOctaveFilter2.type = "lowpass"; subOctaveFilter2.frequency.value = 800; subOctaveFilter2.Q.value = 0.5;

  // Flip-flop: track zero crossings, output toggles between +1/-1 at half the input frequency
  const scriptNode = ctx.createScriptProcessor(256, 1, 1);
  let flipState = 1;
  let prevSample = 0;
  scriptNode.onaudioprocess = (e) => {
    const input = e.inputBuffer.getChannelData(0);
    const output = e.outputBuffer.getChannelData(0);
    for (let i = 0; i < input.length; i++) {
      // Detect positive-going zero crossing
      if (prevSample <= 0 && input[i] > 0) {
        flipState = -flipState; // toggle at half rate = octave down
      }
      prevSample = input[i];
      output[i] = flipState * 0.5; // square wave at half frequency
    }
  };
  sourceMix.connect(scriptNode);
  scriptNode.connect(subOctaveFilter);
  subOctaveFilter.connect(subOctaveFilter2);
  subOctaveFilter2.connect(subOctaveGain);
  // ====== END GUITAR LOOP SOURCE ======

  const inputGain = ctx.createGain(); inputGain.gain.value = 1;

  // Dynamics
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -22; compressor.ratio.value = 2.5;
  compressor.attack.value = 0.018; compressor.release.value = 0.22; compressor.knee.value = 6;
  const compMakeupGain = ctx.createGain(); compMakeupGain.gain.value = dbToLin(4);
  const compWetGain = ctx.createGain(); compWetGain.gain.value = 0.55;
  const compDryGain = ctx.createGain(); compDryGain.gain.value = 0.45;
  const compMerge = ctx.createGain(); compMerge.gain.value = 1;

  // Drive
  const driveHP = ctx.createBiquadFilter(); driveHP.type = "highpass"; driveHP.frequency.value = 90; driveHP.Q.value = 0.5;
  const driveLP = ctx.createBiquadFilter(); driveLP.type = "lowpass"; driveLP.frequency.value = 8500; driveLP.Q.value = 0.5;
  const waveshaper = ctx.createWaveShaper();
  waveshaper.curve = makeDriveCurve(1, 0.25, dbToLin(9), -0.15) as Float32Array<ArrayBuffer>;
  waveshaper.oversample = "4x";
  const driveWetGain = ctx.createGain(); driveWetGain.gain.value = 0.65;
  const driveDryGain = ctx.createGain(); driveDryGain.gain.value = 0.35;
  const driveLevelGain = ctx.createGain(); driveLevelGain.gain.value = 1;
  const driveMerge = ctx.createGain(); driveMerge.gain.value = 1;

  // Character
  const chorusDelay = ctx.createDelay(0.05); chorusDelay.delayTime.value = 0.007;
  const chorusLFO = ctx.createOscillator(); chorusLFO.type = "sine"; chorusLFO.frequency.value = 0.45;
  const chorusLFOGain = ctx.createGain(); chorusLFOGain.gain.value = 0.25 * 0.003;
  const chorusDryGain = ctx.createGain(); chorusDryGain.gain.value = 0.7;
  const chorusWetGain = ctx.createGain(); chorusWetGain.gain.value = 0.3;
  const chorusMerge = ctx.createGain(); chorusMerge.gain.value = 1;

  // Stereo
  const merger = ctx.createChannelMerger(2);
  const delayL = ctx.createDelay(0.02); delayL.delayTime.value = 0.0065;
  const delayR = ctx.createDelay(0.02); delayR.delayTime.value = 0.0065 * 0.85;
  const stereoLDry = ctx.createGain(); stereoLDry.gain.value = 0.45;
  const stereoRDry = ctx.createGain(); stereoRDry.gain.value = 0.45;
  const stereoLWet = ctx.createGain(); stereoLWet.gain.value = 0.55;
  const stereoRWet = ctx.createGain(); stereoRWet.gain.value = 0.55;

  // Space
  const convolver = ctx.createConvolver();
  convolver.buffer = generateReverbIR(ctx, 3.2, 0.45);
  const reverbDryGain = ctx.createGain(); reverbDryGain.gain.value = 1.0;
  const reverbWetGain = ctx.createGain(); reverbWetGain.gain.value = 0.38;

  // Cabinet
  const cabLowRes = ctx.createBiquadFilter(); cabLowRes.type = "lowshelf"; cabLowRes.frequency.value = 110; cabLowRes.gain.value = 4;
  const cabHighRoll = ctx.createBiquadFilter(); cabHighRoll.type = "lowpass"; cabHighRoll.frequency.value = 6800; cabHighRoll.Q.value = 0.7;
  const cabAirShelf = ctx.createBiquadFilter(); cabAirShelf.type = "highshelf"; cabAirShelf.frequency.value = 8000; cabAirShelf.gain.value = 0.3 * 6;

  // Output
  const outputGain = ctx.createGain(); outputGain.gain.value = dbToLin(-3);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.16; limiter.knee.value = 0;

  const bypassGain = ctx.createGain(); bypassGain.gain.value = 0.0001;
  const effectGain = ctx.createGain(); effectGain.gain.value = 1;
  const analyser = ctx.createAnalyser(); analyser.fftSize = 2048;

  // Looper tap points (post-dynamics, pre-space)
  const looperInput = ctx.createGain(); looperInput.gain.value = 1;
  const looperOutput = ctx.createGain(); looperOutput.gain.value = 1;

  // === ROUTING ===
  sourceMix.connect(inputGain);
  subOctaveGain.connect(inputGain); // sub-octave mixed into signal chain

  // Dynamics
  inputGain.connect(compressor);
  compressor.connect(compMakeupGain);
  compMakeupGain.connect(compWetGain);
  compWetGain.connect(compMerge);
  inputGain.connect(compDryGain);
  compDryGain.connect(compMerge);

  // Drive
  compMerge.connect(driveHP);
  driveHP.connect(driveLP);
  driveLP.connect(waveshaper);
  waveshaper.connect(driveLevelGain);
  driveLevelGain.connect(driveWetGain);
  driveWetGain.connect(driveMerge);
  compMerge.connect(driveDryGain);
  driveDryGain.connect(driveMerge);

  // Character
  driveMerge.connect(chorusDelay);
  chorusLFO.connect(chorusLFOGain);
  chorusLFOGain.connect(chorusDelay.delayTime);
  chorusDelay.connect(chorusWetGain);
  chorusWetGain.connect(chorusMerge);
  driveMerge.connect(chorusDryGain);
  chorusDryGain.connect(chorusMerge);

  // Looper insert: post-character, pre-stereo
  chorusMerge.connect(looperInput);
  looperInput.connect(looperOutput);

  // Stereo split
  looperOutput.connect(delayL);
  delayL.connect(stereoLWet);
  looperOutput.connect(stereoLDry);
  stereoLWet.connect(merger, 0, 0);
  stereoLDry.connect(merger, 0, 0);
  looperOutput.connect(delayR);
  delayR.connect(stereoRWet);
  looperOutput.connect(stereoRDry);
  stereoRWet.connect(merger, 0, 1);
  stereoRDry.connect(merger, 0, 1);

  // Reverb
  const reverbMerge = ctx.createGain(); reverbMerge.gain.value = 1;
  merger.connect(convolver);
  convolver.connect(reverbWetGain);
  reverbWetGain.connect(reverbMerge);
  merger.connect(reverbDryGain);
  reverbDryGain.connect(reverbMerge);

  // Cab -> Out
  reverbMerge.connect(cabLowRes);
  cabLowRes.connect(cabHighRoll);
  cabHighRoll.connect(cabAirShelf);
  cabAirShelf.connect(outputGain);
  outputGain.connect(limiter);
  limiter.connect(effectGain);

  sourceMix.connect(bypassGain);

  effectGain.connect(analyser);
  bypassGain.connect(analyser);
  analyser.connect(ctx.destination);

  chorusLFO.start();
  // source.start() called after buffer is loaded

  return {
    ctx, source, subOctaveProcessor: scriptNode, subOctaveGain, audioBuffer: source.buffer!, sourceMix,
    inputGain, compressor, compMakeupGain, compDryGain, compWetGain, compMerge,
    driveHP, driveLP, waveshaper, driveDryGain, driveWetGain, driveLevelGain, driveMerge,
    chorusDelay, chorusLFO, chorusLFOGain, chorusDryGain, chorusWetGain, chorusMerge,
    merger, delayL, delayR, stereoLDry, stereoRDry, stereoLWet, stereoRWet,
    convolver, reverbDryGain, reverbWetGain,
    cabLowRes, cabHighRoll, cabAirShelf,
    outputGain, limiter, bypassGain, effectGain, analyser,
    looperInput, looperOutput,
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
// Looper State Machine
// ============================================================
type LooperState = "idle" | "recording" | "playing" | "overdub";

// ============================================================
// Sub-Components
// ============================================================

// --- Knob (inline, no external dependency) ---
function Knob({ label, value: initialValue = 0.5, size = 72, onChange }: {
  label: string; value?: number; size?: number; onChange?: (v: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);
  const velocityRef = useRef(0);
  const animRef = useRef<number>(0);

  const angle = -135 + value * 270;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  const handleDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    lastYRef.current = e.clientY;
    velocityRef.current = 0;
    cancelAnimationFrame(animRef.current);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dy = lastYRef.current - e.clientY;
    lastYRef.current = e.clientY;
    const delta = dy * 0.004;
    velocityRef.current = delta;
    setValue(prev => clampf(prev + delta, 0, 1));
  }, []);

  const handleUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const tick = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.0005) return;
      setValue(prev => {
        let next = prev + velocityRef.current;
        if (next <= 0) { next = 0; velocityRef.current = -velocityRef.current * 0.3; }
        if (next >= 1) { next = 1; velocityRef.current = -velocityRef.current * 0.3; }
        return clampf(next, 0, 1);
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => { onChangeRef.current?.(value); }, [value]);
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((-135 + i * 27) * Math.PI) / 180;
    return {
      x1: cx + (r - 4) * Math.cos(a), y1: cy + (r - 4) * Math.sin(a),
      x2: cx + (r + 1) * Math.cos(a), y2: cy + (r + 1) * Math.sin(a),
      active: i <= value * 10,
    };
  });

  const pa = (angle * Math.PI) / 180;
  const px = cx + (r - 12) * Math.cos(pa);
  const py = cy + (r - 12) * Math.sin(pa);

  return (
    <div
      style={{ textAlign: "center", cursor: "ns-resize", userSelect: "none", touchAction: "none" }}
      onPointerDown={handleDown} onPointerMove={handleMove}
      onPointerUp={handleUp} onPointerCancel={handleUp}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Knob body -- brushed metal look */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a3735" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={r - 3} fill="#1e1c1a" />
        <circle cx={cx} cy={cy} r={r - 5}
          fill="url(#knobGrad)" stroke="#2a2826" strokeWidth="0.5" />
        <defs>
          <radialGradient id="knobGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#3a3836" />
            <stop offset="100%" stopColor="#1a1816" />
          </radialGradient>
        </defs>
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.active ? "#c9b99a" : "#2a2725"} strokeWidth="1" />
        ))}
        <line x1={cx} y1={cy} x2={px} y2={py}
          stroke="#c9b99a" strokeWidth="2" strokeLinecap="square" />
        <circle cx={cx} cy={cy} r="2" fill="#c9b99a" />
      </svg>
      <p style={{
        fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
        color: "#8a8278", marginTop: 6, fontWeight: 500,
      }}>{label}</p>
    </div>
  );
}

// --- E-ink Display ---
function EinkDisplay({ soundName, soundNumber, totalSounds, scene, looperState, ghosting }: {
  soundName: string; soundNumber: number; totalSounds: number; scene: "A" | "B";
  looperState: LooperState; ghosting: boolean;
}) {
  return (
    <div style={{
      background: "#d4d0c8",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='4' height='4' fill='%23d4d0c8'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23ccc8c0' opacity='0.3'/%3E%3C/svg%3E\")",
      border: "2px solid #2a2725",
      padding: "16px 20px",
      position: "relative",
      width: "100%",
      maxWidth: 220,
      margin: "0 auto",
      overflow: "hidden",
    }}>
      {/* Ghosting overlay on transitions */}
      {ghosting && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(180,176,168,0.4)",
          animation: "einkGhost 300ms ease-out forwards",
          pointerEvents: "none",
        }} />
      )}
      {/* Sound name */}
      <div style={{
        fontSize: 18, fontWeight: 500, color: "#1a1816",
        textAlign: "center", letterSpacing: "-0.02em",
        fontFamily: "Inter, sans-serif", lineHeight: 1.2,
        marginBottom: 8,
      }}>{soundName}</div>
      {/* Divider */}
      <div style={{ height: 1, background: "#b0aca4", margin: "0 0 8px" }} />
      {/* Scene + Number row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontSize: 24, fontWeight: 300, color: "#1a1816",
          fontFamily: "Inter, sans-serif",
        }}>{scene}</span>
        <span style={{
          fontSize: 11, letterSpacing: "0.1em", color: "#5a5650",
          fontFamily: "Inter, sans-serif",
        }}>{String(soundNumber).padStart(2, "0")} / {totalSounds}</span>
      </div>
      {/* Looper state */}
      {looperState !== "idle" && (
        <>
          <div style={{ height: 1, background: "#b0aca4", margin: "8px 0" }} />
          <div style={{
            fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
            color: looperState === "recording" ? "#8b1a1a" : "#1a1816",
            textAlign: "center", fontWeight: 600,
            fontFamily: "Inter, sans-serif",
          }}>
            {looperState === "recording" ? "REC" : looperState === "playing" ? "PLAY" : "DUB"}
          </div>
        </>
      )}
    </div>
  );
}

// --- Footswitch ---
function Footswitch({ label, ledOn, ledColor, onTap, onHoldStart, onHoldEnd }: {
  label: string; ledOn: boolean; ledColor?: string;
  onTap: () => void; onHoldStart?: () => void; onHoldEnd?: () => void;
}) {
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const col = ledColor || "#c9b99a";

  const handleDown = useCallback(() => {
    isHoldingRef.current = false;
    if (onHoldStart) {
      holdTimerRef.current = setTimeout(() => {
        isHoldingRef.current = true;
        onHoldStart();
      }, 400);
    }
  }, [onHoldStart]);

  const handleUp = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      onHoldEnd?.();
    } else {
      onTap();
    }
  }, [onTap, onHoldEnd]);

  return (
    <div style={{ textAlign: "center", flex: "1 1 0" }}>
      {/* LED */}
      <div style={{
        width: 6, height: 6, margin: "0 auto 8px",
        background: ledOn ? col : "#2a2725",
        boxShadow: ledOn ? `0 0 8px ${col}` : "none",
        transition: "background 0.15s, box-shadow 0.15s",
      }} />
      {/* Switch body */}
      <button
        onPointerDown={handleDown} onPointerUp={handleUp} onPointerCancel={handleUp}
        style={{
          width: 44, height: 44,
          background: "linear-gradient(180deg, #2a2826 0%, #1a1816 100%)",
          border: "2px solid #3a3735",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto", borderRadius: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          transition: "box-shadow 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#5a5755")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#3a3735")}
      >
        <div style={{
          width: 20, height: 20,
          border: `1px solid ${ledOn ? col : "#3a3735"}`,
          transition: "border-color 0.15s",
        }} />
      </button>
      <p style={{
        fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
        color: "#8a8278", marginTop: 8, fontWeight: 500, lineHeight: 1.2,
      }}>{label}</p>
    </div>
  );
}

// --- Waveform ---
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
    <canvas ref={canvasRef} width={400} height={50} style={{
      width: "100%", height: 50, display: "block",
      border: "1px solid #2a2725", background: "#0e0d0c",
    }} />
  );
}

// ============================================================
// Screw Component
// ============================================================
function Screw({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute", width: 10, height: 10,
      background: "linear-gradient(135deg, #3a3836 0%, #252321 100%)",
      border: "1px solid #4a4745",
      boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)",
      ...style,
    }}>
      {/* Phillips cross */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 6, height: 1, background: "#1a1816",
        transform: "translate(-50%, -50%)",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 1, height: 6, background: "#1a1816",
        transform: "translate(-50%, -50%)",
      }} />
    </div>
  );
}

// ============================================================
// Preset Loader — converts .rig.json to SoundDef
// ============================================================

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

// --- Preset Browser ---
function PresetBrowser({ onLoad, onLoadSet }: { onLoad: (sound: SoundDef) => void; onLoadSet: (sounds: SoundDef[], setName: string) => void }) {
  const [basePresets, setBasePresets] = useState<PresetEntry[]>([]);
  const [userPresets, setUserPresets] = useState<PresetEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [activeSet, setActiveSet] = useState<"base" | "user1">("user1");

  useEffect(() => {
    fetch("/rigs/index.json")
      .then(r => r.json())
      .then((data: PresetEntry[]) => setBasePresets(data))
      .catch(() => {});
    fetch("/rigs/user1/index.json")
      .then(r => r.json())
      .then((data: PresetEntry[]) => setUserPresets(data))
      .catch(() => setUserPresets([]));
  }, []);

  const loadPreset = useCallback(async (entry: PresetEntry, setKey: "base" | "user1") => {
    setLoading(true);
    setSelected(entry.id);
    try {
      const path = setKey === "base" ? `/rigs/${entry.file}` : `/rigs/user1/${entry.file}`;
      const resp = await fetch(path);
      const rj: RigJson = await resp.json();
      onLoad(rigJsonToSoundDef(rj));
    } catch (e) {
      console.error("Failed to load preset:", e);
    }
    setLoading(false);
  }, [onLoad]);

  const loadEntireSet = useCallback(async (presets: PresetEntry[], setKey: "base" | "user1", setName: string) => {
    setLoading(true);
    try {
      const sounds: SoundDef[] = [];
      for (const entry of presets) {
        const path = setKey === "base" ? `/rigs/${entry.file}` : `/rigs/user1/${entry.file}`;
        const resp = await fetch(path);
        const rj: RigJson = await resp.json();
        sounds.push(rigJsonToSoundDef(rj));
      }
      if (sounds.length > 0) {
        onLoadSet(sounds, setName);
        setSelected("");
        setExpanded(false);
      }
    } catch (e) {
      console.error("Failed to load set:", e);
    }
    setLoading(false);
  }, [onLoadSet]);

  if (!basePresets.length && !userPresets.length) return null;

  const activePresets = activeSet === "base" ? basePresets : userPresets;
  const tabStyle = (active: boolean) => ({
    background: active ? "rgba(201,185,154,0.12)" : "none",
    border: "none",
    borderBottom: active ? "2px solid #c9b99a" : "2px solid transparent",
    color: active ? "var(--fg, #e8e4dc)" : "var(--fg-dim, #8a8278)",
    padding: "8px 16px",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    fontWeight: active ? 700 : 500,
    borderRadius: 0,
    transition: "all 0.15s",
  });

  return (
    <div style={{ marginBottom: 32 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none",
          border: "1px solid var(--border, #2a2725)",
          color: "var(--fg-dim, #8a8278)",
          padding: "8px 16px",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontWeight: 600,
          borderRadius: 0,
          width: "100%",
          maxWidth: 480,
          display: "block",
          margin: "0 auto",
          textAlign: "left",
        }}
      >
        {expanded ? "Hide" : "Load"} Presets {selected && !expanded ? `-- ${[...basePresets, ...userPresets].find(p => p.id === selected)?.name}` : ""}
      </button>
      {expanded && (
        <div style={{
          maxWidth: 480,
          margin: "0 auto",
          border: "1px solid var(--border, #2a2725)",
          borderTop: "none",
          background: "var(--surface, #111)",
        }}>
          {/* Set tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border, #2a2725)" }}>
            <button onClick={() => setActiveSet("base")} style={tabStyle(activeSet === "base")}>
              My Rigs ({basePresets.length})
            </button>
            <button onClick={() => setActiveSet("user1")} style={tabStyle(activeSet === "user1")}>
              Famous Rigs ({userPresets.length})
            </button>
          </div>
          {/* Load entire set button */}
          {activePresets.length > 0 && (
            <button
              onClick={() => loadEntireSet(activePresets, activeSet, activeSet === "base" ? "My Rigs" : "Famous Rigs")}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                background: "rgba(201,185,154,0.08)",
                border: "none",
                borderBottom: "1px solid var(--border, #2a2725)",
                padding: "12px 16px",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: 0,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#c9b99a",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,185,154,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,185,154,0.08)")}
            >
              {loading ? "Loading..." : `Load All ${activePresets.length} Rigs`}
            </button>
          )}
          {/* Preset list */}
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {activePresets.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--fg-dim, #8a8278)", fontSize: 12, fontStyle: "italic" }}>
                No presets yet -- design rigs to add them here
              </div>
            ) : (
              activePresets.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => { loadPreset(entry, activeSet); setExpanded(false); }}
                  disabled={loading}
                  style={{
                    display: "block",
                    width: "100%",
                    background: selected === entry.id ? "rgba(201,185,154,0.1)" : "none",
                    border: "none",
                    borderBottom: "1px solid var(--border, #2a2725)",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,185,154,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = selected === entry.id ? "rgba(201,185,154,0.1)" : "none")}
                >
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--fg, #e8e4dc)",
                    display: "block",
                    marginBottom: 2,
                  }}>{entry.name}</span>
                  <span style={{
                    fontSize: 11,
                    color: "var(--fg-dim, #8a8278)",
                    lineHeight: 1.4,
                    display: "block",
                  }}>{entry.notes.length > 80 ? entry.notes.slice(0, 80) + "..." : entry.notes}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function RigSimulator() {
  const engineRef = useRef<AudioEngine | null>(null);
  const macrosRef = useRef<Macros>({ touch: 0, heat: 0, motion: 0, depth: 0, body: 0 });
  const morphRef = useRef(0);
  const morphTargetRef = useRef(0);
  const morphMsRef = useRef(120);
  const morphAnimRef = useRef<number>(0);
  const lastMorphTimeRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [currentSound, setCurrentSound] = useState(0);
  const [sounds, setSounds] = useState<SoundDef[]>(SOUNDS);
  const [loadedSetName, setLoadedSetName] = useState<string>("");
  const [scene, setScene] = useState<"A" | "B">("A");
  const [ghosting, setGhosting] = useState(false);
  const [looperState, setLooperState] = useState<LooperState>("idle");
  const [looperLed, setLooperLed] = useState(false);

  // Looper buffer refs
  const looperBufferRef = useRef<Float32Array | null>(null);
  const looperRecorderRef = useRef<ScriptProcessorNode | null>(null);
  const looperSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const looperRecordingRef = useRef<Float32Array[]>([]);

  const triggerGhost = useCallback(() => {
    setGhosting(true);
    setTimeout(() => setGhosting(false), 300);
  }, []);

  // Morph animation loop
  const stepMorph = useCallback(() => {
    const now = performance.now();
    const dt = now - lastMorphTimeRef.current;
    lastMorphTimeRef.current = now;

    const target = morphTargetRef.current;
    const ms = morphMsRef.current;
    const step = dt / (ms <= 1 ? 1 : ms);

    if (Math.abs(target - morphRef.current) > 0.0005) {
      if (target > morphRef.current) morphRef.current = clampf(morphRef.current + step, 0, 1);
      else morphRef.current = clampf(morphRef.current - step, 0, 1);
    } else {
      morphRef.current = target;
    }

    recomputeAndApply();

    if (Math.abs(target - morphRef.current) > 0.0005) {
      morphAnimRef.current = requestAnimationFrame(stepMorph);
    }
  }, []);

  const startMorph = useCallback((target: number, ms: number) => {
    morphTargetRef.current = target;
    morphMsRef.current = ms;
    lastMorphTimeRef.current = performance.now();
    cancelAnimationFrame(morphAnimRef.current);
    morphAnimRef.current = requestAnimationFrame(stepMorph);
  }, [stepMorph]);

  const presetSoundRef = useRef<SoundDef | null>(null);

  const recomputeAndApply = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const sound = presetSoundRef.current || sounds[currentSound];
    if (!sound) return;
    const shaped = smoothstep(morphRef.current);
    const base = lerpRig(sound.sceneA, sound.sceneB, shaped);
    const p = applyMacroMaps(base, macrosRef.current);
    updateEngineParams(engine, p);
  }, [currentSound]);

  const startAudio = useCallback(async () => {
    if (engineRef.current) return;
    let engine: AudioEngine;
    try {
      engine = buildEngine();
    } catch (e) {
      console.error("Failed to build audio engine:", e);
      return;
    }
    // Mobile Safari fix — resume on user gesture
    try {
      if (engine.ctx.state === "suspended") await engine.ctx.resume();
    } catch (e) {
      console.error("Failed to resume AudioContext:", e);
    }
    // Load guitar loop
    try {
      const resp = await fetch("/audio/guitar-loop.mp3");
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuf = await resp.arrayBuffer();
      const audioBuffer = await engine.ctx.decodeAudioData(arrayBuf);
      engine.audioBuffer = audioBuffer;
      // Create a fresh source node (can only start once)
      const newSource = engine.ctx.createBufferSource();
      newSource.buffer = audioBuffer;
      newSource.loop = true;
      newSource.connect(engine.sourceMix);
      engine.source = newSource;
      newSource.start(0);
    } catch (e) {
      console.error("Failed to load guitar loop:", e);
      try { engine.ctx.close(); } catch { /* */ }
      return;
    }
    engineRef.current = engine;
    setAnalyser(engine.analyser);
    setPlaying(true);
  }, []);

  const stopAudio = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    try { engine.source.stop(); engine.chorusLFO.stop(); } catch { /* */ }
    engine.ctx.close();
    engineRef.current = null;
    setAnalyser(null);
    setPlaying(false);
    setLooperState("idle");
    setLooperLed(false);
  }, []);

  // Scene footswitch
  const onSceneTap = useCallback(() => {
    setScene(prev => {
      const next = prev === "A" ? "B" : "A";
      startMorph(next === "B" ? 1 : 0, 120);
      triggerGhost();
      return next;
    });
  }, [startMorph, triggerGhost]);

  const onSceneHoldStart = useCallback(() => {
    startMorph(scene === "A" ? 1 : 0, 80);
  }, [scene, startMorph]);

  const onSceneHoldEnd = useCallback(() => {
    startMorph(scene === "A" ? 0 : 1, 120);
  }, [scene, startMorph]);

  // Sound navigation
  const applySubOctave = useCallback((soundIdx: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const level = sounds[soundIdx]?.subOctave ?? 0;
    const t = engine.ctx.currentTime;
    engine.subOctaveGain.gain.linearRampToValueAtTime(level, t + 0.015);
  }, []);

  const onNextSound = useCallback(() => {
    setPresetSound(null);
    presetSoundRef.current = null;
    setCurrentSound(prev => {
      const next = (prev + 1) % sounds.length;
      morphRef.current = 0;
      morphTargetRef.current = 0;
      setScene("A");
      triggerGhost();
      applySubOctave(next);
      return next;
    });
  }, [triggerGhost, applySubOctave]);

  const onPrevSound = useCallback(() => {
    setPresetSound(null);
    presetSoundRef.current = null;
    setCurrentSound(prev => {
      const next = (prev - 1 + sounds.length) % sounds.length;
      morphRef.current = 0;
      morphTargetRef.current = 0;
      setScene("A");
      triggerGhost();
      applySubOctave(next);
      return next;
    });
  }, [triggerGhost, applySubOctave]);

  // Looper
  const onLooperTap = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (looperState === "idle") {
      // Start recording
      looperRecordingRef.current = [];
      const recorder = engine.ctx.createScriptProcessor(4096, 1, 1);
      recorder.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        looperRecordingRef.current.push(new Float32Array(input));
      };
      engine.looperInput.connect(recorder);
      recorder.connect(engine.ctx.destination); // needed for processing
      looperRecorderRef.current = recorder;
      setLooperState("recording");
      setLooperLed(true);
    } else if (looperState === "recording") {
      // Stop recording, start playback
      if (looperRecorderRef.current) {
        engine.looperInput.disconnect(looperRecorderRef.current);
        looperRecorderRef.current.disconnect();
        looperRecorderRef.current = null;
      }
      // Concatenate chunks
      const chunks = looperRecordingRef.current;
      const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
      const buffer = new Float32Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
      looperBufferRef.current = buffer;
      // Play loop
      playLoopBuffer(engine);
      setLooperState("playing");
    } else if (looperState === "playing") {
      // Overdub
      looperRecordingRef.current = [];
      const recorder = engine.ctx.createScriptProcessor(4096, 1, 1);
      recorder.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        looperRecordingRef.current.push(new Float32Array(input));
      };
      engine.looperInput.connect(recorder);
      recorder.connect(engine.ctx.destination);
      looperRecorderRef.current = recorder;
      setLooperState("overdub");
    } else if (looperState === "overdub") {
      // Stop overdub, mix into buffer
      if (looperRecorderRef.current) {
        engine.looperInput.disconnect(looperRecorderRef.current);
        looperRecorderRef.current.disconnect();
        looperRecorderRef.current = null;
      }
      const chunks = looperRecordingRef.current;
      const overdub = new Float32Array(chunks.reduce((s, c) => s + c.length, 0));
      let off = 0;
      for (const chunk of chunks) { overdub.set(chunk, off); off += chunk.length; }
      // Mix into existing buffer
      if (looperBufferRef.current) {
        const existing = looperBufferRef.current;
        const minLen = Math.min(existing.length, overdub.length);
        for (let i = 0; i < minLen; i++) {
          existing[i] = clampf(existing[i] + overdub[i], -1, 1);
        }
      }
      // Restart playback with mixed buffer
      if (looperSourceRef.current) {
        try { looperSourceRef.current.stop(); } catch { /* */ }
      }
      playLoopBuffer(engine);
      setLooperState("playing");
    }
  }, [looperState]);

  const onLooperHoldStart = useCallback(() => {
    // Long press = clear
  }, []);

  const onLooperHoldEnd = useCallback(() => {
    // Clear looper
    if (looperSourceRef.current) {
      try { looperSourceRef.current.stop(); } catch { /* */ }
      looperSourceRef.current = null;
    }
    if (looperRecorderRef.current) {
      const engine = engineRef.current;
      if (engine) {
        try { engine.looperInput.disconnect(looperRecorderRef.current); } catch { /* */ }
        looperRecorderRef.current.disconnect();
      }
      looperRecorderRef.current = null;
    }
    looperBufferRef.current = null;
    looperRecordingRef.current = [];
    setLooperState("idle");
    setLooperLed(false);
  }, []);

  function playLoopBuffer(engine: AudioEngine) {
    const buf = looperBufferRef.current;
    if (!buf || !buf.length) return;
    const audioBuf = engine.ctx.createBuffer(1, buf.length, engine.ctx.sampleRate);
    audioBuf.getChannelData(0).set(buf);
    const src = engine.ctx.createBufferSource();
    src.buffer = audioBuf;
    src.loop = true;
    src.connect(engine.looperOutput);
    src.start();
    looperSourceRef.current = src;
  }

  // Knob handlers
  const onTouch = useCallback((v: number) => { macrosRef.current.touch = v; recomputeAndApply(); }, [recomputeAndApply]);
  const onHeat = useCallback((v: number) => { macrosRef.current.heat = v; recomputeAndApply(); }, [recomputeAndApply]);
  const onBody = useCallback((v: number) => { macrosRef.current.body = v; recomputeAndApply(); }, [recomputeAndApply]);
  const onDepth = useCallback((v: number) => { macrosRef.current.depth = v; recomputeAndApply(); }, [recomputeAndApply]);
  const onMotion = useCallback((v: number) => { macrosRef.current.motion = v; recomputeAndApply(); }, [recomputeAndApply]);

  // Preset loading
  const [presetSound, setPresetSound] = useState<SoundDef | null>(null);

  const onPresetLoad = useCallback((sd: SoundDef) => {
    setPresetSound(sd);
    presetSoundRef.current = sd;
    morphRef.current = 0;
    morphTargetRef.current = 0;
    setScene("A");
    triggerGhost();
    // Reapply immediately
    const engine = engineRef.current;
    if (engine) {
      const p = applyMacroMaps(sd.sceneA, macrosRef.current);
      updateEngineParams(engine, p);
    }
  }, [triggerGhost]);

  const onLoadSet = useCallback((newSounds: SoundDef[], setName: string) => {
    setSounds(newSounds);
    setLoadedSetName(setName);
    setCurrentSound(0);
    setPresetSound(null);
    presetSoundRef.current = null;
    morphRef.current = 0;
    morphTargetRef.current = 0;
    setScene("A");
    triggerGhost();
    const engine = engineRef.current;
    if (engine) {
      const p = applyMacroMaps(newSounds[0].sceneA, macrosRef.current);
      updateEngineParams(engine, p);
    }
  }, [triggerGhost]);

  // Recompute when sound changes
  useEffect(() => { recomputeAndApply(); }, [currentSound, recomputeAndApply]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try { engineRef.current.source.stop(); engineRef.current.chorusLFO.stop(); } catch { /* */ }
        engineRef.current.ctx.close();
      }
      cancelAnimationFrame(morphAnimRef.current);
    };
  }, []);

  const sound = presetSound || sounds[currentSound];

  return (
    <div>
      <style>{`
        @keyframes einkGhost {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (max-width: 640px) {
          .pedal-body { max-width: 100% !important; padding: 24px 16px 20px !important; }
          .knob-clusters { flex-direction: column !important; gap: 24px !important; }
          .knob-cluster { width: 100% !important; }
          .footswitch-row { gap: 8px !important; }
        }
      `}</style>

      <h2 style={{
        fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 300,
        letterSpacing: "-0.02em", marginBottom: 16,
      }}>Try the Rig</h2>
      <p style={{
        color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7,
        maxWidth: 560, marginBottom: 48,
      }}>
        Interactive pedal simulator. Turn the knobs, switch scenes, navigate sounds --
        hear the Chaincraft DSP engine in real-time.
      </p>

      {/* Preset browser */}
      <PresetBrowser onLoad={onPresetLoad} onLoadSet={onLoadSet} />

      {/* Pedal enclosure */}
      <div className="pedal-body" style={{
        background: "linear-gradient(180deg, #1e1c1a 0%, #161412 40%, #0e0d0c 100%)",
        backgroundImage: `
          linear-gradient(180deg, #1e1c1a 0%, #161412 40%, #0e0d0c 100%),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)
        `,
        border: "2px solid #2a2725",
        maxWidth: 480,
        margin: "0 auto",
        padding: "32px 28px 24px",
        position: "relative",
        boxShadow: "0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        {/* Corner screws */}
        <Screw style={{ top: 8, left: 8 }} />
        <Screw style={{ top: 8, right: 8 }} />
        <Screw style={{ bottom: 8, left: 8 }} />
        <Screw style={{ bottom: 8, right: 8 }} />

        {/* Brand mark */}
        <div style={{
          textAlign: "center", marginBottom: 20,
          fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "#5a5650", fontWeight: 600,
        }}>UNION RIG</div>

        {/* E-ink display */}
        <div style={{ marginBottom: 24 }}>
          <EinkDisplay
            soundName={sound?.name || ""}
            soundNumber={currentSound + 1}
            totalSounds={sounds.length}
            scene={scene}
            looperState={looperState}
            ghosting={ghosting}
          />
        </div>

        {/* Waveform */}
        <div style={{ marginBottom: 16 }}>
          <Waveform analyser={analyser} />
        </div>

        {/* Signal chain mini view */}
        <div style={{ marginBottom: 16, overflow: "hidden" }}>
          <SignalChainView compact />
        </div>

        {/* Knob clusters -- side by side on desktop, stacked on mobile */}
        <div className="knob-clusters" style={{
          display: "flex", gap: 16, marginBottom: 24, justifyContent: "center",
        }}>
          {/* Left cluster: Tone/Feel */}
          <div className="knob-cluster" style={{
            flex: "1 1 0", textAlign: "center",
          }}>
            <p style={{
              fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#5a5650", marginBottom: 10, fontWeight: 600,
            }}>Tone / Feel</p>
            {/* Triangle layout: Heat on top, Touch + Body below */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <Knob label="Heat" value={0} size={64} onChange={onHeat} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", gap: 4 }}>
              <Knob label="Touch" value={0.5} size={56} onChange={onTouch} />
              <Knob label="Body" value={0.5} size={56} onChange={onBody} />
            </div>
          </div>

          {/* Right cluster: Space/Time */}
          <div className="knob-cluster" style={{
            flex: "1 1 0", textAlign: "center",
          }}>
            <p style={{
              fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#5a5650", marginBottom: 10, fontWeight: 600,
            }}>Space / Time</p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <Knob label="Motion" value={0.3} size={64} onChange={onMotion} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", gap: 4 }}>
              <Knob label="Depth" value={0.3} size={56} onChange={onDepth} />
              <Knob label="Tempo" value={0.5} size={56} />
            </div>
          </div>
        </div>

        {/* Footswitches */}
        <div className="footswitch-row" style={{
          display: "flex", gap: 12, justifyContent: "center",
          borderTop: "1px solid #2a2725", paddingTop: 20,
        }}>
          <Footswitch
            label="Looper"
            ledOn={looperLed}
            ledColor={looperState === "recording" ? "#cc3333" : looperState === "overdub" ? "#ccaa33" : "#c9b99a"}
            onTap={onLooperTap}
            onHoldStart={onLooperHoldStart}
            onHoldEnd={onLooperHoldEnd}
          />
          <Footswitch
            label="Scene"
            ledOn={scene === "B"}
            onTap={onSceneTap}
            onHoldStart={onSceneHoldStart}
            onHoldEnd={onSceneHoldEnd}
          />
          <Footswitch
            label="Next"
            ledOn={false}
            onTap={onNextSound}
          />
          <Footswitch
            label="Prev"
            ledOn={false}
            onTap={onPrevSound}
          />
        </div>
      </div>

      {/* Play/Stop */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={playing ? stopAudio : startAudio}
          style={{
            background: playing ? "none" : "var(--accent)",
            color: playing ? "var(--accent)" : "var(--bg)",
            border: "1px solid var(--accent)",
            padding: "10px 32px", fontSize: 12,
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: 600, borderRadius: 0,
          }}
        >{playing ? "Stop" : "Play Demo"}</button>
      </div>
    </div>
  );
}
