"""Every place Spec Builder reaches into the Kiro Crew gateway, in one module.

An external app's Python runs inside the gateway process. Spec Builder needs
three kinds of host surface:

1. **The App Kit context** handed to ``register_routes`` (``ctx``): the data
   directory, outbound redaction (``ctx.scrub``), the audit log (``ctx.audit``)
   and the owner gate (``ctx.require_owner``, App Kit level 1). These are public
   seams. Each is read off the context with ``getattr`` and has a fallback that
   is never MORE permissive than the host: no scrubber withholds every string,
   no owner gate refuses every caller, no data directory refuses the operation.

2. **Gateway functions with no App Kit seam yet.** A spec's worker is a
   dashboard chat slot: the app creates it, relays turns into it through the
   host's chat runner, stops it, archives it, and drives the execution phase
   with an AutoNudge loop. Its ``git`` calls run through the host sandbox, its
   file reads through the host's no-follow readers, and its git audit trail is
   a critical (fail-closed) security-event write. None of that has a public
   seam, so each name is resolved here from the running gateway through
   :func:`_host_attr` (``importlib``). Names the backend modules bind at import
   (and tests patch there) are resolved once, when this module is imported,
   each with a stand-in that refuses; names the built-in imported lazily are
   resolved when the operation runs (:func:`require`), and a missing one fails
   that operation. ``PORTING.md`` lists each one with the seam that would
   replace it, and ``register_routes`` reports what is missing through
   ``ctx.health``.

3. **Runtime objects the gateway already hands every route.** ``request.app``
   carries the dashboard state under ``"state"`` (slots, sessions, the
   conversation log). The built-in read it the same way; its shape is
   feature-detected where it is used.

Nothing else in ``backend/`` names a ``kiro_crew`` module
(``tests/test_no_host_imports.py`` pins that), and this module has no
``import kiro_crew`` statement: every host name goes through
:func:`_host_attr`, so a missing one never breaks the load.
"""

from __future__ import annotations

import importlib
import logging
import os
import sys
import tempfile
import threading
from dataclasses import dataclass
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Awaitable, Callable

logger = logging.getLogger("kirocrew.app.spec-builder")

APP_NAME = "spec-builder"

#: The App Kit seam level this app is written against: structural route records
#: and ``ctx.require_owner``.
REQUIRED_SDK_LEVEL = 1


# ── host resolution ─────────────────────────────────────────────────────────


def _host_attr(module: str, name: str) -> Any | None:
    """``module.name`` from the running gateway, or ``None`` when it has none.

    The one seam tests replace to model an older or stripped-down gateway.
    """
    try:
        mod = importlib.import_module(module)
    except Exception:  # noqa: BLE001 - any import failure means "not provided"
        return None
    return getattr(mod, name, None)


class HostCapabilityMissing(RuntimeError):
    """The gateway does not provide a function this operation requires."""


def require(module: str, name: str) -> Any:
    """``module.name`` from the gateway, resolved now; raises when it is missing.

    For the names the built-in imported inside a function body: they are looked
    up when the operation runs, so a test (or a gateway) that replaces the host
    attribute is seen, and an operation that cannot get one fails like the
    built-in's own import would have.
    """
    value = _host_attr(module, name)
    if value is None:
        raise HostCapabilityMissing(f"the gateway does not provide {module}.{name}")
    return value


#: Every gateway name this backend resolves, by owning module. Pinned by
#: tests/test_no_host_imports.py and listed, with the seam each needs, in PORTING.md.
HOST_FUNCTIONS: dict[str, tuple[str, ...]] = {
    "kiro_crew.atomic_write": ("atomic_write",),
    "kiro_crew.platform_compat": (
        "IS_MACOS",
        "IS_WINDOWS",
        "RENAME_NOREPLACE_AVAILABLE",
        "rename_noreplace",
        "strip_extended_length_prefix",
    ),
    "kiro_crew.security": ("is_sensitive_path",),
    "kiro_crew.messaging.split": ("iter_fence_spans",),
    "kiro_crew.sel": ("sel",),
    "kiro_crew.hooks": ("safe_read_file_bytes_nolink",),
    "kiro_crew.pinned_fs": ("fd_real_path",),
    "kiro_crew.sandbox": (
        "create_subprocess_limited",
        "sandboxed_spawn_argv",
        "shielded_prepare_off_loop",
    ),
    "kiro_crew.constants": ("CHAT_TURN_TIMEOUT",),
    "kiro_crew.session_lifecycle": ("compaction_in_flight",),
    "kiro_crew.dashboard.chat_persistence": (
        "rehydrate_slot_from_history_async",
        "save_slot_off_loop",
    ),
    "kiro_crew.dashboard.chat_utils": ("_history_key_for",),
    "kiro_crew.dashboard.session_control": ("containment_meta",),
    "kiro_crew.dashboard.chat_runner": ("_run_chat", "_start_next_queued_turn"),
    "kiro_crew.dashboard.turn_dispatch": ("bounded_chat_turn",),
    "kiro_crew.autonudge": ("AutoNudgeService", "get_instance"),
    "kiro_crew.autonudge_authz": ("authorize_and_add_nudge",),
    "kiro_crew.dashboard.handlers": ("api_models",),
}

