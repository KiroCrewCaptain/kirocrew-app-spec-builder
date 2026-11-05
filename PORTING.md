# Porting notes: built-in → external app

This repository was ported from Kiro Crew's built-in Spec Builder at KiroCrew
`main` `55439d8770`:

- the backend, `src/kiro_crew/apps/builtins/spec_builder/` (`app.json`,
  `backend/*.py`, `backend/orchestration/*.py`, `skills/spec-workflow/SKILL.md`,
  and its own `tests/`);
- the dashboard page, `website/src/apps/spec-builder/` (`SpecBuilderPage.tsx`,
  `api.ts`, `prompts.ts`, `inlineStyles.ts`, `components/*.tsx`), and its store
  art, `website/public/app-assets/spec-builder/`;
- the `apps.specBuilder.*` strings of `website/src/i18n/locales/*.json`;
- the tests: the 27 files of the app's own `tests/`, the four
  `test/test_spec_builder_routes_coverage*.py` files with
  `test/spec_builder_routes_coverage_helpers.py`, the Spec Builder cases of five
  core test files (below), the 25 `website/src/test/SpecBuilder*.test.ts(x)` /
  `specBuilder*.test.ts` files, and the project-picker cases of
  `website/src/test/windowsProjectNameSites.test.tsx` and
  `windowsBasenameSites.test.tsx`.

Paths with a line number below refer to that commit. A **gap** is something the
built-in gets from Kiro Crew that an external app has no public way to get yet;
closing one is a Kiro Crew change (a generic, app-agnostic App Kit seam), not a
change here. Nothing here invents an SDK API: every host name the app still
needs is resolved by its existing name, and listed.

## What carried over unchanged

- `app.json` `name` (`spec-builder`), `version` (`0.1.0`), `author`,
  `permissions` (`api: ["/api/apps/spec-builder", "/api/apps/spec-builder/*",
  "/api/chat", "/api/chat/*"]`, `storage: true`), `skills`, `platform`,
  `defaultEnabled: false`, `tags`, `displayName`, `description`, `useCases` and
  `configuration`. `tests/test_manifest_contract.py` compares them with the
  built-in's manifest (`tests/fixtures/builtin-app.json`), because adoption
  refuses a manifest that widens a grant or forces the app off.
- `skills/spec-workflow/SKILL.md`, byte for byte.
- The whole backend: every route's method, path, validation, status codes and
  response shape; the spec index, its tombstones and its abandoned-duplicate
  recovery; the per-spec turn lock, the decision ledger and its outbox, the
  execution claims and stop barrier, the STOP sentinel written through a pinned
  directory descriptor, the sandboxed `git` worktree calls and their audit
  trail. `backend/*.py` and `backend/orchestration/*.py` are the built-in's
  files with their imports changed (and the few call sites below).
- Where a user's data lives: specs' documents in the project folder
  (`<project>/.kiro/specs/<name>/`, or under the settings' base path), the
  app's state under `<data home>/workspace/spec-builder/` (`index.json`,
  `deleted.json`, `settings.json`), the decision record at
  `<data home>/trust/spec-builder-decisions.json`, and each spec's conversation
  in the chat slot `spec-builder-<name>-<8 hex>` with app provenance
  `spec-builder`. All of these are outside the app's install directory, so an
  update or an adoption keeps them. The data home is derived from
  `ctx.data_dir` (`_host.config_dir`), never guessed.
- The page's markup, class strings and behaviour (`ui/src/`), its 184 strings
  in all 12 dashboard locales, and its local-storage keys (`spec-builder:*`).

## What changed, and why

