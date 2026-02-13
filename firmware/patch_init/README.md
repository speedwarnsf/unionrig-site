# patch.Init Firmware Starter (Chaincraft)

This folder contains a minimal, tweakable starting point for Chaincraft on Electrosmith patch.Init (Daisy Patch SM).

Files:
- main.cpp: hardware init + control polling + audio callback
- chaincraft.h: the Chaincraft DSP engine (mono in → stereo out), A/B scenes, macro maps

Notes:
- patch.Init ships with 4 panel knobs in many builds; Body is temporarily mapped to Depth until a 5th pot is added.
- Footswitch pins in main.cpp are placeholders—wire your own momentary switches to appropriate Patch SM pins + GND.

## Power (prototype)
- Intended power: **IEC C14 inlet with internal AC–DC PSU**.
- Bench bring-up may use a lab DC supply feeding patch.Init VIN.
