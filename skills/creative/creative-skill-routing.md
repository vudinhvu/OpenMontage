# Creative Skill Routing

This routing makes the selected creative skills available by stage for `animated-explainer`. Load only skills whose stated trigger matches the brief or scene.

| Stage | Load | Required outcome |
|---|---|---|
| Proposal | `video-explainer`, `brandkit`, `design-taste-frontend` | Explicit runtime and art-direction decision; no invented brand tokens. |
| Script | `video-explainer` | Script-first scene structure and narration-ready beats. |
| Scene plan | `video-explainer`, `diagram-design`, `brandkit`, `design-taste-frontend` | One visual job per scene; diagram source and brand treatment identified. |
| Assets | `diagram-design`, `brandkit` | Traceable SVG/PNG diagram assets recorded in `asset_manifest`. |
| Compose with Motion Canvas | `motion-canvas`, `diagram-design`, `brandkit`, `design-taste-frontend` | Editable TypeScript scenes with readable, deliberate motion. |
| Final review | `video-explainer`, `brandkit`, `design-taste-frontend` | Playability, visual variety, legibility, and brand-safe output. |

This routing supplements pipeline-stage skills; it does not bypass proposal approval or runtime governance gates.
