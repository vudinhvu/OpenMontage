# Motion Canvas

Use Motion Canvas for editable TypeScript generator scenes: diagram-led explainers, precise 2D vector animation, and scene-level iteration.

## Runtime contract

- Proposal locks `render_runtime: "motion-canvas"`; edit carries it unchanged.
- Compose routes through `video_compose` to `motion_canvas_compose`.
- Workspace: `motion-canvas-composer/`; install its pinned npm dependencies before render.
- A runtime or render failure is a blocker. Do not silently substitute Remotion, HyperFrames, or FFmpeg.

## Scene contract

- Create project-local scenes under the supplied `project_dir`; keep each scene's source traceable to its scene-plan ID.
- Import diagram assets by path from `asset_manifest`; retain SVG source where available.
- Apply approved playbook/brand tokens only. Missing brand data is unverified, not invented.
- Run the final review after a successful MP4 render.

## Related skills

- `video-explainer` at proposal through compose
- `diagram-design` at scene plan and assets
- `brandkit` and `design-taste-frontend` at proposal, scene plan, and compose
- `skills/meta/animation-runtime-selector.md` for runtime choice
