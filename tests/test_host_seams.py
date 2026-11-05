"""Every way the app reaches the gateway, and what it does when the gateway lacks it.

``backend/_host.py`` is the one place a host name is resolved. Each public seam
(``ctx.require_owner``, ``ctx.scrub``, ``ctx.audit``, ``ctx.data_dir``) and each
gateway function without a seam has a fallback, and none of them is MORE
permissive than the host: no owner gate refuses everyone, no scrubber withholds
the text, no data directory refuses the operation, and a missing chat runner,
sandbox or audit record stops the operation that needs it.
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

import pytest
from aiohttp import web
from aiohttp.test_utils import make_mocked_request

from backend import _host, handlers, parsers, repository, routes, runtime
from backend import decisions

# ── the owner gate (App Kit level 1) ────────────────────────────────────────


def _request(user: str | None = "owner") -> web.Request:
    req = make_mocked_request("POST", "/api/apps/spec-builder/specs/demo/execute")
    if user is not None:
        req["user"] = user
    return req


@pytest.mark.asyncio
async def test_without_the_seam_every_caller_is_refused(bound_ctx):
    with mock.patch.object(bound_ctx, "sdk_level", 0):
        denied = await _host.require_owner(_request(), "execute")
    assert denied is not None and denied.status == 403
    body = json.loads(denied.body)
    # The host gate's own wording, so the README's one FAQ entry holds on both paths.
    assert body == {"code": "owner_only", "error": "owner authorization required"}


@pytest.mark.asyncio
async def test_a_context_with_no_gate_refuses_too():
    _host.bind(SimpleNamespace(sdk_level=1))
    denied = await _host.require_owner(_request(), "execute")
    assert denied is not None and denied.status == 403


@pytest.mark.asyncio
async def test_the_seam_gets_the_bare_operation_and_its_answer_is_returned(bound_ctx):
    refusal = web.json_response({"code": "owner_only"}, status=403)
    gate = mock.AsyncMock(return_value=refusal)
    with mock.patch.object(bound_ctx, "require_owner", gate):
        out = await _host.require_owner(_request(), "stop")
    gate.assert_awaited_once()
    assert gate.await_args.args[1] == "stop"
    assert out is refusal


@pytest.mark.asyncio
async def test_the_owner_passes_the_seam(bound_ctx):
    with mock.patch.object(bound_ctx, "require_owner", mock.AsyncMock(return_value=None)):
        assert await _host.require_owner(_request(), "execute") is None


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("handler", "operation"),
    [("_handle_handoff", "execute"), ("_handle_stop_execution", "stop")],
)
async def test_the_build_controls_ask_the_seam_before_anything_else(bound_ctx, handler, operation):
    refusal = web.json_response({"code": "owner_only"}, status=403)
    gate = mock.AsyncMock(return_value=refusal)
    with (
        mock.patch.object(bound_ctx, "require_owner", gate),
        mock.patch.object(repository, "_load_index", side_effect=AssertionError("read")),
    ):
        out = await getattr(handlers, handler)(_request())
    assert out is refusal
    assert gate.await_args.args[1] == operation


# ── the data home ───────────────────────────────────────────────────────────


def test_the_data_home_is_derived_from_the_apps_data_directory(bound_ctx, _isolated_home):
    assert _host.config_dir() == _isolated_home
    with (
        mock.patch.object(repository, "_STATE_DIR", None),
        mock.patch.object(decisions, "_DECISIONS_PATH", None),
    ):
        # The built-in's locations: an existing user's specs and answers are found.
        assert repository._state_dir() == _isolated_home / "workspace" / "spec-builder"
        assert decisions._decisions_path() == (
            _isolated_home / "trust" / "spec-builder-decisions.json"
        )


def test_no_context_is_refused():
    _host.unbind()
    with pytest.raises(_host.HostCapabilityMissing):
        _host.config_dir()


@pytest.mark.parametrize("data_dir", ["/x/apps/other-app/data", "/x/apps/spec-builder", "/x/data"])
def test_an_unexpected_data_directory_is_refused(data_dir):
    _host.bind(SimpleNamespace(data_dir=Path(data_dir)))
    with pytest.raises(_host.HostCapabilityMissing):
        _host.config_dir()


# ── outbound redaction ──────────────────────────────────────────────────────


def test_text_goes_through_the_hosts_scrubber(bound_ctx):
    secret = "glpat-IOSFODNN7EXAMPLE"
    out = parsers._redact(f"token {secret} here")
    assert secret not in out and "here" in out


def test_no_scrubber_withholds(bound_ctx):
    with mock.patch.object(bound_ctx, "scrub", None):
        assert parsers._redact("plain") == parsers._UNSCRUBBABLE
        # A name the scrubber cannot vouch for is not served.
        assert parsers._usable_name("demo") is False


def test_a_scrubber_that_returns_no_text_withholds(bound_ctx):
    with mock.patch.object(bound_ctx, "scrub", SimpleNamespace(outbound=lambda t: object())):
        assert parsers._redact("plain") == parsers._UNSCRUBBABLE


# ── the capability report ───────────────────────────────────────────────────


def test_the_pinned_host_reports_nothing_missing(bound_ctx):
    assert _host.capability_issues(bound_ctx) == []


def test_an_older_host_is_reported_degraded_with_the_reason(bound_ctx):
    with (
        mock.patch.object(bound_ctx, "sdk_level", 0),
        mock.patch.object(_host, "_host_attr", lambda m, n: None),
    ):
        records = routes.register_routes(bound_ctx)
    assert records, "the routes still register: every read keeps working"
    assert bound_ctx.health.status == "degraded"
    joined = " ".join(bound_ctx.health.issues)
    assert "App Kit level 1" in joined
    assert "kiro_crew.dashboard.chat_runner._run_chat" in joined


def test_registration_rebinds_the_context(bound_ctx):
    other = SimpleNamespace(**vars(bound_ctx))
    routes.register_routes(other)
    assert _host.bound() is other


# ── gateway functions without a seam ────────────────────────────────────────


class _Slot:
    key = "spec-builder-demo-0123abcd"
    running = False
    task = None

    def append(self, *a, **k):
        raise AssertionError("nothing may be appended before the runner is known")


def test_no_chat_runner_dispatches_nothing():
    state = SimpleNamespace(_background_tasks=set(), push_slots_update=lambda: None)
    with mock.patch.object(_host, "_host_attr", lambda m, n: None):
        with pytest.raises(_host.HostCapabilityMissing):
            runtime._dispatch_turn(state, _Slot(), "seed")
    assert state._background_tasks == set()


@pytest.mark.asyncio
async def test_no_history_key_resolver_stops_nothing_and_discards_nothing():
    slot = SimpleNamespace(key="spec-builder-live", _app="spec-builder", running=True, _queue=["q"])
    state = SimpleNamespace(get_slot=lambda key: slot)
    with mock.patch.object(_host, "_host_attr", lambda m, n: None):
        with pytest.raises(_host.HostCapabilityMissing):
            await runtime._halt_active_turn(state, "live")
    assert slot._queue == ["q"]


def test_a_long_task_list_with_no_host_fence_scanner_offers_no_task():
    text = "- [ ] a real task\n" + ("filler line\n" * 4000) + "```\n- [ ] inside a fence\n```\n"
    assert len(text) > parsers._MAX_COMMONMARK_CHARS
    with mock.patch.object(parsers, "iter_fence_spans", None):
        assert parsers._fenced_spans(text) == ((0, len(text)),)


def test_git_does_not_run_without_the_critical_audit_record():
    with mock.patch.object(repository, "sel", None):
        assert repository._audit_tool("invoked", "rev-parse", "/repo", critical=True) is False


def test_the_atomic_write_stand_in_writes_and_replaces(tmp_path):
    target = tmp_path / "nested" / "index.json"
    _host._no_atomic_write(target, '{"a": 1}')
    _host._no_atomic_write(target, '{"a": 2}')
    assert json.loads(target.read_text(encoding="utf-8")) == {"a": 2}
    assert [p.name for p in target.parent.iterdir()] == ["index.json"]


def test_the_rename_stand_in_refuses():
    with pytest.raises(OSError):
        _host._no_rename_noreplace("a", "b")


def test_the_prefix_stand_in_strips_only_the_extended_prefix():
    assert _host._plain_path("\\\\?\\C:\\repo") == "C:\\repo"
    assert _host._plain_path("\\\\?\\UNC\\host\\share") == "\\\\host\\share"
    assert _host._plain_path("/repo") == "/repo"


@pytest.mark.asyncio
async def test_the_compaction_stand_in_skips_the_cooperative_stop():
    assert _host._compaction_unknown(object(), "key") is True
    with pytest.raises(_host.HostCapabilityMissing):
        await _host._no_rehydrate(object(), "key")


# ── GET /models ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_models_answers_with_the_hosts_handler():
    host = mock.AsyncMock(return_value=web.json_response([{"name": "auto"}, {"name": "m1"}]))
    req = make_mocked_request("GET", "/api/apps/spec-builder/models")
    req["user"] = "owner"
    with mock.patch.object(_host, "_host_attr", lambda m, n: host):
        out = await handlers._handle_models(req)
    host.assert_awaited_once_with(req)
    assert json.loads(out.body) == [{"name": "auto"}, {"name": "m1"}]


@pytest.mark.asyncio
async def test_models_without_the_host_handler_offers_only_the_default():
    req = make_mocked_request("GET", "/api/apps/spec-builder/models")
    req["user"] = "owner"
    with mock.patch.object(_host, "_host_attr", lambda m, n: None):
        out = await handlers._handle_models(req)
    assert json.loads(out.body) == [{"name": "auto", "description": ""}]


@pytest.mark.asyncio
async def test_models_needs_a_signed_in_caller():
    out = await handlers._handle_models(make_mocked_request("GET", "/api/apps/spec-builder/models"))
    assert out.status == 401


def test_the_route_adapter_is_a_coroutine_function():
    assert asyncio.iscoroutinefunction(routes._route("_handle_list"))
