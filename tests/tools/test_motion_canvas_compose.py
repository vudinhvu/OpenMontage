"""Focused contracts for the optional Motion Canvas runtime."""

from pathlib import Path

from tools.video.motion_canvas_compose import MotionCanvasCompose
from tools.video.video_compose import VideoCompose


def test_runtime_check_is_unavailable_without_installed_workspace_dependencies(
    tmp_path: Path, monkeypatch
):
    """A missing local workspace must be a visible blocker, not a false positive."""
    monkeypatch.setattr(MotionCanvasCompose, "workspace_root", tmp_path / "missing")

    check = MotionCanvasCompose()._runtime_check()

    assert check["runtime_available"] is False
    assert check["reasons"]


def test_render_returns_blocker_without_fallback_when_runtime_is_unavailable(
    tmp_path: Path, monkeypatch
):
    """A locked runtime may fail, but it must never produce a substituted MP4."""
    tool = MotionCanvasCompose()
    monkeypatch.setattr(
        tool,
        "_runtime_check",
        lambda: {"runtime_available": False, "reasons": ["workspace missing"]},
    )
    output = tmp_path / "final.mp4"

    result = tool.execute(
        {"operation": "render", "project_dir": str(tmp_path), "output_path": str(output)}
    )

    assert result.success is False
    assert "blocker" in (result.error or "").lower()
    assert not output.exists()


def test_video_compose_reports_motion_canvas_engine(monkeypatch):
    monkeypatch.setattr(VideoCompose, "_hyperframes_available", lambda self: False)
    info = VideoCompose().get_info()
    assert "motion-canvas" in info["render_engines"]
    assert "motion_canvas_note" in info


def test_video_compose_blocks_locked_motion_canvas_without_fallback(tmp_path: Path, monkeypatch):
    """A locked Motion Canvas proposal cannot drift to another renderer."""
    monkeypatch.setattr(VideoCompose, "_motion_canvas_available", lambda self: False)

    result = VideoCompose().execute(
        {
            "operation": "render",
            "output_path": str(tmp_path / "final.mp4"),
            "edit_decisions": {
                "version": "1.0",
                "render_runtime": "motion-canvas",
                "renderer_family": "animation-first",
                "cuts": [
                    {"id": "cut-1", "source": "asset-1", "in_seconds": 0, "out_seconds": 1}
                ],
            },
            "asset_manifest": {"assets": [{"id": "asset-1", "path": "input.png"}]},
        }
    )

    assert result.success is False
    assert "motion-canvas" in (result.error or "").lower()
    assert "do not silently fall back" in (result.error or "").lower()


def test_video_compose_dispatches_to_motion_canvas(tmp_path: Path, monkeypatch):
    from tools.base_tool import ToolResult
    from tools.video.motion_canvas_compose import MotionCanvasCompose

    calls: list[dict] = []
    monkeypatch.setattr(VideoCompose, "_motion_canvas_available", lambda self: True)
    monkeypatch.setattr(
        MotionCanvasCompose,
        "execute",
        lambda self, inputs: calls.append(inputs) or ToolResult(success=True, data={"renderer": "motion-canvas"}),
    )

    result = VideoCompose().execute(
        {
            "operation": "render",
            "output_path": str(tmp_path / "final.mp4"),
            "edit_decisions": {
                "version": "1.0",
                "render_runtime": "motion-canvas",
                "renderer_family": "animation-first",
                "cuts": [{"id": "cut-1", "source": "asset-1", "in_seconds": 0, "out_seconds": 1}],
            },
            "asset_manifest": {"assets": [{"id": "asset-1", "path": "input.png"}]},
        }
    )

    assert result.success is True
    assert len(calls) == 1
    assert calls[0]["operation"] == "render"
    assert calls[0]["edit_decisions"]["render_runtime"] == "motion-canvas"


def test_motion_canvas_skill_pointers_are_present():
    root = Path(__file__).resolve().parents[2]
    for skill_name in (
        "motion-canvas",
        "video-explainer",
        "diagram-design",
        "brandkit",
        "design-taste-frontend",
    ):
        assert (root / ".agents" / "skills" / skill_name / "SKILL.md").is_file()


def test_composition_validator_accepts_motion_canvas_runtime(tmp_path: Path):
    from tools.analysis.composition_validator import CompositionValidator

    scene = tmp_path / "motion-canvas" / "src"
    scene.mkdir(parents=True)
    assets = tmp_path / "motion-canvas" / "assets"
    assets.mkdir()
    (assets / "diagram.svg").write_text("<svg />", encoding="utf-8")
    composition = tmp_path / "artifact.json"
    composition.write_text(
        '{"render_runtime":"motion-canvas","cuts":[{"id":"scene-1","source":"diagram.svg","in_seconds":0,"out_seconds":1}]}',
        encoding="utf-8",
    )

    result = CompositionValidator().execute({"composition_path": str(composition)})

    assert result.success is True
