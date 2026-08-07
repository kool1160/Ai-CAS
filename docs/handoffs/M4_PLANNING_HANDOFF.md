# AI-CAS Milestone 4 Implementation Handoff

## Status

`approval_required` - the M4 implementation and bounded governance-contract
and review-blocker repairs are complete locally. Milestone 4 remains In
Progress and selected pending terminal exact-head CI and independent review.

**Base commit:** `37c7dc3808a5f22fc1816ab08519e8eb471cc12f`

## Owner-authorized governance repair

On 2026-08-07, the product owner authorized one bounded addition to the M4
change scope: `scripts/governance-regression.mjs`. The authorization is only
to reconcile its stale M3 current-gate assertion with the authoritative M4
active-gate state and add future-safe regression coverage. It does not
authorize a change to `docs/status/CURRENT.md`, accepted runtime behavior, or
any other scope.

## Owner-authorized review repair

On 2026-08-07, after independent review of exact head `9eef9730b3eb6d495fb3aba451c54c8fca417c8d`,
the product owner authorized the recorded recovery-write, recovery-import, and
strict schema-1 repairs on the same branch and PR. The same authorization added
`docs/status/CURRENT.md` only for truthful active-gate reconciliation.

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
- Persisted a new draft or history record before accepting it into application
  state; a collection in recovery fails visibly and keeps its malformed raw
  browser value unchanged.
- Blocked history-producing sends before the external call when history is in
  recovery, so a sent action cannot knowingly proceed without local history.
- Rechecked recovery immediately before confirmed import. Recovery blocks the
  whole import without a write; the existing confirmed clear action allows a
  later clean import.
- Split compatible unversioned legacy normalization from strict schema-1
  envelope and backup validation. Invalid types, statuses, review/evidence
  metadata, required IDs, and timestamps now reject instead of being coerced.

No API route, durable backend, authentication, provider call, hosted change,
deployment, storage-key rename, destructive migration, or shell redesign is
included.

## Validation evidence

- Clean dependency install: `npm ci` completed without changing the lockfile.
- Application suite: 146 tests passing, including 14 focused M4 storage and
  backup tests.
- Typecheck and production build: passing.
- Privacy, milestone selection, handoff schema validation, `git diff --check`,
  and the required no-argument M4 scope validation: passing. Generated caches
  were temporarily isolated and then restored for the no-argument scope check;
  no repository data was deleted or changed by that validation setup.
- Both Bash and PowerShell governance entrypoints pass, including schema,
  historical handoff, exact M4 scope, privacy, and regression checks.
- `node scripts/governance-regression.mjs` passes 14 checks. Current-gate
  validation derives the sole selected milestone, validates the authoritative
  M4 active state, accepts a synthetic future active gate, and rejects a
  completed milestone as the selected current gate.
- Both governance contract entrypoints now validate this M4 handoff JSON and
  its exact M4 change surface before allowing a green result.
- `npm ci` reports three high-severity dependency advisories. No dependency
  change or audit fix is authorized in M4.

## Review focus

- Confirm that browser-local recovery notices are clear and never expose raw
  malformed record contents.
- Confirm a recovery-blocked save cannot mutate accepted state or report
  persistence, and a recovery-blocked import cannot alter either collection.
- Confirm strict schema-1 rejection does not weaken compatible unversioned
  legacy loading.
- Confirm that explicit import confirmation is required before a write and
  duplicates cannot replace existing browser records.
- Confirm the exact PR head, full application and governance CI, and all M4
  scope boundaries before any advancement request.

## Rollback and remaining risks

Rollback is an ordinary reviewed revert after a future authorized merge; do not
reset history or delete browser records as a substitute. Browser-local records
remain device-bound and are not durable multi-user audit data. A malformed
collection remains unchanged until an operator uses the existing confirmed
clear action. A validated backup may then be imported cleanly.

## Next command

`Check AI-CAS`

```json
{
  "status": "approval_required",
  "milestone_number": 4,
  "milestone_name": "Browser Record Integrity and Recovery",
  "summary": "Version browser-local draft and history records, preserve legacy-key compatibility, expose non-destructive malformed-data recovery, and add validated preview-first local backup export and merge-only import.",
  "runtime_impact": "The browser workflow now creates collision-resistant local IDs and offers local backup export and explicitly confirmed import without changing API routes or the product shell.",
  "data_persistence_impact": "Existing draft and history keys remain readable. Schema-1 envelopes and backups are strictly validated; compatible unversioned arrays retain a separate legacy path. Recovery-blocked writes and imports preserve malformed raw storage until the existing confirmed clear action is used.",
  "security_impact": "Unsupported schema values, malformed current records, and recovery-state writes/imports fail closed before accepted state or browser storage changes. Import remains bounded, validated, previewed, confirmed, and merge-only; no authentication or backend is introduced.",
  "privacy_ip_impact": "Only synthetic test records are used. Recovery messages contain no raw stored record contents, and backup handling remains browser-local unless an operator chooses a local file export or import.",
  "deployment_impact": "No deployment, hosted configuration, environment value, provider call, or production setting changed.",
  "files_changed": [
    "DECISIONS.md",
    "docs/ARCHITECTURE.md",
    "docs/handoffs/M4_PLANNING_HANDOFF.md",
    "docs/milestones/M4_BROWSER_RECORD_INTEGRITY_RECOVERY.md",
    "docs/status/CURRENT.md",
    "features/woc/components/MoreScreen.tsx",
    "features/woc/components/WocApp.tsx",
    "features/woc/logic/localRecordBackup.ts",
    "features/woc/logic/localRecordsStorage.ts",
    "features/woc/types/wocSessionTypes.ts",
    "scripts/ci-contract.ps1",
    "scripts/ci-contract.sh",
    "scripts/governance-regression.mjs",
    "tests/localRecordBackup.test.ts",
    "tests/localRecordsStorage.test.ts"
  ],
  "tests": [
    "npm ci (passed)",
    "npm run test:run (146 passed; including 14 M4 tests)",
    "npm run typecheck (passed)",
    "npm run build (passed)",
    "node scripts/privacy-fixture-check.mjs (passed)",
    "node scripts/select-milestone.mjs --validate (passed)",
    "node scripts/select-milestone.mjs --selected (passed: Milestone 4)",
    "node scripts/validate-governance.mjs --handoff docs/handoffs/M4_PLANNING_HANDOFF.md --milestone 4 (passed)",
    "node scripts/validate-scope.mjs --milestone 4 (passed with generated caches temporarily isolated and restored)",
    "git diff --check (passed)",
    "bash scripts/ci-contract.sh (passed)",
    "powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1 (passed)",
    "node scripts/governance-regression.mjs (14 passed)"
  ],
  "approval_required": "Independent exact-head review and terminal-green required GitHub CI are required before any authorized advancement. Deployment remains separately unauthorized.",
  "unresolved_items": [
    "Browser-local records remain device-bound and are not durable multi-user audit data.",
    "Recovery requires the existing confirmed clear action before import; the malformed raw collection remains unchanged until that explicit action.",
    "No backend, authentication, cloud synchronization, or durable record ownership exists.",
    "npm ci reports three high-severity dependency advisories; dependency remediation is outside M4 scope."
  ],
  "recommended_next_action": "Run Check AI-CAS on the exact pushed head after required GitHub CI reaches terminal green."
}
```
