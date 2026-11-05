"""The Spec Builder cases of Kiro Crew's own suite, ported with the app.

Kiro Crew's tests of core behaviour also checked the built-in where it met that
behaviour. Those cases belong to the app, so they live here:

* ``test/test_compaction_stop_declined_surfaces.py``: the three Pause cases of
  ``_halt_active_turn`` while the session is (or races into) compacting;
* ``test/test_session_directive_self_arm_provenance.py``:
  ``test_spec_builder_dispatch_sets_no_positive_producer_mark``;
* ``test/test_chat_runner_mcp_sign_in_ask.py``: the typed-text forwarding of the
  dispatch and the decision answer dispatched as composed text;
* ``test/test_pinned_staging_helper_contract.py``: the backend binds the host's
  own ``fd_real_path``;
* ``test/test_windows_extended_prefix_containment.py``:
  ``test_spec_builder_contained``.

The ones that drove a real chat-runner turn through Kiro Crew's runner fixtures
check the same contract here at the seam the app owns: the keyword arguments its
dispatch hands the host's ``_run_chat``.
"""

from __future__ import annotations

import ast
import asyncio
import inspect
import os
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from backend import repository, runtime
from backend.orchestration import decision_outbox

# ── Pause while the session compacts ────────────────────────────────────────


class _SpecSlot:
    """The spec-builder worker slot as ``_halt_active_turn`` reads it."""

    key = "spec-builder-live"
    _app = "spec-builder"
    running = True

    def __init__(self):
        self.task = MagicMock()
        self.task.done.return_value = False
        self._queue = [{"id": "q1", "content": "next prompt"}]
        self._pending_steers = ["steer-1"]
        self._pending_synthesis = True


def _spec_state(slot, *, compacting: bool, stop_outcome: str):
    state = MagicMock()
    state.get_slot = lambda key: slot if key == slot.key else None
    state.sessions.is_compacting = MagicMock(return_value=compacting)
    state.sessions.stop_turn = AsyncMock(return_value=stop_outcome)
    return state


@pytest.mark.asyncio
async def test_spec_builder_pause_while_compacting_skips_the_stop_but_still_halts_the_worker():
    """The cooperative stop would be declined, so it is not sent; the WORKER task
    (this app's own run loop, not the compaction turn) is still cancelled, so a
    Pause the route reports as halted has halted, and its queued work is dropped
    as on any Pause."""
    slot = _SpecSlot()
    state = _spec_state(slot, compacting=True, stop_outcome="soft")
    assert await runtime._halt_active_turn(state, "live") is True
    state.sessions.stop_turn.assert_not_awaited()
    slot.task.cancel.assert_called_once()
    assert slot._queue == [] and slot._pending_steers == []
    assert slot._pending_synthesis is False


@pytest.mark.asyncio
async def test_spec_builder_pause_declined_in_the_race_still_halts_the_worker():
    """The race: the probe passed, the compaction committed, ``stop_turn`` declined.
    The worker task is ours to cancel regardless, so the Pause still halts it."""
    slot = _SpecSlot()
    state = _spec_state(slot, compacting=False, stop_outcome="compacting")
    assert await runtime._halt_active_turn(state, "live") is True
    state.sessions.stop_turn.assert_awaited_once()
    slot.task.cancel.assert_called_once()
    assert slot._queue == [] and slot._pending_steers == []


@pytest.mark.asyncio
async def test_spec_builder_pause_that_goes_through_still_discards_and_cancels():
    slot = _SpecSlot()
    state = _spec_state(slot, compacting=False, stop_outcome="soft")
    assert await runtime._halt_active_turn(state, "live") is True
    slot.task.cancel.assert_called_once()
    assert slot._queue == [] and slot._pending_steers == []
    assert slot._pending_synthesis is False


# ── what the dispatch hands the host's chat runner ──────────────────────────