| Built-in | Here | Why |
|---|---|---|
| `"backend": {"routes": "backend.routes:register_routes"}` (`app.json:31-33`) | `"backend": {"hooks": {"routes": "backend.routes:register_routes"}}` | Top-level `backend.routes` is read only by the built-in boot loop (`BUILTIN_NAMES`, `apps/builtins/__init__.py:20`). An installed app's routes go through the gateway's `RouteRegistry`. |
| `register_routes(app: web.Application)` adding 21 absolute routes with `app.router.add_*` (`backend/routes.py:63-104`) | `register_routes(ctx) -> list[Route]` (`routes.ROUTES`, relative paths); each record's handler is an adapter that runs the first-use duplicate recovery and then calls the built-in handler, looked up by name | The `hooks.routes` contract. `Route` is the app's own frozen dataclass (`backend/_host.py`), accepted structurally from App Kit level 1. The registry serves the records under `/api/apps/spec-builder/`, the built-in's URLs. |
| `_require_enabled` on every route (`backend/routes.py:43-60`, private `apps.manager.is_app_enabled`) | Removed | The registry takes a disabled app's routes down, so a disabled app answers 404 there instead of the built-in's 403 `app_disabled`. The page never branched on that code. |
| The duplicate-recovery task on the aiohttp application (`app[_DUPLICATE_RECOVERY_STATE]`, `backend/repository.py:92-95`, `backend/routes.py:75-76`) | A module-level holder, reset by every `register_routes` | The gateway's application is frozen once it serves; an app must not write to it. A re-enable or an update recovers again, which the recovery already tolerates. |
| GET routes answered HEAD too (aiohttp's `add_get`) | GET only | The registry dispatches the methods a record names. Nothing in the page sends HEAD. |
| `require_owner_dashboard_request(request, "spec_builder_execute")` / `"spec_builder_stop"` (`backend/orchestration/execution.py:19`, `:74`, `:592`) | `_host.require_owner(request, "execute")` / `"stop"` over `ctx.require_owner` | The level-1 owner gate. The host prefixes the app's name, so a denial is now audited as `spec-builder.execute` / `spec-builder.stop`. A gateway without the seam refuses every caller of Start building and Pause, the owner included. |
| `sel().log_api_access(caller="spec-builder", operation=…)` in `_audit` (`backend/repository.py:111-119`) | `ctx.audit.record(operation, outcome, resources=…)` (`_host.audit`) | The level-0 audit seam. Rows now read caller `app:spec-builder` and operation `spec-builder.<verb>` (the built-in wrote `spec-builder` / `<verb>`). Best-effort, as before. |
| `kiro_crew.security.{redact_credentials, redact_exfiltration_urls, redact_and_truncate}` with an import-failure flag (`backend/parsers.py:21-33`, `:64-95`) | `ctx.scrub.outbound(text).text` (`_host.scrub_text`), truncated after scrubbing | The level-0 scrub seam: the same baseline passes plus the gateway's active policy. No context, no scrubber, a scrubber that raises or returns no text: the text is withheld (`[unavailable: redaction is not available]`), as the built-in did without its security module. |
| `config_dir()` from `kiro_crew.config.paths` (`backend/repository.py:19`, `backend/decisions.py:13`) | `_host.config_dir()`, derived from `ctx.data_dir` | `ctx.data_dir` is `<data home>/apps/spec-builder/data`; a context of any other shape is refused. The built-in's state and decision record stay where they were (see above). |
| `kiro_crew.atomic_write.atomic_write` (`backend/repository.py:18`, `backend/decisions.py:12`) | The gateway's own, resolved by name; a temp-file + fsync + replace stand-in on a gateway without it | A durability helper with no policy. |
| `kiro_crew.messaging.split.iter_fence_spans` (`backend/parsers.py:15`) | The gateway's own, resolved by name; without it a `tasks.md` over 32 KiB reads as code (no task is addressable) | The scanner is pure; the fallback fails toward "nothing to run". |
| Absolute imports `kiro_crew.apps.builtins.spec_builder.*` in the tests | `backend.*` | Hook files load into a synthetic package named after the app; relative imports are the documented form. `tests/test_manifest_contract.py` loads the hooks through the gateway's own module loader. |
| `iconUrl` / `heroImage*` / `heroImageDetail*` as `/app-assets/spec-builder/*.svg`, `screenshots` `/app-assets/…` (`app.json:55-63`) | `iconPath` / `heroImage*` / `heroImageDetail*` / `screenshots` as repo-relative PNGs under `assets/` | A registry app's art is repo-relative, and the catalog's publish step refuses SVG for a non-builtin source. The PNGs were rendered from the built-in SVGs (kept beside them): the icon at 512×512 on an opaque tile with `--ico-a` / `--ico-b` fixed to `#a78bfa` / `#7c3aed`, the heroes at 1200×675 and the detail heroes at 1200×288. |
| `ui.pages` `[{"route": "/spec-builder", "label": "Spec Builder", "icon": "ClipboardList"}]`, page compiled into the dashboard (`app.json:43-51`, `website/src/apps/builtinRegistry.ts`) | `ui.entry: "dist/index.mjs"` (a committed ESM bundle built from `ui/src/`), `ui.pages` `[{"route": "/apps/spec-builder", "label": "Spec Builder"}]`, no `icon` | An installed app ships its page as a bundle AppHost loads. The legacy `/spec-builder` route and the `ClipboardList` glyph of an adopted record come from Kiro Crew's adoption pin, never from this manifest. |
| App Store copy keys in the dashboard catalogs (`website/src/components/appstore/appManifest.ts`) | `l10n` block in `app.json` for the 11 non-English locales | The listing copy travels with the app. It is the `apps.specBuilder.manifest` subtree of `ui/i18n/<locale>.json`, kept equal by a test. |
| No `minKiroCrewVersion`, no `license` | `"minKiroCrewVersion": "0.13.0"`, `"license": "Apache-2.0"` | 0.13.0 is the first release line with App Kit level 1 (structural route records, `ctx.require_owner`). A 0.12.x gateway's route registry skips every record that is not its own `AppRoute`, so every route would answer 404 there. The license is the repository's. |
| (none) | `GET /models` | See gap 5. |

## Gateway functions with no App Kit seam: resolved by name, fail closed

Nothing in `backend/` but `_host.py` names a `kiro_crew` module, and `_host.py`
has no `import kiro_crew` statement: every host name goes through
`_host._host_attr` (`importlib`) and is listed in `_host.HOST_FUNCTIONS`
(`tests/test_no_host_imports.py` pins both, and that the pinned Kiro Crew
commit provides every name). Names the built-in imported at module scope are
resolved once when `_host.py` loads, each with a stand-in that refuses; names
it imported inside a function are resolved when the operation runs
(`_host.require`), and a missing one fails that operation. `register_routes`
reports what is missing through `ctx.health` (`_host.capability_issues`).

| Name | Built-in use | Without it | Seam Kiro Crew needs |
|---|---|---|---|
| `kiro_crew.dashboard.chat_runner._run_chat`, `_start_next_queued_turn`; `kiro_crew.dashboard.turn_dispatch.bounded_chat_turn`; `kiro_crew.constants.CHAT_TURN_TIMEOUT` | relaying a seed, decision, task or handoff turn into the spec's slot, and draining a queue a refused reservation left (`backend/runtime.py:22`, `:445-450`, `:515`) | no turn is dispatched (the request fails before anything is appended); without `bounded_chat_turn` the host ceiling applies | an app-owned chat slot API: send a turn with its provenance (typed / composed, user origin), queue behind a running one |
| `kiro_crew.dashboard.session_control.containment_meta` | stamping a queued message on the app-scoped slot (`backend/runtime.py:422`) | the message is not queued (as when the stamp failed in the built-in) | the same slot API's queue call |
| `kiro_crew.dashboard.chat_persistence.rehydrate_slot_from_history_async`, `save_slot_off_loop`; `kiro_crew.dashboard.chat_utils._history_key_for`; `kiro_crew.session_lifecycle.compaction_in_flight` | restoring a cold spec slot's transcript, archiving it on delete, reading the persisted transcript, and skipping the cooperative stop while the session compacts (`backend/runtime.py:15-16`, `:321`, `:368`, `:544`) | no restore (a fresh slot is made, as on a failed restore); delete refuses rather than drop an unarchived conversation; Pause stops nothing and discards nothing; without the compaction probe Pause cancels the worker task only | slot restore / archive / transcript-read calls on the same slot API, and a "stop this slot's turn" call that answers whether it was declined |
| `request.app["state"]`: `get_or_create_slot`, `get_slot`, `_slots`, `sessions.stop_turn`, `conversation_log`, `push_slot_title`, `push_slots_update`, `_background_tasks`; slot attributes `_app`, `_titled`, `task`, `running`, `_queue`; two bookkeeping sets the app keeps on the state (`_spec_decision_deliveries_*`) | the spec worker slot's whole lifecycle (`backend/runtime.py`, `backend/handlers.py`, `backend/orchestration/*.py`) | read off the gateway's application exactly as the built-in did, feature-detected where used: no state, no worker | the same slot API, owned and scoped by app provenance |
| `kiro_crew.autonudge.AutoNudgeService`, `get_instance`; `kiro_crew.autonudge_authz.authorize_and_add_nudge` | arming, finding and removing the execution loop that drives Start building (`backend/orchestration/execution_state.py:37-39`) | Start building answers 503 `autonudge_unavailable`; Pause and delete still halt the turn | an AutoNudge loop API scoped to the app's own slots |
| `kiro_crew.sandbox.sandboxed_spawn_argv`, `create_subprocess_limited`, `shielded_prepare_off_loop` | every `git` child (worktree create, `rev-parse`, status) (`backend/repository.py:49-57`, `backend/repository_git.py`) | no `git` runs: the worktree option and the repository probe report git unavailable | an app-scoped sandboxed subprocess on the context |
| `kiro_crew.sel.sel` (`log_tool_invocation(critical=True)`) | the fail-closed "invoked" record that must land before `git` runs (`backend/repository.py:37`, `:152-169`) | no `git` runs | a critical (fail-closed) variant of `ctx.audit`; the seam's docstring names this as the route until one exists |
| `kiro_crew.hooks.safe_read_file_bytes_nolink`, `kiro_crew.pinned_fs.fd_real_path` | no-follow reads of the spec documents and the descriptor-pinned directory checks (`backend/repository.py:42-46`) | no document is served and every pinned check refuses | no-follow read and pinned-directory helpers on the context |
| `kiro_crew.security.is_sensitive_path` | refusing a project folder or spec directory that is a credential store, the data home or a policy file (`backend/parsers.py:21`) | every path is sensitive: no spec can be created | a sensitive-path predicate on the context |
| `kiro_crew.platform_compat.{IS_MACOS, IS_WINDOWS, RENAME_NOREPLACE_AVAILABLE, rename_noreplace, strip_extended_length_prefix}` | the case-fold of turn keys, the atomic duplicate publish, Windows path comparison (`backend/repository.py:20-24`, `backend/repository_duplicate.py:21`, `backend/orchestration/turn_guard.py:17`) | flags from `sys.platform`; no no-replace rename (duplicating a spec answers "unsupported", as on a platform without one); a lexical prefix stripper | none needed: the App Kit already names `platform_compat` as the module apps route platform decisions through; listed so the table is complete |
| `kiro_crew.dashboard.handlers.api_models` | (new, `GET /models`, gap 5) | the model picker offers only "Default (inherit)" | an SDK model-list call |

## Remaining gaps

1. **The gateway functions above.** Each is a private name a Kiro Crew refactor
   can move; the stand-ins keep that failure closed and reported
   (`ctx.health`), but planning and building stop until the name is back or a
   seam replaces it. `minKiroCrewVersion` and the capability report are the
   only guards.
2. **Execution trust.** A built-in's in-gateway Python is exempt from the
   third-party execution gate (`apps/execution.py`, `is_builtin_app`). This
   copy's hooks load only when the operator trusts it. For an existing user
   Kiro Crew's adoption writes that grant for this repository; a fresh install
   goes through the normal trust dialog.
3. **The decision record lives under the keystone's `trust/` directory.** The
   built-in put `spec-builder-decisions.json` there so an agent cannot erase or
   forge a recorded answer (Kiro Crew `security/paths_lists.py:392`, which
   gates the whole directory). This copy keeps the location so an existing
   user's recorded answers still lock their decisions. The comment in core
   names the app; a generic seam would be an app-owned, agent-unwritable data
   leaf.
4. **Slot-mode and sidebar.** Spec slots are created with `app="spec-builder"`
   and the default mode, exactly as the built-in did; they show in the chat
   sidebar's app grouping as before. No core literal names this app's mode.
5. **Model list.** The built-in settings dialog read the dashboard's shared
   `useAvailableModels()` (`GET /api/models`, `SettingsModal.tsx:22`, `:34`).
   That path is outside this app's API grant, and adoption refuses a widened
   grant, so the page asks the app's own `GET /models`, which answers with the
   gateway's own handler for the same request. A generic SDK hook would remove
   the private handler call.
6. **Styles.** The page keeps the built-in's Tailwind utility class strings and
   the dashboard's CSS custom properties (`var(--accent)`, …). They render
   because the dashboard's stylesheet carries them while the compiled built-in
   page ships with Kiro Crew; nothing in the App Kit documents them as a stable
   surface yet.
7. **Store listing localization.** The catalog's publish step does not carry
   `l10n` yet, so a store row that is not installed shows English.
8. **Sidebar icon on a fresh install.** The `ClipboardList` glyph and the
   `/spec-builder` route are shown only for an adopted record (from Kiro Crew's
   pin). A fresh install lives at `/apps/spec-builder` with the `iconPath` image.
9. **Author.** `app.json` keeps `"author": "kirocrew"`, the built-in's value; the
   catalog's publish step refuses a manifest-asserted reserved author, so
   attribution goes on the catalog row.
10. **Core still names the app.** `src/kiro_crew/apps/builtins/__init__.py:20`
    (`BUILTIN_NAMES`), `security_posture.py:1245-1251`,
    `security/paths_lists.py:392` (comment), `docs/apps.md:61`,
    `website/src/apps/builtinRegistry.ts`,
    `website/src/components/appstore/appManifest.ts`, the
    `apps.specBuilder.*` catalog keys, the dashboard's capture scripts
    (`website/capture/spec-*.tsx`, `website/scripts/capture-spec-builder*.mjs`),
    and the core ratchet rows that list the built-in's files
    (`test/test_lenient_read_rewrite_ratchet.py:88`,
    `test/test_transcript_derivation_seam.py:69`,
    `test/requires-real-symlinks.txt`, `website/src/i18n/countSingularForms.test.ts:64`,
    `website/src/test/hoverVariantPolicy.test.ts:127`,
    `website/src/test/RadioChipGroup.test.tsx:173`). They stay while the
    built-in ships and go when it does.
11. **Uninstall's purge does not reach this app's data.** `kirocrew app
    uninstall --purge-data` deletes only
    `<data home>/apps/spec-builder/data` (`apps/manager_uninstall.py:176-183`),
    and this app writes nothing there: its state stays in
    `<data home>/workspace/spec-builder/` and its decision record in
    `<data home>/trust/spec-builder-decisions.json`, the built-in's locations,
    so an existing user's specs and recorded answers survive adoption. A purge
    therefore leaves both behind, and the README says so and names the paths to
    delete by hand. Moving them into `ctx.data_dir` would lose an adopted
    user's data (and gap 3's agent-unwritable leaf); the generic fix is an
    App Kit seam through which an app declares the data paths it owns outside
    `ctx.data_dir`, so a purge removes them too.

