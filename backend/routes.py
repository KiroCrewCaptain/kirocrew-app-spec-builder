"""Compose and register the Spec Builder HTTP surface."""

from __future__ import annotations

import logging
from typing import Any

from aiohttp import web

from . import _host
from ._host import Route
from .handlers import (  # noqa: F401 - looked up by name at call time (_route)
    _handle_approve,
    _handle_archive,
    _handle_browse,
    _handle_create,
    _handle_delete,
    _handle_duplicate,
    _handle_get,
    _handle_get_settings,
    _handle_handoff,
    _handle_list,
    _handle_message,
    _handle_messages,
    _handle_models,
    _handle_put_settings,
    _handle_recover_decision,
    _handle_repo_info,
    _handle_run_task,
    _handle_stop_execution,
    _handle_title,
)
from .repository import _DUPLICATE_RECOVERY_STATE, APP_NAME
from .repository_duplicate import _ensure_duplicate_recovery

logger = logging.getLogger("kirocrew.app.spec-builder")

#: Every route, relative to ``/api/apps/spec-builder`` (the registry's namespace,
#: which is the built-in's URL prefix), and the handler it runs.
ROUTES: tuple[tuple[str, str, str], ...] = (
    ("GET", "/settings", "_handle_get_settings"),
    ("PUT", "/settings", "_handle_put_settings"),
    ("POST", "/settings", "_handle_put_settings"),
    ("GET", "/repo-info", "_handle_repo_info"),
    ("GET", "/browse", "_handle_browse"),
    # The settings dialog's model list (the host's own list; see _handle_models).
    ("GET", "/models", "_handle_models"),
    ("GET", "/specs", "_handle_list"),
    ("POST", "/specs", "_handle_create"),
    ("GET", "/specs/{name}", "_handle_get"),
    ("GET", "/specs/{name}/messages", "_handle_messages"),
    ("POST", "/specs/{name}/recover-decision", "_handle_recover_decision"),
    ("POST", "/specs/{name}/message", "_handle_message"),
    ("POST", "/specs/{name}/handoff", "_handle_handoff"),
    # Alias: the page calls this "execute".
    ("POST", "/specs/{name}/execute", "_handle_handoff"),
    ("POST", "/specs/{name}/stop", "_handle_stop_execution"),
    # Direct authority over the artifacts, rather than only the ability to ask the
    # agent for a change: record a phase approval, run one task, and manage the
    # label / archive / duplicate lifecycle.
    ("POST", "/specs/{name}/approve", "_handle_approve"),
    ("POST", "/specs/{name}/task", "_handle_run_task"),
    ("POST", "/specs/{name}/title", "_handle_title"),
    ("POST", "/specs/{name}/archive", "_handle_archive"),
    ("POST", "/specs/{name}/duplicate", "_handle_duplicate"),
    ("DELETE", "/specs/{name}", "_handle_delete"),
)


def _route(handler_name: str):
    """The ``(request, ctx)`` handler the registry calls for *handler_name*.

    The handler is looked up in this module by name on every call, so a patch of
    the name is seen. The registry takes a disabled app's routes down, so there is
    no enabled check here (the built-in needed one: its routes were wired once at
    startup and stayed callable).
    """

    async def _call(request: web.Request, ctx: Any) -> web.StreamResponse:
        # Handlers own the 401 response, but an unauthenticated probe must not
        # trigger filesystem work before that gate runs.
        if request.get("user") is not None:
            await _ensure_duplicate_recovery()
        return await globals()[handler_name](request)

    _call.__name__ = handler_name
    _call.__qualname__ = handler_name
    return _call


def register_routes(ctx: Any) -> list[Route]:
    """The ``hooks.routes`` entry point: bind *ctx* and return the route records.

    Registration runs on the gateway event loop. Eager state-directory creation
    could therefore stall startup on remote storage for an app that is never used;
    writers create their own directories off-loop instead, and nothing here
    touches the filesystem.
    """
    _host.bind(ctx)
    # A fresh registration recovers abandoned duplicate reservations again on its
    # first authenticated request.
    _DUPLICATE_RECOVERY_STATE["task"] = None
    health = getattr(ctx, "health", None)
    for issue in _host.capability_issues(ctx):
        logger.warning("spec-builder: %s", issue)
        mark = getattr(health, "mark_degraded", None)
        if callable(mark):
            mark(issue)
    records = [Route(method, path, _route(name)) for method, path, name in ROUTES]
    logger.info("spec-builder: %d app routes under /api/apps/%s", len(records), APP_NAME)
    return records
