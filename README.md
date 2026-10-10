# CHROMA ENGINE

SWWS experimental parametric design-to-toolpath engine for rotational 3D-printed objects.

## Target machine
- Bambu Lab A1
- AMS Lite (up to four filaments)
- 0.8 mm nozzle

## Goal
Profile of revolution → parametric pattern → color mapping → extrusion toolpaths → validated machine G-code.

## Planned modules
1. Profile Designer: 2D curve, radius by height, revolution.
2. Pattern Designer: waves, diamonds, zigzags, pixel/image mapping.
3. Color Designer: assign up to four material channels.
4. Toolpath Engine: per-layer geometry, extrusion width, continuity, sequencing.
5. G-code Engine: machine-specific output after safe validation against Bambu Studio references.

## Development stages
- V0.1: profile editor, geometry viewer, pattern and color preview, JSON/CSV export.
- V0.2: real per-layer paths and extrusion calculations.
- V0.3: multi-color path ordering and purge analysis.
- V0.4: Bambu A1 machine-specific postprocessor and physical validation.

## Safety / validation
**Not yet ready to print.** Preview paths or CSV points are not validated G-code. No machine-ready output should be used until travel moves, volumetric flow, heating, homing, purge, AMS commands and printer-specific start/end sequences have been verified.

## Project boundaries
Independent repository. Do not change `craft-intelligence-graph`, `craft-3d-viewer` or other SWWS repositories without explicit approval.

## Research
Printesso configuration URL suggests serializable shape, pattern and color choices; its internal geometry and manufacturing method remain unverified.
