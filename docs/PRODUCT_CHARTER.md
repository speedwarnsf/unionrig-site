# Chaincraft Product Charter

## One-sentence anchor
**Chaincraft is a mono-in, stereo-out guitar instrument with a fixed signal chain, macro-driven control, and scene-based recall—designed to preserve feel while enabling intelligent evolution.**

## What Chaincraft is
- Pedalboard-format guitar processor (instrument-grade feel).
- Deterministic DSP audio engine (DSP MCU; no OS jitter).
- Fixed, opinionated topology with curated voicings (hybrid: familiar archetypes, original sound).
- Five macro controls: **Touch, Heat, Motion, Depth, Body**.
- Two scenes per rig (A/B) with smooth morphing; no pops/clicks.
- E-ink “rig card” display for cognition (orientation, recall, lineage), not real-time metering.

## What Chaincraft is not
- Not a touchscreen preset browser.
- Not a museum of branded amps/pedals.
- Not an LLM-in-the-audio-path system.
- Not feature-bloated; restraint is a design feature.

## v1 Audio topology (fixed)
Mono In → Dynamics → Drive → Character → Stereo Split → Space (Stereo) → Cab/Output (Stereo) → Stereo Out

## Latency philosophy
- Audio thread is deterministic and isolated.
- LLM/control/UI runs outside audio path.
- All parameter changes are smoothed; enum/mode changes crossfaded.

## Rigs & mutation safety
- Rigs are structured objects (JSON) with scenes, tags, lineage.
- LLM proposes **rig deltas** (partial updates) validated against schema and allowlist.
- Firmware enforces smoothing, crossfade, max delta limits regardless of LLM output.

## Current scope snapshot
**Specified:** topology, DSP block contracts, macro mappings, scene behavior, rig schema, delta schema, allowlist manifest, example rig, patch.Init firmware skeleton.
**Deferred:** enclosure final design, footswitch wiring, display integration, LLM gateway, rig library UI, production DFM.

## Taste memory (hard-coded)
- Chaincraft maintains a local **Preference Vector** that slowly learns your macro tendencies *only on explicit commits* (save/accept), bounded and resettable.
- This is deterministic and offline; the LLM cannot modify it directly.

## Power & reliability
- Standard **IEC C14 inlet** with **internal, enclosed universal AC–DC PSU** (no wall wart).
- Earth bonded to chassis at a single point; fused and EMI-managed.
- Designed for studio and stage environments with consistent power behavior worldwide.