#: The names without which no spec can be planned or built at all; a gateway that
#: lacks one gets the app marked degraded with the reason (``capability_issues``).
_CORE_NAMES: tuple[tuple[str, str], ...] = (
    ("kiro_crew.dashboard.chat_runner", "_run_chat"),
    ("kiro_crew.dashboard.chat_utils", "_history_key_for"),
    ("kiro_crew.dashboard.chat_persistence", "save_slot_off_loop"),
    ("kiro_crew.dashboard.chat_persistence", "rehydrate_slot_from_history_async"),
    ("kiro_crew.dashboard.session_control", "containment_meta"),
    ("kiro_crew.session_lifecycle", "compaction_in_flight"),
    ("kiro_crew.autonudge", "get_instance"),
    ("kiro_crew.autonudge_authz", "authorize_and_add_nudge"),
    ("kiro_crew.sandbox", "sandboxed_spawn_argv"),
    ("kiro_crew.sandbox", "create_subprocess_limited"),
    ("kiro_crew.sandbox", "shielded_prepare_off_loop"),
    ("kiro_crew.sel", "sel"),
    ("kiro_crew.hooks", "safe_read_file_bytes_nolink"),
    ("kiro_crew.pinned_fs", "fd_real_path"),
    ("kiro_crew.security", "is_sensitive_path"),
)


# ── route records ───────────────────────────────────────────────────────────


@dataclass(frozen=True)
class Route:
    """One ``hooks.routes`` record, accepted structurally by the gateway.

    A level-1 ``RouteRegistry`` takes any record with a str ``method``, a str
    ``path`` (relative to ``/api/apps/spec-builder``) and a callable
    ``handler(request, ctx)``.
    """

    method: str
    path: str
    handler: Callable[[Any, Any], Awaitable[Any]]


def sdk_level(ctx: Any) -> int:
    """The seam level the gateway reports; 0 for a gateway that predates the field."""
    level = getattr(ctx, "sdk_level", 0)
    return level if isinstance(level, int) and not isinstance(level, bool) else 0


# ── the bound app context ───────────────────────────────────────────────────

_ctx: Any | None = None
_ctx_lock = threading.Lock()


def bind(ctx: Any) -> None:
    """Remember the context the gateway handed to ``register_routes``.

    Redaction, auditing and the data home are reached from code no request
    passes through (index helpers, the AutoNudge fire callback), so the context
    is held here. A later context replaces an earlier one: an update or a
    re-enable hands a fresh one.
    """
    global _ctx
    with _ctx_lock:
        _ctx = ctx


def unbind(ctx: Any | None = None) -> None:
    """Forget the bound context (only *ctx*, when given)."""
    global _ctx
    with _ctx_lock:
        if ctx is None or _ctx is ctx:
            _ctx = None


def bound() -> Any | None:
    with _ctx_lock:
        return _ctx


def config_dir() -> Path:
    """The Kiro Crew data home, read off the bound context's data directory.

    The built-in resolved it with the host's ``config_dir()`` and kept its state
    under ``<data home>/workspace/spec-builder`` and its decision record under
    ``<data home>/trust/spec-builder-decisions.json``, and read the dashboard's
    ``<data home>/recent_projects.json``. Those locations are kept, so an
    existing user's specs, settings and recorded answers are found where they
    are; on a host at App Kit level 7 the decision record moves, once, into the
    data directory's ``trust/`` (``decisions._decisions_path``). The gateway hands an app ``ctx.data_dir = <data home>/apps/<app>/data``;
    a context whose data directory does not have that shape is refused, never
    resolved to some other directory.
    """
    ctx = bound()
    data_dir = getattr(ctx, "data_dir", None)
    if data_dir is None:
        raise HostCapabilityMissing("no app context is bound")
    path = Path(data_dir)
    if path.name != "data" or path.parent.name != APP_NAME or path.parent.parent.name != "apps":
        raise HostCapabilityMissing(f"unexpected app data directory layout: {path}")
    return path.parent.parent.parent


