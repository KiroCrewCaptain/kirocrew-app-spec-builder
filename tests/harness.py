"""Serve the app's ``hooks.routes`` records on a test's own aiohttp application.

The gateway's ``RouteRegistry`` calls ``register_routes(ctx)``, matches a request
under ``/api/apps/spec-builder`` against the returned records and calls
``handler(request, ctx)``. ``mount`` does the same on a plain application, so the
route tests drive the built-in's URLs through the app's real registration.
"""

from __future__ import annotations

from typing import Any

from aiohttp import web

from backend import _host
from backend import routes as composition

BASE = "/api/apps/spec-builder"


def mount(app: web.Application, ctx: Any = None) -> list[Any]:
    """Register the app's routes on *app* with *ctx* (default: the bound context)."""
    ctx = ctx if ctx is not None else _host.bound()
    records = composition.register_routes(ctx)
    for record in records:

        async def _serve(request: web.Request, _record=record) -> web.StreamResponse:
            return await _record.handler(request, ctx)

        _serve.__name__ = record.handler.__name__
        app.router.add_route(record.method, BASE + record.path, _serve)
    return records
