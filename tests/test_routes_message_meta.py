from __future__ import annotations

import types

import pytest

from backend import _host
from backend.runtime import _dispatch_turn
from tests.routes_facade import routes
from tests.routes_helpers import (  # noqa: F401
    _BASE,
    _make_client,
    _never_touch_the_real_state,
    _seed_spec,
    _state_for,
)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("extra_body", "expected"),
    [
        (
            {"meta": {"sendId": "spec-send_1", "pastes": [{"id": "p1"}], "ignored": "value"}},
            {"sendId": "spec-send_1", "pastes": [{"id": "p1"}]},
        ),
        ({"sendId": "top-level"}, None),
        ({"meta": "not-an-object"}, None),
        ({"meta": {"ignored": "value"}}, None),
        ({"meta": {"sendId": "bad/id"}}, None),
    ],
)
async def test_message_forwards_supported_meta(tmp_path, monkeypatch, extra_body, expected):
    client = _make_client(monkeypatch, tmp_path)
    spec_dir, _ = _seed_spec(tmp_path)
    state, _ = _state_for("live")
    forwarded = []
    monkeypatch.setattr(
        routes,
        "_dispatch_turn",
        lambda *_args, **kwargs: forwarded.append(kwargs.get("message_meta")),
    )
    client.app["state"] = state
    body = {
        "text": "continue",
        "spec_dir": str(spec_dir),
        "slot_key": routes._slot_key("live"),
    }
    body.update(extra_body)

    await client.start_server()
    try:
        response = await client.post(f"{_BASE}/specs/live/message", json=body)
    finally:
        await client.close()

    assert response.status == 200
    assert forwarded == [expected]


@pytest.mark.asyncio
async def test_a_send_id_is_dropped_on_a_gateway_without_the_host_check(tmp_path, monkeypatch):
    """Without the host's send-id check the id is treated as absent, never stored unchecked."""
    from backend.orchestration import messages

    client = _make_client(monkeypatch, tmp_path)
    spec_dir, _ = _seed_spec(tmp_path)
    state, _ = _state_for("live")
    forwarded = []
    monkeypatch.setattr(messages, "normalize_send_id", _host._no_send_id)
    monkeypatch.setattr(
        routes,
        "_dispatch_turn",
        lambda *_args, **kwargs: forwarded.append(kwargs.get("message_meta")),
    )
    client.app["state"] = state
    body = {
        "text": "continue",
        "spec_dir": str(spec_dir),
        "slot_key": routes._slot_key("live"),
        "meta": {"sendId": "spec-send_1"},
    }

    await client.start_server()
    try:
        response = await client.post(f"{_BASE}/specs/live/message", json=body)
    finally:
        await client.close()

    assert response.status == 200
    assert forwarded == [None]


def test_busy_dispatch_keeps_message_meta_with_containment_precedence(monkeypatch):
    queued = []
    slot = types.SimpleNamespace(
        running=True,
        queue_append=lambda message, **kwargs: queued.append((message, kwargs["meta"])),
        append=lambda *_args, **_kwargs: None,
    )
    state = types.SimpleNamespace(push_slots_update=lambda: None)
    monkeypatch.setattr(
        "kiro_crew.dashboard.session_control.containment_meta",
        lambda *_args: {"app": True, "shared": "containment"},
    )

    _dispatch_turn(
        state,
        slot,
        "continue",
        message_meta={"spec_decision_delivery_id": "delivery-1", "shared": "message"},
    )

    assert queued == [
        (
            "continue",
            {
                "spec_decision_delivery_id": "delivery-1",
                "app": True,
                "shared": "containment",
            },
        )
    ]