## UI

The page is `ui/src/`, ported from `website/src/apps/spec-builder/` with the
same markup, class strings and behaviour. `npm run build` in `ui/` writes the
committed `ui/dist/index.mjs`; CI rebuilds it and fails on a difference. Every
request to this app's routes goes through the host's scoped client
(`useAppApi().raw`, handed to `setTransport` by the root), so a path outside
`permissions.api` is refused in the browser; the backend's `error` sentence and
`code` are read back out of the client's refusal. The embedded chat is the
SDK's `ChatEmbed`, which reads the same client and the host's slot-change
signal from the provider AppHost renders. The bundle imports only the seven
modules the dashboard provides; the level-1 names (`Select`, `guideCaution`)
are read off a namespace import with a fallback.

| Built-in | Here |
|---|---|
| `AppScopedApiProvider` with `allowedApiPaths: ['/api/chat']`, `useAppSlotPush('spec-builder')`, `react-router-dom`'s `useNavigate` (`SpecBuilderPage.tsx:12-22`, `:131-144`) | Nothing: AppHost renders `AppApiProvider` with the manifest's `permissions.api`, the app's slot push and navigation |
| `app-sdk/ChatEmbed` | `ChatEmbed` from `@kirocrew/app-sdk` |
| Plain same-origin `fetch` to `/api/apps/spec-builder` (`api.ts:174-195`) | The host's scoped client (`ui/src/api.ts`, `setTransport`) |
| `components/ui` `Btn`, `Input`, `SearchInput`, `EmptyState`; `MarkdownRenderer`, `Clickable`, `ErrorNotice`, `Modal`, `SegmentedControl` | The same components from `@kirocrew/app-sdk/ui` |
| `components/ui` `FilteredEmpty` | `ui/src/host/FilteredEmpty.tsx`, copied |
| `components/SimpleSelect` with `triggerFallback` | `Select` from `@kirocrew/app-sdk/ui` (a native `<select>` on an older host, `ui/src/hostSdk.ts`); a retained model pin the host no longer lists is kept as an option, so the control still shows it |
| `guide/trustRoot.guideCaution` | `guideCaution` from `@kirocrew/app-sdk/ui` (nothing on an older host) |
| `components/ui/dropdown-menu` (Radix) | `ui/src/host/Menu.tsx`: trigger, `role="menu"`, Escape and outside press close, arrow keys move |
| `framer-motion` pulse (`PULSE_MOTION`) | `ui/src/host/Pulse.tsx`: the same opacity loop through `Element.animate`; still under reduced motion |
| `tailwind-merge` | `ui/src/host/cn.ts`, a plain join (no caller passes a conflicting pair) |
| `hooks/usePointerDrag`, `hooks/useColumnResize`, `components/ResizeHandle`, `components/RadioChipGroup`, `utils/pathBasename`, `utils/selectionContainment`, `utils/thunkError.errMessage` | `ui/src/host/`, copied |
| `hooks/useIsMobile` | `ui/src/host/useIsMobile.ts`: the same breakpoint, without the dashboard's view transition and IDE-embed override |
| `utils/safeStorage.safeSetItem` | `ui/src/host/safeStorage.ts`: a non-fatal write (the dashboard's cache reclaim is the host's) |
| `hooks/useAvailableModels` | `ui/src/models.ts`, over the app's `GET /models` (gap 5) |
| `hooks/useImeGuard`, `i18n/format.fmtNumber` | The same from `@kirocrew/app-sdk` |
| `i18n/format.fmtPercent` | `ui/src/format.ts`, the same over the SDK's `fmtNumber` |
| `i18n/t.i18nT` with `apps.specBuilder.*` keys | `t()` in `ui/src/i18n.ts` over `ui/i18n/<locale>.json` (all 12 dashboard locales): the subtree, plus the six shared keys the page reads (`apps.issueRadar.components.detailOverflowMenu.more_actions`, `apps.meetings.review.archivedSection`, `components.ui.*`, `components.resizeHandle.drag_to_resize`) under the same paths. Exact locale, then base language, then English |

