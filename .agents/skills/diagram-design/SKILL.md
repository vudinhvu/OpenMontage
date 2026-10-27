---
name: diagram-design
description: OpenMontage adapter for diagram assets used in video scenes.
---

# Diagram Assets for OpenMontage

Use for a scene where relationships, process, architecture, or data structure are clearer as a visual than narration alone.

1. Produce a source-controlled SVG or PNG through `diagram_gen`; record its source and path in `asset_manifest`.
2. Keep one visual claim per diagram. Ensure text remains legible at the output profile and within safe zones.
3. For Motion Canvas, import the asset from the selected project workspace; do not embed an untraceable screenshot.
4. Treat brand tokens as input: use approved colors/type only, otherwise mark them unverified.
