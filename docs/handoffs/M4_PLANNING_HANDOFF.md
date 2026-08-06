# AI-CAS Milestone 4 Implementation Handoff

## Status

`blocked` — the M4 implementation is complete, but the required terminal
governance checks cannot pass until an out-of-scope prior-gate contract is
reconciled. Milestone 4 remains In Progress and selected.

**Base commit:** `37c7dc3808a5f22fc1816ab08519e8eb471cc12f`

## Delivered M4 slice

- Kept the existing browser-local draft and history storage keys while writing
  versioned schema-1 record envelopes and per-record schema versions.
- Loaded legacy unversioned arrays compatibly without changing their record
  identifiers; explicit unsupported versions, malformed JSON, and malformed
  records produce bounded recovery state and are not automatically saved over.
- Replaced collection-length identifiers with collision-resistant browser-local
  draft and history identifiers.
- Added a labeled local-only backup format with schema version and export time.
  Import has a 1 MB bound, validation, preview counts, duplicate detection,
  explicit confirmation, and merge-only semantics.
- Preserved existing records for duplicate IDs plus record review, attribution,
  evidence, and timestamp fields through the backup round trip.

No API route, durable backend, authentication, provider call, hosted change,
deployment, storage-key rename, destructive migration, or shell redesign is
included.

## Validation evidence

- Clean dependency install: `npm ci` completed without changing the lockfile.
- Application suite: 141 tests passing, including 9 focused M4 storage and
  backup tests.
- Typecheck and production build: passing.
- Privacy, milestone selection, handoff schema validation, `git diff --check`,
  and the required no-argument M4 scope validation: passing. Generated caches
  were temporarily isolated and then restored for the no-argument scope check;
  no repository data was deleted or changed by that validation setup.
- Both Bash and PowerShell governance entrypoints now validate the M3 handoff
  against its recorded historical range, then reach the same remaining stale
  M3-state assertion.
- `node scripts/governance-regression.mjs` currently fails because it requires
  the obsolete M3 `AWAITING_REVIEW` state in `docs/status/CURRENT.md`; the
  current status correctly names the active M4 gate. No out-of-scope repair
  was made.
- Both governance contract entrypoints now validate this M4 handoff JSON and
  its exact M4 change surface before allowing a green result.

## Review focus

- Confirm that browser-local recovery notices are clear and never expose raw
  malformed record contents.
- Confirm that explicit import confirmation is required before a write and
  duplicates cannot replace existing browser records.
- Confirm the exact PR head, full application and governance CI, and all M4
  scope boundaries before any advancement request.

## Rollback and remaining risks

Rollback is an ordinary reviewed revert after a future authorized merge; do not
reset history or delete browser records as a substitute. Browser-local records
remain device-bound and are not durable multi-user audit data. A malformed
collection remains unchanged until an operator explicitly imports a validated
local backup or uses the existing confirmed clear action.

## Next command

Obtain explicit authorization to reconcile the stale M3 governance contract
and its generated-artifact enumeration limit, then rerun the terminal checks.

```json
{
  "status": "blocked",
  "milestone_number": 4,
  "milestone_name": "Browser Record Integrity and Recovery",
  "summary": "Version browser-local draft and history records, preserve legacy-key compatibility, expose non-destructive malformed-data recovery, and add validated preview-first local backup export and merge-only import.",
  "runtime_impact": "The browser workflow now creates collision-resistant local IDs and offers local backup export and explicitly confirmed import without changing API routes or the product shell.",
  "data_persistence_impact": "Existing draft and history keys remain readable. Schema-1 envelopes and per-record schema versions are written for current records; legacy unversioned arrays load compatibly and malformed collections are not automatically overwritten.",
  "security_impact": "Unsupported schema values and malformed import shapes fail closed. Import is bounded, validated, previewed, and merge-only; no authentication, backend, or external action is introduced.",
  "privacy_ip_impact": "Only synthetic test records are used. Recovery messages contain no raw stored record contents, and backup handling remains browser-local unless an operator chooses a local file export or import.",
  "deployment_impact": "No deployment, hosted configuration, environment value, provider call, or production setting changed.",
  "files_changed": [
    "DECISIONS.md",
    "docs/ARCHITECTURE.md",
    "docs/handoffs/M4_PLANNING_HANDOFF.md",
    "features/woc/components/MoreScreen.tsx",
    "features/woc/components/WocApp.tsx",
    "features/woc/logic/localRecordBackup.ts",
    "features/woc/logic/localRecordsStorage.ts",
    "features/woc/types/wocSessionTypes.ts",
    "scripts/ci-contract.ps1",
    "scripts/ci-contract.sh",
    "tests/localRecordBackup.test.ts",
    "tests/localRecordsStorage.test.ts"
  ],
  "tests": [
    "npm ci (passed)",
    "npm run test:run (141 passed; including 9 M4 tests)",
    "npm run typecheck (passed)",
    "npm run build (passed)",
    "node scripts/privacy-fixture-check.mjs (passed)",
    "node scripts/select-milestone.mjs --validate (passed)",
    "node scripts/select-milestone.mjs --selected (passed: Milestone 4)",
    "node scripts/validate-governance.mjs --handoff docs/handoffs/M4_PLANNING_HANDOFF.md --milestone 4 (passed)",
    "node scripts/validate-scope.mjs --milestone 4 (passed with generated caches temporarily isolated and restored)",
    "git diff --check (passed)",
    "bash scripts/ci-contract.sh (blocked only by stale M3 status assertion)",
    "powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1 (blocked only by stale M3 status assertion)",
    "node scripts/governance-regression.mjs (blocked: stale M3 status assertion)"
  ],
  "approval_required": "Explicit authorization is required to reconcile the out-of-scope stale governance regression, then independent exact-head review and terminal-green required GitHub CI are required before any authorized advancement. Deployment remains separately unauthorized.",
  "unresolved_items": [
    "The current status correctly declares M4 ACTIVE, while the existing governance regression script still requires the obsolete M3 AWAITING_REVIEW state. Both files are outside the M4 approved change surface, so required terminal governance checks cannot pass without explicit authorization to reconcile that prior-gate contract.",
    "Browser-local records remain device-bound and are not durable multi-user audit data.",
    "An operator needs a valid local backup to recover a malformed collection without using the existing confirmed clear action.",
    "No backend, authentication, cloud synchronization, or durable record ownership exists."
  ],
  "recommended_next_action": "Authorize reconciliation of the stale governance contract, rerun terminal checks, then run Check AI-CAS on the exact head."
}
```