# ── public seams ────────────────────────────────────────────────────────────


def scrub_text(text: str) -> str | None:
    """*text* through the host's outbound redaction, or ``None`` when it cannot be.

    ``ctx.scrub.outbound`` runs the gateway's credential and exfiltration-URL
    passes and its active policy. No context, no scrubber, a scrubber that raises
    or that returns no text: ``None``, and the caller withholds the text.
    """
    scrubber = getattr(bound(), "scrub", None)
    outbound = getattr(scrubber, "outbound", None)
    if not callable(outbound):
        return None
    try:
        result = outbound(text)
    except Exception:  # noqa: BLE001 - a failed scrub withholds, never passes through
        logger.warning("spec-builder: outbound redaction failed; withholding text")
        return None
    out = getattr(result, "text", None)
    return out if isinstance(out, str) else None


def scrubber_available() -> bool:
    """Whether a bound context carries a callable outbound scrubber."""
    return callable(getattr(getattr(bound(), "scrub", None), "outbound", None))


def audit(operation: str, outcome: str, resources: str = "") -> None:
    """One audit row through ``ctx.audit`` (best-effort, as the built-in's was)."""
    sink = getattr(bound(), "audit", None)
    record = getattr(sink, "record", None)
    if not callable(record):
        logger.debug("spec-builder: no audit sink for %s", operation)
        return
    try:
        record(operation, outcome, resources=resources)
    except Exception:  # noqa: BLE001 - auditing must not break the operation
        logger.debug("SEL audit failed for %s", operation, exc_info=True)


def _owner_denied() -> Any:
    """The host owner gate's own refusal, so both paths read the same to a user."""
    from aiohttp import web

    return web.json_response(
        {"code": "owner_only", "error": "owner authorization required"}, status=403
    )


async def require_owner(request: Any, operation: str) -> Any | None:
    """``None`` when the caller is the dashboard owner, else the refusal to return.

    *operation* is bare (``"execute"``): the host prefixes the app's own name when
    it audits a denial. A gateway without the level-1 seam refuses everyone.
    """
    ctx = bound()
    gate = getattr(ctx, "require_owner", None)
    if sdk_level(ctx) < 1 or not callable(gate):
        return _owner_denied()
    return await gate(request, operation)


def capability_issues(ctx: Any) -> list[str]:
    """What this gateway lacks, as the sentences ``ctx.health`` reports."""
    issues: list[str] = []
    if sdk_level(ctx) < REQUIRED_SDK_LEVEL:
        issues.append(
            f"App Kit level {REQUIRED_SDK_LEVEL} is required (this gateway reports "
            f"{sdk_level(ctx)}): the execute and stop controls refuse every caller"
        )
    if not callable(getattr(getattr(ctx, "scrub", None), "outbound", None)):
        issues.append("no outbound scrubber: every document and transcript is withheld")
    missing = [f"{m}.{n}" for m, n in _CORE_NAMES if _host_attr(m, n) is None]
    if missing:
        issues.append("gateway functions missing: " + ", ".join(missing))
    return issues


# ── gateway functions bound at import, each with a refusing stand-in ─────────


def _resolve(module: str, name: str, fallback: Any) -> Any:
    value = _host_attr(module, name)
    return fallback if value is None else value


def _no_atomic_write(path: Any, data: Any, *args: Any, **kwargs: Any) -> None:
    """Stand-in that writes the same way the host does: temp file, fsync, replace.

    The host's ``atomic_write`` is a plain durability helper with no policy; on a
    gateway that moved it, this keeps a torn write from turning the index or the
    decision record into invalid JSON.
    """
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    payload = data.encode("utf-8") if isinstance(data, str) else bytes(data)
    fd, tmp = tempfile.mkstemp(dir=str(target.parent), prefix=f".{target.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "wb") as fh:
            fh.write(payload)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp, target)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


atomic_write: Callable[..., Any] = _resolve(
    "kiro_crew.atomic_write", "atomic_write", _no_atomic_write
)


def _no_rename_noreplace(src: Any, dst: Any, *args: Any, **kwargs: Any) -> None:
    raise OSError("rename without replace is not available on this gateway")


