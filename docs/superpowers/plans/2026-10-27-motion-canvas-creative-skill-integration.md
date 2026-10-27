# Motion Canvas and Creative-Skill Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Motion Canvas as a governed OpenMontage render runtime and map the selected creative skills to the production stages that need them.

**Architecture:** Motion Canvas lives in its own Vite workspace and is wrapped by one `BaseTool`; `video_compose` remains the single pipeline-facing router. A Layer-2 routing guide, referenced by the explainer and animation directors, selects supporting skills conditionally and records them in existing canonical artifacts.

**Tech Stack:** Python 3, OpenMontage `BaseTool`, Node/Vite, Motion Canvas npm packages, FFmpeg, pytest.

**Spec:** `docs/superpowers/specs/2026-10-27-motion-canvas-creative-skill-integration-design.md`

## Global Constraints

- Use published `@motion-canvas/*` packages in a standalone workspace; do not clone or link the Motion Canvas monorepo.
- Preserve the existing `remotion`, `hyperframes`, and `ffmpeg` behavior and contracts.
- `render_runtime` is locked at proposal; Motion Canvas failures return a blocker and never fall back automatically.
- Supporting skills are conditionally selected by brief/scene type; do not force-read every skill.
- Preserve the instruction-first architecture: no Python skill-selection/orchestration logic.
- No provider credentials, deployment, generated production video, or commit; a human reviews and deploys.

## Review Focus

- Missing Motion Canvas dependencies must report unavailable in preflight rather than a false available state (Task 1 test).
- `render_runtime="motion-canvas"` with no renderer workspace must return a structured blocker and not call FFmpeg, Remotion, or HyperFrames (Task 2 test).
- A proposal/runtime mismatch involving Motion Canvas must be reported by the existing final-review contract (Task 2 test).
- Diagram skill selection must retain a static accessible source before a Motion Canvas animation is authored (Task 3 contract test).
- A general explainer without diagram, brand, or UI triggers must not claim unrelated selected skills (Task 4 contract test).

---

## File Structure

- `motion-canvas-composer/` — isolated Vite/Motion Canvas dependency and starter-project boundary.
- `tools/video/motion_canvas_compose.py` — availability, workspace materialization, render invocation, and structured errors.
- `tools/video/video_compose.py` — only the runtime vocabulary, preflight visibility, and dispatch boundary.
- `skills/core/motion-canvas.md` — OpenMontage-specific use/avoid/routing guidance.
- `skills/core/creative-skill-routing.md` — conditional mapping from brief/scene to Layer-3 skills and artifact traces.
- `skills/meta/animation-runtime-selector.md` — fourth-runtime decision matrix entry.
- `skills/INDEX.md` — Layer-2/Layer-3 inventory and provenance pointers.
- `skills/pipelines/{explainer,animation}/{proposal,scene,asset,compose}-director.md` — stage guidance referencing the routing guide.
- `tests/tools/test_motion_canvas_compose.py` — focused runtime/tool behavior tests.
- `tests/contracts/test_motion_canvas_creative_skill_integration.py` — cross-file governance and mapping contracts.

### Task 1: Establish the standalone Motion Canvas renderer contract

**Files:**
- Create: `motion-canvas-composer/package.json`
- Create: `motion-canvas-composer/vite.config.ts`
- Create: `motion-canvas-composer/src/project.ts`
- Create: `motion-canvas-composer/src/scenes/fixture.tsx`
- Create: `tools/video/motion_canvas_compose.py`
- Test: `tests/tools/test_motion_canvas_compose.py`

**Interfaces:**
- Consumes: `BaseTool`, `ToolResult`, and an explicit `project_dir`, `output_path`, and composition input.
- Produces: `MotionCanvasCompose._runtime_check() -> dict[str, object]`, `MotionCanvasCompose.get_info() -> dict[str, object]`, and `MotionCanvasCompose.execute(inputs: dict[str, object]) -> ToolResult`.

- [ ] **Step 1: Write failing availability and structured-blocker tests**

```python
def test_runtime_check_is_unavailable_without_installed_workspace_dependencies(): ...
def test_render_returns_blocker_without_fallback_when_runtime_is_unavailable(): ...
```