class _IdleSlot:
    key = "spec-builder-demo-0123abcd"
    running = False

    def __init__(self) -> None:
        self.task = None
        self.rows: list[tuple] = []

    def append(self, role, content, meta=None):
        self.rows.append((role, content, meta))


def _idle_state():
    state = MagicMock()
    state._background_tasks = set()
    state.push_slots_update = MagicMock()
    return state


async def _dispatch_capturing(monkeypatch, **dispatch_kwargs) -> dict:
    from kiro_crew.dashboard import chat_runner

    captured: list[dict] = []

    async def _fake_run_chat(_state, _slot, _message, **kwargs):
        captured.append(kwargs)

    monkeypatch.setattr(chat_runner, "_run_chat", _fake_run_chat)
    task = runtime._dispatch_turn(_idle_state(), _IdleSlot(), "seed the spec", **dispatch_kwargs)
    assert task is not None
    await asyncio.wait_for(task, timeout=10)
    (kwargs,) = captured
    return kwargs


@pytest.mark.asyncio
async def test_spec_builder_dispatch_sets_no_positive_producer_mark(monkeypatch):
    """The app relays app-composed seed, task and handoff turns with no actor tag.
    That must grant nothing: the dispatch passes no human origin and no wake."""
    kwargs = await _dispatch_capturing(monkeypatch)
    assert kwargs.get("_directive_user_origin") is False
    assert not kwargs.get("_directive_self_wake")
    assert not kwargs.get("_turn_actor")


@pytest.mark.asyncio
@pytest.mark.parametrize("typed", [True, False])
async def test_the_spec_builder_dispatch_forwards_whether_its_text_was_typed(monkeypatch, typed):
    # The host starts an MCP sign-in only for text a person typed; the dispatch
    # must hand that fact through unchanged.
    kwargs = await _dispatch_capturing(
        monkeypatch, directive_user_origin=True, message_is_typed=typed
    )
    assert kwargs["_message_is_typed"] is typed
    assert kwargs["_directive_user_origin"] is True


def test_a_spec_decision_answer_is_dispatched_as_composed_text():
    # The answer is built from the agent's own decision title and options; the
    # person only picked one, so it must never start a sign-in.
    calls = [
        node
        for node in ast.walk(ast.parse(inspect.getsource(decision_outbox)))
        if isinstance(node, ast.Call) and getattr(node.func, "id", "") == "_dispatch_turn"
    ]
    assert calls
    for call in calls:
        typed = {kw.arg: kw.value for kw in call.keywords}.get("message_is_typed")
        assert isinstance(typed, ast.Constant) and typed.value is False


# ── the host's descriptor and path primitives ───────────────────────────────


def test_the_backend_binds_the_hosts_own_fd_real_path():
    # The descriptor-pinned reads use the host primitive, never a fork of it.
    from kiro_crew import pinned_fs

    assert repository.fd_real_path is pinned_fs.fd_real_path


_PREFIX = "\\\\?\\"


@pytest.fixture
def tree(tmp_path: Path) -> tuple[Path, Path, Path]:
    """A root with one file inside it, and a sibling directory outside it."""
    root = (tmp_path / "root").resolve()
    root.mkdir()
    inside = root / "inside.txt"
    inside.write_text("x", encoding="utf-8")
    outside = (tmp_path / "outside").resolve()
    outside.mkdir()
    (outside / "f.txt").write_text("x", encoding="utf-8")
    return root, inside, outside / "f.txt"


def test_spec_builder_contained(tree, monkeypatch) -> None:
    """``os.path.realpath`` of a file being replaced can come back with Windows'
    extended-length prefix; containment must read it as the same path."""
    root, inside, outside = tree
    real_realpath = os.path.realpath

    def fake(path, *a, **k):  # type: ignore[no-untyped-def]
        out = real_realpath(path, *a, **k)
        return _PREFIX + out if out == str(inside) else out

    monkeypatch.setattr(os.path, "realpath", fake)
    assert repository._contained(inside, root)
    assert not repository._contained(outside, root)
