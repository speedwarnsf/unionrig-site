# Preferences (Taste Memory)

Chaincraft includes a **Preference Vector**: a small, local-only “taste gravity” that nudges future tone changes toward what you repeatedly choose.

## What it is
- A bounded set of biases in the range **[-0.25, +0.25]** for:
  - Touch, Heat, Body, Depth, Motion
  - Tempo (sync-vs-free bias, and bpm slow-vs-fast bias)
- Stored **on-device** (flash/EEPROM), works **offline**.
- Updated **only on explicit commits** (save rig/scene, accept a mutation, etc.).

## What it is not
- Not identity tracking.
- Not cloud personalization.
- Not “listening to you” in the background.
- Not an LLM-controlled state.

> Chaincraft never remembers *who* you are. It remembers *how you adjust sound*.

## Update math (v1)
Let macro value `m` be in [0,1]. Define `x = m - 0.5` (range [-0.5, +0.5]) and `target = 2x` (range [-1, +1]).

Bias update per commit count `n`:
- `η0 = 0.030`, `η_min = 0.006`, `k = 80`
- `η(n) = max(η_min, η0 * (1 / (1 + n/k)))`

Update:
- `b ← clamp(b + η(n) * target, -0.25, +0.25)`

Tempo:
- `mode_bias` nudges toward tempo-sync (positive) vs free-running (negative)
- `bpm_bias` updates more slowly (scaled by 0.5) in normalized bpm space

## How it fits the Rig Delta pipeline
When a rig delta is applied:
1. Validate delta JSON (`schemas/rig-delta.v1.json`)
2. Enforce allowlist & bounds
3. Apply delta to scene params
4. Apply preference biases **to macro values** (not deep params)
5. Run macro mapping → smooth/crossfade → audio output
6. On commit, update the Preference Vector

## User-facing behavior
- Preferences are subtle and bounded.
- A “Reset Preferences” action clears them.
- Preferences never override a direct request; they only shape how the system “lands.”
