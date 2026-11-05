"""Only the host shim reaches Kiro Crew, and only through ``importlib``.

The gateway's public surface for an app is the ``AppContext`` its hooks get and
the structural route records the registry accepts. Spec Builder also drives
gateway functions no App Kit seam provides yet (the chat runner and its slot
persistence, AutoNudge, the sandboxed spawn, the critical tool-audit record and
the no-follow readers; see PORTING.md). Those are resolved from the running
gateway in ``backend/_host.py`` alone, by name through ``importlib`` (the names
the modules bind when ``_host.py`` loads, the rest at call time through
``_host.require``), so a missing one refuses the operation instead of breaking
the module load. No other backend module may import ``kiro_crew`` in any form;
the only ``kiro_crew`` module names outside the shim are the arguments of a
``_host.require`` / ``_host._host_attr`` call. The shim has no top-level
``kiro_crew`` import, and every name it resolves is listed in
``_host.HOST_FUNCTIONS``.
"""

from __future__ import annotations

import ast
import re
import unittest
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1] / "backend"
_SHIMS = ("_host.py",)


def _host_imports(path: Path) -> list[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    found: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            found += [a.name for a in node.names if a.name.split(".")[0] == "kiro_crew"]
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            if node.module.split(".")[0] == "kiro_crew":
                found.append(node.module)
        elif isinstance(node, ast.Call):
            # importlib.import_module("kiro_crew...") / __import__("kiro_crew...")
            name = getattr(node.func, "attr", None) or getattr(node.func, "id", None)
            if name in {"import_module", "__import__"} and node.args:
                arg = node.args[0]
                if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                    if arg.value.split(".")[0] == "kiro_crew":
                        found.append(arg.value)
    return found


def _host_strings(path: Path) -> list[str]:
    """String literals naming a ``kiro_crew`` module (what ``_host_attr`` is handed)."""
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    return [
        node.value
        for node in ast.walk(tree)
        if isinstance(node, ast.Constant)
        and isinstance(node.value, str)
        and re.fullmatch(r"kiro_crew(\.[a-z_]+)*", node.value)
    ]


def _lookup_args(path: Path) -> list[str]:
    """The module names handed to ``_host.require`` / ``_host._host_attr`` in *path*."""
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    found: list[str] = []
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr in ("require", "_host_attr")
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "_host"
            and node.args
            and isinstance(node.args[0], ast.Constant)
        ):
            found.append(node.args[0].value)
    return found


def _lookup_pairs(path: Path) -> list[tuple[str, str]]:
    """``(module, name)`` of every constant-argument lookup in *path*."""
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    found: list[tuple[str, str]] = []
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Call)
            and (getattr(node.func, "attr", None) or getattr(node.func, "id", None))
            in ("require", "_host_attr", "_resolve")
            and len(node.args) >= 2
            and all(isinstance(a, ast.Constant) for a in node.args[:2])
            and str(node.args[0].value).startswith("kiro_crew")
        ):
            found.append((node.args[0].value, node.args[1].value))
    return found


class TestNoHostImports(unittest.TestCase):
    def test_no_backend_module_but_the_host_shim_reaches_kiro_crew(self) -> None:
        files = sorted(BACKEND.rglob("*.py"))
        self.assertTrue(files, "no backend modules found")
        for path in files:
            if path.name in _SHIMS:
                continue
            with self.subTest(module=path.relative_to(BACKEND.parent).as_posix()):
                self.assertEqual(_host_imports(path), [])
                self.assertEqual(sorted(_host_strings(path)), sorted(_lookup_args(path)))

    def test_every_resolved_name_is_in_the_pinned_table(self) -> None:
        from backend import _host

        pinned = {(m, n) for m, names in _host.HOST_FUNCTIONS.items() for n in names}
        used: set[tuple[str, str]] = set()
        for path in sorted(BACKEND.rglob("*.py")):
            used.update(_lookup_pairs(path))
        self.assertTrue(used, "no host lookups found; the scan is broken")
        self.assertEqual(used - pinned, set(), "a host name missing from HOST_FUNCTIONS")
        self.assertEqual(pinned - used, set(), "a HOST_FUNCTIONS row nothing resolves")

    def test_the_pinned_host_resolves_every_name(self) -> None:
        """The Kiro Crew commit the suite is pinned to provides every name."""
        from backend import _host

        missing = [
            f"{m}.{n}"
            for m, names in _host.HOST_FUNCTIONS.items()
            for n in names
            if _host._host_attr(m, n) is None
        ]
        self.assertEqual(missing, [])

    def test_the_host_shims_import_kiro_crew_only_at_call_time(self) -> None:
        for shim in _SHIMS:
            with self.subTest(shim=shim):
                tree = ast.parse((BACKEND / shim).read_text(encoding="utf-8"))
                for node in tree.body:
                    if isinstance(node, (ast.Import, ast.ImportFrom)):
                        names = (
                            [a.name for a in node.names]
                            if isinstance(node, ast.Import)
                            else [node.module or ""]
                        )
                        self.assertFalse(any(n.split(".")[0] == "kiro_crew" for n in names), names)
                self.assertEqual(_host_imports(BACKEND / shim), [])

    def test_the_scan_sees_each_import_form(self) -> None:
        """The detector itself: every spelling it must catch is caught."""
        import tempfile

        source = (
            "import kiro_crew\n"
            "import kiro_crew.apps as a\n"
            "from kiro_crew.executors import run_in_embed_pool\n"
            "import importlib\n"
            "importlib.import_module('kiro_crew.embeddings')\n"
            "__import__('kiro_crew')\n"
            "from . import kiro_crew_like\n"
            "import kiro_crewish\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "probe.py"
            path.write_text(source, encoding="utf-8")
            self.assertEqual(
                _host_imports(path),
                [
                    "kiro_crew",
                    "kiro_crew.apps",
                    "kiro_crew.executors",
                    "kiro_crew.embeddings",
                    "kiro_crew",
                ],
            )


if __name__ == "__main__":
    unittest.main()
