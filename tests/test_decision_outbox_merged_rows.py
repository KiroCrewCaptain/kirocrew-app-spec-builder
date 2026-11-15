"""The outbox finds a relayed decision answer on a merged queue-drain row.

A decision answer that arrives while the spec's worker is busy is queued with
``meta.spec_decision_delivery_id``. The host's queue drain can fold two queued
answers into one user row; the scalar then keeps only the last id, and the row
lists every folded id under ``spec_decision_delivery_ids``. The outbox's
already-relayed scan reads both, so an earlier folded answer is not dispatched
again. The drain half of this contract is the host's own
(``test/test_queue_drain_preserve_decision_id.py`` in Kiro Crew).
"""

from __future__ import annotations

from backend.orchestration.decision_outbox import _row_carries_delivery_id

_ID_A = "delivery-a"
_ID_B = "delivery-b"


def test_matcher_reads_both_scalar_and_list():
    # Scalar match (single-entry row, the common case).
    assert _row_carries_delivery_id({"meta": {"spec_decision_delivery_id": _ID_A}}, _ID_A)
    # List match: the earlier id on a merged row, which the scalar lost.
    assert _row_carries_delivery_id(
        {
            "meta": {
                "spec_decision_delivery_id": _ID_B,
                "spec_decision_delivery_ids": [_ID_A, _ID_B],
            }
        },
        _ID_A,
    )
    # No false positive.
    assert not _row_carries_delivery_id({"meta": {"spec_decision_delivery_id": _ID_B}}, _ID_A)
    assert not _row_carries_delivery_id({"meta": {"spec_decision_delivery_ids": "a"}}, "a")
    assert not _row_carries_delivery_id({"meta": {}}, _ID_A)
    assert not _row_carries_delivery_id({"meta": "x"}, _ID_A)
    assert not _row_carries_delivery_id({}, _ID_A)
    assert not _row_carries_delivery_id("row", _ID_A)
