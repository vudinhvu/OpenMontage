# Motion Canvas and Creative-Skill Integration

## Intent

Make Motion Canvas an explicit OpenMontage composition runtime, and make the
existing `video-explainer`, `diagram-design`, `brandkit`, and
`design-taste-frontend` skills discoverable at the right production stage.
The aim is guided selection, not automatic invocation of every skill.

## Goals

- Add `motion-canvas` as a fourth `render_runtime`, alongside Remotion,
  HyperFrames, and FFmpeg.
- Give it an isolated Vite/TypeScript workspace and a `BaseTool` renderer.
- Keep runtime selection locked from proposal through compose, including
  explicit availability reporting and no silent fallback.
- Add Layer-2 routing so video-explainer helps planning, diagram-design helps
  diagram-led scenes, and brand/taste skills inform branded or atelier work.
- Record every selected supporting skill in the existing production artifacts.

## Non-goals

- Do not replace Remotion, HyperFrames, FFmpeg, GSAP, Lottie, or current
  diagram generation.
- Do not call every installed skill for every video.
- Do not turn external skill instructions into Python orchestration.
- Do not change provider credentials, generate a video, or deploy anything.

## Approaches considered

1. Stage/runtime mapping (selected): Layer-2 files and existing directors name
   the applicable skills; tools expose dependencies through `agent_skills`.
   This preserves OpenMontage's instruction-first architecture.
2. A Python creative-skill selector: rejected because it puts orchestration in
   Python rather than the agent and duplicates the current director system.
3. Always load every skill: rejected because it wastes context and conflicts
   with conditional style, diagram, and renderer guidance.

## Design

### Motion Canvas runtime

Create `motion-canvas-composer/` as an independent Node/Vite workspace. It
uses Motion Canvas npm packages, not a checked-out Motion Canvas monorepo:
`@motion-canvas/core`, `@motion-canvas/2d`, `@motion-canvas/vite-plugin`, and
`@motion-canvas/ffmpeg`.

Add `tools/video/motion_canvas_compose.py`. Its `BaseTool` contract will:

- expose renderer availability via the local workspace and dependencies;
- materialize a project-local Motion Canvas composition under
  `projects/<project-id>/motion-canvas/`;
- render only that workspace to the requested MP4 output path;
- return a structured blocker if dependencies, Vite, or rendering fail; and
- attach Motion Canvas plus the relevant animation skills via `agent_skills`.

Extend `tools/video/video_compose.py` so `motion-canvas` is valid in
`render_runtime`, appears in `get_info()["render_engines"]`, and dispatches to
the new tool. Runtime mismatch detection and the final review must treat it
the same as existing runtimes. No fallback from Motion Canvas is permitted.

Update the runtime selector and proposal directors so Motion Canvas is offered
when available for editable, generator-driven 2D vector sequences, especially
diagram-led explainers. It is not the default for existing Remotion components,
word-level captions, avatars, or HTML/GSAP compositions.

### Creative-skill mapping

Vendor the four selected Layer-3 skills into `OpenMontage/.agents/skills/` and
document their source and intended use in `skills/INDEX.md`.

Add one Layer-2 routing guide, `skills/core/creative-skill-routing.md`:

| Trigger | Required reading | Output constraint |
| --- | --- | --- |
| Narrated explainer/training/video brief | `video-explainer` | pipeline selection, script-first scenes, approval gates |
| Diagram is the primary visual proof | `diagram-design` plus existing `diagram_gen` guidance | semantic type, accessible static source, complexity budget |
| Brand/launch/atelier or supplied brand assets | `brandkit` and `taste-direction` | `taste_profile`, reference strategy, no invented replacement identity |
| Website/UI shown in video | `design-taste-frontend` only for UI/screen asset direction | preserve actual UI; do not treat it as a video renderer |

The guide requires a director to write the selected skill IDs to the existing
artifact field appropriate for the stage: proposal decision log, scene-plan
notes, and `asset_manifest.layer3_skills_read`. Existing GSAP routing remains
unchanged because the skills are already present for HyperFrames/Remotion use.

Update explainer and animation proposal, scene, asset, and compose directors
to link to the guide and enforce the mapping. Pipeline manifests continue to
declare `video_compose`; no new pipeline is created.

### Validation

- Unit tests: Motion Canvas availability, accepted runtime, blocked runtime,
  dispatch, and mismatch detection.
- Fixture smoke render: one static/vector scene renders to MP4, passes ffprobe,
  and records `render_runtime_used: motion-canvas`.
- Contract tests: the routing guide is referenced by each intended director and
  selected skills are retained in artifacts.
- Existing Remotion, HyperFrames, and FFmpeg routing tests must remain green.

## Files expected to change

- `motion-canvas-composer/package.json` and its starter Vite project files
- `tools/video/motion_canvas_compose.py`
- `tools/video/video_compose.py`
- `skills/core/motion-canvas.md`
- `skills/core/creative-skill-routing.md`
- `skills/meta/animation-runtime-selector.md`
- `skills/INDEX.md`
- relevant explainer and animation proposal/scene/asset/compose directors
- focused tests for composition routing and creative-skill artifact mapping

## Risks and controls

- Motion Canvas is a distinct runtime: use an isolated workspace and never
  import it into Remotion or HyperFrames.
- Diagram-design's static-accessibility requirements remain mandatory before
  animation.
- Brandkit is used only after real brand assets or an explicit new-identity
  decision; it must not invent a replacement for supplied branding.
- Design-taste-frontend is asset direction for UI/screen scenes, not a global
  page-style rule for video output.

## Acceptance criteria

1. Preflight lists Motion Canvas truthfully as available or unavailable.
2. A proposal can present Motion Canvas with existing runtimes and lock it.
3. Compose renders a small Motion Canvas fixture or returns an actionable,
   structured blocker without swapping runtimes.
4. Each selected creative skill is mapped only to its relevant trigger and is
   traceable in the appropriate artifacts.
5. Existing renderer behavior is preserved.
