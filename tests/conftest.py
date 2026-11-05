"""Test floor for the Spec Builder suite, plus its Windows collection rules.

The floor:

* The gateway loads hook files into a synthetic package named after the app, so
  the backend never needs to be on ``sys.path`` there. A plain pytest run has no
  such loader, so the app root is put on the path and ``backend`` imports as a
  package (``tests`` too, for the shared helpers).
* Kiro Crew (a pinned test dependency, ``tests/requirements.txt``) is the host
  the backend resolves through ``backend/_host.py``. Its data home is pinned to a
  throwaway directory BEFORE anything imports it, and again per test, so no test
  reads or writes the operator's real ``~/.kiro/crew``. The security event log's
  default directory is a session-local one for the same reason.
* Every test runs with an App Kit context bound the way ``register_routes``
  binds the gateway's: the host's own ``AppContext`` (its real scrubber, audit
  sink and owner gate) with a data directory under the test's data home. A test
  that models a gateway without one of them replaces it.
* ``_floor_monkeypatch`` is the floor's own ``MonkeyPatch``, as in Kiro Crew's
  suite: a test that calls ``monkeypatch.undo()`` must not put the real paths
  back for the rest of the test.

The Windows rules mirror the built-in suite: a named burn-down list of tests
skipped on Windows, rather than scattering ``skipif`` markers.

Why these specific tests, and why skipping is correct rather than a paper-over:
the backend pins the spec directory with a non-following ``O_DIRECTORY``
descriptor and does every sentinel create/rename/unlink relative to that
descriptor. Windows has neither ``O_NOFOLLOW`` nor ``dir_fd`` support, so
``_CAN_PIN_DIR`` is False and ``_write_stop_sentinel`` / ``_clear_stop_sentinel``
**fail closed by design** -- they refuse to operate by path, because the agent
runs inside the user's project and could swap the directory for a junction
between the check and the write. The tests below assert the pinned POSIX
behaviour, so on Windows they are asserting a capability the product
deliberately declines to have.

Skipping is therefore recording a platform boundary the source already states,
not hiding a defect: the Windows behaviour (no sentinel; halt via loop removal
plus turn cancellation, both in-process) is itself covered by the tests that do
run. The remaining entries are path-shape gaps of the same per-feature kind.

Delete a line when its test is made portable. Anything NOT listed still fails
the Windows job, so this list cannot silently absorb a real regression.
"""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
from pathlib import Path

import pytest

APP_ROOT = Path(__file__).resolve().parent.parent
TESTS = Path(__file__).resolve().parent
for _entry in (str(TESTS), str(APP_ROOT)):
    if _entry not in sys.path:
        sys.path.insert(0, _entry)

_SESSION_HOME = Path(tempfile.mkdtemp(prefix="kca-spec-builder-home-"))
os.environ["KIROCREW_HOME"] = str(_SESSION_HOME / "crew")
os.environ["KIROCREW_WORKSPACE"] = str(_SESSION_HOME / "workspace")
os.environ.pop("KIROCREW_STRICT_ON_LOOP_PERSIST", None)

from kiro_crew import platform_compat  # noqa: E402

#: The tests a host without real symlink creation (Windows without the privilege)
#: cannot run; Kiro Crew's own suite lists them in ``requires-real-symlinks.txt``.
_REQUIRES_REAL_SYMLINKS = {
    "test_a_claim_through_an_aliased_spelling_is_refused",
    "test_a_symlinked_spelling_cannot_record_a_second_answer",
    "test_an_unresolvable_directory_keeps_its_normalized_literal_key",
    "test_the_ledger_key_touches_no_filesystem",
    "test_handoff_refuses_a_symlinked_tasks_file",
    "test_resolved_spec_dir_is_revalidated_for_sensitivity",
    "test_safe_dir_resolves_symlinks_before_checking",
    "test_scan_skips_a_symlink_to_a_sensitive_target",
    "test_spec_file_refuses_symlink_out_of_spec_dir",
    "test_spec_file_refuses_symlink_to_sensitive_target",
    "test_spec_read_refuses_a_symlinked_spec_file",
    "test_symlinked_spec_dir_cannot_touch_another_specs_sentinel",
}


def _can_create_symlink() -> bool:
    with tempfile.TemporaryDirectory() as tmp:
        target = os.path.join(tmp, "target")
        os.mkdir(target)
        try:
            os.symlink(target, os.path.join(tmp, "link"), target_is_directory=True)
        except (OSError, NotImplementedError, AttributeError):
            return False
        return True


_HAS_SYMLINKS = _can_create_symlink()

requires_symlinks = pytest.mark.skipif(
    not _HAS_SYMLINKS,
    reason="creating a symlink needs SeCreateSymbolicLinkPrivilege on Windows",
)


def pytest_unconfigure(config: pytest.Config) -> None:
    shutil.rmtree(_SESSION_HOME, ignore_errors=True)


@pytest.fixture
def _floor_monkeypatch():
    """The floor's OWN ``MonkeyPatch`` -- never the shared ``monkeypatch``.

    The two are undone independently: ``monkeypatch.undo()`` reverts every record
    on the instance it is called on, so a test that called it mid-way would also
    drop the floor's data-home pin and resolve the operator's real data home.
    """
    mp = pytest.MonkeyPatch()
    try:
        yield mp
    finally:
        mp.undo()


