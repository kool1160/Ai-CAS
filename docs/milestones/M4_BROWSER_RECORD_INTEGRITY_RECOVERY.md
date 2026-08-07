# Milestone 4 - Browser Record Integrity and Recovery

**Status:** In Progress
**Selected:** Yes
**Primary product source:** `AI-CAS_PROJECT_SUMMARY.md`

## Goal

Strengthen the current browser-local record model so drafts and history are
versioned, validated, recoverable, and portable without claiming durable cloud
persistence or activating a backend.

## Entry condition

Milestone 3 must be merged and marked Complete before Milestone 4 becomes the
selected milestone. This condition is satisfied by PR `#73`, reviewed at exact
head `6a70b47e88d92cc39b92275efcdc0ba13a8c1970` and squash-merged as
`97b6ec5efbea371c43bc96d868f56fc99b6c6cb4` after the product owner issued
`Advance AI-CAS`.

## Activation state

Milestone 4 is the sole selected gate. PR `#75` is the sole active M4
implementation pull request on branch `codex/milestone-4`. Independent review
of exact head `9eef9730b3eb6d495fb3aba451c54c8fca417c8d` returned `BLOCKED`; the next
valid command is `Continue AI-CAS` to repair only the recorded M4 blockers on
that same branch and pull request.

## In scope

- Close Milestone 3 and select Milestone 4.
- Add a documented local schema version for drafts and history.
- Replace array-length-derived IDs with stable collision-resistant local IDs.
- Preserve existing storage-key compatibility without renaming keys.
- Detect malformed records and expose a safe recovery/quarantine result instead
  of silently discarding data.
- Add validated local backup export for drafts and history.
- Add preview-first, explicitly confirmed local backup import.
- Detect duplicate records and avoid destructive overwrite by default.
- Preserve review metadata, attribution, evidence metadata, and original dates.
- Add deterministic round-trip, migration, malformed-data, duplicate, and
  rollback tests.
- Keep all persistence claims explicitly browser-local.

## Out of scope

- Database, Supabase, cloud sync, server records, authentication, multi-user
  ownership, billing, or customer-data backend.
- Storage-key rename, silent destructive migration, or automatic overwrite.
- Email, extraction, routing, PDF release, hosted settings, deployment, or shell
  redesign.

## Required behavior

### Versioned local records

Draft and history records include an explicit schema version. Existing records
without a version load through a tested compatibility path. Invalid versions or
shapes do not silently become current valid records.

Current `schemaVersion: 1` records are strict current-schema records, not legacy
compatibility inputs. Wrong field types, invalid statuses, malformed review or
evidence metadata, invalid identifiers or required timestamps, or other schema
violations must be rejected or quarantined instead of silently coerced.

### Stable identifiers

New record IDs are collision-resistant within the browser and do not depend on
array length. Existing IDs remain readable and are not rewritten merely because
the app loaded them.

### Recovery and quarantine

Malformed local JSON or malformed records produce visible, bounded recovery
information. Valid records continue loading. Invalid data is not silently
promoted, and recovery does not leak record contents into logs.

An affected collection in recovery/quarantine must not accept a new record and
then report it as saved while persistence is suppressed. The action must fail
visibly unless the record can actually be persisted.

A backup import must not clear a recovery guard and overwrite the malformed raw
collection. While a collection is in recovery, import for that affected
collection fails closed and leaves the original localStorage value unchanged.
The existing separately confirmed clear action may resolve that malformed
collection before a clean import.

### Backup export and import

Export produces a clearly labeled AI-CAS browser-local backup containing a
version, export timestamp, and validated records. Import validates before
writing, shows a summary, detects duplicates, and requires explicit confirmation.
Merge is the safe default; destructive replacement requires a separate explicit
product decision and is not part of this milestone.

Backup records using schema version 1 must pass the strict current-schema
validators before preview can authorize import. Malformed backup records fail
before any browser write.

## Required affected roles

- AI-CAS Foreman
- Data and Records Engineer
- Corrective Action Workflow Engineer
- Security and Access Engineer
- Privacy and IP Guardian
- Validation Engineer
- UX and Mobile Workflow Engineer
- Deployment Engineer

Manufacturing Operations Engineer reviews usability. AI Extraction Engineer
confirms extraction data is preserved without reinterpretation. Product and
Commercial Engineer reviews support burden and beta value.

## Acceptance criteria