def _plain_path(path: str) -> str:
    """Stand-in for the host's Windows ``\\\\?\\`` prefix stripper."""
    if isinstance(path, str) and path.startswith("\\\\?\\UNC\\"):
        return "\\\\" + path[8:]
    if isinstance(path, str) and path.startswith("\\\\?\\"):
        return path[4:]
    return path


#: The ``platform_compat`` names this backend reads. A gateway without one gets
#: the stand-in: the platform flags from ``sys.platform``, and no no-replace
#: rename (so duplicating a spec refuses, as on a platform that lacks one).
platform_compat = SimpleNamespace(
    IS_MACOS=_resolve("kiro_crew.platform_compat", "IS_MACOS", sys.platform == "darwin"),
    IS_WINDOWS=_resolve("kiro_crew.platform_compat", "IS_WINDOWS", os.name == "nt"),
)
RENAME_NOREPLACE_AVAILABLE: bool = bool(
    _resolve("kiro_crew.platform_compat", "RENAME_NOREPLACE_AVAILABLE", False)
)
rename_noreplace: Callable[..., Any] = _resolve(
    "kiro_crew.platform_compat", "rename_noreplace", _no_rename_noreplace
)
strip_extended_length_prefix: Callable[[str], str] = _resolve(
    "kiro_crew.platform_compat", "strip_extended_length_prefix", _plain_path
)


def _always_sensitive(path: str) -> bool:
    """Fail closed when path sensitivity cannot be determined."""
    return True


#: ``None`` when the gateway has no sensitive-path predicate: callers then
#: refuse every path (``parsers.is_sensitive_path``).
host_is_sensitive_path: Callable[[str], bool] | None = _host_attr(
    "kiro_crew.security", "is_sensitive_path"
)

#: ``None`` when missing: the long-``tasks.md`` fence scan then treats the whole
#: file as code (no task is addressable), never as prose.
iter_fence_spans: Callable[[str], Any] | None = _host_attr(
    "kiro_crew.messaging.split", "iter_fence_spans"
)

#: The security event log, for the CRITICAL git tool-invocation record. ``None``
#: when missing, and then no git command runs (``repository._audit_tool``).
sel: Callable[[], Any] | None = _host_attr("kiro_crew.sel", "sel")

#: No-follow file reads and the descriptor's real path. ``None`` when missing,
#: and the readers that need them then serve nothing.
safe_read_file_bytes_nolink: Callable[..., Any] | None = _host_attr(
    "kiro_crew.hooks", "safe_read_file_bytes_nolink"
)
fd_real_path: Callable[[int], Any] | None = _host_attr("kiro_crew.pinned_fs", "fd_real_path")

#: The sandboxed spawn every git child goes through. ``None`` when missing, and
#: then no git command runs.
create_subprocess_limited: Callable[..., Any] | None = _host_attr(
    "kiro_crew.sandbox", "create_subprocess_limited"
)
sandboxed_spawn_argv: Callable[..., Any] | None = _host_attr(
    "kiro_crew.sandbox", "sandboxed_spawn_argv"
)
shielded_prepare_off_loop: Callable[..., Any] | None = _host_attr(
    "kiro_crew.sandbox", "shielded_prepare_off_loop"
)

#: The host's chat-turn ceiling, for a gateway without ``bounded_chat_turn``.
CHAT_TURN_TIMEOUT = _resolve("kiro_crew.constants", "CHAT_TURN_TIMEOUT", 1800)


async def _no_rehydrate(state: Any, slot_key: str, **kwargs: Any) -> Any:
    raise HostCapabilityMissing("the gateway cannot restore a chat transcript")


rehydrate_slot_from_history_async: Callable[..., Awaitable[Any]] = _resolve(
    "kiro_crew.dashboard.chat_persistence", "rehydrate_slot_from_history_async", _no_rehydrate
)


def _compaction_unknown(sessions: Any, session_key: str) -> bool:
    """Stand-in: report a compaction, so Stop skips the cooperative stop request
    and relies on cancelling the worker task, which it always does."""
    return True


compaction_in_flight: Callable[[Any, str], bool] = _resolve(
    "kiro_crew.session_lifecycle", "compaction_in_flight", _compaction_unknown
)

#: AutoNudge, for the execution loop. ``None`` when missing: Start build refuses.
AutoNudgeService: Any | None = _host_attr("kiro_crew.autonudge", "AutoNudgeService")
autonudge_instance: Callable[[], Any] | None = _host_attr("kiro_crew.autonudge", "get_instance")
authorize_and_add_nudge: Callable[..., Any] | None = _host_attr(
    "kiro_crew.autonudge_authz", "authorize_and_add_nudge"
)
