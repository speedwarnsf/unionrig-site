# Chaincraft Project Folder

This folder captures the *current* Chaincraft artifacts we designed in-chat:
- Product/UX/mechanical documents
- Rig JSON schema + rig-delta schema
- Safety allowlist manifest for LLM→DSP changes
- Example rig ("Velvet Static v3")
- patch.Init firmware starter skeleton (two-file version)

Everything here is specific to Chaincraft (no other projects).

## Added (Preferences)
- `schemas/prefs.v1.json` — Preference Vector schema
- `docs/PREFERENCES.md` — behavior + math + pipeline integration
- `schemas/rig-delta.v1.json` updated to allow optional `changes.macros`

## Power decision (locked)
- IEC C14 inlet with internal, enclosed universal AC–DC PSU (no wall wart).

## Latest Updates
- External ADC strategy locked
- IEC internal PSU locked
- Phase-2 enclosure geometry defined

## Union Rig locked docs
Added docs/PRODUCT_SPEC_LOCKED.md, docs/CONTROLS_PERFORMANCE_MODEL.md, docs/LOOPER_SPEC.md, docs/TECHNICAL_PAGE_PLAIN.md, docs/BRAND_NOTES_UNION.md, docs/SITE_COPY_HOME.md

## BOM
Prototype and production BOM docs added under /bom
