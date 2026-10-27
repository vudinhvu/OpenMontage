"""Static contracts for the Motion Canvas creative-skill integration."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def test_motion_canvas_selector_entry_references_core_guide():
    selector = (ROOT / "skills" / "meta" / "animation-runtime-selector.md").read_text(encoding="utf-8")
    core = (ROOT / "skills" / "core" / "motion-canvas.md").read_text(encoding="utf-8")

    assert "motion-canvas" in selector
    assert "skills/core/motion-canvas.md" in selector
    assert "Do not silently substitute" in core


def test_creative_routing_is_conditional_and_keeps_diagram_source():
    routing = (ROOT / "skills" / "creative" / "creative-skill-routing.md").read_text(encoding="utf-8")

    assert "video-explainer" in routing
    assert "diagram-design" in routing
    assert "brandkit" in routing
    assert "design-taste-frontend" in routing
    assert "only" in routing.lower()
    assert "Traceable SVG/PNG" in routing


def test_all_new_skill_ids_resolve_to_openmontage_agent_skills():
    for skill_name in (
        "motion-canvas",
        "video-explainer",
        "diagram-design",
        "brandkit",
        "design-taste-frontend",
    ):
        assert (ROOT / ".agents" / "skills" / skill_name / "SKILL.md").is_file()


def test_explainer_and_animation_directors_reference_creative_skill_routing():
    for pipeline in ("explainer", "animation"):
        for stage in ("proposal", "scene", "asset", "compose"):
            text = (ROOT / "skills" / "pipelines" / pipeline / f"{stage}-director.md").read_text(encoding="utf-8")
            assert "creative-skill-routing.md" in text


def test_pipeline_manifests_keep_video_compose_and_expose_motion_canvas():
    for manifest in ("animated-explainer.yaml", "animation.yaml"):
        text = (ROOT / "pipeline_defs" / manifest).read_text(encoding="utf-8")
        assert "video_compose" in text
        assert "motion_canvas_compose" in text
        assert "creative/creative-skill-routing" in text
