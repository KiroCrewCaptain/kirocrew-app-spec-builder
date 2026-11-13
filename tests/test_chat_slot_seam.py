"""On a gateway with ``ctx.chat_slots`` (App Kit level 8) a spec's worker runs on it.

The seam is Kiro Crew's public door to the chat slot functions this backend
otherwise resolves by name: create and restore the worker, start or queue its
turns, reserve, stop and archive it, read its transcript, and arm, find and remove
its AutoNudge loop. These tests bind a context carrying a recording stand-in for
the seam and check that every one of those operations goes through it, with the
same arguments the name-resolved path hands the gateway, and that the app's own
identity checks still run first. The rest of the suite runs on a context without
the seam, which is the older-gateway path.
"""

from __future__ import annotations

import asyncio
import contextlib
import types
from typing import Any

import pytest

from backend import _host, runtime
from backend.orchestration import execution_state
from tests.routes_facade import routes
from tests.routes_helpers import _BASE, _make_client

APP = routes.APP_NAME


class _Nudges:
    def __init__(self) -> None:
        self.loops: dict[str, types.SimpleNamespace] = {}
        self.removed: list[tuple[str, str]] = []

    def get_by_slot(self, key: str) -> types.SimpleNamespace | None:
        return self.loops.get(key)

    def list_all(self) -> list[types.SimpleNamespace]:
        return list(self.loops.values())

    async def remove(self, loop_id: str, *, stop_reason: str = "") -> None:
        self.removed.append((loop_id, stop_reason))
        self.loops = {k: v for k, v in self.loops.items() if v.id != loop_id}


