---
name: video-explainer
description: OpenMontage adapter for script-first, scene-level explainer productions.
---

# Video Explainer for OpenMontage

Use only for an explicit MP4 explainer, training, or screen-demo request.

1. Select a pipeline under `pipeline_defs/`; use `animated-explainer` for a narrated, diagram-led explanation.
2. Work script-first: proposal, script, scene plan, assets, edit decisions, then compose.
3. Lock `production_plan.render_runtime` at proposal and preserve it in `edit_decisions`; a renderer failure is a blocker, never a silent fallback.
4. Render scenes so a correction re-renders only the affected scene. Run the pipeline's final review before claiming a deliverable.

For stage contracts, read `skills/pipelines/explainer/` and `skills/meta/animation-runtime-selector.md`.
