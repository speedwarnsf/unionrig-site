# Union Rig — Product Specification (Locked Draft v0.9)

## Identity
- Brand: Union
- Product: Union Rig
- Tagline: Trust what works.
- Axiom: Machines are useless if you can’t trust them.

## Core behavior (what it does)
Union Rig is a mono-in / stereo-out guitar instrument with a fixed signal structure, a 12-sound working set, two scenes per sound, and a left-foot looper. It is designed to change sound without audio interruption and to build trust through consistency and explicit user commits.

## Audio I/O
- Mono guitar input
- Stereo outputs (L/R)

## Fixed signal structure
Dynamics → Drive → Character/Motion → Stereo Width → Space → Output Shaping

## Control surface
### Knobs (6)
Left cluster: Touch (lower-left), Heat (upper-mid), Body (lower-right)  
Right cluster: Depth, Motion, Tempo

### Footswitches (4), left→right
1) Looper  2) Scene (A/B + momentary morph)  3) Next Sound  4) Previous Sound

## Sounds & scenes
- 12 sounds loaded at a time (no banks)
- Each sound has Scene A and Scene B (musically related)
- Linear sound navigation; scenes are primary within-song control

## Looper (intent)
- Single loop, sound-on-sound overdub
- Recorded post-dynamics, pre-space
- Persists unless cleared (no hidden auto-clear)
- Temporary (no save/recall), destructive by design

## Preference memory
- Local Preference Vector (macro-level biases) updated only on explicit commits.
- No identity tracking; LLM cannot modify it directly.

## LLM role
- Optional control-plane assistant (intent → bounded deltas).
- Never in the audio path; changes validated and user-committed.

## Hardware posture
- IEC C14 inlet with internal, enclosed universal AC–DC PSU (no wall wart)
- CNC aluminum production intent; Phase-2 printed enclosure used to lock geometry

## Explicit exclusions (v1)
No touchscreen, no deep parameter pages, no unlimited banks, no cloud dependency.