## Tests

| Built-in test | Here | Change |
|---|---|---|
| The app's `tests/` (27 files) and `test/test_spec_builder_routes_coverage*.py` with their helpers | `tests/`, same names | Module paths are `backend.*` and `tests.*`. Registration goes through `tests/harness.py` (`mount`), which serves `register_routes(ctx)`'s records under `/api/apps/spec-builder` the way the registry does. `tests/conftest.py` pins the data home, isolates the security event log, provides the floor's own `MonkeyPatch` and binds the host's own `AppContext` (real scrubber, audit sink and owner gate). Kiro Crew (one pinned public commit) is a test dependency, so the chat runner, AutoNudge, sandbox and security-log collaborators are the real ones. The Windows gap list and the real-symlink list are the built-in suite's. |
| `test_routes.py::test_disabled_app_denies`, `TestRequireEnabled` | `test_registration_returns_relative_records_for_the_registry`, `TestRouteAdapter` | The registry, not the app, takes a disabled app's routes down. |
| `TestRegisterRoutes` (gate identity, HEAD twins) | the adapter identity; no HEAD twins; the route set gains `GET /models` | See above. |
| `TestAudit` (API rows through `sel`) | API rows through `ctx.audit` | Caller `app:spec-builder`, operation `spec-builder.<verb>`. The git tool-audit cases are unchanged. |
| `TestSecurityModuleUnavailable` | the same two cases, on a host with no sensitive-path predicate and a context with no scrubber; plus a scrubber that raises | Redaction is the seam's. |
| `test_routes_paths.py::test_gateway_helpers_are_imported_at_module_scope` | same | The deferred dashboard imports are now `_host.require("kiro_crew.dashboard.…")` lookups; the guard checks those, and that no function imports `kiro_crew`. |
| `test_orchestration_composition_contract.py` | same | `_host` is the bottom layer; 19 route entry points (with `_handle_models`). |
| Spec Builder cases of `test/test_compaction_stop_declined_surfaces.py`, `test/test_session_directive_self_arm_provenance.py`, `test/test_chat_runner_mcp_sign_in_ask.py`, `test/test_pinned_staging_helper_contract.py`, `test/test_windows_extended_prefix_containment.py` | `tests/test_host_cases_ported.py` | The two that drove a real runner turn through Kiro Crew's runner fixtures check the same contract at the seam this app owns: the keyword arguments its dispatch hands the host's `_run_chat`. |
| (none) | `tests/test_host_seams.py`, `tests/test_no_host_imports.py`, `tests/test_manifest_contract.py` | Every fail-closed path above, the capability report, the data-home derivation, `GET /models`; only the shim reaches `kiro_crew`, through `importlib`, and every name is pinned; manifest parity, the host parser, the bundle's imports, the hooks loading through the gateway's module loader, no hardcoded model id, an adoptable tree. |
| `website/src/test/SpecBuilder*.test.tsx`, `specBuilder*.test.ts` (25 files) | `ui/tests/`, same names | Run by vitest with stand-ins for the host SDK (`ui/tests/stubs/`): the SDK components with the roles and labels the host renders, `MarkdownRenderer` over micromark (CommonMark), `ChatEmbed` as a marker. The router wrapper is gone (the page needs none); `ChatEmbed` and `Select` are mocked on the SDK and `hostSdk` modules. |
| Project-picker cases of `windowsProjectNameSites.test.tsx` and `windowsBasenameSites.test.tsx` | `ui/tests/SpecBuilderProjectPickerWindowsPaths.test.tsx` | Same cases, over this copy's `ProjectPicker` and `host/pathBasename`. |
| (none) | `ui/tests/externalSeams.test.tsx` | Catalog coverage and fallback, plural forms, the scoped transport and its error mapping, the model list, the older-host `Select` and caution marker, the pulse and menu stand-ins. |