class _Seam:
    """Records every call; answers the way Kiro Crew's ``ChatSlotSDK`` does."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, tuple, dict]] = []
        self.nudge_view: _Nudges | None = _Nudges()
        self.maintenance_view = _Nudges()
        self.restored: Any = None
        self.archived = True
        self.rows: list[dict[str, Any]] = []

    def _record(self, name: str, *args: Any, **kwargs: Any) -> None:
        self.calls.append((name, args, kwargs))

    def named(self, name: str) -> list[tuple[tuple, dict]]:
        return [(a, k) for n, a, k in self.calls if n == name]

    def send(self, state, slot, message, **kwargs):
        self._record("send", state, slot, message, **kwargs)
        return None

    def reserve(self, state, slot):
        self._record("reserve", state, slot)
        return "reservation"

    async def stop_turn(self, state, slot):
        self._record("stop_turn", state, slot)
        return True

    async def archive(self, state, slot, *, require=False):
        self._record("archive", state, slot, require=require)
        return self.archived

    async def transcript(self, state, key):
        self._record("transcript", state, key)
        return list(self.rows)

    async def restore(self, state, key, *, adopt_closed):
        self._record("restore", state, key, adopt_closed=adopt_closed)
        return self.restored

    def open(self, state, key):
        self._record("open", state, key)
        slot = types.SimpleNamespace(
            key=key, _app=APP, project="", model="", _titled=False, title="", running=False
        )
        state.slots[key] = slot
        return slot, True

    def nudges(self):
        self._record("nudges")
        return self.nudge_view

    @contextlib.asynccontextmanager
    async def nudge_maintenance(self):
        self._record("nudge_maintenance")
        yield self.maintenance_view

    async def arm_nudge(self, state, slot, **kwargs):
        self._record("arm_nudge", state, slot, **kwargs)
        assert self.nudge_view is not None
        self.nudge_view.loops[slot.key] = types.SimpleNamespace(
            id="loop-1", slot_key=slot.key, active=True
        )
        return self.nudge_view.loops[slot.key], None, 200


@pytest.fixture
def seam(bound_ctx):
    stand_in = _Seam()
    bound_ctx.chat_slots = stand_in
    yield stand_in
    bound_ctx.chat_slots = None


def _refuse_named(monkeypatch, *names: str) -> None:
    """Make the name-resolved path raise, so only the seam can satisfy a call."""

    def _never(*_a, **_k):
        raise AssertionError("reached the gateway by name on a host with the seam")

    for module, name in (
        ("kiro_crew.dashboard.chat_runner", "_run_chat"),
        ("kiro_crew.dashboard.chat_persistence", "save_slot_off_loop"),
        ("kiro_crew.dashboard.chat_persistence", "rehydrate_slot_from_history_async"),
    ):
        if name in names:
            monkeypatch.setattr(f"{module}.{name}", _never)


class _State:
    def __init__(self, *slots: Any) -> None:
        self.slots = {slot.key: slot for slot in slots}
        self._slots = self.slots

    def get_slot(self, key: str) -> Any:
        return self.slots.get(key)

    def get_or_create_slot(self, *_a, **_k):  # pragma: no cover - must not be reached
        raise AssertionError("created a slot without the seam")


def _own_slot(name: str = "seamed", *, running: bool = False) -> types.SimpleNamespace:
    return types.SimpleNamespace(
        key=routes._slot_key(name), _app=APP, running=running, task=None, messages=[]
    )


def test_the_seam_is_read_off_the_bound_context(bound_ctx):
    assert _host.chat_slots() is None
    bound_ctx.chat_slots = types.SimpleNamespace(send=None)
    assert _host.chat_slots() is None, "a seam without a callable send is not one"
    bound_ctx.chat_slots = _Seam()
    assert _host.chat_slots() is bound_ctx.chat_slots
    bound_ctx.chat_slots = None


def test_the_capability_report_does_not_count_names_the_seam_replaces(bound_ctx, monkeypatch):
    monkeypatch.setattr(_host, "_host_attr", lambda module, name: None)
    without = " ".join(_host.capability_issues(bound_ctx))
    assert "kiro_crew.dashboard.chat_runner._run_chat" in without
    bound_ctx.chat_slots = _Seam()
    try:
        with_seam = " ".join(_host.capability_issues(bound_ctx))
    finally:
        bound_ctx.chat_slots = None
    for module, name in _host._SLOT_SEAM_NAMES:
        assert f"{module}.{name}" not in with_seam
    assert "kiro_crew.sandbox.sandboxed_spawn_argv" in with_seam


def test_a_turn_goes_through_the_seam_with_its_provenance(seam, monkeypatch):
    _refuse_named(monkeypatch, "_run_chat")
    slot = _own_slot()
    state = _State(slot)
    consumed = []
    assert (
        runtime._dispatch_turn(
            state,
            slot,
            "build it",
            message_meta={"files": "a"},
            append_user=False,
            directive_user_origin=True,
            message_is_typed=False,
            on_consumed=consumed.append,
        )
        is None
    )
    ((args, kwargs),) = seam.named("send")
    assert args == (state, slot, "build it")
    assert kwargs == {
        "meta": {"files": "a"},
        "append_user": False,
        "user_origin": True,
        "typed": False,
        "on_consumed": consumed.append,
        "on_irreversibly_consumed": None,
    }


def test_a_reservation_goes_through_the_seam(seam):
    slot = _own_slot()
    state = _State(slot)
    assert runtime._reserve_slot_turn(state, slot) == "reservation"
    assert seam.named("reserve") == [((state, slot), {})]


@pytest.mark.asyncio
async def test_pause_checks_ownership_then_stops_through_the_seam(seam):
    slot = _own_slot(running=True)
    state = _State(slot)
    assert await runtime._halt_active_turn(state, "seamed", only_slot=slot) is True
    assert seam.named("stop_turn") == [((state, slot), {})]
    foreign = types.SimpleNamespace(key=slot.key, _app="other-app", running=True)
    assert await runtime._halt_active_turn(_State(foreign), "seamed") is False
    assert len(seam.named("stop_turn")) == 1, "a foreign slot reached the seam"


@pytest.mark.asyncio
async def test_delete_archives_through_the_seam_and_reports_a_failed_save(seam, monkeypatch):
    _refuse_named(monkeypatch, "save_slot_off_loop")
    slot = _own_slot()
    state = _State(slot)
    assert await runtime._teardown_worker_slot(state, "seamed", only_slot=slot, require_archive=True)
    assert seam.named("archive") == [((state, slot), {"require": True})]
    seam.archived = False
    assert (
        await runtime._teardown_worker_slot(state, "seamed", only_slot=slot, require_archive=True)
        is False
    )
    replaced = _own_slot()
    assert await runtime._teardown_worker_slot(state, "seamed", only_slot=replaced) is True
    assert len(seam.named("archive")) == 2, "a replaced slot reached the seam"


@pytest.mark.asyncio
async def test_the_transcript_is_read_through_the_seam_and_redacted(seam):
    secret = "ghp_" + "a" * 36
    seam.rows = [
        {"role": "system", "content": "hidden"},
        {"role": "user", "content": f"token {secret}", "ts": "1"},
    ]
    state = _State()
    out = await runtime._serialize_messages(state, routes._slot_key("seamed"))
    assert seam.named("transcript") == [((state, routes._slot_key("seamed")), {})]
    assert [row["role"] for row in out] == ["user"]
    assert secret not in out[0]["content"]


@pytest.mark.asyncio
async def test_a_cold_worker_is_restored_and_opened_through_the_seam(seam, monkeypatch, tmp_path):
    _refuse_named(monkeypatch, "rehydrate_slot_from_history_async")
    monkeypatch.setattr(runtime, "_safe_dir", lambda wd: tmp_path)
    monkeypatch.setattr(runtime, "_load_settings", lambda: {})
    state = _State()
    slot = await runtime._ensure_worker_slot(state, "seamed", {"working_dir": str(tmp_path)})
    key = routes._slot_key("seamed")
    assert slot is not None and slot.key == key and slot.project == str(tmp_path)
    assert seam.named("restore") == [((state, key), {"adopt_closed": True})]
    assert seam.named("open") == [((state, key), {})]


@pytest.mark.asyncio
async def test_a_slot_opened_elsewhere_under_the_key_is_refused(seam, monkeypatch, tmp_path):
    def _refused(state, key):
        raise PermissionError("someone else's slot")

    monkeypatch.setattr(seam, "open", _refused)
    assert await runtime._ensure_worker_slot(_State(), "seamed", {"working_dir": str(tmp_path)}) is None


@pytest.mark.asyncio
async def test_the_nudge_loop_is_found_and_removed_through_the_seam(seam):
    key = routes._slot_key("seamed")
    seam.nudge_view.loops[key] = types.SimpleNamespace(id="loop-1", slot_key=key, active=True)
    assert execution_state._exec_loop_id_for_slot(key) == "loop-1"
    assert execution_state._exec_loop_active_for_slot(key) is True
    await execution_state._remove_nudge_loop_for_slot(key, only_loop_id="loop-1", stop_reason="x")
    assert seam.nudge_view.removed == [("loop-1", "x")]
    seam.nudge_view = None
    assert execution_state._exec_loop_id_for_slot(key) is None


@pytest.mark.asyncio
async def test_orphan_cleanup_runs_inside_the_seams_maintenance_view(seam, monkeypatch):
    seen: list[Any] = []

    async def _with_service(state, service):
        seen.append(service)
        return set()

    monkeypatch.setattr(execution_state, "_remove_orphaned_executions_with_service", _with_service)
    assert await execution_state._remove_orphaned_executions(_State()) == set()
    assert seen == [seam.maintenance_view] and seam.named("nudge_maintenance")


@pytest.mark.asyncio
async def test_a_handoff_arms_its_loop_through_the_seam(seam, monkeypatch, tmp_path):
    async def _never(**_kw):  # pragma: no cover - must not be reached
        raise AssertionError("armed by name on a host with the seam")

    monkeypatch.setattr(routes, "authorize_and_add_nudge", _never)
    monkeypatch.setattr(routes, "_autonudge_instance", lambda: None)
    client = _make_client(monkeypatch, tmp_path)
    spec_dir = tmp_path / "wd" / ".kiro" / "specs" / "armed"
    spec_dir.mkdir(parents=True)
    (spec_dir / "tasks.md").write_text("- [ ] task")
    routes._save_index(
        {
            "armed": {
                "spec_dir": str(spec_dir),
                "working_dir": str(tmp_path / "wd"),
                "slot_key": routes._slot_key("armed"),
            }
        }
    )
    slot = types.SimpleNamespace(
        key=routes._slot_key("armed"),
        _app=APP,
        project="",
        model="",
        _titled=True,
        title="",
        running=False,
        task=None,
        messages=[],
    )
    client.app["state"] = _State(slot)
    await client.start_server()
    try:
        resp = await client.post(f"{_BASE}/specs/armed/handoff")
        status = resp.status
    finally:
        await client.close()
    assert status == 200, status
    ((args, kwargs),) = seam.named("arm_nudge")
    assert args[1] is slot
    assert "source" not in kwargs, "the seam names the source itself"
    assert kwargs["idle_secs"] == 120 and kwargs["max_cycles"] == execution_state._EXEC_MAX_CYCLES
    assert kwargs["stop_sentinel_path"].endswith("STOP")
    assert [a[2] for a, _ in seam.named("send")], "the build turn was not sent"


def test_the_seam_path_runs_on_the_event_loop_it_was_given():
    """``_dispatch_turn`` is synchronous on both paths, so callers keep their order."""
    assert not asyncio.iscoroutinefunction(runtime._dispatch_turn)
    assert not asyncio.iscoroutinefunction(runtime._reserve_slot_turn)