@pytest.fixture
def monkeypatch(_floor_monkeypatch):
    """pytest's own ``monkeypatch``, re-declared to order it AFTER the floor."""
    mp = pytest.MonkeyPatch()
    yield mp
    mp.undo()


@pytest.fixture(scope="session", autouse=True)
def _isolate_sel_default_dir(tmp_path_factory):
    """Point the security event log's default directory at a session-local one.

    The log is a process singleton whose writer is a daemon thread, so it gets
    one directory for the whole run that no individual test deletes.
    """
    from kiro_crew import sel as _sel

    original_default = _sel._default_dir
    original_instance = _sel.SecurityEventLog._instance
    sel_dir = tmp_path_factory.mktemp("sel")
    _sel._default_dir = lambda: sel_dir
    try:
        yield sel_dir
    finally:
        _sel._default_dir = original_default
        _sel.SecurityEventLog._instance = original_instance


@pytest.fixture
def sel_private_root(tmp_path_factory):
    """Bind the security event log to a directory private to the requesting test.

    Built ``sync=True``, so every event is written inline and the test can read
    its own rows back. The prior singleton is restored afterwards.
    """
    from kiro_crew.sel import SecurityEventLog

    root = tmp_path_factory.mktemp("sel-private")
    prior_instance = SecurityEventLog._instance
    SecurityEventLog._instance = None
    SecurityEventLog._initialized = False
    try:
        SecurityEventLog(base_dir=root, sync=True)
        yield root
    finally:
        SecurityEventLog._instance = prior_instance
        SecurityEventLog._initialized = False


@pytest.fixture(autouse=True)
def _isolated_home(tmp_path: Path, _floor_monkeypatch: pytest.MonkeyPatch) -> Path:
    home = tmp_path / "kirocrew-home"
    _floor_monkeypatch.setenv("KIROCREW_HOME", str(home))
    _floor_monkeypatch.setenv("KIROCREW_WORKSPACE", str(tmp_path / "kirocrew-workspace"))
    return home


def make_ctx(home: Path):
    """The host's own ``AppContext`` for this app, as the gateway builds it."""
    from kiro_crew.apps.context import build_app_context

    return build_app_context("spec-builder", home / "apps" / "spec-builder" / "data")


@pytest.fixture(autouse=True)
def bound_ctx(_isolated_home: Path):
    """The context ``register_routes`` would bind, for every test."""
    from backend import _host

    ctx = make_ctx(_isolated_home)
    _host.bind(ctx)
    yield ctx
    _host.unbind()


#: POSIX ``dir_fd`` pinning is unavailable, so the sentinel helpers fail closed
#: and every assertion about a written/cleared STOP file is unreachable.
_POSIX_SENTINEL_PINNING = {
    "test_sentinel_helpers_fail_closed_without_directory_pinning",
    "test_sentinel_write_is_pinned_to_the_verified_directory",
    "test_sentinel_clear_is_pinned_to_the_verified_directory",
    "test_stop_sentinel_write_destroys_planted_symlink",
    "test_prepare_handoff_reports_tasks_and_clears_a_stale_sentinel",
    "test_prepare_handoff_refuses_a_tasks_file_with_no_open_task",
    "test_prepare_handoff_still_clears_for_the_matching_identity",
    "test_prepare_handoff_unpinned_call_keeps_working",
    "test_stop_write_is_refused_for_a_replaced_spec",
    "test_halt_execution_leaves_user_trust_alone",
    "test_verified_spec_dir_accepts_an_ordinary_directory",
    # Duplicate creation writes through the SAME pinned descriptor and fails
    # closed without it. These assert bytes written by that POSIX-only path.
    "test_duplicate_doc_create_only_succeeds_while_the_file_is_absent",
    "test_duplicate_doc_create_retries_short_writes",
    "test_duplicate_copies_the_documents_into_a_fresh_spec",
}

#: POSIX path shape: separators, absolute-path spelling and ``~`` expansion all
#: differ, so these compare against a literal that is only correct on POSIX.
_POSIX_PATH_SHAPE = {
    "test_only_our_own_slot_is_adopted_and_a_missing_one_is_created",
    "test_discovered_spec_gets_a_scoped_slot",
    "test_index_derived_strings_are_redacted_on_egress",
    "test_safe_dir_still_accepts_absolute_and_tilde",
}

#: An entry belongs here only when Windows itself is the cause. A process-control
#: timeout whose sandbox-preparation thread hop sits inside the window its wait
#: bounds goes red on any heavily parallel shard, Linux included, and the fix is
#: stubbing that hop in the test rather than listing the test here.

_WINDOWS_GAPS = _POSIX_SENTINEL_PINNING | _POSIX_PATH_SHAPE


def pytest_collection_modifyitems(config, items):
    """Skip the tracked Windows gaps (all parametrizations of each name)."""
    if not _HAS_SYMLINKS:
        no_links = pytest.mark.skip(
            reason="test requires real symlink creation; host lacks that capability"
        )
        for item in items:
            if (item.originalname or item.name.split("[")[0]) in _REQUIRES_REAL_SYMLINKS:
                item.add_marker(no_links)
    if not platform_compat.IS_WINDOWS:
        return
    marker = pytest.mark.skip(
        reason="known Windows gap -- tracked in this suite's conftest "
        "(POSIX dir_fd pinning / path shape / process timing)"
    )
    for item in items:
        if item.originalname in _WINDOWS_GAPS or item.name.split("[")[0] in _WINDOWS_GAPS:
            item.add_marker(marker)