Kiro Crew tests that use `spec-builder` only as a sample app name or slot key
(`test/test_chat_folder_icons.py`, `test/test_chat_folder_app_isolation.py`,
`test/test_mcp_dashboard_folders.py`, `website/src/test/appSlotPush.test.ts`
and the other slot-scoping tests) stay in Kiro Crew with a neutral fixture.

## What Kiro Crew keeps doing

The release that adds adoption still ships the built-in. A user's built-in
record moves onto this repository at the commit Kiro Crew pins, on the restart
after the tree is fetched and verified; a record that cannot move keeps running
the built-in copy, unchanged.

## Release handoff: one commit for both pins

The adoption pin and the catalog row must name the same commit, and that
commit must be the ported tree.

1. Call the full 40-hex SHA of this repository's `main` `C`
   (`git rev-parse HEAD`).
2. In the Kiro Crew release PR that adds adoption, run
   `python3 scripts/adoption_pin.py compute <this URL> C` and add the row it
   prints (commit, `treeSha256`, `archiveSha256`, `legacyNav`) to
   `src/kiro_crew/apps/adoption-pins.json`; then
   `python3 scripts/adoption_pin.py verify`. Until that row exists the release
   adopts nothing, and the catalog row must not switch.
3. The KiroCrewApps row for `spec-builder` switches to `"type": "git"`, this
   URL, `"ref": "C"`. Never a branch name or a placeholder.
4. Check that both files name the same `C`, and that GitHub serves it: in a
   fresh clone, `git fetch origin C` succeeds and `git cat-file -t C` prints
   `commit`.
5. The catalog PR stays a draft, labelled hold-for-release, until the Kiro Crew
   release that ships adoption and the App Kit level-1 seams is published.
