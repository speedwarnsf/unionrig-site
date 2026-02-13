# Union Rig — Looper Spec (Locked Intent)

## Purpose
A simple but performance-usable looper that supports listening and building without becoming a workstation.

## Placement
Leftmost footswitch (player’s left foot).

## Signal placement
Record point: post-dynamics, pre-space. Playback remains inside the instrument so scenes and macro changes can act on the loop.

## Scope
- Single loop buffer
- Sound-on-sound overdub
- Temporary (no save/recall)
- Destructive by design (no deep undo)

## Persistence rules
- Persists across Scene changes
- Persists across Sound advances unless explicitly cleared
- No hidden automatic clearing

## Required control capabilities
Start/stop record, enter/exit overdub, stop playback, clear loop (deliberate gesture).