- Draft and history records use a documented local schema version.
- Existing unversioned records remain readable through tested compatibility.
- Current schema-1 and backup records are strictly validated instead of coerced.
- Stable local IDs replace array-length-derived IDs for new records.
- Malformed records are reported or quarantined rather than silently disappearing.
- Recovery-state saves fail visibly when the affected collection cannot persist.
- Recovery-state imports leave malformed raw storage untouched and fail closed.
- Explicit confirmed clear followed by clean import remains available.
- Exported backups are versioned, validated, synthetic-testable, and clearly browser-local.
- Imports are validated and previewed before an explicit confirmation.
- Duplicate handling is deterministic and non-destructive by default.
- Review, attribution, evidence, and timestamp metadata survive round trips.
- Existing storage keys remain readable and no automatic destructive migration occurs.
- No backend, authentication, provider call, hosted change, or deployment occurs.
- Typecheck, build, privacy, governance, scope, and handoff validation pass.

## Approved Change Scope

Scope is default-deny. Any required path outside this list is a stop-and-ask
condition.

### Owner-authorized governance repair - 2026-08-07

The product owner explicitly authorized `scripts/governance-regression.mjs`
only to replace its stale M3 current-gate assertion with a future-safe check of
the sole selected active gate.

### Owner-authorized review repair and status reconciliation - 2026-08-07

After independent review of PR `#75` at exact head
`9eef9730b3eb6d495fb3aba451c54c8fca417c8d`, the product owner authorizes the
recorded recovery, import, and strict-schema repairs on the same PR and adds
`docs/status/CURRENT.md` to the approved M4 path set solely for truthful status
reconciliation. This supersedes the earlier prohibition on editing that status
file only for the active PR/branch/head/review/blocker/next-command facts. It
does not authorize unrelated governance changes or product-scope expansion.

### Allowed paths

- `BACKLOG.md`
- `DECISIONS.md`
- `docs/status/CURRENT.md`
- `docs/ARCHITECTURE.md`
- `docs/milestones/M3_AI_EXTRACTION_CONTRACT_SAFETY.md`
- `docs/handoffs/M3_PLANNING_HANDOFF.md`
- `docs/milestones/M4_BROWSER_RECORD_INTEGRITY_RECOVERY.md`
- `docs/handoffs/M4_PLANNING_HANDOFF.md`
- `features/woc/components/WocApp.tsx`
- `features/woc/components/DraftsScreen.tsx`
- `features/woc/components/HistoryScreen.tsx`
- `features/woc/components/MoreScreen.tsx`
- `features/woc/logic/localRecordsStorage.ts`
- `features/woc/logic/localRecordBackup.ts`
- `features/woc/persistence/**`
- `features/woc/types/wocSessionTypes.ts`
- `tests/**`
- `scripts/ci-contract.sh`
- `scripts/ci-contract.ps1`
- `scripts/governance-regression.mjs`

### Forbidden paths

- `AI-CAS_PROJECT_SUMMARY.md`
- `app/api/**`
- `app/print-report/**`
- `.github/workflows/**`
- `package.json`
- `package-lock.json`
- `public/**`
- `.env`
- `.vercel/**`
- `vercel.json`

### Forbidden operations

- secrets
- environment values
- GitHub/Vercel identity
- production settings
- deployment
- destructive operations
- merge without human approval
- live provider calls
- database, Supabase, cloud sync, authentication, or customer-data backend
- storage-key renaming or silent destructive migration
- real customer, employer, personal, or proprietary data
- product-shell redesign

## Required validation

- `npm ci`
- `npm run test:run`
- `npm run typecheck`
- `npm run build`
- `node scripts/privacy-fixture-check.mjs`
- `bash scripts/ci-contract.sh`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/ci-contract.ps1`
- `node scripts/select-milestone.mjs --validate`
- `node scripts/select-milestone.mjs --selected`
- `node scripts/validate-scope.mjs --milestone 4`
- `node scripts/governance-regression.mjs`
- `git diff --check`

The repair must add deterministic regression evidence proving that recovery-
state saves do not mutate accepted state or claim success, recovery-state
imports leave malformed raw storage unchanged, explicit clear-then-import
works, malformed schema-1 records are quarantined, malformed backup records
fail before mutation, and compatible unversioned legacy records still load.

## Queue end behavior

Milestone 4 is the final currently executable queue item. On completion, mark
M4 Complete but do not invent the next milestone. Stop and request a product-
owner queue refill based on fresh repository evidence.

## Approval boundaries

The Foreman may prepare, validate, and request publication of one draft PR for
Milestone 4. Merge, deployment, backend activation, hosted changes, destructive
migration, scope expansion, and real-data use remain human approval boundaries.