Assert an unavailable status/note identifies the missing local requirement; assert rendering does not create the requested MP4.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pytest tests/tools/test_motion_canvas_compose.py -v`

Expected: FAIL because `MotionCanvasCompose` does not exist.

- [ ] **Step 3: Create the Vite workspace and `MotionCanvasCompose`**

Use package dependencies `@motion-canvas/core`, `@motion-canvas/2d`, `@motion-canvas/vite-plugin`, and `@motion-canvas/ffmpeg`. Implement local availability checks for `npx`, workspace files, and installed dependencies; materialize only under `projects/<project-id>/motion-canvas/`; return a `ToolResult(success=False, error=...)` for all blockers. Set `agent_skills` to the vendored Motion Canvas skill plus the relevant animation skill IDs.

- [ ] **Step 4: Run availability/blocker tests**

Run: `pytest tests/tools/test_motion_canvas_compose.py -v`

Expected: PASS without downloading dependencies.

- [ ] **Step 5: Install the workspace dependencies and add a fixture smoke test**

Run the approved npm installation only inside `motion-canvas-composer/`; add `test_fixture_render_outputs_mp4_when_runtime_available`, skipped when the local renderer prerequisites are absent. Its passing case checks MP4 existence and `ffprobe` metadata.

- [ ] **Step 6: Run the complete focused suite**

Run: `pytest tests/tools/test_motion_canvas_compose.py -v`

Expected: blocker tests PASS; fixture test PASS when dependencies are present or SKIPPED with a precise prerequisite reason.

### Task 2: Route the new runtime through `video_compose`

**Files:**
- Modify: `tools/video/video_compose.py`
- Modify: `tests/qa/test_05_video_compose.py`
- Test: `tests/tools/test_motion_canvas_compose.py`

**Interfaces:**
- Consumes: `MotionCanvasCompose` from Task 1 and `edit_decisions.render_runtime`.
- Produces: `VideoCompose.get_info()["render_engines"]["motion-canvas"]: bool` and `VideoCompose` routing for `render_runtime == "motion-canvas"`.

- [ ] **Step 1: Write failing router tests**

```python
def test_get_info_reports_motion_canvas_engine(): ...
def test_motion_canvas_runtime_dispatches_to_motion_canvas_compose(monkeypatch): ...
def test_motion_canvas_failure_is_not_rerouted(monkeypatch): ...
def test_final_review_flags_motion_canvas_runtime_swap(): ...
```

Assert the router delegates once, preserves a failed `ToolResult`, and includes `motion-canvas` in the same proposal/edit mismatch evidence used by existing runtimes.

- [ ] **Step 2: Run router tests to verify they fail**

Run: `pytest tests/tools/test_motion_canvas_compose.py tests/qa/test_05_video_compose.py -v`

Expected: FAIL because `motion-canvas` is not a recognized runtime.

- [ ] **Step 3: Implement minimal router changes**

Add a `_motion_canvas_available()` delegate, a `motion-canvas` entry and explanatory note in `get_info()`, runtime validation acceptance, and a dedicated render branch calling `MotionCanvasCompose`. Extend capability/agent-skill metadata only as required to describe the fourth runtime. Do not change existing branches.

- [ ] **Step 4: Run router and regression tests**

Run: `pytest tests/tools/test_motion_canvas_compose.py tests/qa/test_05_video_compose.py tests/tools/test_video_compose_vertical.py -v`

Expected: PASS; existing runtime tests remain unchanged.

### Task 3: Add Motion Canvas and skill-routing guidance

**Files:**
- Create: `skills/core/motion-canvas.md`
- Create: `skills/core/creative-skill-routing.md`
- Modify: `skills/meta/animation-runtime-selector.md`
- Modify: `skills/INDEX.md`
- Create: `.agents/skills/{video-explainer,diagram-design,brandkit,design-taste-frontend}/` from their approved sources
- Test: `tests/contracts/test_motion_canvas_creative_skill_integration.py`

**Interfaces:**
- Consumes: the runtime names from Task 2 and the external skill instructions.
- Produces: a conditional routing table, explicit artifact-trace requirements, and Layer-3 skill directories matching all referenced IDs.

- [ ] **Step 1: Write failing documentation/skill-pointer contracts**

```python
def test_motion_canvas_selector_entry_references_core_guide(): ...
def test_creative_routing_maps_only_declared_triggers(): ...
def test_all_new_skill_ids_resolve_to_openmontage_agent_skills(): ...
```

Assert Motion Canvas has use/avoid guidance, diagram selection requires a static accessible source, brand selection preserves provided identity, and each referenced Layer-3 directory exists.

- [ ] **Step 2: Run contracts to verify they fail**

Run: `pytest tests/contracts/test_motion_canvas_creative_skill_integration.py -v`

Expected: FAIL because guides and vendored skill directories are missing.

- [ ] **Step 3: Vendor the approved skills and create Layer-2 guides**

Copy the approved source directories from the shared workspace's
`../.agents/skills/` without rewriting their `SKILL.md` files. The routing
guide must map `video-explainer`, `diagram-design`, `brandkit`, and
`design-taste-frontend` only to their defined triggers; it must explicitly
identify `design-taste-frontend` as UI/screen asset direction, not a renderer.
Add Motion Canvas to the runtime selector without changing GSAP guidance.

- [ ] **Step 4: Update the skill index**

List Motion Canvas under video composition and the four selected skills under their relevant capability/use cases, documenting conditional selection and provenance.

- [ ] **Step 5: Run pointer and new contracts**

Run: `pytest tests/contracts/test_agent_skill_pointers.py tests/contracts/test_motion_canvas_creative_skill_integration.py -v`

Expected: PASS.

### Task 4: Attach conditional mapping to explainer and animation stages

**Files:**
- Modify: `skills/pipelines/explainer/proposal-director.md`
- Modify: `skills/pipelines/explainer/scene-director.md`
- Modify: `skills/pipelines/explainer/asset-director.md`
- Modify: `skills/pipelines/explainer/compose-director.md`
- Modify: `skills/pipelines/animation/proposal-director.md`
- Modify: `skills/pipelines/animation/scene-director.md`
- Modify: `skills/pipelines/animation/asset-director.md`
- Modify: `skills/pipelines/animation/compose-director.md`
- Modify: `pipeline_defs/animated-explainer.yaml`
- Modify: `pipeline_defs/animation.yaml`
- Test: `tests/contracts/test_motion_canvas_creative_skill_integration.py`

**Interfaces:**
- Consumes: `creative-skill-routing.md` from Task 3 and the `motion-canvas` runtime from Task 2.
- Produces: stage instructions that record selected skill IDs in proposal decisions, scene-plan notes, and `asset_manifest.layer3_skills_read`; manifests retain `video_compose` as the compose tool.

- [ ] **Step 1: Write failing director/manifests contracts**

```python
def test_explainer_and_animation_directors_reference_creative_skill_routing(): ...
def test_proposal_guidance_requires_motion_canvas_to_be_presented_when_available(): ...
def test_non_matching_brief_does_not_require_all_creative_skills(): ...
```

Assert the mapping appears only in proposal/scene/assets/compose guidance, `video_compose` remains the compose boundary, and general briefs do not falsely claim all selected skills.

- [ ] **Step 2: Run director contracts to verify they fail**

Run: `pytest tests/contracts/test_motion_canvas_creative_skill_integration.py -v`

Expected: FAIL because the selected directors lack the mapping references.

- [ ] **Step 3: Add stage-specific routing instructions**

Proposal: present Motion Canvas alongside available runtimes and log selected support skills. Scene plan: attach diagram/brand/UI choices only where triggered. Assets: require source/brand inputs and populate `layer3_skills_read`. Compose: preserve the locked runtime and run the relevant runtime validation. Keep each existing approval gate and artifact schema unchanged.

- [ ] **Step 4: Add minimal manifest review criteria**

Add review lines only where needed to require matching skill traces and Motion Canvas runtime governance; do not add a new pipeline or selector tool.

- [ ] **Step 5: Run contracts and manifest regressions**

Run: `pytest tests/contracts/test_motion_canvas_creative_skill_integration.py tests/contracts/test_pipeline_catalog.py tests/contracts/test_runtime_presentation_contract.py -v`

Expected: PASS.

### Task 5: End-to-end static verification and handoff

**Files:**
- Modify: only files from Tasks 1-4 if fixes are required
- Test: existing focused suites from Tasks 1-4

**Interfaces:**
- Consumes: all completed task contracts.
- Produces: an evidence-backed handoff with runtime availability and tests stated separately from a real production render.

- [ ] **Step 1: Run the focused full test set**

Run: `pytest tests/tools/test_motion_canvas_compose.py tests/tools/test_video_compose_vertical.py tests/tools/test_hyperframes_compose.py tests/qa/test_05_video_compose.py tests/contracts/test_agent_skill_pointers.py tests/contracts/test_motion_canvas_creative_skill_integration.py tests/contracts/test_runtime_presentation_contract.py -v`

Expected: PASS, except the Motion Canvas real-render test may be SKIPPED only when its prerequisite reason is explicit.

- [ ] **Step 2: Run repository hygiene checks**

Run: `git diff --check` and `git status --short`

Expected: no whitespace errors; only planned files changed.

- [ ] **Step 3: Report verification boundaries**

State the installed Motion Canvas package versions, preflight availability, test outcomes, and whether the fixture MP4 was rendered. Label any unavailable runtime or skipped render as not run; do not claim production-video validation.
