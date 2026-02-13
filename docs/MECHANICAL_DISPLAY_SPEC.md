# Chaincraft v1 Display Subsystem Mechanical Spec

Subsystem: 4.2″ portrait e-ink “Rig Card” display  
Goal: mechanically plausible, serviceable, vibration-safe, manufacturable

## A. Display module (fixed constraints)
- Type: 4.2″ monochrome e-ink panel (400×300 class)
- Active area: 84.8 mm (H) × 63.6 mm (W)
- Overall glass/module envelope: ~91 mm (H) × 77 mm (W) (treated as target)
- Glass thickness: ~1.3 mm (range 1.2–1.5 mm)

## B. Top shell machining (CNC aluminum)
### B1. Cutout & reveal
- Visible window: active area 84.8 × 63.6 mm
- Reveal gap (shadow line) between aluminum and clamp frame: 0.25–0.40 mm per side

### B2. Support ledge (rabbet) — non-negotiable
- Ledge depth: 1.8 mm
- Ledge land width: 2.5–3.5 mm continuous around perimeter
- Display rests on ledge; clamp frame prevents lift

### B3. Bosses for fasteners
- 4× integrated threaded bosses (or inserts) in aluminum
- Thread: M2 × 0.4

## C. Retention method (chosen and frozen)
### C1. Clamp frame
- Thickness: 2.5 mm
- Fastening: 4× M2 screws into top-shell bosses
- Frame inner opening clears active window (no pixel occlusion)
- Frame outer edge provides intentional border (“trading card” vibe)

### C2. Compression gasket
- Closed-cell foam or silicone
- Thickness (uncompressed): 0.5 mm
- Compression target: 20–35%
- Contacts glass perimeter only (never active area)

## D. Display-to-controller connection
- FPC exits bottom edge of display
- Minimum bend radius ≥ 5 mm
- Service loop/slack: 10–15 mm free length before connector
- Provide strain relief (clamp tab or adhesive anchor)

## E. Controller PCB
- PCB thickness: 1.6 mm
- Standoff height: 8 mm (fixed)
- Minimum clearance between PCB components and glass underside: ≥ 2.0 mm
- Mount on 4 standoffs with consistent fasteners

## F. Z-stack budget (authoritative)
Treat display bay as requiring ~12–15 mm internal Z depth under glass plane, accounting for glass + gasket + clearance + PCB + component height + standoffs.

## G. Serviceability rules
- Removable by removing clamp screws, lifting frame, unplugging FPC, lifting glass.
- No permanent bonding of glass to aluminum for v1 (adhesive only for strain relief, not primary retention).

## H. Visual intent
- Portrait “patch card” presence
- Visible frame border + shadow line
- Slightly recessed/protected feel (no flush phone-glass vibe)
