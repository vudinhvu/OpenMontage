"""Motion Canvas runtime wrapper for OpenMontage composition."""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from tools.base_tool import BaseTool, Determinism, ExecutionMode, ResourceProfile, ResumeSupport, ToolResult, ToolRuntime, ToolStability, ToolTier


class MotionCanvasCompose(BaseTool):
    name = "motion_canvas_compose"
    version = "0.1.0"
    tier = ToolTier.CORE
    capability = "video_post"
    provider = "motion-canvas"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.DETERMINISTIC
    runtime = ToolRuntime.LOCAL
    dependencies = ["cmd:npx", "cmd:ffmpeg"]
    install_instructions = "Install the local motion-canvas-composer dependencies, then verify with the doctor operation."
    agent_skills = ["motion-canvas", "diagram-design", "brandkit", "design-taste-frontend"]
    capabilities = ["motion_canvas_render", "motion_canvas_doctor"]
    best_for = ["Editable generator-driven 2D vector sequences", "Diagram-led explainers"]
    not_good_for = ["Existing Remotion scene components", "HTML/GSAP compositions", "Word-level caption burn"]
    input_schema = {"type": "object", "required": ["operation"], "properties": {"operation": {"type": "string", "enum": ["render", "doctor"]}, "project_dir": {"type": "string"}, "output_path": {"type": "string"}}}
    resource_profile = ResourceProfile(cpu_cores=4, ram_mb=2048, disk_mb=2000, network_required=False)
    resume_support = ResumeSupport.FROM_START
    idempotency_key_fields = ["operation", "project_dir", "output_path"]
    side_effects = ["writes only to the supplied project workspace and output_path"]

    @property
    def workspace_root(self) -> Path:
        return Path(__file__).resolve().parents[2] / "motion-canvas-composer"

    def _runtime_check(self) -> dict[str, Any]:
        reasons: list[str] = []
        root = self.workspace_root
        if not shutil.which("npx"):
            reasons.append("npx is not on PATH")
        if not shutil.which("ffmpeg"):
            reasons.append("ffmpeg is not on PATH")
        if not (root / "package.json").is_file():
            reasons.append(f"Motion Canvas workspace is missing: {root}")
        required_packages = (
            "@motion-canvas/core",
            "@motion-canvas/2d",
            "@motion-canvas/ui",
            "@motion-canvas/vite-plugin",
            "@motion-canvas/ffmpeg",
            "vite",
        )
        for package in required_packages:
            if not (root / "node_modules" / package).is_dir():
                reasons.append(f"Motion Canvas workspace dependency is missing: {package}")
        return {"runtime_available": not reasons, "workspace": str(root), "npx_available": bool(shutil.which("npx")), "ffmpeg_available": bool(shutil.which("ffmpeg")), "reasons": reasons}

    def get_info(self) -> dict[str, Any]:
        info = super().get_info()
        info["motion_canvas_runtime"] = self._runtime_check()
        return info

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        if inputs.get("operation") == "doctor":
            return ToolResult(success=True, data=self._runtime_check())
        if inputs.get("operation") != "render":
            return ToolResult(success=False, error=f"Unknown operation: {inputs.get('operation')}")
        check = self._runtime_check()
        if not check["runtime_available"]:
            return ToolResult(success=False, error="Motion Canvas blocker: " + "; ".join(check["reasons"]), data=check)
        if not inputs.get("project_dir") or not inputs.get("output_path"):
            return ToolResult(success=False, error="Motion Canvas blocker: project_dir and output_path are required")
        return ToolResult(success=False, error="Motion Canvas blocker: render scaffolding is not yet materialized", data=check)
