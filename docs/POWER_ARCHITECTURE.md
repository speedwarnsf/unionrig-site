# Power Architecture (IEC Internal PSU)

## Overview
Chaincraft uses a **standard IEC C14 inlet** with an **internal, enclosed, pre-certified AC–DC PSU**. No external wall wart or brick.

## Safety & compliance (design intent)
- Pre-certified PSU module (UL/IEC 62368-1)
- Line fuse immediately after IEC inlet
- Protective Earth bonded to chassis at a single point
- EMI filter per PSU application notes
- Clear separation between AC zone and low-voltage audio/DSP zone

## Mechanical considerations
- Allocate ~25–35 mm depth for PSU module
- Maintain creepage/clearance per PSU datasheet
- Provide passive thermal path
- Strain relief on IEC inlet wiring

## Builder notes (prototype)
- IEC C14 inlet with integrated fuse holder preferred
- Wire: IEC → fuse → PSU AC input (L/N), PE → chassis bond
- Route DC rails as twisted pairs away from audio inputs
